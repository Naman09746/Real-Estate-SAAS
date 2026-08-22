import { NextRequest } from "next/server";
import { apiSuccess, apiError, checkRateLimit } from "@/lib/server/api-security";
import { resurrectScanSchema } from "@/lib/server/validations";
import {
  getApiAuthContext,
  getAuthenticatedServerClient,
  isLiveSupabaseAvailable,
  MANAGER_ROLES,
} from "@/lib/server/supabase-server";

// POST /api/agent/resurrect - Lost-Lead Matching Engine
// Manager+ only: returns dormant buyer PII across the organization.
export async function POST(req: NextRequest) {
  const auth = await getApiAuthContext();
  if (!auth) {
    return apiError("Authentication required", 401, "UNAUTHORIZED");
  }

  if (!MANAGER_ROLES.includes(auth.role)) {
    return apiError(
      "Resurrection scanning requires a manager or admin role",
      403,
      "FORBIDDEN"
    );
  }

  const rateCheck = checkRateLimit(`agent_resurrect_${auth.userId}`, 20, 60000);
  if (!rateCheck.allowed) {
    return apiError("Rate limit exceeded for AI Resurrection scanner", 429, "RATE_LIMIT_EXCEEDED");
  }

  const supabase = await getAuthenticatedServerClient();
  if (!supabase || !isLiveSupabaseAvailable) {
    return apiError(
      "Backend database is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      503,
      "SERVICE_UNAVAILABLE"
    );
  }

  const startTime = Date.now();

  try {
    const rawBody = await req.json().catch(() => ({}));
    // Strict integer validation — prevents PostgREST .or() filter injection
    const { daysThreshold } = resurrectScanSchema.parse(rawBody);

    // 1. Query dormant or lost leads (tenant isolation via RLS + explicit org filter)
    const { data: staleLeads, error: leadsError } = await supabase
      .from("leads")
      .select(`
        id,
        stage,
        days_in_stage,
        budget,
        project_id,
        people:person_id (name, phone),
        projects:project_id (name, location)
      `)
      .eq("org_id", auth.orgId)
      .or(`stage.eq.lost,days_in_stage.gte.${daysThreshold}`)
      .limit(20);

    if (leadsError) {
      console.error("[RESURRECT_SCAN_ERROR]", leadsError.code);
      return apiError("Failed to scan dormant leads", 500, "DB_SCAN_ERROR");
    }

    // 2. Query available inventory units to match (tenant-scoped)
    const { data: availableUnits, error: unitsError } = await supabase
      .from("project_units")
      .select("id, project_id, tower, unit_number, configuration, price")
      .eq("org_id", auth.orgId)
      .eq("status", "available")
      .limit(50);

    if (unitsError) {
      console.error("[RESURRECT_UNITS_ERROR]", unitsError.code);
      return apiError("Failed to load inventory for matching", 500, "DB_SCAN_ERROR");
    }

    const matches = (staleLeads || []).map((lead: any) => {
      const matchingUnit = (availableUnits || []).find((u: any) =>
        u.project_id === lead.project_id ||
        Math.abs(u.price - lead.budget) / (lead.budget || 1) <= 0.2
      );

      return {
        leadId: lead.id,
        buyerName: lead.people?.name || "Client",
        phone: lead.people?.phone || "",
        currentStage: lead.stage,
        daysInactive: lead.days_in_stage,
        matchedUnit: matchingUnit ? {
          id: matchingUnit.id,
          tower: matchingUnit.tower,
          unitNumber: matchingUnit.unit_number,
          config: matchingUnit.configuration,
          price: matchingUnit.price,
        } : null,
        suggestedAngle: matchingUnit ? "New Tower Allotment" : "20:80 Payment Scheme",
        revivalScore: matchingUnit ? 92 : 75,
      };
    });

    // 3. Log AI execution telemetry (best-effort; never blocks the response)
    try {
      await supabase.from("ai_agent_executions").insert({
        org_id: auth.orgId,
        session_id: `resurrect_scan_${Date.now()}`,
        agent_name: "lost_lead_resurrector",
        tool_invoked: "scan_and_match_inventory",
        tool_input: { daysThreshold },
        tool_output: { count: matches.length },
        latency_ms: Date.now() - startTime,
        status: "success",
        executed_by_user_id: auth.userId,
      });
    } catch (telemetryErr) {
      console.warn("[RESURRECT_TELEMETRY_FAILED]");
    }

    return apiSuccess({
      totalScanned: staleLeads?.length || 0,
      resurrectableOpportunities: matches,
      latencyMs: Date.now() - startTime,
    }, 200);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "issues" in err) {
      return apiError("Invalid scan parameters", 422, "VALIDATION_ERROR", (err as any).issues);
    }
    return apiError("Resurrection scan failed", 500, "AGENT_ERROR");
  }
}
