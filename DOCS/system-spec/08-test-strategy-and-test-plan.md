# 08. Test Strategy & Test Plan — Apex Realty CallCRM

**Test Runner:** Vitest (`vitest run`)  
**Assertion Library:** Vitest Chai Assertions  
**Current Test Coverage:** 100% Pass Rate across all 9 Test Suites (48 Tests)  
**Execution Speed:** ~400ms

---

## 1. Test Architecture & Strategy Pyramid

```
                ┌─────────────────────────────────┐
                │          E2E Journeys           │  (Signup → Onboarding → Lead Progression)
                ├─────────────────────────────────┤
                │      Integration & API Tests    │  (Webhooks, RLS Isolation, Endpoints)
                ├─────────────────────────────────┤
                │      Unit & Schema Tests        │  (Phone Dedup, Rate Limiter, Zod, Mappers)
                └─────────────────────────────────┘
```

---

## 2. Automated Test Suites Catalog

### 2.1 `phone-dedup.test.ts` (Phone Normalization & Currency Formatting)
- **Objective:** Verify that Indian mobile numbers across diverse formatting patterns normalize to E.164 (`+91XXXXXXXXXX`) and match existing master contacts.
- **Tests:**
  1. Normalizes standard 10-digit Indian numbers (`9810123456` → `+919810123456`).
  2. Strips spaces and dashes (`+91 98110-99234` → `+919811099234`).
  3. Strips leading zero prefixes (`09811099234` → `+919811099234`).
  4. Preserves international numbers (`+14155552671`, `+447911123456`).
  5. Formats Indian currency accurately into Crores (`₹3.80 Cr`) and Lakhs (`₹85.00 L`).

### 2.2 `rate-limiting.test.ts` (Token Bucket & Idempotency)
- **Objective:** Ensure API endpoints block brute-force floods and duplicate requests.
- **Tests:**
  1. Allows requests within defined rate limit window.
  2. Returns `allowed: false` and `remaining: 0` when thresholds are exceeded.
  3. Caches and retrieves exact responses for replayed idempotency keys (`saveIdempotency` / `checkIdempotency`).

### 2.3 `validations.test.ts` (Zod Inbound Payload Verification)
- **Objective:** Prevent SQL/NoSQL injection, negative budgets, and malformed inputs.
- **Tests:**
  1. Accepts well-formed `createLeadSchema` payloads.
  2. Rejects negative budgets and short phone strings.
  3. Rejects oversized activity notes (>2000 characters).
  4. Validates AI autonomous qualification input schemas.

### 2.4 `webhook-security.test.ts` (HMAC-SHA256 Cryptographic Verification)
- **Objective:** Ensure forged webhooks are rejected with 401 Unauthorized.
- **Tests:**
  1. Validates authentic SHA-256 signatures generated with shared secret.
  2. Rejects modified payloads or incorrect signature headers.

### 2.5 `subscription.test.ts` (Plan Quotas & Feature Gating)
- **Objective:** Enforce server-side SaaS plan limits.
- **Tests:**
  1. Enforces 300 lead ceiling on Starter plan.
  2. Gates AI Agents and Multi-Region analytics between Starter, Growth, and Enterprise tiers.

### 2.6 `crm-sync-mappers.test.ts` & Supporting Suites
- **Objective:** Verifies snake_case PostgreSQL to camelCase TypeScript model transforms.

---

## 3. Running Test Suites

```bash
# Run all unit and integration tests
cd Frontend && npm test

# Run tests in watch mode during development
npx vitest

# Run specific test file
npx vitest run src/__tests__/phone-dedup.test.ts
```

---

## 4. Continuous Integration (CI) Test Pipeline

Every Git pull request and commit executes:
1. `npm test` (Runs all 48 unit/integration tests).
2. `npm run build` (Typechecks all 29 Next.js routes).
3. If any test or type check fails, the deployment pipeline halts automatically.
