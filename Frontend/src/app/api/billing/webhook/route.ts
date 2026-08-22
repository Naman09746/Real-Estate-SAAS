import { NextRequest } from "next/server";
import { apiSuccess, apiError, verifyHmacSignature } from "@/lib/server/api-security";
import {
  updateTenantSubscription,
  resolvePlan,
  type SubscriptionStatus,
} from "@/lib/server/subscription";
import { getServiceRoleClient, isLiveSupabaseAvailable } from "@/lib/server/supabase-server";

// FAIL CLOSED: unsigned billing webhooks are never processed. Without this
// secret, anyone could POST "your org is now enterprise".
const BILLING_WEBHOOK_SECRET =
  process.env.BILLING_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "";

const MAX_PAYLOAD_BYTES = 64 * 1024;

// Events that legitimately flip a subscription to active
const ACTIVATION_EVENTS = new Set([
  "checkout.session.completed",
  "invoice.payment_succeeded",
  "payment.captured", // Razorpay
  "subscription.activated",
]);
const CANCELLATION_EVENTS = new Set([
  "customer.subscription.deleted",
  "subscription.cancelled",
]);

export async function POST(req: NextRequest) {
  // FAIL CLOSED
  if (!BILLING_WEBHOOK_SECRET) {
    console.error("[BILLING_CONFIG_ERROR] BILLING_WEBHOOK_SECRET is not set");
    return apiError(
      "Billing webhook signature verification is required but not configured",
      503,
      "SERVICE_UNAVAILABLE"
    );
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_PAYLOAD_BYTES) {
    return apiError("Payload too large", 413, "PAYLOAD_TOO_LARGE");
  }

  const signatureHeader =
    req.headers.get("stripe-signature") || req.headers.get("x-razorpay-signature");
  if (!verifyHmacSignature(rawBody, signatureHeader, BILLING_WEBHOOK_SECRET)) {
    console.warn("[BILLING_SECURITY_ALERT] Invalid HMAC signature detected!");
    return apiError("Invalid cryptographic billing webhook signature", 401, "UNAUTHORIZED_WEBHOOK");
  }

  let jsonBody: any;
  try {
    jsonBody = JSON.parse(rawBody);
  } catch {
    return apiSuccess({ status: "ignored_malformed_payload" }, 200);
  }

  const eventId: string = jsonBody.id || jsonBody.event_id || "";
  const eventType: string = jsonBody.type || jsonBody.event || "";

  const supabase = getServiceRoleClient();
  if (!supabase || !isLiveSupabaseAvailable) {
    return apiError("Backend database is not configured", 503, "SERVICE_UNAVAILABLE");
  }

  // IDEMPOTENCY FIRST: the unique index on webhook_events.idempotency_key is
  // the duplicate guard. Insert-before-process means a replayed delivery is
  // dropped BEFORE it can mutate subscription state twice.
  const idempotencyKey = `billing_${eventId}`;
  const { error: insertEventError } = await supabase.from("webhook_events").insert({
    provider: "billing",
    event_type: eventType || "untyped_event",
    idempotency_key: idempotencyKey,
    payload: jsonBody,
    status: "pending",
  });

  if (insertEventError) {
    return apiSuccess({ status: "duplicate_dropped", eventId }, 200);
  }

  try {
    // Tenant resolution from signed payload fields
    const orgId: string | undefined =
      jsonBody.data?.object?.client_reference_id ||
      jsonBody.payload?.payment?.entity?.notes?.org_id;

    if (orgId && eventId) {
      let nextStatus: SubscriptionStatus | null = null;
      if (ACTIVATION_EVENTS.has(eventType)) nextStatus = "active";
      else if (CANCELLATION_EVENTS.has(eventType)) nextStatus = "canceled";

      if (nextStatus) {
        const result = await updateTenantSubscription(
          orgId,
          resolvePlan(jsonBody.data?.object?.metadata?.plan_id),
          nextStatus
        );
        if (!result.ok) {
          await supabase
            .from("webhook_events")
            .update({ status: "failed", error_message: "subscription update failed" })
            .eq("idempotency_key", idempotencyKey);
          return apiSuccess({ status: "processing_failed", eventId }, 200);
        }
      }
    }

    await supabase
      .from("webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("idempotency_key", idempotencyKey);

    return apiSuccess({ status: "processed", eventId }, 200);
  } catch {
    console.error("[BILLING_WEBHOOK_ERROR]");
    try {
      await supabase
        .from("webhook_events")
        .update({ status: "failed", error_message: "unexpected processing error" })
        .eq("idempotency_key", idempotencyKey);
    } catch {}
    // 200 so providers don't retry-storm; failure recorded in webhook_events
    return apiSuccess({ status: "error_acknowledged" }, 200);
  }
}
