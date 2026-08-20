# Apex Realty CallCRM — Enterprise Real Estate Sales Operating System

CallCRM is a production-grade, enterprise sales operating system and daily sales cockpit engineered specifically for high-ticket Indian luxury real estate developers, brokerage houses, and sales teams.

Built with **Next.js 15 App Router**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Radix UI**, CallCRM bridges executive visibility with rapid, frictionless salesperson execution.

---

## Executive Overview & Architectural Philosophy

CallCRM is designed around the core operational loop:
$$\text{SEE} \longrightarrow \text{ACT} \longrightarrow \text{LOG} \longrightarrow \text{SCHEDULE} \longrightarrow \text{MOVE ON}$$

### Key Value Pillars
1. **Zero Cognitive Overhead for Sales Teams**: Within 10 seconds of opening CallCRM at 9 AM, a sales representative knows exactly which overdue leads to call, which site visits are happening, which deals are hot, and which units to pitch.
2. **Instant 10-Second Interaction Logger**: Complete structured outcome disposition and next-action follow-up scheduling in under 10 seconds without modal fatigue.
3. **Role-Tailored Workspaces**:
   - **Executive (Boss) Command Center**: High-altitude telemetry, regional hub conversion metrics, team capacity, and overdue SLA breach tracking.
   - **Salesperson Daily Cockpit**: Action-first task timeline, prioritized next best actions, hot deal alerts, and matching inventory recommendations.
4. **360° Lead Customer Dossier**: Real estate specific buyer requirements (floor, facing, parking, intent), confirmed buying signals, objections, last conversation narratives, and alternative inventory matching.
5. **Interactive Project & Inventory Matrix**: Real-time tower, floor, and unit allocation with instant status transitions (`Available`, `Hold`, `Site Visit`, `Negotiation`, `Booked`, `Sold`).

---

## System Architecture & Directory Structure

```
Real-estate/
├── .agents/                      # AI Agent Customizations & MCP configurations
├── DOCS/                         # Architecture blueprints & domain specifications
├── Frontend/                     # Next.js 15 Enterprise Application
│   ├── src/
│   │   ├── app/                  # Next.js App Router (14 Routes)
│   │   │   ├── layout.tsx        # Inter typography & Root Layout
│   │   │   ├── page.tsx          # CRM Provider & AppShell entry
│   │   │   ├── globals.css       # Off-white design system tokens & variables
│   │   │   ├── leads/            # Leads Directory (List | Pipeline | Priority)
│   │   │   ├── pipeline/         # Enterprise Drag/Drop Stage Progression Board
│   │   │   ├── tasks/            # Tasks & Daily Follow-ups Queue
│   │   │   ├── projects/         # Project Catalog & Inventory Matrix
│   │   │   ├── activities/       # Immutable Chronological Audit Stream
│   │   │   ├── reports/          # Pipeline Analytics & Velocity Charts
│   │   │   ├── people/           # Contact Directory & Buyer Master Records
│   │   │   ├── regions/          # Regional Hubs (Gurgaon, South Delhi, Noida, Mumbai)
│   │   │   ├── users/            # Sales Reps & Role Permissions
│   │   │   └── settings/         # Organization Configuration
│   │   ├── components/
│   │   │   ├── crm/              # Domain-Specific Components
│   │   │   │   ├── boss-overview.tsx        # Executive Command Center
│   │   │   │   ├── salesperson-home.tsx     # Action-First Sales Cockpit
│   │   │   │   ├── quick-activity-modal.tsx # 10s Rapid Follow-Up Logger
│   │   │   │   ├── lead-detail-modal.tsx    # 360° Customer Dossier
│   │   │   │   ├── global-search-dialog.tsx # Enhanced ⌘K Command Palette
│   │   │   │   ├── pipeline-board.tsx       # Kanban & Stage Progression
│   │   │   │   └── charts/                  # SVG Circular Gauges & Sparklines
│   │   │   ├── layout/           # App Shell, Persistent Sidebar, TopBar
│   │   │   └── ui/               # Radix UI primitives & Status Badges
│   │   ├── context/
│   │   │   └── crm-context.tsx   # Global Reactive State & localStorage Persistence
│   │   ├── lib/
│   │   │   ├── mock-data.ts      # Indian Luxury Real Estate Seed Data Engine
│   │   │   └── utils.ts          # Currency (₹ Lakh / Cr), Phone, and Formatters
│   │   └── types/
│   │       └── crm.ts            # Enterprise TypeScript Domain Interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── CLAUDE.md                     # Agent & Developer Guidelines
└── README.md                     # Project Documentation
```

---

## Core Feature Breakdown

### 1. Salesperson Daily Cockpit (`SalespersonHome`)
- **"What should I do next?" Banner**: Immediate visibility into today's most urgent action items.
- **Compact "Today" Metric Summary Bar**:
  - 🔴 **Overdue Actions**: Immediate rescue indicator for overdue follow-up SLAs.
  - 🟠 **Due Today**: Scheduled call quota for the day.
  - 🟣 **Upcoming Site Visits**: Confirmed on-site property tours.
  - 🟢 **Hot Pipeline Value**: Total value of active high-intent buyers ($\ge$ 75 Lead Score).
  - 🔵 **Follow-up SLA Adherence**: Percentage of inquiries contacted within SLA ($\le 15\text{ mins}$).
- **Today's Sales Timeline**: Chronological sales activity queue (`09:30 AM Call Vikram Mehra`, `11:00 AM Site Visit Rajesh Singhal`, `01:30 PM WhatsApp Kavita Sethi`, `04:00 PM Call Rohit Bansal`) with 1-click **Call**, **WhatsApp**, and **Log** buttons.
- **Next Best Actions (Prioritized)**: Smart operational cards displaying buyer requirements, deal value, Lead Score (`94 Hot`), Deal Health (`🟢 Strong`), **"Why this action matters"**, and **"Suggested next action"**.

### 2. Rapid 10-Second Follow-Up Workflow (`QuickActivityModal`)
- **Structured Outcomes**: `Connected`, `No Answer / Ringing`, `Interested`, `Site Visit Booked`, `Negotiating`, `Follow-up Required`, `Not Interested`.
- **1-Click Next Action Presets**: `Tomorrow`, `In 3 Days`, `In 1 Week`, `Custom`.
- Flow: `CALL → LOG OUTCOME → SCHEDULE NEXT ACTION → DONE`.

### 3. My Leads Multi-View Switcher (`LeadsPage`)
- **`List Table`**: High-density tabular view with multi-select checkboxes, floating bulk action bar (Move Stage, Assign Rep, Schedule Follow-up Today), and CSV export.
- **`Pipeline Stages`**: Leads grouped into stage columns (`New`, `Contacted`, `Qualified`, `Site Visit`, `Negotiation`, `Won`) with live lead counts and ₹ Cr values.
- **`Priority Queue`**: Algorithmic ranking (Lead score + deal value + urgency + health + recency) displaying high-impact operational action cards.

### 4. 360° Lead Customer Dossier (`LeadDetailModal`)
- **Header**: Identity, phone, budget, Lead Score badge, and Deal Health telemetry.
- **Real Estate Sales Context**:
  - **Confirmed Buying Signals**: `✓ Pre-approved loan`, `✓ Site visit completed`, `✓ Ready to close before Diwali`, `✓ Selling existing flat`, `✓ Direct buyer`.
  - **Active Objections & Friction**: `⚠ High maintenance cost`, `⚠ Delivery timeline Dec 2026`, `⚠ Price negotiation`.
  - **Last Conversation Summary Narrative** & **Suggested Next Move Prompt**.
- **Buyer Requirements Profile**: Configuration, floor preference, facing/Vastu, parking bays, intent, decision makers.
- **Project & Unit Allocation**: Linked unit with **alternative matching available units in the same project**.
- **Chronological Timeline**: Immutable audit trail of calls, WhatsApps, site visits, and notes.

### 5. Recommended Inventory for My Leads (`ProjectsPage`)
- Dedicated matching engine mapping active buyers directly to available inventory:
  $$\text{WHO} \longrightarrow \text{WANTS WHAT} \longrightarrow \text{RECOMMENDED UNIT} \longrightarrow \text{PRICE} \longrightarrow \text{PITCH UNIT}$$

### 6. Activities Audit Stream (`ActivitiesPage`)
- **Scope Toggle**: `My Activity | Team Activity`.
- **Type Filter Chips**: `All Types | Calls | WhatsApp | Site Visits | Stage Changes`.
- **Search**: Real-time filtering by contact, user, notes, or outcome.

### 7. Global Keyboard Shortcuts (`AppShell`)
- <kbd>L</kbd> — Open Rapid Activity Logger (10s)
- <kbd>F</kbd> — Jump to Tasks & Follow-ups
- <kbd>/</kbd> or <kbd>⌘K</kbd> — Open Command Palette & Global Search
- <kbd>Esc</kbd> — Close any open modal or drawer

---

## Getting Started & Local Development

### Prerequisites
- Node.js 18.18+ or 20+
- npm 9+

### Installation
```bash
# Clone the repository
git clone https://github.com/Naman09746/Real-Estate-SAAS.git
cd Real-Estate-SAAS/Frontend

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

## Design System & Tokens

- **Background**: Soft warm off-white (`#fcfcf9` / `hsl(60, 20%, 98%)`)
- **Card Surfaces**: Pure white (`#ffffff`) with subtle 1px borders (`#e8e8e3`) and light box shadows (`0 1px 3px rgba(0,0,0,0.04)`)
- **Typography**: Deep navy / charcoal (`#1a1f2c` / `hsl(222, 47%, 11%)`)
- **Accent Primary**: Professional slate navy (`#0f172a` / `hsl(222, 47%, 14%)`)
- **Status Accents**:
  - Emerald (`#059669` / `#10b981`): Strong deals, Won stage, Available units
  - Amber (`#d97706` / `#f59e0b`): Site visits, Due today follow-ups
  - Rose (`#e11d48` / `#f43f5e`): At-risk deals, Overdue actions, Lost stage
  - Blue (`#2563eb` / `#3b82f6`): Booked units, Contacted stage
  - Purple (`#7c3aed` / `#8b5cf6`): Site visits, Negotiations

---

## License & Copyright

© 2026 Apex Realty Technologies. All rights reserved.
