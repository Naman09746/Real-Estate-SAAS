# 06. Deployment & Operations Runbook — Apex Realty CallCRM

**Document Version:** 1.0.0 (Production Release)  
**Hosting Platforms:** Vercel (Edge & Serverless Compute) + Supabase (Managed PostgreSQL 15+)  
**Monitoring:** `/api/health` + Uptime Monitoring + Sentry Error Tracking

---

## 1. Production Deployment Workflow

### 1.1 Pre-Deployment Checklist
- [ ] Run test suite: `npm test` (verify all 48 unit tests pass).
- [ ] Run build verification: `npm run build` (ensure 0 TypeScript or lint errors).
- [ ] Verify environment variables are configured in the Vercel Production Environment.
- [ ] Check that database migrations are executed in Supabase SQL Editor.

### 1.2 Step-by-Step Deployment Guide

```bash
# 1. Clone repository & navigate to Frontend
cd /path/to/Real-estate/Frontend

# 2. Install production dependencies
npm ci

# 3. Execute test suite
npm test

# 4. Compile optimized production build
npm run build

# 5. Deploy to Vercel (Production)
npx vercel --prod
```

---

## 2. Database Migration & Rollback Procedures

### 2.1 Applying Database Migrations (Supabase)
1. Open the **Supabase Dashboard** for the production project.
2. Navigate to **SQL Editor** → **New Query**.
3. Open `supabase/migrations/20260821_enterprise_schema.sql` and run the script.
4. If setting up a fresh staging instance with test inventory, run `supabase/seed.sql`.

### 2.2 Migration Rollback Strategy
All table alterations and policies are designed to be backwards compatible. If a migration needs to be rolled back:
```sql
-- Disable policies if needed
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- Rollback schema changes
DROP TABLE IF EXISTS public.webhook_events CASCADE;
DROP TABLE IF EXISTS public.ai_agent_executions CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
```

---

## 3. Health Monitoring & SLA Telemetry

### 3.1 Live Health Check Endpoint (`GET /api/health`)
Configure an external uptime monitor (e.g., BetterStack, UptimeRobot, Pingdom) to poll `https://your-domain.com/api/health` every 60 seconds.

**Expected Status 200 Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "services": {
      "database": { "status": "healthy", "latencyMs": 12 },
      "aiEngine": { "status": "ready" }
    }
  }
}
```

### 3.2 Alert Thresholds
- **Critical (P0):** `/api/health` returns status `500` or database status is `unreachable` for > 2 consecutive checks.
- **Warning (P1):** Database query latency exceeds `500ms` for > 5 minutes.
- **Warning (P2):** Memory usage `heapUsedMb` exceeds 85% of allocated container limit.

---

## 4. 2 AM Incident Response Runbook

### Scenario A: Database Unreachable / Connection Pool Exhaustion
1. **Symptom:** API routes return `DB_QUERY_ERROR` or `/api/health` shows `dbStatus: unreachable`.
2. **Immediate Action:**
   - Log in to Supabase Dashboard → **Database** → **Connection Pooling**.
   - Verify connection pool mode is set to **Transaction Mode (Port 6543)**.
   - Check for long-running unindexed queries in **Query Performance**.

### Scenario B: AI Agent Rate Limit / Quota Exhaustion
1. **Symptom:** Aria bot returns `API_KEY_REQUIRED` or `RESOURCE_EXHAUSTED`.
2. **Immediate Action:**
   - Verify Google AI Studio / Gemini API quota.
   - Check `Frontend/.env.local` for valid `GEMINI_API_KEY`.
   - The frontend automatically switches to localized simulated conversational mode if the key is missing or exhausted, preventing user downtime.

### Scenario C: Webhook Failure Storm
1. **Symptom:** Meta / WhatsApp reports delivery errors.
2. **Immediate Action:**
   - Inspect `/api/webhooks/whatsapp` logs in Vercel.
   - Check `webhook_events` table for unhandled event types.
   - Confirm `WHATSAPP_APP_SECRET` matches the Meta App Dashboard secret.

---

## 5. Disaster Recovery & Backups

- **RPO (Recovery Point Objective):** < 1 hour (via Supabase Point-in-Time Recovery).
- **RTO (Recovery Time Objective):** < 15 minutes (via automated Vercel rollback).
- **Instant Deployment Rollback:** In the Vercel Dashboard, select **Deployments** → Locate the previous working build → Click **Instant Rollback**.
