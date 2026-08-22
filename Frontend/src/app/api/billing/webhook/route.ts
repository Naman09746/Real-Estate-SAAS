import { NextRequest } from "next/server";
import { apiSuccess, apiError, verifyHmacSignature, checkIdempotency, saveIdempotency } from "@/lib/server/api-security";
import { updateTenantSubscription, PlanId } from "@/lib/server/subscription";
import { getServiceRoleClient, isLiveSupabaseAvailable } from "@/lib/server/supabase-server";

const BILLING_WEBHOOK_SECRET = process.env.BILLING_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "";

// POST /api/billing/webhook - Stripe / Razorpay Webhook Event Processor
export async function POST(req: NextRequest) {
  const signatureHeader = req.headers.get("stripe-signature") || req.headers.get("x-razorpay-signature");
  const rawBody = await req.text();

  if (BILLING_WEBHOOK_SECRET) {
    const isValid = verifyHmacSignature(rawBody, signatureHeader, BILLING_WEBHOOK_SECRET);
    if (!isValid) {
      return apiError("Invalid cryptographic billing webhook signature", 401, "UNAUTHORIZED_WEBHOOK");
    }
  }

  try {
    const jsonBody = JSON.parse(rawBody);
    const eventId = jsonBody.id || jsonBody.event_id || `evt_${Date.now()}`;
    const eventType = jsonBody.type || jsonBody.event || "checkout.session.completed";

    // Idempotency check
    const idempotencyKey = `billing_${eventId}`;
    if (checkIdempotency(idempotencyKey)) {
      return apiSuccess({ status: "duplicate_event_acknowledged", eventId }, 200);
    }
    saveIdempotency(idempotencyKey, { processedAt: new Date().toISOString() });

    const orgId = jsonBody.data?.object?.client_reference_id || jsonBody.payload?.payment?.entity?.notes?.org_id;
    const planId: PlanId = (jsonBody.data?.object?.metadata?.plan_id || "growth") as PlanId;

    if (orgId) {
      if (eventType === "checkout.session.completed" || eventType === "invoice.payment_succeeded") {
        await updateTenantSubscription(orgId, planId, "active");
      } else if (eventType === "customer.subscription.deleted") {
        await updateTenantSubscription(orgId, planId, "canceled");
      }
    }

    const supabase = getServiceRoleClient();
    if (supabase && isLiveSupabaseAvailable) {
      await supabase.from("webhook_events").insert({
        org_id: orgId || null,
        provider: "billing_stripe_razorpay",
        event_type: eventType,
        idempotency_key: idempotencyKey,
        payload: jsonBody,
        status: "processed",
        processed_at: new Date().toISOString(),
      });
    }

    return apiSuccess({ status: "processed", eventId, orgId }, 200);
  } catch (err: any) {
    console.error("[BILLING_WEBHOOK_ERROR]", err);
    return apiSuccess({ status: "error_acknowledged", error: err.message }, 200);
  }
}
