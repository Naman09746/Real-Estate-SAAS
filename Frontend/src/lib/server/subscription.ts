import { getAuthenticatedServerClient, getServiceRoleClient, isLiveSupabaseAvailable } from "@/lib/server/supabase-server";

// ====================================================================
// ENTERPRISE SUBSCRIPTION & PLAN QUOTA ENFORCEMENT ENGINE
// ====================================================================

export type PlanId = "starter" | "growth" | "enterprise";

export interface PlanLimits {
  name: string;
  maxSeats: number;
  maxLeads: number;
  maxProjects: number;
  aiAgentsEnabled: boolean;
  resurrectionEngineEnabled: boolean;
  multiRegionEnabled: boolean;
}

export const PLAN_CONFIGS: Record<PlanId, PlanLimits> = {
  starter: {
    name: "Solo Closer",
    maxSeats: 1,
    maxLeads: 300,
    maxProjects: 1,
    aiAgentsEnabled: false,
    resurrectionEngineEnabled: false,
    multiRegionEnabled: false,
  },
  growth: {
    name: "Boutique Team",
    maxSeats: 4,
    maxLeads: 2500,
    maxProjects: 5,
    aiAgentsEnabled: true,
    resurrectionEngineEnabled: true,
    multiRegionEnabled: false,
  },
  enterprise: {
    name: "Scale Desk",
    maxSeats: 25,
    maxLeads: 50000,
    maxProjects: 100,
    aiAgentsEnabled: true,
    resurrectionEngineEnabled: true,
    multiRegionEnabled: true,
  },
};

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  currentCount: number;
  maxLimit: number;
  plan: PlanId;
}

// Check whether tenant has reached their lead creation quota
export async function checkLeadQuota(orgId: string, currentLeadCount: number, plan: PlanId = "growth"): Promise<QuotaCheckResult> {
  const config = PLAN_CONFIGS[plan] || PLAN_CONFIGS.growth;

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

// Check whether tenant has access to specific AI Agent feature
export function checkFeatureAccess(feature: "ai_agents" | "resurrection" | "multi_region", plan: PlanId = "growth"): boolean {
  const config = PLAN_CONFIGS[plan] || PLAN_CONFIGS.growth;
  if (feature === "ai_agents") return config.aiAgentsEnabled;
  if (feature === "resurrection") return config.resurrectionEngineEnabled;
  if (feature === "multi_region") return config.multiRegionEnabled;
  return false;
}

// Update tenant subscription status after successful webhook payment
export async function updateTenantSubscription(
  orgId: string,
  plan: PlanId,
  status: "active" | "trialing" | "past_due" | "canceled",
  billingCycle: "monthly" | "yearly" = "monthly"
): Promise<boolean> {
  const supabase = getServiceRoleClient();
  if (!supabase || !isLiveSupabaseAvailable) {
    return true; // Mock mode success
  }

  const limits = PLAN_CONFIGS[plan] || PLAN_CONFIGS.growth;

  const { error } = await supabase
    .from("organizations")
    .update({
      plan,
      max_seats: limits.maxSeats,
      is_active: status === "active" || status === "trialing",
      custom_settings: {
        subscription_status: status,
        billing_cycle: billingCycle,
        updated_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", orgId);

  if (error) {
    console.error("[SUBSCRIPTION_UPDATE_ERROR]", error);
    return false;
  }

  return true;
}
