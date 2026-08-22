# Apex Realty CallCRM — Architectural Real Estate Sales & AI Agent Command Center

CallCRM is an enterprise sales operating system and autonomous AI agent platform engineered specifically for high-ticket Indian luxury real estate developers, brokerage houses, and advisory desks.

Built with **Next.js 15 App Router**, **React 19**, **TypeScript**, **Tailwind CSS**, **Vercel AI SDK 5**, **Google Gemini 2.5 Flash**, and **Supabase Realtime**, CallCRM bridges executive command visibility with autonomous AI lead qualification and frictionless salesperson execution.

---

## ⚡ Key Differentiators & Value Pillars

1. **Autonomous AI Intake & Qualification (Aria Agent)**: 24/7 conversational NLP bot across WhatsApp and web widgets that extracts budget, micro-market, unit config, and buyer intent, calculates hot lead scores, and autonomously creates qualified deals in the pipeline.
2. **AI Lost-Lead Resurrection Engine**: Cross-matches dormant buyer requirements against newly released towers, floor rises, and payment plans, generating hyper-personalized WhatsApp pitches for 1-click deal revival.
3. **Frictionless 10-Second Interaction Logger**: Complete structured outcome disposition and next-action follow-up scheduling in under 10 seconds without modal fatigue (<kbd>L</kbd>, <kbd>F</kbd>, <kbd>⌘K</kbd> hotkeys).
4. **Project Collateral & KYC Document Vault**: Secure repository for brochures, floor plans, cost sheets, and buyer KYC with real-time association to leads and projects.
5. **WhatsApp Sales Engine**: 1-click personalized templating with dynamic CRM variable interpolation and automatic activity audit stream logging.
6. **Role-Tailored Workspaces**:
   - **Executive (Boss) Command Center**: High-altitude telemetry, regional hub conversion metrics, team capacity, and overdue SLA breach tracking.
   - **Salesperson Daily Cockpit**: Action-first task timeline, prioritized next best actions, hot deal alerts, and matching inventory recommendations.

---

## 🧠 AI Agents & Automation Modules

> For a complete architectural breakdown, refer to [`DOCS/ai-agents-and-automation.md`](file:///Users/namanjoshi/SAAS/Real-estate/DOCS/ai-agents-and-automation.md).

| Agent / Engine | Purpose | Technology |
| :--- | :--- | :--- |
| **Aria Lead Qualifier** | Autonomous intake & qualification | Gemini 2.5 Flash, Vercel AI SDK 5, `streamText` |
| **Lost-Lead Resurrector** | Cross-matching dormant deals with new units | Client-side rule heuristics + Gemini prompt generator |
| **WhatsApp Sales Engine** | 1-Click templated outreach & instant logging | Dynamic variable interpolation + `wa.me/` protocol |
| **Live Sync Telemetry** | Real-time cross-device updates | Supabase `postgres_changes` + React Query |

---

## System Architecture & Directory Structure

```
Real-estate/
├── .agents/                      # AI Agent Customizations & Skills
├── DOCS/                         # Architecture blueprints & AI Agent guides
│   ├── ai-agents-and-automation.md # Dedicated AI Agent Architecture Deep Dive
│   ├── re_arch.txt               # Multi-Tenant Architecture Blueprint
│   └── real-estate-crm-architecture.md.pdf
├── Frontend/                     # Next.js 15 Enterprise Application
│   ├── src/
│   │   ├── app/                  # Next.js App Router (21 Routes)
│   │   │   ├── agent-live/       # Dedicated AI Agent Live Command Center
│   │   │   ├── api/chat/         # Gemini 2.5 Flash Streaming Route & Tools
│   │   │   ├── layout.tsx        # Typography, AuthProvider & CRMProvider
│   │   │   ├── page.tsx          # Public Landing Page & Visualizer
│   │   │   ├── leads/            # Leads Directory (List | Pipeline | Priority)
│   │   │   ├── pipeline/         # Enterprise Stage Progression Board
│   │   │   ├── tasks/            # Tasks & Daily Follow-ups Queue
│   │   │   ├── projects/         # Project Catalog & Inventory Matrix
│   │   │   ├── activities/       # Immutable Chronological Audit Stream
│   │   │   ├── reports/          # Pipeline Analytics & Velocity Charts
│   │   │   ├── people/           # Contact Master Records & Phone Dedup
│   │   │   ├── regions/          # Regional Hubs (Gurgaon, Mumbai, Bengaluru)
│   │   │   ├── users/            # Sales Reps & Role Permissions
│   │   │   └── settings/         # Organization Configuration
│   │   ├── components/
│   │   │   ├── crm/              # Domain-Specific Components
│   │   │   │   ├── ai-agent-command-center.tsx # Dual-Pane AI Qualification Terminal
│   │   │   │   ├── ai-lead-bot.tsx             # Floating Global AI Intake Widget
│   │   │   │   ├── ai-resurrection-modal.tsx   # Lost-Lead Inventory Cross-Matcher
│   │   │   │   ├── boss-overview.tsx           # Executive Command Center
│   │   │   │   ├── salesperson-home.tsx        # Action-First Sales Cockpit
│   │   │   │   ├── quick-activity-modal.tsx    # 10s Rapid Follow-Up Logger
│   │   │   │   ├── lead-detail-modal.tsx       # 360° Customer Dossier & Document Vault
│   │   │   │   ├── whatsapp-action-modal.tsx   # WhatsApp Templating Engine
│   │   │   │   └── pipeline-board.tsx          # Kanban & Stage Progression
│   │   │   ├── layout/           # App Shell, Persistent Sidebar, TopBar
│   │   │   └── ui/               # Radix UI primitives & Status Badges
│   │   ├── context/
│   │   │   ├── auth-context.tsx  # SaaS Onboarding & Auth Funnel
│   │   │   └── crm-context.tsx   # Global Reactive State & localStorage Persistence
│   │   ├── lib/
│   │   │   ├── mock-data.ts      # Indian Luxury Real Estate Seed Data Engine
│   │   │   ├── utils.ts          # Currency (₹ Lakh / Cr), Phone, and Formatters
│   │   │   └── queries/crm-queries.ts # Supabase Realtime Channels
│   │   └── types/
│   │       └── crm.ts            # Enterprise TypeScript Domain Interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── CLAUDE.md                     # Agent & Developer Guidelines
└── README.md                     # Project Documentation
```

---

## 🚀 Getting Started & Local Development

### Prerequisites
- Node.js 18.18+ or 20+
- npm 9+

### Installation & Run
```bash
# Navigate to application folder
cd Frontend

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
cd Frontend
npm run build
npm run start
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
