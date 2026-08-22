# Graph Report - Real-estate  (2026-08-22)

## Corpus Check
- 233 files · ~177,899 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1530 nodes · 3381 edges · 72 communities (67 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `de600f33`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]

## God Nodes (most connected - your core abstractions)
1. `apiError()` - 120 edges
2. `apiSuccess()` - 111 edges
3. `getApiAuthContext()` - 107 edges
4. `getServiceRoleClient()` - 71 edges
5. `getAuthenticatedServerClient()` - 66 edges
6. `isLiveSupabaseAvailable` - 58 edges
7. `useCRM()` - 52 edges
8. `checkRateLimit()` - 51 edges
9. `cn()` - 33 edges
10. `formatCurrencyINR()` - 32 edges

## Surprising Connections (you probably didn't know these)
- `CRMProvider()` --calls--> `useAuth()`  [EXTRACTED]
  Frontend/src/context/crm-context.tsx → Frontend/src/context/auth-context.tsx
- `TopBar()` --calls--> `useCRM()`  [EXTRACTED]
  Frontend/src/components/layout/top-bar.tsx → Frontend/src/context/crm-context.tsx
- `WhatsAppActionModal()` --calls--> `useCRM()`  [EXTRACTED]
  Frontend/src/components/crm/whatsapp-action-modal.tsx → Frontend/src/context/crm-context.tsx
- `GlobalSearchDialog()` --calls--> `useCRM()`  [EXTRACTED]
  Frontend/src/components/crm/global-search-dialog.tsx → Frontend/src/context/crm-context.tsx
- `useTestCRM()` --calls--> `useCRM()`  [EXTRACTED]
  Frontend/src/__tests__/dom/crm-state-machine.test.tsx → Frontend/src/context/crm-context.tsx

## Communities (72 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (103): acceptInviteSchema, POST(), GET(), POST(), GET(), POST(), RouteParams, POST() (+95 more)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (63): afterNonStageUpdate, afterStageUpdate, assignRepTest, assignStateExists, auditCount, beforeTime, billingEvent, candRpc (+55 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (52): fetchMetaLeadData(), GET(), isFreshWebhookTime(), parseFieldData(), POST(), timingSafeCompare(), verifyHmacSignature(), InboundLeadParams (+44 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (52): messageShapeSchema, POST(), validateMessages(), AiLeadBotProps, ChatMessage, QualifiedLeadCardData, QUICK_PROMPTS, AriaToolContext (+44 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (25): useCRM(), AiAgentCommandCenter(), AiLeadBot(), AiResurrectionModal(), BossOverview(), LeadDetailModal(), PipelineBoard(), STAGES (+17 more)

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (48): activities, baseLead, fixedNow, fourOverdue, initialRes, initialTasks, lead, lead15d (+40 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (46): DEFAULT_RESURRECTION_WEIGHTS, getMatchTier(), MatchingWeights, normalizeConfiguration(), scoreUnitForLead(), altProject, altUnit, baseLead (+38 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (31): ActivityHeatmap(), DAYS, HEATMAP_DATA, HOURS, AreaTrendChart(), DataPoint, DEFAULT_SERIES, CircularProgress() (+23 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (41): aiAgentQualifySchema, bulkImportUnitsSchema, createActivitySchema, createDocumentSchema, createInvitationSchema, createLeadSchema, createProjectSchema, createProjectUnitSchema (+33 more)

### Community 9 - "Community 9"
Cohesion: 0.05
Nodes (38): CallCRM — Technical Implementation Audit & Codebase Verification, Category 1: Tenant Isolation, RBAC & Security, Category 2: Core Organization & Inventory Management, Category 3: Data Ingestion, Export & Storage, Category 4: Billing & Subscription Enforcement, Category 5: AI Agents, Automations & Intelligence, code:tsx (const handleSave = (e: React.FormEvent) => {), code:tsx (const handleExport = () => {) (+30 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (36): CRMContext, CRMContextType, INITIAL_ACTIVITIES, INITIAL_DOCUMENTS, INITIAL_ORG, INITIAL_PEOPLE, INITIAL_PROJECTS, INITIAL_REGIONS (+28 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (29): LandingPage(), ChoosePlanPage(), PLANS, PlanTier, AuthContext, AuthContextType, AuthOrg, AuthUser (+21 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (35): getSupabaseClient(), isSupabaseConfigured, activityToRow(), AnyRow, CrmHydration, deleteDocumentRemote(), deleteProjectRemote(), deleteRegionRemote() (+27 more)

### Community 13 - "Community 13"
Cohesion: 0.23
Nodes (14): SalespersonHomeProps, Badge(), badgeVariants, Button, ButtonProps, buttonVariants, Card, CardContent (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (28): 03. API Documentation — Apex Realty CallCRM, 1.1 Standard Success Envelope (`200 OK`, `201 Created`), 1.2 Standard Error Envelope (`400`, `401`, `403`, `422`, `429`, `500`), 1. Global API Standards & Envelopes, 2.1 Leads Management API, 2.2 Activity & Audit Stream API, 2.3 Autonomous AI Agent APIs, 2.4 Webhooks API (Inbound Event Receivers) (+20 more)

### Community 15 - "Community 15"
Cohesion: 0.08
Nodes (28): AuthContext, boss, bossRes, deleteRes, doc1, DocumentRecord, evaluateDocumentMutation(), evaluateLeadUpdate() (+20 more)

### Community 16 - "Community 16"
Cohesion: 0.08
Nodes (28): 1. 🔴 Supabase — REQUIRED (database + auth + realtime), 2. 🟠 Google Gemini — for the Aria AI agent, 3. 🟡 WhatsApp Cloud API — inbound message ingestion, 4. 🟡 Meta Lead Ads — instant lead capture from Facebook/Instagram ads, 5. 🟡 Payments & Billing — Stripe and Razorpay (Multi-Gateway + Sandbox), 5. 🟡 Payments — Stripe *or* Razorpay (pick one to start), 6. ⚪ Error Tracking (recommended before launch), API Keys & Environment Setup Guide (+20 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (16): metadata, PlanItem, PLANS_DATA, props, actionCardProps(), Input, InputProps, TaskStatusBadge() (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.07
Nodes (26): ARCHITECTURE ASSESSMENT, CALLCRM PRODUCTION-READINESS AUDIT & IMPLEMENTATION ROADMAP, Critical Issues (P0), EXECUTIVE SUMMARY, IMMEDIATE ACTION ITEMS (COMPLETED & VERIFIED), Important Issues (P1), Nice-to-Have (P3), PHASE 11-18: RELIABILITY, SCALABILITY, UX AUDIT (+18 more)

### Community 19 - "Community 19"
Cohesion: 0.08
Nodes (26): 1. Executive Summary & Design Philosophy, 2. Agent 1: Aria 2.0 — Real Estate Sales Intelligence Assistant, 2. Agent 1: Aria — Lead Qualification Agent (Human-Gated), 3. Agent 2: Lost-Lead Resurrection Engine, 4. Automation 3: WhatsApp Sales Assistant Engine, 5. Automation 4: Real-Time Event Sync, 6. Business Impact Model, 7. Configuration & Environment (+18 more)

### Community 20 - "Community 20"
Cohesion: 0.19
Nodes (16): AiResurrectionModalProps, LeadDetailModalProps, NotificationPreferencesDialog(), NotificationPreferencesDialogProps, NotificationsDrawer(), NotificationsDrawerProps, WhatsAppActionModal(), WhatsAppActionModalProps (+8 more)

### Community 21 - "Community 21"
Cohesion: 0.09
Nodes (22): 1. Core Architectural Pillars, 1. `GET /api/leads`, 2. `POST /api/leads`, 2. PostgreSQL Row-Level Security Matrix, 2. PostgreSQL Row-Level Security (RLS) Matrix, 3. Endpoints & Security Matrix, 3. `POST /api/activities`, 4. `POST /api/webhooks/whatsapp` (+14 more)

### Community 22 - "Community 22"
Cohesion: 0.09
Nodes (21): cancelSubscriptionSchema, createRefundSchema, updateBillingProfileSchema, atQuota, expiredGrace, futureGrace, growthOver, growthUnder (+13 more)

### Community 23 - "Community 23"
Cohesion: 0.14
Nodes (13): LogContext, Logger, LogLevel, REDACTED_KEYS, sanitizeLogData(), blockedCheck, check, cleaned (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.1
Nodes (19): 1. Database setup, 2. Environment, 3. Run, 🧠 AI Agents & Automation Modules, Apex Realty CallCRM — Architectural Real Estate Sales & AI Agent Command Center, code:block1 (Real-estate/), code:block2 (supabase/migrations/0001_init.sql        → 0006_billing_quot), code:bash (cd Frontend) (+11 more)

### Community 25 - "Community 25"
Cohesion: 0.1
Nodes (19): 1. System Architecture & Component Map, 2. Full Security & Isolation Matrix, 3. Data Integrity & Database Hardening (Migrations 0001–0017), 4. Concurrency & Race-Condition Controls, 5. Verification & Test Suite Summary, 6. Production Deployment Runbook, Atomic Unit Reservation (`public.reserve_project_unit`), CallCRM — Production Readiness & Deployment Guide (+11 more)

### Community 26 - "Community 26"
Cohesion: 0.1
Nodes (19): 1. Overview & Architecture, 2. SLA & Deal Health Rules Engine, 3. In-App Notification System & Idempotency Strategy, 4. Audit Logging Integration, 5. Security & Multi-Tenant Isolation, 6. Manual Testing & Invocation Instructions, A. Stage Velocity (`days_in_stage`), B. Follow-Up Task Automation (+11 more)

### Community 27 - "Community 27"
Cohesion: 0.1
Nodes (18): 06. Deployment & Operations Runbook — Apex Realty CallCRM, 1.1 Pre-Deployment Checklist, 1.2 Step-by-Step Deployment Guide, 1. Production Deployment Workflow, 2.1 Applying Database Migrations (Supabase), 2.2 Migration Rollback Strategy, 2. Database Migration & Rollback Procedures, 3.1 Live Health Check Endpoint (`GET /api/health`) (+10 more)

### Community 28 - "Community 28"
Cohesion: 0.15
Nodes (19): mapActivityRow(), mapActivityType(), mapDocumentRow(), mapLeadRow(), mapPersonRow(), mapProjectRow(), mapTaskRow(), mapUnitRow() (+11 more)

### Community 29 - "Community 29"
Cohesion: 0.16
Nodes (16): fraunces, ibmPlexMono, inter, metadata, AuthProvider(), CRMProvider(), lead, leadWithUnit (+8 more)

### Community 30 - "Community 30"
Cohesion: 0.16
Nodes (16): fixedNow, mapped, sampleRaw, { startDate, endDate }, testCases, DateRangePreset, DealHealthSummaryAnalytics, ExecutiveDashboardAnalytics (+8 more)

### Community 31 - "Community 31"
Cohesion: 0.15
Nodes (16): AiAgentCommandCenterProps, PRESET_BUYERS, CommandItem, GlobalSearchDialog(), GlobalSearchDialogProps, DealHealth, BadgeProps, DealHealthBadge() (+8 more)

### Community 32 - "Community 32"
Cohesion: 0.12
Nodes (15): 02. System Architecture Document — Apex Realty CallCRM, 1. High-Level Architecture Topology, 2.1 Web Application & Router (`Frontend/src/app/`), 2.2 Global State & Optimistic UI (`Frontend/src/context/crm-context.tsx`), 2.3 Unified Data Service (`Frontend/src/lib/services/crm-data-service.ts`), 2.4 Enterprise Server Security Layer (`Frontend/src/lib/server/api-security.ts`), 2. Component Subsystems & Responsibilities, 3.1 Lead Ingestion & Qualification Flow (+7 more)

### Community 33 - "Community 33"
Cohesion: 0.15
Nodes (14): CheckoutSessionParams, CheckoutSessionResult, RefundResult, BillingCustomer, BillingCycle, BillingInvoice, BillingOverviewData, BillingProvider (+6 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (12): cancelled, completed, days, entered10DaysAgo, enteredJustNow, lost, notifOrgA, notifOrgB (+4 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (14): 04. Database & Data Model Specification — Apex Realty CallCRM, 1. Entity Relationship Diagram (Conceptual), 2.1 `public.organizations` (Tenant Partition), 2.2 `public.people` (Master Contact & Phone Dedup Anchor), 2.3 `public.projects` (Development Catalog), 2.4 `public.project_units` (Inventory Matrix), 2.5 `public.leads` (Sales Opportunities), 2.6 `public.activities` (Immutable Audit Stream) (+6 more)

### Community 36 - "Community 36"
Cohesion: 0.13
Nodes (14): 1. **Aria — Lead Qualification Agent (Human-Gated)**, 1. Project Overview & Role, 2. Essential Commands, 2. **Lost-Lead Resurrection Engine**, 3. Strict Operating Rules & Constraints, 3. **WhatsApp Sales Engine**, 4. Architecture & Directory Layout, 4. **Billing & Entitlements** (+6 more)

### Community 37 - "Community 37"
Cohesion: 0.13
Nodes (13): 08. Test Strategy & Test Plan — Apex Realty CallCRM, 1. Test Architecture & Strategy Pyramid, 2.1 `phone-dedup.test.ts` (Phone Normalization & Currency Formatting), 2.2 `rate-limiting.test.ts` (Token Bucket & Idempotency), 2.3 `validations.test.ts` (Zod Inbound Payload Verification), 2.4 `webhook-security.test.ts` (HMAC-SHA256 Cryptographic Verification), 2.5 `subscription.test.ts` (Plan Quotas & Feature Gating), 2.6 `crm-sync-mappers.test.ts` & Supporting Suites (+5 more)

### Community 38 - "Community 38"
Cohesion: 0.13
Nodes (13): 01. Product Requirements Document (PRD) — Apex Realty CallCRM, 1.1 The High-Ticket Real Estate Challenge, 1.2 The CallCRM Solution, 1. Executive Summary & Problem Statement, 2. User Personas & Roles, 3.1 Master Contact Identity & Phone Deduplication, 3.2 7-Stage Luxury Sales Pipeline, 3.3 10-Second Quick Activity Logger (+5 more)

### Community 39 - "Community 39"
Cohesion: 0.14
Nodes (13): 1. Core Health Model, 2. Factor Attribution Matrix, 3. Structured Output & Explainability, 4. Execution Architecture, 5. Aria 2.0 & UI Integration, Clamping & Invariants, code:block1 (Score: 0 – 100), code:json ({) (+5 more)

### Community 40 - "Community 40"
Cohesion: 0.14
Nodes (13): 1. Overview, 2. 100-Point Scoring Architecture, 3. Hard Exclusion Rules & Safety, 4. Re-Engagement Workflow, 5. API Endpoints, 6. Database Schema & RPCs, CallCRM — Phase 10: Multi-Factor Resurrection Engine, code:mermaid (flowchart TD) (+5 more)

### Community 41 - "Community 41"
Cohesion: 0.22
Nodes (11): enqueue(), flush(), flushRetries(), givenUpCallbacks, queue, QueueEntry, reportGiveUp(), requeue() (+3 more)

### Community 42 - "Community 42"
Cohesion: 0.15
Nodes (12): 1. Database Migration `0013_phase7_lead_ingestion.sql`, 2. Reusable Ingestion Engine (`Frontend/src/lib/server/lead-ingestion.ts`), 3. Meta Lead Ads Webhook (`Frontend/src/app/api/webhooks/meta-lead-ads/route.ts`), 4. WhatsApp Webhook (`Frontend/src/app/api/webhooks/whatsapp/route.ts`), 5. Webhook Retry & Dead-Letter Endpoint (`Frontend/src/app/api/webhooks/retry/route.ts`), CallCRM — Phase 7: Lead Ingestion Automation, code:mermaid (flowchart TD), Ingestion Flow & Architecture (+4 more)

### Community 43 - "Community 43"
Cohesion: 0.17
Nodes (11): 1. Overview & Architecture, 2. Data Model & Migrations, 3. Multi-Tenant Privacy & Strict Row Level Security, 4. Notification Emission & Idempotency, 5. Client UI & Realtime Integration, 6. Endpoints, Centralized Notifications, Real-Time Alert Center & Notification System, code:block1 (┌──────────────────────────────────────────────────────────┐) (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.17
Nodes (10): 07. AI Agent & Automation System Specification — Apex Realty CallCRM, 1. Agent Architecture & Role Definitions, 2. Aria Agent System Prompt & Directives, 3. Tool Specifications & Zod Schemas, 4. Human-in-the-Loop Safety & Approval Gate, 5. Lost-Lead Resurrection Engine, code:block1 (┌───────────────────────────────────────────────┐), code:markdown (You are Aria, an elite Senior AI Property Advisor and Autono) (+2 more)

### Community 45 - "Community 45"
Cohesion: 0.17
Nodes (11): 1. Architectural Highlights, 1. Database Hardening & Concurrency Protection (`0017_phase11_production_hardening.sql`), 2. Structured Production Logger & PII/Secret Redaction (`Frontend/src/lib/server/logger.ts`), 2. Validation & Quality Gates, 3. Billing UI & Authoritative Verification Polish (`Frontend/src/components/crm/pages/billing-page.tsx` & `billing-success-view.tsx`), CallCRM — Phase 11: Final Production Hardening & Security Audit, CallCRM — Phase 8 Walkthrough & Verification Report, Executive Overview (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.24
Nodes (9): verifyProviderWebhookSignature(), GatedFeature, isPlanId(), isSubscriptionActive(), resolvePlan(), SubscriptionStatus, UpdateSubscriptionParams, ACTIVATION_EVENTS (+1 more)

### Community 47 - "Community 47"
Cohesion: 0.18
Nodes (10): 1. Overview, 1. `public.get_pipeline_analytics`, 2. PostgreSQL Analytics RPCs (`supabase/migrations/0015_phase9_server_side_analytics.sql`), 2. `public.get_rep_performance_analytics`, 3. `public.get_time_series_analytics`, 3. Server Endpoints, 4. Deterministic Forecasting Methodology, 4. `public.get_pipeline_velocity_analytics` (+2 more)

### Community 48 - "Community 48"
Cohesion: 0.18
Nodes (9): 05. Security & Threat Model — Apex Realty CallCRM, 1. Threat Modeling Overview (STRIDE Matrix), 2.1 Broken Object Level Authorization (BOLA / IDOR), 2.2 Broken Authentication & Session Management, 2.3 AI Agent Prompt Injection & Autonomous Action Attack, 2.4 Webhook Forgery & Replay Attacks, 2. Deep Dive: Top SaaS Vulnerability Mitigations, 3. Rate Limiting Thresholds (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.18
Nodes (9): 09. UX & Product Specification — Apex Realty CallCRM, 1. Core UX Principles, 2.1 Boss Executive Cockpit (`/dashboard` & `/reports`), 2.2 Salesperson Action-First Home (`/dashboard` for reps), 2.3 7-Stage Interactive Pipeline Board (`/pipeline`), 2.4 Project Inventory & Tower Explorer (`/projects`), 2. Primary Product Surfaces, 3. Global Keyboard Navigation & Hotkeys (+1 more)

### Community 50 - "Community 50"
Cohesion: 0.31
Nodes (7): checkFeatureAccess(), checkLeadQuota(), PLAN_CONFIGS, PlanLimits, QuotaCheckResult, atLimit, underLimit

### Community 51 - "Community 51"
Cohesion: 0.22
Nodes (7): [0.5.0] - 2026-08-20 — Frontend Visual MVP Release, 12. Changelog & Release Notes — Apex Realty CallCRM, [1.0.0] - 2026-08-22 — Enterprise Production Release, 🚀 Added, 🚀 Added, 🔒 Security Hardening, 🎨 UI/UX Enhancements

### Community 52 - "Community 52"
Cohesion: 0.25
Nodes (6): 11. Architecture Decision Records (ADRs) — Apex Realty CallCRM, ADR 001: Next.js 15 App Router & React 19 as the Core Full-Stack Framework, ADR 002: PostgreSQL Row-Level Security (RLS) for Multi-Tenant Data Isolation, ADR 003: Master `people` Table as the E.164 Phone Deduplication Anchor, ADR 004: Human-in-the-Loop Approval Gate for AI Lead Qualification, ADR 005: Graphify AST Knowledge Graph for Zero-Token Codebase Navigation

### Community 53 - "Community 53"
Cohesion: 0.38
Nodes (6): AUTH_FLOW_PREFIXES, config, isAuthFlow(), isProtected(), middleware(), PROTECTED_PREFIXES

### Community 54 - "Community 54"
Cohesion: 0.38
Nodes (5): TopBar(), TopBarProps, Avatar, AvatarFallback, AvatarImage

### Community 55 - "Community 55"
Cohesion: 0.29
Nodes (6): ComputedDealHealth, computeDealHealth(), DealHealthActivityInput, DealHealthFactor, DealHealthLeadInput, DealHealthTaskInput

### Community 56 - "Community 56"
Cohesion: 0.29
Nodes (5): 10. Environment & Configuration Reference — Apex Realty CallCRM, 1. Environment Variables Matrix, 2. Zero-Setup Local Development Resilience, 3. Sample Configuration File (`.env.local`), code:bash (# ==========================================================)

### Community 57 - "Community 57"
Cohesion: 0.47
Nodes (5): checkoutSchema, createProviderCheckoutSession(), getActiveBillingProvider(), getPlanPrice(), createCheckoutSessionSchema

### Community 58 - "Community 58"
Cohesion: 0.47
Nodes (3): ErrorMeta, forwardToReporter(), reportError()

### Community 59 - "Community 59"
Cohesion: 0.4
Nodes (4): 1. Ask BFS natural language questions about codebase connections:, 2. Find the shortest call-path between any two symbols:, 3. Get plain-language explanation of a component and its callers:, 4. Refresh after code updates (automatic on git commit):

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (3): cleanup(), ownerIdRef(), psql()

## Knowledge Gaps
- **705 isolated node(s):** `config`, `config`, `securityHeaders`, `nextConfig`, `email` (+700 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `apiError()` connect `Community 0` to `Community 2`, `Community 3`, `Community 46`, `Community 57`, `Community 58`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `reportError()` connect `Community 58` to `Community 0`, `Community 10`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Community 11` to `Community 4`, `Community 10`, `Community 20`, `Community 54`, `Community 29`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `config`, `config`, `securityHeaders` to the rest of the system?**
  _705 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._