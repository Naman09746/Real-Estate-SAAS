# CLAUDE.md — CallCRM Developer & AI Agent Guidelines

This document outlines architectural principles, development commands, design rules, and domain standards for **CallCRM (Apex Realty)**.

---

## 1. Project Overview & Role

- **Project**: CallCRM for Apex Realty
- **Domain**: High-ticket Indian luxury real estate sales operating system & daily salesperson cockpit with Autonomous AI Agents.
- **Application Directory**: `Frontend/` (Next.js 15 App Router)
- **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI Primitives, Lucide React, Vercel AI SDK 5 (`ai`, `@ai-sdk/react`), Google Gemini 2.5 Flash (`@ai-sdk/google`), Supabase Realtime client SDK ready.

---

## 2. Essential Commands

All development commands must be run from within the `Frontend/` directory:

```bash
# Navigate to application folder
cd Frontend

# Install dependencies
npm install

# Start local development server (Port 3000)
npm run dev

# Run production build & verify TypeScript compilation
npm run build

# Start production server
npm run start

# Run ESLint validation
npm run lint
```

---

## 3. Strict Operating Rules & Constraints

1. **Git Policy (CRITICAL)**:
   - **DO NOT commit or push to Git** unless the user explicitly commands it in their prompt (`"commit and push"`).
2. **Design Language & Visual Identity**:
   - **Background**: Soft off-white (`#fcfcf9` / `hsl(60, 20%, 98%)`) with architectural blueprint touches.
   - **Cards & Surfaces**: Clean white (`#ffffff`) with subtle 1px border (`#e8e8e3`) and light box-shadow.
   - **Typography**: Crisp deep navy / charcoal (`#1a1f2c`).
   - **Card Compactness**: Keep cards relatively compact with readable, dense real-estate metrics.
3. **Data Reactivity & Synchronization**:
   - Updates must be end-to-end reactive. When an AI Agent or salesperson modifies a lead (e.g. `Qualified → Site Visit`), the change must reflect across `filteredLeads`, stage totals, activity audit stream, timeline queues, and assigned inventory units.
4. **Fast 10-Second Interaction Philosophy**:
   - Salesperson workflows must always prioritize speed: `SEE → ACT → LOG → SCHEDULE → MOVE ON`.
   - Modals should provide 1-click presets (`Tomorrow`, `In 3 Days`, `In 1 Week`) and structured outcomes (`Connected`, `Interested`, `Site Visit Booked`, etc.).

---

## 4. Architecture & Directory Layout

```
Frontend/src/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx                # Inter font, metadata & HTML root
│   ├── page.tsx                  # App entry wrapping CRMProvider & AppShell
│   ├── globals.css               # Design system tokens & pastel utilities
│   ├── agent-live/page.tsx       # Dedicated AI Agent Live Terminal Route
│   ├── api/chat/route.ts         # Gemini 2.5 Flash Streaming Route & Tools
│   ├── leads/page.tsx            # Leads Directory (List | Pipeline | Priority)
│   ├── pipeline/page.tsx         # Enterprise Stage Progression Board
│   ├── tasks/page.tsx            # Tasks & Scheduled Daily Follow-ups
│   ├── projects/page.tsx         # Project Catalog & Inventory Matrix
│   ├── activities/page.tsx       # Immutable Chronological Audit Stream
│   ├── reports/page.tsx          # Analytics, Pipeline Value & SLA Charts
│   ├── people/page.tsx           # Contact Master Records
│   ├── regions/page.tsx          # Regional Hubs (Gurgaon, South Delhi, Noida, Mumbai)
│   ├── users/page.tsx            # Team Members & Role Switcher
│   └── settings/page.tsx         # Organization Preferences
├── components/
│   ├── crm/                      # Core CRM & AI Agent Components
│   │   ├── pages/                # Page bodies (route files are thin AppShell wrappers)
│   │   │   ├── leads-page.tsx          # Leads Directory (List | Pipeline | Priority)
│   │   │   ├── tasks-page.tsx          # Tasks & Scheduled Daily Follow-ups
│   │   │   ├── projects-page.tsx       # Project Catalog & Inventory Matrix
│   │   │   ├── activities-page.tsx     # Immutable Chronological Audit Stream
│   │   │   ├── reports-page.tsx        # Analytics, Pipeline Value & SLA Charts
│   │   │   ├── people-page.tsx         # Contact Master Records
│   │   │   ├── regions-page.tsx        # Regional Hubs (Gurgaon, South Delhi, Noida, Mumbai)
│   │   │   ├── users-page.tsx          # Team Members & Role Switcher
│   │   │   └── settings-page.tsx       # Organization Preferences
│   │   ├── ai-agent-command-center.tsx # Dual-Pane AI Qualification Terminal
│   │   ├── ai-lead-bot.tsx             # Floating Global AI Intake Widget
│   │   ├── ai-resurrection-modal.tsx   # Lost-Lead Inventory Cross-Matcher
│   │   ├── boss-overview.tsx           # Executive Command Center & Lost-Lead Radar
│   │   ├── salesperson-home.tsx        # Action-First Sales Cockpit
│   │   ├── quick-activity-modal.tsx    # 10s Rapid Disposition Logger
│   │   ├── lead-detail-modal.tsx       # 360° Customer Dossier & Document Vault
│   │   ├── whatsapp-action-modal.tsx   # 1-Click WhatsApp Templating Engine
│   │   ├── global-search-dialog.tsx    # Enhanced ⌘K Command Palette
│   │   └── pipeline-board.tsx          # Stage Board (select-based stage changes)
│   ├── layout/                   # AppShell, Sidebar, TopBar
│   └── ui/                       # Radix UI Primitives & Status Badges
├── context/
│   └── crm-context.tsx           # Reactive State (filters persist to localStorage; CRM data is in-memory)
├── lib/
│   ├── mock-data.ts              # Seed Database Engine (12 Luxury Projects & Leads)
│   ├── utils.ts                  # Currency (₹ Lakh / Cr), Phone & Formatters
│   └── queries/crm-queries.ts    # Supabase Realtime Channels & React Query Hooks
└── types/
    └── crm.ts                    # Domain TypeScript Definitions
```

---

## 5. AI Agents & Automation Modules

### 1. **Aria — Autonomous Lead Qualification Agent**
- **Endpoint**: `/api/chat/route.ts` with `streamText` and `@ai-sdk/google`.
- **Tool**: `qualifyAndCreateLead` — parses budget, micro-market, config, timeline, intent, and calculates lead scores (0–100). The tool has NO server-side execute handler by design: AI-proposed leads are staged and require explicit human approval before any pipeline write.
- **UI Surfaces**:
  - `AiAgentCommandCenter` (`/agent-live`): Executive live simulation terminal with real-time execution logs and preset buyer personas.
  - `AiLeadBot`: Global floating widget with live tool action cards and instant CRM synchronization.

### 2. **Lost-Lead Resurrection Engine**
- **Component**: `AiResurrectionModal` (`/components/crm/ai-resurrection-modal.tsx`).
- **Functionality**: Scans dormant leads (`daysInStage >= 14` or `stage === 'lost'`), matches their historical requirements against live project units, selects pitch angles (New Tower, 20:80 Payment Scheme, Price Drop, NRI Reallocation), and generates tailored WhatsApp pitches for 1-click or batch reactivation.

### 3. **WhatsApp Sales Engine**
- **Component**: `WhatsAppActionModal` (`/components/crm/whatsapp-action-modal.tsx`).
- **Functionality**: Injects dynamic CRM variables into luxury real estate messaging templates with direct `wa.me/` dispatch and automated activity logging.

---

## 6. Real Estate Conventions & Formatting

- **Currency**: Always use `formatCurrencyINR(val)` from `src/lib/utils.ts`.
  - $\ge 1\text{ Crore} \longrightarrow \text{₹X.XX Cr}$ (e.g. `₹6.50 Cr`)
  - $< 1\text{ Crore} \longrightarrow \text{₹XX.XX L}$ (e.g. `₹85.00 L`)
- **Phone Numbers**: Indian phone format `+91 98112 34567` with direct `tel:` and `https://wa.me/` links.
- **Vastu & Facings**: Common preferences include `North-East`, `East`, `Park Facing`, `Corner Unit`.
- **Keyboard Hotkeys**:
  - <kbd>L</kbd> — Open Rapid Activity Logger (10s)
  - <kbd>F</kbd> — Jump to Tasks / Follow-ups
  - <kbd>/</kbd> or <kbd>⌘K</kbd> — Open Command Palette
  - <kbd>Esc</kbd> — Close any modal or drawer

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
