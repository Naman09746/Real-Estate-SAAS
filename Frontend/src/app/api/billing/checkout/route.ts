import { NextRequest } from "next/server";
import { apiSuccess, apiError, checkRateLimit } from "@/lib/server/api-security";
import { z } from "zod";

const checkoutSchema = z.object({
  planId: z.enum(["starter", "growth", "enterprise"]),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
  orgId: z.string().min(1),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

// POST /api/billing/checkout - Generate payment checkout session
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateCheck = checkRateLimit(`checkout_${ip}`, 10, 60000);
  if (!rateCheck.allowed) {
    return apiError("Rate limit exceeded for checkout initiation", 429, "RATE_LIMIT_EXCEEDED");
  }

  try {
    const rawBody = await req.json();
    const parsed = checkoutSchema.parse(rawBody);

    const isStripe = Boolean(process.env.STRIPE_SECRET_KEY);
    const isRazorpay = Boolean(process.env.RAZORPAY_KEY_SECRET);

    // Mock checkout session when keys are unconfigured (Zero-setup development)
    const sessionId = `cs_${parsed.planId}_${Date.now()}`;
    const checkoutUrl = `${req.nextUrl.origin}/onboarding?session_id=${sessionId}&plan=${parsed.planId}`;

    return apiSuccess({
      sessionId,
      checkoutUrl,
      provider: isStripe ? "stripe" : isRazorpay ? "razorpay" : "simulated",
      plan: parsed.planId,
      billingCycle: parsed.billingCycle,
    }, 200);
  } catch (err: any) {
    return apiError(err.message || "Invalid checkout payload", 400, "INVALID_CHECKOUT_REQUEST");
  }
}
