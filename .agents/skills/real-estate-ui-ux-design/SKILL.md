---
name: real-estate-ui-ux-design
description: |
  Comprehensive UI/UX design and interaction guide for luxury high-ticket real estate SaaS web applications.
  Use when designing or building real-estate landing pages, property dashboards, unit matchers, inventory matrices,
  3D architectural floor/tower explorers, speed-to-lead calling interfaces, and Indian real estate sales workflows.
---

# Luxury Real Estate UI/UX Design & Conversion Playbook

This skill outlines design patterns, interaction standards, and visual requirements for high-ticket real estate SaaS platforms (specialized for developers, luxury brokerages, and institutional property sales desks).

---

## 1. Core Visual Principles for High-Ticket Real Estate

### A. The "Architectural Ledger" Aesthetic
Luxury real estate buyers and enterprise brokers do not want generic colorful SaaS templates. The design must feel like an authoritative architectural ledger:
- **Palette**: Deep ink charcoal (`#13161c`), blueprint off-white/paper (`#f4f6f8`), refined metallic brass/gold (`#a9812e`), verdigris patina green (`#2d5a4c`), and slate gray (`#64748b`).
- **Typography**: 
  - Architectural serif headlines (`Fraunces` / `Cinzel` / `Playfair`) to communicate prestige and timeless craft.
  - Neutral clean UI sans (`Inter` / `Plus Jakarta Sans`) for forms, table cells, and navigation.
  - Precision monospace (`IBM Plex Mono`) for unit codes (`[TOWER-C · UNIT-1401]`), INR prices (`₹14.50 Cr`), and SLA timers.
- **Architectural Motifs**: Subtle 1px CAD grid lines, elevation datum markers (`LVL +168.50M`), floor slab lines, and Vastu compass roses.

---

## 2. Interactive 3D & Architectural Visual Standards

1. **Live 3D WebGL Backgrounds**:
   - Use Three.js with hardware-accelerated WebGL rendering for 3D building models.
   - Include realistic architectural geometries: cantilevered sky balconies, floor-to-ceiling glass facets, lit penthouse windows, spires, and ambient particle dust.
   - Support interactive mouse orbit and perspective toggles (`Dusk Golden Hour`, `Blueprint Wireframe`, `Architectural Night`).
   - Must be 100% SSR-safe in Next.js (mounted via `useEffect` on canvas, strictly client-side).

2. **Interactive 3D Floor & Unit Selection**:
   - Allow users to click floors (e.g. Level 14, Level 28, Penthouse Level 42) to trigger live visual feedback, showing unit layout, carpet vs super area, orientation, and price.

3. **Realistic Real Estate Media Elements**:
   - Use architectural blueprints with dimension lines (`TOTAL WIDTH: 88'-0"`).
   - Display Vastu compliance tags (`● North-East Facing · Vastu Approved`).
   - Provide instant WhatsApp pitch generation with pre-formatted luxury real estate summaries.

---

## 3. High-Converting Sales Cockpit UX Patterns

1. **Speed-to-Lead Call Dialer**:
   - Prominently display incoming leads with response timers (`< 60s target`).
   - 1-click calling triggers with live waveform animation and instant disposition logging (`Connected`, `Site Visit Booked`, `Negotiating`).
2. **Buyer-to-Unit Matcher**:
   - Direct formula matching: $\text{Buyer Requirements} \cap \text{Inventory Matrix} \longrightarrow \text{Matched Units (4/4 exact criteria)}$.
3. **Transparent Financial Ledger**:
   - Indian numbering format: `₹X.XX Cr` for $\ge 1\text{ Crore}$ and `₹XX.XX Lakh` for $< 1\text{ Crore}$.
   - Automatic 18% GST calculation on commercial tech SaaS invoices.
