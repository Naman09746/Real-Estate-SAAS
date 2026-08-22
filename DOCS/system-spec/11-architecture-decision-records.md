# 11. Architecture Decision Records (ADRs) — Apex Realty CallCRM

This document records the critical architectural decisions made during the design and hardening of Apex Realty CallCRM.

---

## ADR 001: Next.js 15 App Router & React 19 as the Core Full-Stack Framework

- **Status:** Accepted
- **Context:** We needed a framework capable of rendering ultra-fast desktop CRM interfaces with sub-10ms optimistic updates while securely processing serverless API routes, webhooks, and streaming AI responses.
- **Decision:** Use Next.js 15 with the App Router and React 19.
- **Consequences:**
  - *Positive:* Unified TypeScript codebase across UI and backend APIs; zero boilerplate routing; native support for streaming AI text responses via Vercel AI SDK; built-in middleware for session route protection.
  - *Trade-off:* Requires awareness of client vs. server component boundaries (`"use client"`).

---

## ADR 002: PostgreSQL Row-Level Security (RLS) for Multi-Tenant Data Isolation

- **Status:** Accepted
- **Context:** High-ticket real estate CRM data is strictly confidential. If a developer accidentally forgets an `org_id` WHERE clause in application code, cross-tenant data leakage could occur.
- **Decision:** Implement hard multi-tenancy at the PostgreSQL engine level using Supabase Row-Level Security (RLS).
- **Consequences:**
  - *Positive:* Mathematically impossible for Tenant A to query or mutate Tenant B records, even via raw API exploits or IDOR attacks.
  - *Trade-off:* Requires JWT claims to inject `org_id` and database helper functions (`current_tenant_id()`).

---

## ADR 003: Master `people` Table as the E.164 Phone Deduplication Anchor

- **Status:** Accepted
- **Context:** High-ticket buyers often inquire on multiple properties using varied phone number formats (`9810123456`, `+91 98101 23456`, `09810123456`), leading to fragmented lead cards and duplicate sales outreach.
- **Decision:** Decouple the *Buyer Identity* (`people` table) from the *Opportunity* (`leads` table). Enforce automated E.164 phone normalization (`+91XXXXXXXXXX`) via database trigger and a unique index on `(org_id, phone_normalized)`.
- **Consequences:**
  - *Positive:* Complete 360° buyer history across multiple developments; zero duplicate contacts per agency.
  - *Trade-off:* Lead creation requires an upsert / resolution step against the `people` table.

---

## ADR 004: Human-in-the-Loop Approval Gate for AI Lead Qualification

- **Status:** Accepted
- **Context:** Allowing an autonomous LLM to execute direct database mutations exposes the system to prompt injection attacks, hallucinated budgets, and fake lead generation.
- **Decision:** Aria's `qualifyAndCreateLead` tool call emits an interactive proposal card to the UI (`approvalStatus: "pending"`). Database writes require an explicit human click on `✓ Approve & Push to CRM`.
- **Consequences:**
  - *Positive:* 100% elimination of unauthorized autonomous CRM corruptions; sales managers maintain complete quality control.
  - *Trade-off:* Adds one human interaction click for web chatbot leads.

---

## ADR 005: Graphify AST Knowledge Graph for Zero-Token Codebase Navigation

- **Status:** Accepted
- **Context:** As the codebase expanded across 100+ files and 29 routes, LLM agents were forced to re-read thousands of lines of code on every interaction, causing context exhaustion and high latency.
- **Decision:** Integrate `graphify` to pre-extract an AST knowledge graph (`graph.json`, 547 nodes, 1324 edges) and install Git lifecycle hooks.
- **Consequences:**
  - *Positive:* Agents query symbols, call flows, and dependencies instantly in 0 tokens; no repetitive file scanning.
  - *Trade-off:* Requires `graphify update .` after major structural refactors (automated via Git hook).
