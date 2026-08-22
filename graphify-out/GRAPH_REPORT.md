# Graph Report - Real-estate  (2026-08-22)

## Corpus Check
- 118 files · ~84,362 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 547 nodes · 1324 edges · 21 communities (17 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8ebf1643`
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

## God Nodes (most connected - your core abstractions)
1. `useCRM()` - 46 edges
2. `cn()` - 33 edges
3. `formatCurrencyINR()` - 25 edges
4. `apiError()` - 24 edges
5. `getSupabaseClient()` - 23 edges
6. `Button` - 21 edges
7. `apiSuccess()` - 19 edges
8. `useAuth()` - 17 edges
9. `Lead` - 16 edges
10. `Badge()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `LandingPage()` --calls--> `useAuth()`  [EXTRACTED]
  Frontend/src/app/page.tsx → Frontend/src/context/auth-context.tsx
- `SetupOrgPage()` --calls--> `useAuth()`  [EXTRACTED]
  Frontend/src/app/(auth)/setup-org/page.tsx → Frontend/src/context/auth-context.tsx
- `ChoosePlanPage()` --calls--> `useAuth()`  [EXTRACTED]
  Frontend/src/app/(auth)/choose-plan/page.tsx → Frontend/src/context/auth-context.tsx
- `LoginForm()` --calls--> `useAuth()`  [EXTRACTED]
  Frontend/src/app/(auth)/login/page.tsx → Frontend/src/context/auth-context.tsx
- `OnboardingPage()` --calls--> `useAuth()`  [EXTRACTED]
  Frontend/src/app/(auth)/onboarding/page.tsx → Frontend/src/context/auth-context.tsx

## Communities (21 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (82): GET(), POST(), messageShapeSchema, POST(), validateMessages(), checkoutSchema, POST(), GET() (+74 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (57): useCRM(), AiAgentCommandCenter(), AiLeadBot(), AiLeadBotProps, QualifiedLeadCardData, QUICK_PROMPTS, AiResurrectionModal(), AiResurrectionModalProps (+49 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (77): CRMContext, CRMContextType, INITIAL_ACTIVITIES, INITIAL_DOCUMENTS, INITIAL_LEADS, INITIAL_ORG, INITIAL_PEOPLE, INITIAL_PROJECTS (+69 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (40): fraunces, ibmPlexMono, inter, metadata, LandingPage(), ChoosePlanPage(), PLANS, PlanTier (+32 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (29): AiAgentCommandCenterProps, PRESET_BUYERS, STAGES, SalespersonHomeProps, DealHealth, LeadScoreLabel, PipelineStage, Badge() (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (26): ActivityHeatmap(), DAYS, HEATMAP_DATA, HOURS, AreaTrendChart(), DataPoint, DEFAULT_SERIES, CircularProgress() (+18 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (26): ARCHITECTURE ASSESSMENT, CALLCRM PRODUCTION-READINESS AUDIT & IMPLEMENTATION ROADMAP, Critical Issues (P0), EXECUTIVE SUMMARY, IMMEDIATE ACTION ITEMS (COMPLETED & VERIFIED), Important Issues (P1), Nice-to-Have (P3), PHASE 11-18: RELIABILITY, SCALABILITY, UX AUDIT (+18 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (21): 1. Executive Summary & Why "Agentic" Matters, 2. Agent 1: Aria — Autonomous Lead Qualification & Intake Agent, 3. Agent 2: Autonomous Lost-Lead Resurrection Agent, 4. Automation 3: WhatsApp Sales Assistant Engine, 5. Automation 4: Real-Time Event Sync Engine, 6. Business Impact & Organization ROI, 7. Configuration & Environment Setup, AI Agents & Automation Architecture — Apex CallCRM (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (18): 1. Core Architectural Pillars, 1. `GET /api/leads`, 2. `POST /api/leads`, 2. PostgreSQL Row-Level Security (RLS) Matrix, 3. Endpoints & Security Matrix, 3. `POST /api/activities`, 4. `POST /api/webhooks/whatsapp`, 4. Standardized API Response Contracts (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (13): 🧠 AI Agents & Automation Modules, Apex Realty CallCRM — Architectural Real Estate Sales & AI Agent Command Center, Building for Production, code:block1 (Real-estate/), code:bash (# Navigate to application folder), code:bash (cd Frontend), 🚀 Getting Started & Local Development, 🎹 Global Keyboard Shortcuts (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (13): 1. **Aria — Autonomous Lead Qualification Agent**, 1. Project Overview & Role, 2. Essential Commands, 2. **Lost-Lead Resurrection Engine**, 3. Strict Operating Rules & Constraints, 3. **WhatsApp Sales Engine**, 4. Architecture & Directory Layout, 5. AI Agents & Automation Modules (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.38
Nodes (6): AUTH_FLOW_PREFIXES, config, isAuthFlow(), isProtected(), middleware(), PROTECTED_PREFIXES

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (4): 1. Ask BFS natural language questions about codebase connections:, 2. Find the shortest call-path between any two symbols:, 3. Get plain-language explanation of a component and its callers:, 4. Refresh after code updates (automatic on git commit):

## Knowledge Gaps
- **194 isolated node(s):** `config`, `config`, `nextConfig`, `PROTECTED_PREFIXES`, `AUTH_FLOW_PREFIXES` (+189 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Community 3` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 5` to `Community 1`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `useCRM()` connect `Community 1` to `Community 2`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `config`, `config`, `nextConfig` to the rest of the system?**
  _194 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._