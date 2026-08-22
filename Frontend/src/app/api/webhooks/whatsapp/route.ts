import { NextRequest, NextResponse } from "next/server";
import {
  apiSuccess,
  apiError,
  verifyHmacSignature,
  timingSafeCompare,
} from "@/lib/server/api-security";
import { whatsappWebhookSchema } from "@/lib/server/validations";
import { getServiceRoleClient, isLiveSupabaseAvailable } from "@/lib/server/supabase-server";

// FAIL CLOSED: both tokens are mandatory. No hardcoded fallbacks.
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET || "";

const MAX_PAYLOAD_BYTES = 64 * 1024;
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60; // reject replays older than 5 minutes

function isFreshWebhook(timestampSeconds: string | undefined): boolean {
  if (!timestampSeconds) return false;
  const ts = parseInt(timestampSeconds, 10);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - ts) <= TIMESTAMP_TOLERANCE_SECONDS;
}

type ResolvedOrg = { id: string } | null;

async function resolveOrgForSource(
  supabase: any,
  provider: "whatsapp",
  externalId: string
): Promise<ResolvedOrg> {
  const { data } = await supabase
    .from("webhook_sources")
    .select("org_id")
    .eq("provider", provider)
    .eq("external_id", externalId)
    .maybeSingle();
  return data ? { id: data.org_id } : null;
}

// GET /api/webhooks/whatsapp - Meta Webhook Challenge Handshake
export async function GET(req: NextRequest) {
  if (!WHATSAPP_VERIFY_TOKEN) {
    console.error("[WHATSAPP_CONFIG_ERROR] WHATSAPP_VERIFY_TOKEN is not set");
    return apiError("Webhook verification is not configured", 503, "SERVICE_UNAVAILABLE");
  }

  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token") || "";
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && timingSafeCompare(token, WHATSAPP_VERIFY_TOKEN)) {
    return new NextResponse(challenge, { status: 200 });
  }

  return apiError("Verification token mismatch", 403, "FORBIDDEN");
}

// POST /api/webhooks/whatsapp - Inbound Message Receiver
export async function POST(req: NextRequest) {
  // FAIL CLOSED: unsigned processing is never allowed.
  if (!WHATSAPP_APP_SECRET) {
    console.error("[WHATSAPP_CONFIG_ERROR] WHATSAPP_APP_SECRET is not set");
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
  const isValid = verifyHmacSignature(rawBody, signatureHeader, WHATSAPP_APP_SECRET);
  if (!isValid) {
    console.warn("[WHATSAPP_SECURITY_ALERT] Invalid HMAC signature detected!");
    return apiError("Invalid cryptographic payload signature", 401, "UNAUTHORIZED_WEBHOOK");
  }

  try {
    const jsonBody = JSON.parse(rawBody);
    const parsed = whatsappWebhookSchema.safeParse(jsonBody);

    if (!parsed.success) {
      // Return 200 to acknowledge Meta even if non-message change event
      return apiSuccess({ status: "ignored_non_message_event" }, 200);
    }

    const entry = parsed.data.entry[0]?.changes[0]?.value;
    const message = entry?.messages?.[0];
    const contact = entry?.contacts?.[0];

    if (!message || !contact) {
      return apiSuccess({ status: "acknowledged_no_message" }, 200);
    }

    // Replay protection: stale messages are dropped
    if (!isFreshWebhook(message.timestamp)) {
      console.warn("[WHATSAPP_SECURITY_ALERT] Stale or missing timestamp dropped");
      return apiSuccess({ status: "stale_event_dropped", messageId: message.id }, 200);
    }

    const supabase = getServiceRoleClient();
    if (!supabase || !isLiveSupabaseAvailable) {
      return apiError(
        "Backend database is not configured. Set SUPABASE_SERVICE_ROLE_KEY.",
        503,
        "SERVICE_UNAVAILABLE"
      );
    }

    // TENANT RESOLUTION: the sending phone_number_id must be mapped to an org.
    const phoneNumberId = entry?.metadata?.phone_number_id;
    const org = phoneNumberId
      ? await resolveOrgForSource(supabase, "whatsapp", phoneNumberId)
      : null;

    if (!org) {
      // Unknown source: record for ops, create nothing tenant-scoped.
      try {
        await supabase.from("webhook_events").insert({
          org_id: null,
          provider: "whatsapp",
          event_type: "unmapped_source",
          idempotency_key: `wa_unmapped_${message.id}`,
          payload: { phone_number_id: phoneNumberId },
          status: "failed",
          error_message: "No webhook_sources mapping for phone_number_id",
          processed_at: new Date().toISOString(),
        });
      } catch {}
      return apiSuccess({ status: "unmapped_phone_number_id" }, 200);
    }

    // IDEMPOTENCY: durable, enforced by the unique index on webhook_events.
    const idempotencyKey = `wa_msg_${message.id}`;
    const { error: insertEventError } = await supabase.from("webhook_events").insert({
      org_id: org.id,
      provider: "whatsapp",
      event_type: "inbound_message",
      idempotency_key: idempotencyKey,
      payload: jsonBody,
      status: "pending",
    });

    if (insertEventError) {
      // Unique violation => duplicate delivery; safely drop.
      return apiSuccess({ status: "duplicate_dropped", messageId: message.id }, 200);
    }

    // Normalize incoming phone
    const normalizedPhone = fromPhoneNormalized(message.from);

    // Check or create person (tenant-scoped)
    let personId: string | null = null;
    const { data: person } = await supabase
      .from("people")
      .select("id")
      .eq("org_id", org.id)
      .eq("phone_normalized", normalizedPhone)
      .maybeSingle();

    if (person) {
      personId = person.id;
    } else {
      const { data: newPerson } = await supabase
        .from("people")
        .insert({
          org_id: org.id,
          name: senderNameSafe(contact.profile.name),
          phone: normalizedPhone,
          phone_normalized: normalizedPhone,
          source: "WhatsApp Inbound",
        })
        .select("id")
        .single();
      personId = newPerson?.id ?? null;
    }

    // Log inbound activity (attacker-controlled text is truncated & fenced)
    if (personId) {
      await supabase.from("activities").insert({
        org_id: org.id,
        person_id: personId,
        type: "whatsapp",
        outcome: "inbound_message",
        outcome_label: "WhatsApp Message Received",
        notes: truncate(`[WhatsApp Inbound]: ${JSON.stringify(message.text?.body ?? "")}`, 1900),
      });
    }

    await supabase
      .from("webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("idempotency_key", idempotencyKey)
      .eq("org_id", org.id);

    return apiSuccess({ status: "processed", messageId: message.id }, 200);
  } catch (err) {
    console.error("[WHATSAPP_PROCESSING_ERROR]");
    // Always return 200 to Meta Webhook to prevent retry storms
    return apiSuccess({ status: "error_acknowledged" }, 200);
  }
}

function fromPhoneNormalized(from: string): string {
  return from.startsWith("+") ? from : `+${from}`;
}

function senderNameSafe(name: string): string {
  return truncate(name.trim(), 200) || "Unknown Contact";
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
