# 03. API Documentation — Apex Realty CallCRM

**Base URL:** `https://your-domain.com/api` (or `http://localhost:3000/api` in local dev)  
**Protocol:** HTTPS / JSON  
**Authentication:** Bearer JWT Token (`Authorization: Bearer <token>`)

---

## 1. Global API Standards & Envelopes

### 1.1 Standard Success Envelope (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_f82a910c",
    "timestamp": "2026-08-22T06:00:00.000Z",
    "page": 1,
    "limit": 50,
    "total": 142
  }
}
```

### 1.2 Standard Error Envelope (`400`, `401`, `403`, `422`, `429`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for input payload",
    "requestId": "req_d31e847b",
    "details": [
      { "path": "phone", "message": "Phone number must be at least 10 digits" }
    ]
  }
}
```
*(Zero stack traces, raw SQL queries, or internal credentials are ever returned in client responses).*

---

## 2. API Endpoints Catalog

### 2.1 Leads Management API

#### `GET /api/leads`
Retrieve paginated, tenant-isolated sales opportunities.
- **Query Parameters:**
  - `stage` (string, optional): Filter by pipeline stage (`new`, `contacted`, `qualified`, `site_visit`, `negotiation`, `won`, `lost`, `all`).
  - `projectId` (string, optional): Filter by target project ID.
  - `repId` (string, optional): Filter by assigned sales representative.
  - `page` (number, default: 1): Page number.
  - `limit` (number, default: 50): Items per page.
- **Rate Limit:** 120 requests / min.
- **Response `200 OK`:** Array of enriched Lead objects.

#### `POST /api/leads`
Create a new sales opportunity with automatic phone normalization and deduplication.
- **Headers:** `X-Idempotency-Key` (string, recommended).
- **Rate Limit:** 30 requests / min.
- **Request Body (Zod Validated):**
```json
{
  "personName": "Vikramaditya Singhania",
  "phone": "+91 98101 23456",
  "email": "vikram@singhania.com",
  "projectId": "proj-camellias",
  "budget": 250000000,
  "stage": "qualified",
  "source": "Website Inbound",
  "configurationPreference": "4 BHK Penthouse",
  "timeline": "Immediate (Within 30 Days)",
  "leadScore": 96,
  "leadScoreLabel": "Hot"
}
```
- **Response `201 Created`:** The created lead object with normalized phone and linked master person ID.

---

### 2.2 Activity & Audit Stream API

#### `GET /api/activities`
Retrieve immutable chronological audit trail of calls, WhatsApp chats, and visits.
- **Query Parameters:** `leadId` (string, optional), `projectId` (string, optional), `limit` (number, default: 50).
- **Response `200 OK`:** Array of activity records with timestamps and actor details.

#### `POST /api/activities`
Log a sales interaction and update lead velocity.
- **Request Body:**
```json
{
  "leadId": "55555555-5555-5555-5555-555555550001",
  "type": "call",
  "outcome": "site_visit_booked",
  "outcomeLabel": "Site Visit Booked",
  "notes": "Spoke with client. Confirmed physical site walkthrough for Saturday 11:30 AM.",
  "durationSeconds": 145,
  "scheduledFollowUpAt": "Saturday, 11:30 AM"
}
```
- **Response `201 Created`:** Created activity record. Automatically updates `last_activity_at` on parent lead.

---

### 2.3 Autonomous AI Agent APIs

#### `POST /api/chat`
Streaming conversational AI lead qualification endpoint (Aria Agent).
- **Request Body:** `{ "messages": [ { "role": "user", "content": "Looking for 3 BHK in Gurgaon around 4 Cr" } ] }`
- **Features:** 10-message rolling window limit, max 1024 output tokens, temperature 0.3, tool invocation streaming.
- **Response:** `text/event-stream` UI Message Stream.

#### `POST /api/agent/resurrect`
Autonomous lost-lead resurrection scanner.
- **Request Body:** `{ "daysThreshold": 14 }`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "totalScanned": 12,
    "resurrectableOpportunities": [
      {
        "leadId": "lead-lost-1",
        "buyerName": "Rajeev Agarwal",
        "phone": "+919811122334",
        "daysInactive": 24,
        "matchedUnit": { "tower": "Tower Camellias B", "unitNumber": "B-1204", "price": 245000000 },
        "suggestedAngle": "New Tower Allotment",
        "revivalScore": 94
      }
    ],
    "latencyMs": 42
  }
}
```

---

### 2.4 Webhooks API (Inbound Event Receivers)

#### `GET & POST /api/webhooks/whatsapp`
Meta WhatsApp Cloud API Webhook Handler.
- **GET (Verification Handshake):** Validates `hub.verify_token` against `WHATSAPP_VERIFY_TOKEN` and echoes `hub.challenge`.
- **POST (Inbound Message):** Validates `X-Hub-Signature-256` HMAC with `WHATSAPP_APP_SECRET`. Idempotently registers inbound touchpoint into `activities` and `webhook_events`.

#### `GET & POST /api/webhooks/meta-lead-ads`
Meta Instant Form Lead Ads Webhook Handler.
- **POST:** Validates HMAC signature, extracts `leadgen_id`, and enqueues buyer for CRM ingestion.

---

### 2.5 Billing & Subscriptions API

#### `POST /api/billing/checkout`
Create a Stripe / Razorpay checkout session for subscription upgrade.
- **Request Body:** `{ "planId": "growth", "billingCycle": "yearly", "orgId": "org-1" }`
- **Response `200 OK`:** `{ "sessionId": "cs_growth_...", "checkoutUrl": "..." }`

#### `POST /api/billing/webhook`
Handles payment provider lifecycle events (`checkout.session.completed`, `customer.subscription.deleted`).
- **Signature Verification:** Validates `stripe-signature` or `x-razorpay-signature`.
- **Action:** Updates `organizations` subscription tier and seat allocations.

---

### 2.6 System Telemetry API

#### `GET /api/health`
Deep health and operational telemetry check.
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptimeSeconds": 4120,
    "services": {
      "database": { "status": "healthy", "latencyMs": 14, "provider": "Supabase PostgreSQL 15+" },
      "aiEngine": { "status": "ready", "model": "gemini-2.5-flash" },
      "memory": { "rssMb": 84, "heapUsedMb": 52 }
    }
  }
}
```
