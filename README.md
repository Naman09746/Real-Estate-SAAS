# Apex Realty CallCRM — Architectural Real Estate Sales & AI Agent Command Center

CallCRM is an enterprise sales operating system and AI agent platform engineered specifically for high-ticket Indian luxury real estate developers, brokerage houses, and advisory desks.

Built with **Next.js 15 App Router**, **React 19**, **TypeScript**, **Tailwind CSS**, **Vercel AI SDK**, **Google Gemini 2.5 Flash**, and **Supabase** (Postgres + Auth + RLS + Realtime), CallCRM bridges executive command visibility with human-gated AI lead qualification and frictionless salesperson execution.

---

## ⚡ Key Differentiators & Value Pillars

1. **Human-Gated AI Intake & Qualification (Aria Agent)**: 24/7 conversational intake across web widgets that extracts budget, micro-market, unit config, and buyer intent, calculates lead scores — and stages every proposed deal behind an explicit **Approve/Reject** card before anything touches the pipeline. The AI never writes to the database on its own.
2. **AI Lost-Lead Resurrection Engine**: Manager-only scan (`/api/agent/resurrect`) cross-matches dormant buyer requirements against live inventory, generating personalized WhatsApp pitches for 1-click deal revival through the standard audited mutation path.
3. **Frictionless 10-Second Interaction Logger**: Complete structured outcome disposition and next-action follow-up scheduling in under 10 seconds without modal fatigue (<kbd>L</kbd>, <kbd>F</kbd>, <kbd>⌘K</kbd> hotkeys). Failed syncs auto-retry via the built-in retry queue.
4. **Multi-Tenant Security by Construction**: Row-Level Security on all 16 tables, `org_id` always derived from the verified session (never request bodies), fail-closed HMAC-verified webhooks, DB-trigger-enforced plan quotas, role changes guarded against self-elevation.
5. **Project Collateral & KYC Document Vault**: Repository for brochures, floor plans, cost sheets, and buyer KYC associated to leads and projects.
6. **Role-Tailored Workspaces**:
   - **Executive (Boss) Command Center**: Real computed KPIs (inflow momentum, stage aging, follow-up closure rate), regional filters that actually filter, overdue tracking, and lost-lead radar.
   - **Salesperson Daily Cockpit**: Action-first task timeline, prioritized next best actions, hot deal alerts, and matching inventory recommendations.

---

## 🧠 AI Agents & Automation Modules

> For the full architectural breakdown, see [`DOCS/ai-agents-and-automation.md`](./DOCS/ai-agents-and-automation.md).

| Agent / Engine | Purpose | Trust Model |
| :--- | :--- | :--- |
| **Aria Lead Qualifier** | Conversational intake & qualification proposals | Gemini 2.5 Flash · no-execute tool · human approval required |
| **Lost-Lead Resurrector** | Dormant-deal ↔ live-inventory matching | Server-side manager+ scan (read-only) · client applies via audited writes |
| **WhatsApp Sales Engine** | 1-click templated outreach & instant logging | Outbound `wa.me/` · inbound webhook HMAC + replay guard |
| **Live Sync Telemetry** | Cross-device convergence | Supabase Realtime `postgres_changes` on leads/tasks/activities |

---

## System Architecture

```
Real-estate/
├── supabase/migrations/            # Canonical DB — apply in order:
│   ├── 0001_init.sql               #   multi-tenant schema, RLS, org bootstrap trigger
│   ├── 0002_sample_seed.sql        #   first-run sample data RPC
│   ├── 0003_rate_limiting.sql      #   durable Postgres rate limiter
│   ├── 0004_tenant_defaults.sql    #   org_id column defaults
│   ├── 0005_authorization_hardening.sql # role guard, task scoping, ownership
│   └── 0006_billing_quotas.sql     #   billing columns + lead/seat quota triggers
├── .github/workflows/ci.yml        # CI: lint → vitest → next build
├── DOCS/                           # Architecture blueprints & AI agent guides
└── Frontend/
    ├── Dockerfile                  # Multi-stage standalone production image (non-root)
    ├── .env.local.example          # Complete environment template
    └── src/
        ├── middleware.ts           # Edge route protection (JWT revalidation)
        ├── app/                    # App Router: marketing page, auth flow,
        │   │                       # CRM routes (thin AppShell wrappers), /api/*
        │   └── api/                # chat · leads · activities · agent/resurrect ·
        │                           # health · billing/* · webhooks/*  (all gated)
        ├── components/crm/pages/   # Page bodies; routes are thin AppShell wrappers
        ├── context/                # auth-context (Supabase sessions) · crm-context
        │                           # (hydration + optimistic write-through mutations)
        ├── lib/
        │   ├── persistence/        # crm-sync (row↔domain mappers) · retry-queue
        │   ├── observability/      # structured [CRM_ERROR] reporter
        │   ├── server/             # api-security · supabase-server · validations ·
        │   │                       # rate-limit · subscription (server-only modules)
        │   ├── mock-data.ts        # Demo dataset (unauthenticated mode only)
        │   └── utils.ts            # ₹ Lakh/Cr currency, phone formatters
        ├── types/crm.ts            # Domain TypeScript definitions
        └── __tests__/              # 60 tests: unit · security primitives ·
                                    # persistence mappers · CRM state machine (jsdom)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 9+
- A Supabase project (free tier works)

### 1. Database setup
Apply migrations in numeric order (SQL Editor or Supabase CLI):
```
supabase/migrations/0001_init.sql        → 0006_billing_quotas.sql
```
This provisions the multi-tenant schema, RLS policies, org auto-bootstrap on signup, first-run sample-data seeding, quota triggers, and durable rate limiting. All migrations are validated against real PostgreSQL.

### 2. Environment
```bash
cd Frontend
cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# Optional: GEMINI_API_KEY, webhook secrets, BILLING_WEBHOOK_SECRET
```

### 3. Run
```bash
npm install
npm run dev        # http://localhost:3000
```
Signing up auto-provisions your organization, owner profile, default pipeline stages, and a representative sample dataset so the cockpit is usable immediately.

Without env configuration the app runs in demo mode (mock dataset, in-memory) for UI exploration only — authentication is never faked.

### Testing & CI
```bash
npm test           # 60 tests: unit, security primitives, mappers, state machine
npm run lint       # ESLint (next/core-web-vitals)
npm run build      # typecheck + production compile
```
GitHub Actions runs lint → test → build on every push/PR.

### Production (Docker)
```bash
docker build -t callcrm:latest .
docker run -p 3000:3000 --env-file .env.production callcrm:latest
# Non-root standalone runtime; HEALTHCHECK probes /api/health
```

---

## 🎹 Global Keyboard Shortcuts
- <kbd>L</kbd> — Open Rapid Activity Logger (10s)
- <kbd>F</kbd> — Jump to Tasks & Follow-ups
- <kbd>/</kbd> or <kbd>⌘K</kbd> — Open Command Palette & Global Search
- <kbd>Esc</kbd> — Close any open modal or drawer

---

## 📄 License & Copyright

© 2026 Apex Realty Technologies. All rights reserved.
