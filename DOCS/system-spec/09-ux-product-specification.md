# 09. UX & Product Specification — Apex Realty CallCRM

**Design Philosophy:** "10-Second Sales Interaction"  
**Aesthetic Style:** Clean Luxury Off-White & Dark Slate Glassmorphism  
**Design Tokens:** Deep Indigo (`#4f46e5`), Emerald Green (`#10b981`), Slate (`#0f172a`), Amber (`#f59e0b`)  
**Typography:** Modern Sans-Serif (Inter / System UI) + Monospace Numerics for Currency

---

## 1. Core UX Principles

1. **Sub-10-Second Quick Activity Logging:** Sales reps must be able to log a phone call, WhatsApp conversation, or meeting in less than 10 seconds without navigating away from their active queue.
2. **Context-Aware Information Density:** High-ticket real estate deals require immediate access to: Buyer Budget (Crores), Configuration, Target Project, Lead Score, Days in Stage, and Next Scheduled Move.
3. **Optimistic Visual Feedback:** Every stage movement, task completion, and note entry updates the screen in <10ms before server roundtrips.
4. **Indian Real Estate Native Notation:** Direct formatting in Crores (`₹X.XX Cr`) and Lakhs (`₹XX.XX L`) throughout all cards, tables, and analytics.

---

## 2. Primary Product Surfaces

### 2.1 Boss Executive Cockpit (`/dashboard` & `/reports`)
- **Gross Pipeline Valuation Bar:** Total pipeline value (e.g. `₹48.5 Cr`), Weighted Deal Health, Active Opportunity Count.
- **Lost-Lead Resurrection Radar:** Scans and highlights dormant high-ticket leads ready for inventory cross-matching.
- **Rep SLA Compliance Matrix:** Tracks outreach speed and overdue task metrics per sales closer.
- **Global Filter Bar:** Persistent multi-dimensional filtering by Region, Salesperson, Project, and Date Range.

### 2.2 Salesperson Action-First Home (`/dashboard` for reps)
- **Top Priority Calling Queue:** Highlights leads requiring immediate phone/WhatsApp outreach (overdue & due today).
- **1-Click Call & WhatsApp Action Triggers:** Opens pre-formatted WhatsApp luxury templates or initiates call recording logs.
- **Today's Scorecard:** Tracks calls logged, site visits booked, and stage progressions completed today.

### 2.3 7-Stage Interactive Pipeline Board (`/pipeline`)
- **Drag-and-Drop Kanban:** Smooth column transitions between `New Inflow`, `Contacted`, `Qualified`, `Site Visit Done`, `Negotiation`, `Won`, and `Lost`.
- **Card Badges:** Displays Buyer Name, Project Name, Lead Propensity Score (`Hot`, `Warm`, `Cold`), and Deal Health indicator.

### 2.4 Project Inventory & Tower Explorer (`/projects`)
- **Multi-Tower Matrix:** Visual grid of inventory units across floors and towers.
- **Unit Status Color Coding:**
  - `Available` (Emerald Green)
  - `Hold / Site Visit` (Amber)
  - `Negotiation` (Pink)
  - `Booked / Sold` (Slate/Dark)

---

## 3. Global Keyboard Navigation & Hotkeys

To maximize sales closer productivity, CallCRM includes global keyboard shortcuts:

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| `Ctrl + K` or `Cmd + K` | Open Global Omnibar Search (search leads, buyers, projects) | Global |
| `Ctrl + N` or `Cmd + N` | Open "New Inbound Lead" Creation Modal | Global |
| `Escape` | Close active modal, dialog, or drawer | Global |

---

## 4. Accessibility & Responsive Standards

- **Semantic HTML:** Radix UI dialogs, dropdowns, tooltips, and tabs with appropriate ARIA roles and labels (`aria-label`, `role="dialog"`, `aria-describedby`).
- **Focus Rings:** Visible high-contrast focus rings (`ring-2 ring-indigo-500`) for full keyboard navigation.
- **Mobile Responsive:** Adaptive drawers and cards optimized for iPad / tablet site visits and mobile phone calling queues.
