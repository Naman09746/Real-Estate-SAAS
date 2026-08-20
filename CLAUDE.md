# CLAUDE.md — CallCRM Developer & AI Agent Guidelines

This document outlines architectural principles, development commands, design rules, and domain standards for **CallCRM (Apex Realty)**.

---

## 1. Project Overview & Role

- **Project**: CallCRM for Apex Realty
- **Domain**: High-ticket Indian luxury real estate sales operating system & daily salesperson cockpit.
- **Application Directory**: `Frontend/` (Next.js 15 App Router)
- **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI Primitives, Lucide React, Supabase client SDK ready.

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
   - **Background**: Soft off-white (`#fcfcf9` / `hsl(60, 20%, 98%)`).
   - **Cards & Surfaces**: Clean white (`#ffffff`) with subtle 1px border (`#e8e8e3`) and light box-shadow.
   - **Typography**: Crisp deep navy / charcoal (`#1a1f2c`).
   - **Prohibited**: Do NOT introduce flashy neon gradients, glassmorphic blur overdrives, dark mode toggles, or unasked dashboard charts.
   - **Card Compactness**: Keep cards relatively compact with readable, dense real-estate metrics.
3. **Data Reactivity & Synchronization**:
   - Updates must be end-to-end reactive. When a lead changes stage (e.g. `Qualified → Site Visit`), the change must reflect across `filteredLeads`, stage totals, activity audit stream, timeline queues, and assigned inventory units.
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
│   ├── crm/                      # Core CRM Business Components
│   │   ├── boss-overview.tsx        # Executive Command Center (Boss Role)
│   │   ├── salesperson-home.tsx     # Action-First Sales Cockpit (Salesperson Role)
│   │   ├── quick-activity-modal.tsx # 10s Rapid Disposition Logger
│   │   ├── lead-detail-modal.tsx    # 360° Customer Dossier
│   │   ├── global-search-dialog.tsx # Enhanced ⌘K Command Palette
│   │   └── pipeline-board.tsx       # Drag/Drop Stage Board
│   ├── layout/                   # AppShell, Sidebar, TopBar
│   └── ui/                       # Radix UI Primitives & Status Badges
├── context/
│   └── crm-context.tsx           # Reactive State & localStorage Persistence
├── lib/
│   ├── mock-data.ts              # Seed Database Engine (12 Luxury Projects & Leads)
│   └── utils.ts                  # Currency (₹ Lakh / Cr), Phone & Formatters
└── types/
    └── crm.ts                    # Domain TypeScript Definitions
```

---

## 5. Domain Entities & TypeScript Types

### `Lead` ([`src/types/crm.ts`](file:///Users/namanjoshi/SAAS/Real-estate/Frontend/src/types/crm.ts))
- Core customer record containing:
  - `personName`, `phone`, `email`
  - `budget` (INR), `projectId`, `projectName`, `regionId`, `regionName`
  - `stage`: `"new" | "contacted" | "qualified" | "site_visit" | "negotiation" | "won" | "lost"`
  - `leadScore` (0–100) and `leadScoreLabel` (`"Hot" | "Warm" | "Cold"`)
  - `dealHealth` (`"strong" | "neutral" | "at_risk"`) and `dealHealthReason`
  - `configurationPreference`, `preferredFloor`, `facingPreference`, `parkingRequirement`
  - `buyerIntent`, `decisionMakers`, `buyingSignals[]`, `objections[]`
  - `lastConversationSummary`, `suggestedNextMove`, `assignedUnitId`, `assignedUnitNumber`
  - `nextFollowUpAt`, `followUpStatus`: `"due_today" | "upcoming" | "overdue" | "completed"`

### `ProjectUnit`
- Inventory unit containing:
  - `tower`, `unitNumber`, `floor`, `configuration`, `superAreaSqFt`, `price` (INR)
  - `status`: `"available" | "hold" | "site_visit" | "negotiation" | "booked" | "sold"`
  - `assignedLeadId`, `assignedLeadName`, `assignedLeadPhone`

### `Activity`
- Immutable interaction log:
  - `type`: `"call" | "whatsapp" | "site_visit" | "meeting" | "note" | "stage_change" | "booking"`
  - `outcomeLabel`: e.g. `"Interested"`, `"Site Visit Booked"`, `"Negotiating"`, `"No Answer"`
  - `notes`, `scheduledFollowUpAt`, `createdAt`

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
