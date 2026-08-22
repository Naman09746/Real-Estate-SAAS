import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/server/api-security";
import { getApiAuthContext, MANAGER_ROLES } from "@/lib/server/supabase-server";
import { z } from "zod";

const checkoutSchema = z.object({
  planId: z.enum(["starter", "growth", "enterprise"]),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
  successUrl: z.string().max(500).optional(),
  cancelUrl: z.string().max(500).optional(),
});

// POST /api/billing/checkout - Initiate a plan upgrade for the CALLER'S org.
// Authentication + manager role required. The org is always taken from the
// verified session — a caller can never open checkout for another tenant.
export async function POST(req: NextRequest) {
  const auth = await getApiAuthContext();
  if (!auth) {
    return apiError("Authentication required", 401, "UNAUTHORIZED");
  }
  if (!MANAGER_ROLES.includes(auth.role)) {
    return apiError("Only managers and admins can initiate billing changes", 403, "FORBIDDEN");
  }

  const rateLimitModule = await import("@/lib/server/rate-limit");
  const rateCheck = await rateLimitModule.checkRateLimitDurable(
    `checkout_${auth.userId}`,
    10,
    60_000
  );
  if (!rateCheck.allowed) {
    return apiError("Rate limit exceeded for checkout initiation", 429, "RATE_LIMIT_EXCEEDED");
  }

  try {
    const parsed = checkoutSchema.parse(await req.json());

    const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);
    const hasRazorpay = Boolean(process.env.RAZORPAY_KEY_SECRET);
    const provider = hasStripe ? "stripe" : hasRazorpay ? "razorpay" : "simulated";

    // SIMULATED MODE (no payment provider configured): return an explicit
    // simulation result. This NEVER grants entitlements — only the signed
    // billing webhook can change subscription state.
    if (provider === "simulated") {
      return apiSuccess(
        {
          provider,
          simulated: true,
          message:
            "No payment provider configured. Set STRIPE_SECRET_KEY or RAZORPAY_KEY_SECRET to enable real checkout. No charge was made and no entitlement changed.",
          requestedPlan: parsed.planId,
          billingCycle: parsed.billingCycle,
        },
        200
      );
    }

    // Real provider integration point: create the checkout session server-side
    // with client_reference_id = auth.orgId so webhook events resolve the tenant.
    // (Stripe/Razorpay SDK session creation lands with the payments pass.)
    return apiError(
      `${provider} checkout session creation is not yet implemented`,
      501,
      "PROVIDER_NOT_IMPLEMENTED"
    );
  } catch (err: unknown) {
    if (err && typeof err === "object" && "issues" in err) {
      return apiError("Invalid checkout payload", 422, "VALIDATION_ERROR", (err as any).issues);
    }
    return apiError("Invalid checkout payload", 400, "INVALID_CHECKOUT_REQUEST");
  }
}
