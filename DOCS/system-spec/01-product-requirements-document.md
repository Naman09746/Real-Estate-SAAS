# 01. Product Requirements Document (PRD) — Apex Realty CallCRM

**Product Name:** Apex Realty CallCRM  
**Document Version:** 1.0.0 (Production Release)  
**Target Market:** Luxury Indian High-Ticket Real Estate (Developers, Tier-1 Brokerages, Wealth Advisory Desks)  
**Classification:** Proprietary Multi-Tenant SaaS Platform

---

## 1. Executive Summary & Problem Statement

### 1.1 The High-Ticket Real Estate Challenge
High-ticket real estate sales in India (ticket sizes ₹2.5 Cr to ₹50 Cr+) suffer from severe operational friction:
1. **Speed-to-Lead Failure:** Inbound buyer leads from Meta Ads, website forms, and WhatsApp go uncontacted for hours or days. Conversion probability drops by 80% after 5 minutes.
2. **Context Fragmentation:** Sales closers switch between WhatsApp, phone calls, spreadsheets, and legacy CRM systems (Salesforce, LeadSquared) that require 2+ minutes to log a single interaction.
3. **Contact Duplication:** A single buyer often inquires across multiple projects and marketing channels using slightly different phone formats (`9810123456`, `+91 98101-23456`, `09810123456`), fragmenting history.
4. **Dormant / Lost Lead Waste:** Brokerages accumulate thousands of "Lost / Stale" leads without systematic re-engagement when new towers, inventory, or payment schemes launch.

### 1.2 The CallCRM Solution
Apex Realty CallCRM is a **high-velocity, AI-agentic sales cockpit** designed specifically for real estate closers and managing directors. It combines:
- **Sub-10-Second Quick Activity Logging** with one-click WhatsApp sales outreach.
- **Autonomous AI Lead Qualification (Aria)** with natural language multi-turn dialogue and a Human-in-the-Loop approval gate.
- **Autonomous Lost-Lead Resurrection Engine** that cross-matches dormant buyers against newly released project units.
- **Master Contact Deduplication (E.164 Anchor)** across all projects and marketing channels.
- **Boss Executive Analytics & Salesperson Priority Calling Queues**.

---

## 2. User Personas & Roles

| Persona | Role | Key Jobs to Be Done | Primary Surface |
| :--- | :--- | :--- | :--- |
| **Vikram (Managing Director / Boss)** | `admin` / `manager` | Monitor gross pipeline value, pipeline velocity, rep SLA compliance, regional revenue, and approve agent actions. | Boss Executive Dashboard, Reports, Settings |
| **Rahul (Senior Sales Closer)** | `salesperson` | Clear prioritized daily follow-ups, log calls in <10s, initiate WhatsApp templates, and advance deals on the Kanban board. | Salesperson Home, Calling Queue, Kanban Pipeline |
| **Aria (Autonomous AI Agent)** | `agent` | Engage inbound web/WhatsApp traffic, qualify budget/location/configuration, extract structured intent, and queue lead proposals. | Floating AI Bot, Command Center, Webhooks |

---

## 3. Core Functional Requirements

### 3.1 Master Contact Identity & Phone Deduplication
- **REQ-1.1:** System MUST normalize all incoming phone numbers to E.164 format (`+91XXXXXXXXXX` for Indian mobile numbers).
- **REQ-1.2:** The `people` table serves as the immutable master identity anchor per organization. Multiple leads for the same buyer across different developments link to a single person record.
- **REQ-1.3:** Display total lifetime budget, associated projects, and full touchpoint history on the buyer's 360° Dossier.

### 3.2 7-Stage Luxury Sales Pipeline
- **REQ-2.1:** Pipeline MUST enforce the 7 industry standard stages:
  1. `New Inflow` → 2. `Contacted` → 3. `Qualified & Budget Fit` → 4. `Site Visit Done` → 5. `Price Negotiation` → 6. `Booking Won` → 7. `Lost / Dormant`.
- **REQ-2.2:** Drag-and-drop Kanban movement automatically synchronizes lead status, days-in-stage counter, and linked project unit availability (`available`, `site_visit`, `negotiation`, `booked`).

### 3.3 10-Second Quick Activity Logger
- **REQ-3.1:** Reps must be able to log any call, WhatsApp message, meeting, or site visit in under 10 seconds.
- **REQ-3.2:** Pre-configured outcome chips (`Connected: High Intent`, `Connected: Low Intent`, `Site Visit Scheduled`, `Negotiating`, `RNR / Busy`, `Not Interested`).
- **REQ-3.3:** Logging a scheduled next follow-up automatically generates a prioritized task in the rep's queue and completes previous overdue tasks for that lead.

### 3.4 Autonomous AI Agent Suite (Aria & Resurrection Engine)
- **REQ-4.1:** **Aria Intake Agent:** Multi-turn consultative conversational bot using Gemini 2.5 Flash. Collects buyer name, phone, budget, micro-market, and configuration.
- **REQ-4.2:** **Human Approval Gate:** AI-extracted qualifications display as an interactive proposal card. CRM database write requires explicit human operator confirmation.
- **REQ-4.3:** **Lost-Lead Resurrection Engine:** Scans leads dormant for >14 days or marked as lost, evaluates price and configuration fit against available project inventory, and generates personalized re-engagement pitches.

### 3.5 Project Catalog & Inventory Matrix
- **REQ-5.1:** Multi-tower, multi-floor inventory explorer with unit status tracking (`available`, `hold`, `site_visit`, `negotiation`, `booked`, `sold`).
- **REQ-5.2:** Indian currency formatting native support (Crores `₹X.XX Cr` and Lakhs `₹XX.XX L`).

---

## 4. Non-Functional Requirements (NFRs)

- **Performance:** Initial page load under 1.5s; API response time under 100ms; full Next.js production build under 5s.
- **Security:** 100% database-enforced Row-Level Security (RLS); zero IDOR/BOLA vulnerability; cryptographic HMAC verification for webhooks.
- **Reliability:** 99.9% uptime; resilient local fallback store when database credentials are unconfigured; token-bucket rate limiting to prevent abuse.
- **Accessibility:** Keyboard-navigable workflows (`/` global search, `C` new lead, `K` pipeline, `T` tasks); WCAG AA color contrast compliance.

---

## 5. Success Metrics & KPIs

1. **Lead Response Time:** Reduced from industry average of 4 hours to < 10 seconds via Aria Bot.
2. **Sales Logging Compliance:** Rep interaction logging compliance increased from ~40% to > 95%.
3. **Pipeline Re-Activation:** 12-18% of dormant leads successfully reactivated through automated inventory cross-matching.
4. **Data Isolation Integrity:** 0% cross-tenant data leakage incidents.
