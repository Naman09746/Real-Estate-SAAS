-- ====================================================================
-- MIGRATION 0012: Phase 6 — Aria 2.0 Real-Estate Intelligence Indexes
-- & Multi-Tenant Inventory Matching Helpers
-- ====================================================================

-- 1. Optimized High-Performance Indexes for Aria Inventory Search
create index if not exists idx_project_units_aria_search
  on public.project_units(org_id, status, configuration, price, super_area_sq_ft);

create index if not exists idx_project_units_facing
  on public.project_units(org_id, facing)
  where status = 'available';

-- 2. Fast Customer Dossier & Duplicate Search Indexes
create index if not exists idx_people_ai_phone_email
  on public.people(org_id, phone_normalized, email);

create index if not exists idx_leads_ai_phone_email
  on public.leads(org_id, phone_normalized, email, salesperson_id);

create index if not exists idx_leads_ai_stage_health
  on public.leads(org_id, stage, deal_health, days_in_stage);

-- 3. Document Search Indexes
create index if not exists idx_documents_ai_lookup
  on public.documents(org_id, project_id, lead_id, type);

-- 4. Projects Query Index
create index if not exists idx_projects_ai_search
  on public.projects(org_id, status, region_id);
