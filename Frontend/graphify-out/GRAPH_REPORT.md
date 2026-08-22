# Graph Report - Frontend  (2026-08-22)

## Corpus Check
- 106 files · ~66,194 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 482 nodes · 1302 edges · 17 communities (14 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aa886274`
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

## God Nodes (most connected - your core abstractions)
1. `useCRM()` - 48 edges
2. `cn()` - 33 edges
3. `formatCurrencyINR()` - 25 edges
4. `apiError()` - 25 edges
5. `getSupabaseClient()` - 23 edges
6. `Button` - 21 edges
7. `apiSuccess()` - 19 edges
8. `useAuth()` - 17 edges
9. `Lead` - 16 edges
10. `Badge()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `useTestCRM()` --calls--> `useCRM()`  [EXTRACTED]
  src/__tests__/dom/crm-state-machine.test.tsx → src/context/crm-context.tsx
- `DialogFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dialog.tsx → src/lib/utils.ts
- `WhatsAppActionModal()` --calls--> `useCRM()`  [EXTRACTED]
  src/components/crm/whatsapp-action-modal.tsx → src/context/crm-context.tsx
- `LandingPage()` --calls--> `useAuth()`  [EXTRACTED]
  src/app/page.tsx → src/context/auth-context.tsx
- `SetupOrgPage()` --calls--> `useAuth()`  [EXTRACTED]
  src/app/(auth)/setup-org/page.tsx → src/context/auth-context.tsx

## Communities (17 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (71): GET(), POST(), messageShapeSchema, POST(), validateMessages(), checkoutSchema, POST(), GET() (+63 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (79): CRMContext, CRMContextType, INITIAL_ACTIVITIES, INITIAL_DOCUMENTS, INITIAL_LEADS, INITIAL_ORG, INITIAL_PEOPLE, INITIAL_PROJECTS (+71 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (46): ActivityHeatmap(), DAYS, HEATMAP_DATA, HOURS, AreaTrendChart(), DataPoint, DEFAULT_SERIES, CircularProgress() (+38 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (28): useCRM(), AiAgentCommandCenter(), AiLeadBot(), AiLeadBotProps, QualifiedLeadCardData, QUICK_PROMPTS, AiResurrectionModal(), BossOverview() (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (42): AiAgentCommandCenterProps, PRESET_BUYERS, CommandItem, GlobalSearchDialogProps, LeadDetailModalProps, QuickActivityModalProps, StructuredOutcome, WhatsAppActionModal() (+34 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (42): fraunces, ibmPlexMono, inter, metadata, LandingPage(), ChoosePlanPage(), PLANS, PlanTier (+34 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (19): aiAgentQualifySchema, createActivitySchema, createLeadSchema, createTaskSchema, idSchema, metaLeadAdsWebhookSchema, phoneSchema, resurrectScanSchema (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (12): enqueue(), flush(), flushRetries(), givenUpCallbacks, onWriteAbandoned(), queue, QueueEntry, reportGiveUp() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.38
Nodes (6): AUTH_FLOW_PREFIXES, config, isAuthFlow(), isProtected(), middleware(), PROTECTED_PREFIXES

### Community 9 - "Community 9"
Cohesion: 0.47
Nodes (3): ErrorMeta, forwardToReporter(), reportError()

## Knowledge Gaps
- **144 isolated node(s):** `config`, `config`, `securityHeaders`, `nextConfig`, `PROTECTED_PREFIXES` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `reportError()` connect `Community 9` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.229) - this node is a cross-community bridge._
- **Why does `apiError()` connect `Community 0` to `Community 9`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Community 5` to `Community 1`, `Community 2`, `Community 3`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `config`, `config`, `securityHeaders` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._