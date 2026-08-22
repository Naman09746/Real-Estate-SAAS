# Enterprise Multi-Tenant SaaS Backend Architecture

This document details the production backend architecture for **Apex Realty CallCRM**, incorporating enterprise security best practices (OWASP ASVS, OWASP API Security Top 10, multi-tenant isolation, cryptographic webhook verification, and autonomous agent audit trails).

---

## 1. Core Architectural Pillars

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 Client UI                     │
│  (React 19, App Router, SSR Auth, TanStack React Query)    │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       Direct Database Calls          Server-Side Protected APIs
    (Scoped by JWT Claims / RLS)      (/api/leads, /api/webhooks/*)
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│     PostgreSQL 15+ Engine    │ │   Enterprise Security Layer  │
│   (Row-Level Security / RLS) │ │ - Rate Limiter (Token Bucket)│
│ - Tenant Isolation           │ │ - Zod Inbound Validator      │
│ - Role-Based Visibility      │ │ - Idempotency Lock           │
│ - Phone Normalization Trg    │ │ - HMAC-SHA256 Verifier       │
└──────────────────────────────┘ └──────────────────────────────┘
```

1. **Database-Enforced Multi-Tenancy**: Data isolation is guaranteed at the PostgreSQL engine level via Row-Level Security (`RLS`). Application code bugs cannot accidentally leak cross-tenant data.
2. **Zero-Trust Input Validation**: Every request body is validated via strict `Zod` schemas. Malformed types, SQL/NoSQL injection payloads, and unwanted fields are rejected with structured `422/400` errors.
3. **Idempotent Ingestion**: All write APIs and webhooks accept an `X-Idempotency-Key` or parse provider event IDs to prevent duplicate leads and double charges.
4. **Cryptographic Webhook Handshake**: Inbound webhooks from Meta / WhatsApp Cloud API are validated using `HMAC-SHA256` signatures against app secrets.
5. **AI Agent Observability**: Autonomous agent tool invocations, prompts, tokens, and decisions are logged to `ai_agent_executions` for compliance, debugging, and cost tracking.

---

## 2. PostgreSQL Row-Level Security (RLS) Matrix

| Table | Policy Name | Permitted Scope |
| :--- | :--- | :--- |
| `organizations` | `org_tenant_isolation` | `id = current_tenant_id()` |
| `users` | `users_tenant_isolation` | `org_id = current_tenant_id()` |
| `people` | `people_tenant_isolation` | `org_id = current_tenant_id()` |
| `projects` | `projects_tenant_isolation` | `org_id = current_tenant_id()` |
| `project_units`| `project_units_tenant_isolation` | `org_id = current_tenant_id()` |
| `leads` | `leads_tenant_isolation` | `org_id = current_tenant_id()` AND (`role IN ('admin','manager')` OR `assigned_salesperson_id = auth.uid()`) |
| `activities` | `activities_tenant_isolation` | `org_id = current_tenant_id()` |
| `tasks` | `tasks_tenant_isolation` | `org_id = current_tenant_id()` AND (`role IN ('admin','manager')` OR `assigned_to_user_id = auth.uid()`) |
| `documents` | `documents_tenant_isolation` | `org_id = current_tenant_id()` |
| `ai_agent_executions` | `ai_agent_tenant_isolation` | `org_id = current_tenant_id()` |

---

## 3. Endpoints & Security Matrix

### 1. `GET /api/leads`
- **Authentication**: JWT Bearer Token (containing `org_id` and `user_id`).
- **Rate Limit**: 120 requests / min per IP.
- **Security Check**: Scoped strictly to the requesting user's tenant organization. Salespeople only receive their assigned opportunities.

### 2. `POST /api/leads`
- **Authentication**: JWT Bearer Token.
- **Rate Limit**: 30 requests / min per IP.
- **Idempotency**: Checked via `X-Idempotency-Key` header.
- **Validation**: Strict `createLeadSchema` (Zod). Normalizes Indian telephone numbers into E.164 (`+91XXXXXXXXXX`) and automatically deduplicates against existing `people` records.

### 3. `POST /api/activities`
- **Authentication**: JWT Bearer Token.
- **Function**: Immutable chronological audit stream logger. Triggers automatic `last_activity_at` updates on the parent lead and generates prioritized follow-up tasks if a next touchpoint was scheduled.

### 4. `POST /api/webhooks/whatsapp`
- **Authentication**: `X-Hub-Signature-256` HMAC validation with `WHATSAPP_APP_SECRET`.
- **Handshake**: Handled via `GET /api/webhooks/whatsapp` with `hub.verify_token`.
- **Idempotency**: Keyed by `wa_msg_<message_id>` in `webhook_events`.

### 5. `POST /api/webhooks/meta-lead-ads`
- **Authentication**: `X-Hub-Signature-256` HMAC validation.
- **Idempotency**: Keyed by `meta_leadgen_<leadgen_id>`.

### 6. `POST /api/agent/resurrect`
- **Function**: Autonomous lost-lead reactivation scanner. Cross-matches dormant buyer requirements against newly released project units and logs token usage and execution latency.

### 7. `GET /api/health`
- **Function**: Deep health check verifying PostgreSQL database latency, memory consumption, uptime, and AI engine status.

---

## 4. Standardized API Response Contracts

### Success Response (`200 / 201`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_a8f9c102",
    "timestamp": "2026-08-21T18:45:00.000Z",
    "page": 1,
    "limit": 50,
    "total": 142
  }
}
```

### Error Response (`400 / 401 / 403 / 422 / 429 / 500`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for input payload",
    "requestId": "req_7b3e198a",
    "details": [
      { "path": "phone", "message": "Invalid telephone format" }
    ]
  }
}
```
*(Note: Internal stack traces, raw SQL queries, and database passwords are never returned in client error responses).*

---

## 5. Security & QA Verification Checklist

- [x] **Authentication Bypass**: Unauthenticated requests to protected endpoints return `401 Unauthorized`.
- [x] **BOLA / IDOR Prevention**: Fetching/modifying records across organizations is blocked by PostgreSQL RLS.
- [x] **Tenant Data Isolation**: All queries require `org_id` match.
- [x] **Phone Deduplication**: Normalized E.164 deduplication prevents duplicate buyer identities.
- [x] **Rate Limiting**: Token-bucket protection enforces thresholds and returns `429 Too Many Requests`.
- [x] **Webhook Idempotency**: Duplicate webhook payloads are safely acknowledged without creating duplicate records.
- [x] **Audit Trail**: Every significant entity mutation is recorded in `activities` and `audit_logs`.
