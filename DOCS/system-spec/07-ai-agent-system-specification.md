# 07. AI Agent & Automation System Specification — Apex Realty CallCRM

**Document Version:** 1.0.0 (Production Release)  
**AI Framework:** Vercel AI SDK 5 (`streamText`, `tool`, `inputSchema`)  
**Underlying Foundation Model:** Google Gemini 2.5 Flash (`gemini-2.5-flash`)  
**Safety Protocol:** Human-in-the-Loop Confirmation Gate

---

## 1. Agent Architecture & Role Definitions

Apex Realty CallCRM utilizes a two-tier agentic architecture:
1. **Aria (Inbound Qualification & Intake Agent):** Front-facing conversational intelligence for high-ticket real estate buyer intake.
2. **Resurrection Engine (Autonomous Lost-Lead Cross-Matcher):** Background intelligence scanning dormant buyer opportunities and matching them against available high-ticket inventory.

```
                     ┌───────────────────────────────────────────────┐
                     │          INBOUND PROSPECT / BUYER             │
                     └──────────────────────┬────────────────────────┘
                                            │
                                            ▼
                     ┌───────────────────────────────────────────────┐
                     │       ARIA INTAKE AGENT (Gemini 2.5 Flash)    │
                     │  - Multi-Turn Consultative NLP                │
                     │  - Parameter Extraction: Budget, Loc, Config  │
                     │  - Structured Lead Scoring & Intent Label     │
                     └──────────────────────┬────────────────────────┘
                                            │ Tool Call (qualifyAndCreateLead)
                                            ▼
                     ┌───────────────────────────────────────────────┐
                     │          HUMAN APPROVAL GATE (UI)             │
                     │   [✓ Approve & Push to CRM]   [✕ Discard]     │
                     └──────────────────────┬────────────────────────┘
                                            │ Approved
                                            ▼
                     ┌───────────────────────────────────────────────┐
                     │            CRM PIPELINE INGESTION             │
                     │  - Auto-Linked to Master Person (Phone Dedup) │
                     │  - Stage: Qualified (Score: 92+ Hot)          │
                     │  - Prioritized SLA Follow-up Task Scheduled   │
                     └───────────────────────────────────────────────┘
```

---

## 2. Aria Agent System Prompt & Directives

```markdown
You are Aria, an elite Senior AI Property Advisor and Autonomous Sales Agent for luxury Indian real estate (covering Delhi NCR, Mumbai, Bengaluru, Hyderabad, and Pune).

Your primary objective is to warmly greet prospective homebuyers/investors, answer their queries with domain authority, and autonomously QUALIFY the lead through natural consultative dialogue.

To fully qualify a lead, you must naturally collect or clarify:
1. Full Name of the buyer/client
2. Phone or WhatsApp number (+91 format preferred)
3. Target City & Micro-market (e.g., Golf Course Extension Gurgaon, Bandra West Mumbai, Whitefield Bengaluru)
4. Preferred Configuration (e.g., 3 BHK + Servant, 4 BHK Duplex, Luxury Villa, Sky Penthouse)
5. Investment / Budget Range (e.g., ₹2.5 Cr - ₹4.5 Cr, ₹8 Cr+, etc.)
6. Purchase Timeline & Intent (e.g., Immediate / 30-60 days; End-user residence vs Rental yield investment)

GUIDELINES:
- Be warm, sophisticated, concise, and highly professional.
- Speak in polished English, with natural Indian real estate fluency (understanding Cr, Lakhs, Carpet area, RERA, Vastu, Possession timelines).
- Do not overwhelm the user with a questionnaire all at once. Ask 1-2 engaging questions per turn.
- If the user provides multiple details in one message, acknowledge them smartly and only ask for what is missing.
- AS SOON as you have collected the core details (Name, Phone, Location, Configuration, Budget), you MUST immediately execute the `qualifyAndCreateLead` tool.
- After calling the tool, summarize what you've logged and reassure the buyer that a senior property director from the desk is preparing an exclusive floor-plan dossier and VIP site visit slot for them.
```

---

## 3. Tool Specifications & Zod Schemas

### `qualifyAndCreateLead` Tool
- **Description:** Autonomously qualify the real estate lead and register their complete profile into the CRM Sales Pipeline with high-priority scoring.
- **Input Schema:**
```typescript
z.object({
  personName: z.string().describe("Full name of the prospect/buyer"),
  phone: z.string().describe("Contact phone or WhatsApp number"),
  location: z.string().describe("Preferred city/micro-market"),
  configuration: z.string().describe("Unit configuration (e.g., 3 BHK + Servant, 4 BHK Villa)"),
  budget: z.number().describe("Budget in INR (e.g., 38000000 for 3.8 Cr)"),
  timeline: z.string().describe("Purchase timeframe (e.g., Ready to move / 30-60 days)"),
  buyerIntent: z.string().describe("End-User (Primary Residence) or High-yield Investor"),
  leadScore: z.number().min(0).max(100).describe("Readiness score from 0 to 100"),
  leadScoreLabel: z.enum(["Hot", "Warm", "Cold"]).describe("Score badge"),
  buyingSignals: z.array(z.string()).describe("Key buying signals observed"),
  objections: z.array(z.string()).describe("Any concerns noted"),
  notes: z.string().describe("Comprehensive executive summary of requirements"),
})
```

---

## 4. Human-in-the-Loop Safety & Approval Gate

1. When the agent streams the `qualifyAndCreateLead` tool call, the client component `AiLeadBot` or `AiAgentCommandCenter` sets the card state to `approvalStatus: "pending"`.
2. The UI renders an **Interactive Approval Card** with amber highlight.
3. The sales manager/operator can inspect:
   - Extracted Buyer Name & Phone
   - Verified Budget in Crores/Lakhs
   - Configuration & Location Specs
   - Assigned Intent Score (`Hot`, `Warm`, `Cold`)
4. **Action Handlers:**
   - **`✓ Approve & Push to CRM`**: Calls `createLead(...)` in `CRMContext`, synchronizes with PostgreSQL, changes badge to `✓ Approved & Synced`, and generates an immediate follow-up task.
   - **`✕ Discard`**: Marks card as `✕ Discarded by Operator`. No database mutations or lead insertions occur.

---

## 5. Lost-Lead Resurrection Engine

- **Trigger:** Automated background scan or manual invocation via `AiResurrectionModal`.
- **Query Strategy:** Queries leads in `stage = 'lost'` OR `days_in_stage >= 14` with `stage != 'won'`.
- **Matching Algorithm:** Evaluates pricing overlap ($\pm 20\%$ of original budget) and configuration alignment against active inventory in `project_units`.
- **Output:** Produces customized re-engagement scripts highlighting:
  - Fresh inventory release (e.g., *"Tower Camellias B just released 4 BHK units"*).
  - Special payment schemes (e.g., *"20:80 Possession-linked plan available"*).
- **Execution Telemetry:** Recorded in `public.ai_agent_executions` capturing `session_id`, `agent_name`, `tool_invoked`, `latency_ms`, and status.
