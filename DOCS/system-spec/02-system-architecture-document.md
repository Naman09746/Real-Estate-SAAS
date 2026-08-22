# 02. System Architecture Document — Apex Realty CallCRM

**Document Version:** 1.0.0 (Production Release)  
**Architecture Style:** Modular Monolith (Next.js 15 App Router + React 19 + Supabase PostgreSQL)  
**Classification:** Enterprise Multi-Tenant SaaS

---

## 1. High-Level Architecture Topology

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT LAYER                                         │
│  - Next.js 15 App Router (React 19 Server & Client Components)                         │
│  - Tailwind CSS + Radix UI Primitives (Design Tokens: Indigo, Emerald, Slate)           │
│  - State Management: CRMContext (Reactive in-memory cache + Optimistic UI updates)     │
│  - Realtime Layer: TanStack React Query + Supabase WebSocket Channels                   │
└───────────────────────────┬─────────────────────────────────┬───────────────────────────┘
                            │                                 │
                 Direct Database Calls                Protected REST APIs
              (Supabase Client with JWT RLS)     (/api/leads, /api/activities, etc.)
                            │                                 │
                            ▼                                 ▼
┌───────────────────────────────────────────────┐ ┌───────────────────────────────────────┐
│          POSTGRESQL 15+ (SUPABASE)            │ │       ENTERPRISE SECURITY LAYER       │
│  - Row-Level Security (RLS) on all 15 Tables  │ │  - Token-Bucket Rate Limiter (Per IP) │
│  - Tenant Isolation Function: current_tenant()│ │  - Zod Inbound Schema Validation      │
│  - Phone Normalization Trigger (E.164)        │ │  - Idempotency Cache Lock (X-Idemp)   │
│  - Automatic updated_at Timestamps            │ │  - HMAC-SHA256 Signature Verifier     │
│  - Composite Indexing on (org_id, key)        │ │  - Zero-Information Error Responders  │
└───────────────────────────────────────────────┘ └───────────────────┬───────────────────┘
                                                                      │
                                                                      ▼
                                                  ┌───────────────────────────────────────┐
                                                  │       AUTONOMOUS AI AGENT ENGINE      │
                                                  │  - Vercel AI SDK 5 (streamText)       │
                                                  │  - Google Gemini 2.5 Flash            │
                                                  │  - Human Approval Gate Interceptor    │
                                                  │  - Execution Telemetry & Audit Logs   │
                                                  └───────────────────────────────────────┘
```

---

## 2. Component Subsystems & Responsibilities

### 2.1 Web Application & Router (`Frontend/src/app/`)
- **Framework:** Next.js 15.2.0 with Turbopack and React 19.
- **Route Architecture:**
  - `/(auth)/`: Unauthenticated and onboarding workflows (`login`, `setup-org`, `choose-plan`, `onboarding`).
  - `/dashboard`: Role-aware redirect hub (Boss Executive Dashboard vs Salesperson Home).
  - `/leads`, `/pipeline`, `/projects`, `/tasks`, `/activities`, `/people`, `/reports`, `/regions`, `/users`, `/settings`: Core CRM operations.
  - `/api/`: Protected serverless API routes with security middleware.

### 2.2 Global State & Optimistic UI (`Frontend/src/context/crm-context.tsx`)
- Centralized reactive bridge managing organizational state (`leads`, `tasks`, `projects`, `units`, `activities`, `people`, `documents`).
- **Strict Multi-Tenant Verification:** Every filtered selector (`filteredLeads`, `filteredTasks`, `reactivationLeads`) strictly enforces `record.orgId === currentUser.orgId`.
- **Sub-10ms UI Feedback:** State updates optimistically in React before resolving over the network.

### 2.3 Unified Data Service (`Frontend/src/lib/services/crm-data-service.ts`)
- Decouples UI components from storage implementation.
- Automatically communicates with live Supabase database when configured (`NEXT_PUBLIC_SUPABASE_URL`), with seamless fallback to localized in-memory cache for offline testing and demos.

### 2.4 Enterprise Server Security Layer (`Frontend/src/lib/server/api-security.ts`)
- **Rate Limiting:** Token-bucket algorithm enforcing request thresholds (writes: 30/min, reads: 120/min).
- **Idempotency Engine:** Prevents duplicate lead creation on network retries using `X-Idempotency-Key` headers and webhook event IDs.
- **HMAC Verification:** Validates webhook authenticity for Meta Lead Ads (`sha256`) and WhatsApp Cloud API payloads.
- **Sanitized Responders:** Generates standard JSON envelopes (`apiSuccess` / `apiError`) with unique `requestId` tracking (`req_...`).

---

## 3. Data Flow & Communication Patterns

### 3.1 Lead Ingestion & Qualification Flow
```
External Buyer ──► Meta Ad / WhatsApp ──► Webhook Route (/api/webhooks/*)
                                                    │ (HMAC Verified + Idempotency Check)
                                                    ▼
                                           People Table (Phone Dedup)
                                                    │
                                                    ▼
                                            Leads Table (Stage: New)
                                                    │
                                                    ▼
                                           Supabase Realtime Channel
                                                    │
                                                    ▼
                                      Sales Closer Screen Updates Instantly
```

### 3.2 AI Agent Human-in-the-Loop Flow
```
Buyer Dialogue ──► Aria Bot (Gemini 2.5) ──► Tool Call (qualifyAndCreateLead)
                                                        │
                                                        ▼
                                            Interactive Approval Card (UI)
                                                        │
                                            ┌───────────┴───────────┐
                                            ▼                       ▼
                                      [✓ APPROVE]              [✕ DISCARD]
                                            │                       │
                                            ▼                       ▼
                                   createLead(CRM)             No DB Mutation
                                            │
                                            ▼
                                   Lead Added to Pipeline
```

---

## 4. Multi-Tenant Architecture & Data Partitioning

Data partitioning uses a **Shared Database, Shared Schema with Row-Level Security (RLS)** model:
1. Every table (except system metadata) contains an `org_id UUID NOT NULL` column referencing `public.organizations(id)`.
2. Supabase JWT tokens carry the authenticated user's `org_id` and `role`.
3. PostgreSQL evaluates the policy `USING (org_id = current_tenant_id())` on every `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
4. Even if an API route omitted an `org_id` WHERE clause, the PostgreSQL kernel rejects cross-tenant reads or writes.

---

## 5. Technology Stack Summary

| Layer | Technologies | Version |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router), React, TypeScript | Next 15.2.0, React 19.0.0, TS 5 |
| **Styling & Components**| Tailwind CSS, Radix UI, Lucide Icons | Tailwind 3.4.17, Radix Primitives |
| **Database & Auth** | Supabase (PostgreSQL 15+), Supabase Auth | `@supabase/supabase-js` 2.49.1 |
| **AI Agentic Layer** | Vercel AI SDK, Google Gemini 2.5 Flash | `ai` 7.0.73, `@ai-sdk/google` 4.0.49 |
| **Testing Framework** | Vitest, Node Test Runner | Vitest 4.1.11 |
| **Knowledge Graph** | Graphify AST Engine | Graphify 1.0 (547 nodes, 1324 edges) |
