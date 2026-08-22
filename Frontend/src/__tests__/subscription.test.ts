import { describe, it, expect } from "vitest";
import { checkLeadQuota, checkFeatureAccess, PLAN_CONFIGS } from "../lib/server/subscription";

describe("Plan Quota & Feature Gating Enforcement", () => {
  it("should enforce lead creation limits on Starter plan", async () => {
    // Starter limit is 300
    const underLimit = await checkLeadQuota("org-1", 250, "starter");
    expect(underLimit.allowed).toBe(true);

    const atLimit = await checkLeadQuota("org-1", 300, "starter");
    expect(atLimit.allowed).toBe(false);
    expect(atLimit.reason).toContain("Plan lead limit reached");
  });

  it("should enforce feature gates between Starter and Growth/Enterprise", () => {
    // Starter has AI agents disabled
    expect(checkFeatureAccess("ai_agents", "starter")).toBe(false);
    expect(checkFeatureAccess("resurrection", "starter")).toBe(false);

    // Growth has AI agents enabled
    expect(checkFeatureAccess("ai_agents", "growth")).toBe(true);
    expect(checkFeatureAccess("resurrection", "growth")).toBe(true);
    expect(checkFeatureAccess("multi_region", "growth")).toBe(false);

    // Enterprise has all features enabled
    expect(checkFeatureAccess("ai_agents", "enterprise")).toBe(true);
    expect(checkFeatureAccess("resurrection", "enterprise")).toBe(true);
    expect(checkFeatureAccess("multi_region", "enterprise")).toBe(true);
  });
});
