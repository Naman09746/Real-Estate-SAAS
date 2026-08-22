import { getServiceRoleClient, isLiveSupabaseAvailable } from "@/lib/server/supabase-server";

// ====================================================================
// SUBSCRIPTION & PLAN QUOTA ENFORCEMENT ENGINE
//
// IMPORTANT ARCHITECTURE NOTES:
// 1. The canonical tenant table is `orgs` (see supabase/migrations/0001_init.sql
//    and 0006_billing_quotas.sql). Hard lead/seat quotas are enforced by DB
//    triggers (assert_lead_quota / assert_seat_quota) so BOTH write paths —
//    browser -> Supabase direct and REST API — are covered. The constants
//    below MUST stay in sync with migration 0006.
// 2. Feature gating (AI agents, resurrection engine) is enforced at the API
//    layer because those features only execute through server routes.
// 3. Never trust client-supplied plan identifiers or usage counts.
// ====================================================================

export type PlanId = "starter" | "growth" | "enterprise";

export interface PlanLimits {
  name: string;
  maxSeats: number;
  maxLeads: number;
  aiAgentsEnabled: boolean;
  resurrectionEngineEnabled: boolean;
  multiRegionEnabled: boolean;
}

export const PLAN_CONFIGS: Record<PlanId, PlanLimits> = {
  starter: {
    name: "Solo Closer",
    maxSeats: 1,
    maxLeads: 300,
    aiAgentsEnabled: false,
    resurrectionEngineEnabled: false,
    multiRegionEnabled: false,
  },
  growth: {
    name: "Boutique Team",
    maxSeats: 4,
    maxLeads: 2500,
    aiAgentsEnabled: true,
    resurrectionEngineEnabled: true,
    multiRegionEnabled: false,
  },
  enterprise: {
    name: "Scale Desk",
    maxSeats: 25,
    maxLeads: 50000,
    aiAgentsEnabled: true,
    resurrectionEngineEnabled: true,
    multiRegionEnabled: true,
  },
};

const DEFAULT_PLAN: PlanId = "growth";

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in PLAN_CONFIGS;
}

// Resolve a plan safely — no silent upgrade defaults. An unknown plan value
// degrades to the LOWEST tier rather than a paid one (fail closed).
export function resolvePlan(plan: unknown): PlanId {
  return isPlanId(plan) ? plan : "starter";
}

export { DEFAULT_PLAN };

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  currentCount: number;
  maxLimit: number;
  plan: PlanId;
}

/**
 * Pure quota evaluation for a given count. The COUNT must be resolved
 * server-side (DB trigger does this authoritatively); this function exists
 * for API-layer fast checks and tests only.
 */
export function checkLeadQuota(currentLeadCount: number, plan: PlanId): QuotaCheckResult {
  const config = PLAN_CONFIGS[plan];

  if (currentLeadCount >= config.maxLeads) {
    return {
      allowed: false,
      reason: `Plan lead limit reached (${currentLeadCount}/${config.maxLeads}). Please upgrade to a higher tier.`,
      currentCount: currentLeadCount,
      maxLimit: config.maxLeads,
      plan,
    };
  }

  return {
    allowed: true,
    currentCount: currentLeadCount,
    maxLimit: config.maxLeads,
    plan,
  };
}

export type GatedFeature = "ai_agents" | "resurrection" | "multi_region";

export function checkFeatureAccess(feature: GatedFeature, plan: PlanId): boolean {
  const config = PLAN_CONFIGS[plan];
  if (feature === "ai_agents") return config.aiAgentsEnabled;
  if (feature === "resurrection") return config.resurrectionEngineEnabled;
  if (feature === "multi_region") return config.multiRegionEnabled;
  return false;
}

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

/**
 * Update tenant subscription state after a SIGNED billing webhook event.
 * Targets the canonical `orgs` table (0006 columns). Returns false when the
 * live database is unavailable or the update fails — callers must not treat
 * unconfigured mode as success beyond local development.
 */
export async function updateTenantSubscription(
  orgId: string,
  plan: PlanId,
  status: SubscriptionStatus,
  billingCycle: "monthly" | "yearly" = "monthly"
): Promise<{ ok: boolean; simulated: boolean }> {
  // Simulated mode (local dev without Supabase): explicitly flagged as such so
  // callers/logs can distinguish it from a real persisted update.
  if (!isLiveSupabaseAvailable) {
    console.warn("[SUBSCRIPTION] Simulated mode: subscription update NOT persisted");
    return { ok: true, simulated: true };
  }

  const supabase = getServiceRoleClient();
  if (!supabase) {
    console.error("[SUBSCRIPTION_UPDATE_ERROR] service-role client unavailable");
    return { ok: false, simulated: false };
  }

  const limits = PLAN_CONFIGS[plan];

  const { error } = await supabase
    .from("orgs")
    .update({
      plan,
      billing_cycle: billingCycle,
      subscription_status: status,
      is_active: status === "active" || status === "trialing",
      custom_settings: {
        max_leads: limits.maxLeads,
        updated_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", orgId);

  if (error) {
    console.error("[SUBSCRIPTION_UPDATE_ERROR]", error.code);
    return { ok: false, simulated: false };
  }

  return { ok: true, simulated: false };
}
