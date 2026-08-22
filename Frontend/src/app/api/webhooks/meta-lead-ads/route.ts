import { NextRequest, NextResponse } from "next/server";
import {
  apiSuccess,
  apiError,
  verifyHmacSignature,
  timingSafeCompare,
} from "@/lib/server/api-security";
import { metaLeadAdsWebhookSchema } from "@/lib/server/validations";
import { getServiceRoleClient, isLiveSupabaseAvailable } from "@/lib/server/supabase-server";

// FAIL CLOSED: both tokens are mandatory. No hardcoded fallbacks.
const META_VERIFY_TOKEN = process.env.META_LEAD_ADS_VERIFY_TOKEN || "";
const META_APP_SECRET = process.env.META_APP_SECRET || "";

const MAX_PAYLOAD_BYTES = 64 * 1024;
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

function isFreshWebhookTime(timeSeconds: number | undefined): boolean {
  if (typeof timeSeconds !== "number" || !Number.isFinite(timeSeconds)) return false;
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - timeSeconds) <= TIMESTAMP_TOLERANCE_SECONDS;
}

// GET /api/webhooks/meta-lead-ads - Verification Handshake
export async function GET(req: NextRequest) {
  if (!META_VERIFY_TOKEN) {
    console.error("[META_CONFIG_ERROR] META_LEAD_ADS_VERIFY_TOKEN is not set");
    return apiError("Webhook verification is not configured", 503, "SERVICE_UNAVAILABLE");
  }

  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token") || "";
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && timingSafeCompare(token, META_VERIFY_TOKEN)) {
    return new NextResponse(challenge, { status: 200 });
  }

  return apiError("Meta Lead Ads verification token mismatch", 403, "FORBIDDEN");
}

// POST /api/webhooks/meta-lead-ads - Inbound Lead Ad Instant Capture
export async function POST(req: NextRequest) {
  // FAIL CLOSED: unsigned processing is never allowed.
  if (!META_APP_SECRET) {
    console.error("[META_CONFIG_ERROR] META_APP_SECRET is not set");
    return apiError(
      "Webhook signature verification is required but not configured",
      503,
      "SERVICE_UNAVAILABLE"
    );
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_PAYLOAD_BYTES) {
    return apiError("Payload too large", 413, "PAYLOAD_TOO_LARGE");
  }

  const signatureHeader = req.headers.get("x-hub-signature-256");
  const isValid = verifyHmacSignature(rawBody, signatureHeader, META_APP_SECRET);
  if (!isValid) {
    console.warn("[META_SECURITY_ALERT] Invalid HMAC signature detected!");
    return apiError("Invalid cryptographic payload signature", 401, "UNAUTHORIZED_WEBHOOK");
  }

  try {
    const jsonBody = JSON.parse(rawBody);
    const parsed = metaLeadAdsWebhookSchema.safeParse(jsonBody);

    if (!parsed.success) {
      return apiSuccess({ status: "ignored_non_leadgen_event" }, 200);
    }

    const entry = parsed.data.entry[0];
    const leadgenId = entry?.changes[0]?.value?.leadgen_id;
    const formId = entry?.changes[0]?.value?.form_id;
    const pageId = entry?.changes[0]?.value?.page_id;

    if (!leadgenId) {
      return apiSuccess({ status: "no_leadgen_id" }, 200);
    }

    // Replay protection
    if (!isFreshWebhookTime(entry?.time)) {
      console.warn("[META_SECURITY_ALERT] Stale or missing timestamp dropped");
      return apiSuccess({ status: "stale_event_dropped", leadgenId }, 200);
    }

    const supabase = getServiceRoleClient();
    if (!supabase || !isLiveSupabaseAvailable) {
      return apiError(
        "Backend database is not configured. Set SUPABASE_SERVICE_ROLE_KEY.",
        503,
        "SERVICE_UNAVAILABLE"
      );
    }

    // TENANT RESOLUTION via page_id mapping
    const { data: source } = await supabase
      .from("webhook_sources")
      .select("org_id")
      .eq("provider", "meta_ads")
      .eq("external_id", pageId)
      .maybeSingle();

    if (!source) {
      try {
        await supabase.from("webhook_events").insert({
          org_id: null,
          provider: "meta_ads",
          event_type: "unmapped_source",
          idempotency_key: `meta_unmapped_${leadgenId}`,
          payload: { page_id: pageId },
          status: "failed",
          error_message: "No webhook_sources mapping for page_id",
          processed_at: new Date().toISOString(),
        });
      } catch {}
      return apiSuccess({ status: "unmapped_page_id" }, 200);
    }

    // IDEMPOTENCY: durable, enforced by the unique index on webhook_events.
    const idempotencyKey = `meta_leadgen_${leadgenId}`;
    const { error: insertEventError } = await supabase.from("webhook_events").insert({
      org_id: source.org_id,
      provider: "meta_ads",
      event_type: "leadgen_captured",
      idempotency_key: idempotencyKey,
      payload: jsonBody,
      status: "pending",
    });

    if (insertEventError) {
      return apiSuccess({ status: "duplicate_dropped", leadgenId }, 200);
    }

    await supabase
      .from("webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("idempotency_key", idempotencyKey)
      .eq("org_id", source.org_id);

    return apiSuccess({
      status: "leadgen_enqueued",
      leadgenId,
      formId,
    }, 200);
  } catch (err) {
    console.error("[META_LEAD_ADS_ERROR]");
    return apiSuccess({ status: "error_acknowledged" }, 200);
  }
}
