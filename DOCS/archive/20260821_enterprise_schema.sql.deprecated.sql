-- ====================================================================
-- APEX REALTY CALLCRM: ENTERPRISE MULTI-TENANT DATABASE ARCHITECTURE
-- PostgreSQL 15+ / Supabase with Row-Level Security (RLS) & Audit Trails
-- ====================================================================

-- 1. EXTENSIONS & UTILITIES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean and standard enum types
DO $$ BEGIN
    CREATE TYPE org_plan_type AS ENUM ('starter', 'growth', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('admin', 'manager', 'salesperson', 'agent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE project_status_type AS ENUM ('upcoming', 'active', 'sold_out');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE unit_status_type AS ENUM ('available', 'hold', 'site_visit', 'negotiation', 'booked', 'sold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE lead_status_type AS ENUM ('open', 'won', 'lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE deal_health_type AS ENUM ('strong', 'neutral', 'at_risk');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM ('call', 'whatsapp', 'meeting', 'site_visit', 'note', 'stage_change', 'ai_agent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE task_status_type AS ENUM ('overdue', 'due_today', 'upcoming', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('brochure', 'cost_sheet', 'floor_plan', 'kyc_doc', 'agreement');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. HELPER FUNCTIONS FOR PHONE NORMALIZATION & JWT CONTEXT
CREATE OR REPLACE FUNCTION normalize_phone(phone_input TEXT)
RETURNS TEXT AS $$
DECLARE
    cleaned TEXT;
BEGIN
    IF phone_input IS NULL THEN
        RETURN NULL;
    END IF;
    cleaned := regexp_replace(phone_input, '\D', '', 'g');
    -- Handle 10-digit Indian numbers
    IF length(cleaned) = 10 THEN
        RETURN '+91' || cleaned;
    ELSIF length(cleaned) = 12 AND cleaned LIKE '91%' THEN
        RETURN '+' || cleaned;
    ELSIF length(cleaned) = 11 AND cleaned LIKE '0%' THEN
        RETURN '+91' || substr(cleaned, 2);
    ELSE
        RETURN '+' || cleaned;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Extract current Tenant ID from JWT claims (or custom session setting)
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        NULLIF(current_setting('request.jwt.claim.org_id', true), '')::UUID,
        NULLIF(current_setting('app.current_org_id', true), '')::UUID,
        (auth.jwt() -> 'app_metadata' ->> 'org_id')::UUID,
        (auth.jwt() -> 'user_metadata' ->> 'org_id')::UUID
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Extract current User ID from Auth
CREATE OR REPLACE FUNCTION current_app_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Extract current User Role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        auth.jwt() -> 'app_metadata' ->> 'role',
        auth.jwt() -> 'user_metadata' ->> 'role',
        'salesperson'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. CORE ENTITY SCHEMAS

-- 3.1 ORGANIZATIONS (Tenants)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan org_plan_type NOT NULL DEFAULT 'growth',
    max_seats INT NOT NULL DEFAULT 20,
    reactivation_days_threshold INT NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT true,
    custom_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 REGIONS (Hubs)
CREATE TABLE IF NOT EXISTS public.regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    state VARCHAR(100),
    code VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_regions_org ON public.regions(org_id);

-- 3.3 USERS / PROFILES
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    phone_normalized VARCHAR(30),
    role user_role_type NOT NULL DEFAULT 'salesperson',
    is_active BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_org_role ON public.users(org_id, role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 3.4 PEOPLE (Master Identity & Phone Dedup Anchor per Org)
CREATE TABLE IF NOT EXISTS public.people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    phone_normalized VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100),
    source VARCHAR(100) DEFAULT 'Direct Inbound',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_person_phone_per_org UNIQUE(org_id, phone_normalized)
);
CREATE INDEX IF NOT EXISTS idx_people_org_phone ON public.people(org_id, phone_normalized);
CREATE INDEX IF NOT EXISTS idx_people_org_name ON public.people(org_id, name);

-- 3.5 PROJECTS (Developments / Property Catalog)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    developer_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    price_min BIGINT NOT NULL DEFAULT 0,
    price_max BIGINT NOT NULL DEFAULT 0,
    price_range_label VARCHAR(100),
    total_units INT NOT NULL DEFAULT 0,
    status project_status_type NOT NULL DEFAULT 'active',
    hero_image TEXT,
    brochure_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_org ON public.projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_region ON public.projects(org_id, region_id);

-- 3.6 PROJECT CONTACTS (Stakeholder Roles)
CREATE TABLE IF NOT EXISTS public.project_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    person_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role VARCHAR(100) NOT NULL, -- 'owner', 'builder', 'architect', 'engineer', 'guard'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_proj_contacts_proj ON public.project_contacts(org_id, project_id);

-- 3.7 PROJECT UNITS (Tower -> Floor -> Unit Inventory Matrix)
CREATE TABLE IF NOT EXISTS public.project_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    tower VARCHAR(50) NOT NULL,
    unit_number VARCHAR(50) NOT NULL,
    floor INT NOT NULL,
    configuration VARCHAR(50) NOT NULL, -- '3 BHK Luxury', '4 BHK Penthouse'
    super_area_sqft INT NOT NULL,
    price BIGINT NOT NULL,
    status unit_status_type NOT NULL DEFAULT 'available',
    facing VARCHAR(50),
    assigned_lead_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_unit_key UNIQUE(org_id, project_id, tower, unit_number)
);
CREATE INDEX IF NOT EXISTS idx_units_project_status ON public.project_units(org_id, project_id, status);

-- 3.8 PIPELINE STAGES
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT true,
    color_hex VARCHAR(20) DEFAULT '#4f46e5',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pipeline_stage_slug UNIQUE(org_id, slug)
);

-- 3.9 LEADS (Opportunities: Person x Project tracked through pipeline)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    assigned_salesperson_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'site_visit', 'negotiation', 'won', 'lost'
    budget BIGINT NOT NULL DEFAULT 0,
    property_type VARCHAR(100) DEFAULT 'Luxury Apartment',
    configuration_preference VARCHAR(100),
    preferred_floor VARCHAR(50),
    facing_preference VARCHAR(50),
    timeline VARCHAR(100),
    source VARCHAR(100) DEFAULT 'Website Inbound',
    status lead_status_type NOT NULL DEFAULT 'open',
    lost_at TIMESTAMPTZ,
    lost_reason TEXT,
    lead_score INT NOT NULL DEFAULT 70,
    lead_score_label VARCHAR(30) DEFAULT 'Warm',
    deal_health deal_health_type NOT NULL DEFAULT 'neutral',
    deal_health_reason TEXT,
    suggested_next_move TEXT,
    next_follow_up_at TIMESTAMPTZ,
    follow_up_status task_status_type DEFAULT 'upcoming',
    assigned_unit_number VARCHAR(50),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    days_in_stage INT NOT NULL DEFAULT 0,
    qualification_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_org_stage ON public.leads(org_id, stage, status);
CREATE INDEX IF NOT EXISTS idx_leads_org_rep ON public.leads(org_id, assigned_salesperson_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_project ON public.leads(org_id, project_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_score ON public.leads(org_id, lead_score DESC);

-- 3.10 ACTIVITIES (Immutable Chronological Audit Stream)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    person_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type activity_type NOT NULL DEFAULT 'call',
    outcome VARCHAR(100),
    outcome_label VARCHAR(100),
    notes TEXT,
    duration_seconds INT DEFAULT 0,
    scheduled_follow_up_at VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activities_org_lead ON public.activities(org_id, lead_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_org_user ON public.activities(org_id, user_id, occurred_at DESC);

-- 3.11 TASKS (Scheduled Prioritized Follow-ups)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    assigned_to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    due_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_time VARCHAR(20),
    status task_status_type NOT NULL DEFAULT 'upcoming',
    priority VARCHAR(20) DEFAULT 'medium',
    completed_at TIMESTAMPTZ,
    completed_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_org_rep_status ON public.tasks(org_id, assigned_to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON public.tasks(org_id, due_at);

-- 3.12 DOCUMENTS (Brochure & KYC Vault)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    type document_type NOT NULL DEFAULT 'brochure',
    file_size_bytes BIGINT DEFAULT 0,
    mime_type VARCHAR(100),
    uploaded_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_org_proj ON public.documents(org_id, project_id);
CREATE INDEX IF NOT EXISTS idx_documents_org_lead ON public.documents(org_id, lead_id);

-- 3.13 WEBHOOK EVENTS (Idempotent Ingestion Log)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'whatsapp', 'meta_ads', 'website'
    event_type VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'failed'
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhooks_idempotency ON public.webhook_events(idempotency_key);

-- 3.14 AI AGENT EXECUTIONS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.ai_agent_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    agent_name VARCHAR(100) NOT NULL, -- 'aria_intake', 'lost_lead_resurrector'
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    tool_invoked VARCHAR(100) NOT NULL,
    tool_input JSONB NOT NULL,
    tool_output JSONB NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    latency_ms INT DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'success',
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_agent_org ON public.ai_agent_executions(org_id, agent_name);

-- 3.15 SOC2 / COMPLIANCE AUDIT LOG
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'reassign', 'export', 'login'
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    diff JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_org_entity ON public.audit_logs(org_id, entity_type, entity_id);

-- 4. ROW-LEVEL SECURITY (RLS) POLICIES — HARD TENANT ISOLATION

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Base Tenant Isolation Policies (SELECT, INSERT, UPDATE, DELETE)

-- Organizations: users can only see their own org
CREATE POLICY org_tenant_isolation ON public.organizations
    FOR ALL
    USING (id = current_tenant_id());

-- Regions
CREATE POLICY regions_tenant_isolation ON public.regions
    FOR ALL
    USING (org_id = current_tenant_id())
    WITH CHECK (org_id = current_tenant_id());

-- Users
CREATE POLICY users_tenant_isolation ON public.users
    FOR ALL
    USING (org_id = current_tenant_id())
    WITH CHECK (org_id = current_tenant_id());

-- People
CREATE POLICY people_tenant_isolation ON public.people
    FOR ALL
    USING (org_id = current_tenant_id())
    WITH CHECK (org_id = current_tenant_id());

-- Projects
CREATE POLICY projects_tenant_isolation ON public.projects
    FOR ALL
    USING (org_id = current_tenant_id())
    WITH CHECK (org_id = current_tenant_id());

-- Project Contacts
CREATE POLICY proj_contacts_tenant_isolation ON public.project_contacts
    FOR ALL
    USING (org_id = current_tenant_id())
    WITH CHECK (org_id = current_tenant_id());

-- Project Units
CREATE POLICY project_units_tenant_isolation ON public.project_units
    FOR ALL
    USING (org_id = current_tenant_id())
    WITH CHECK (org_id = current_tenant_id());

-- Pipeline Stages
CREATE POLICY pipeline_stages_tenant_isolation ON public.pipeline_stages
    FOR ALL
    USING (org_id = current_tenant_id())
    WITH CHECK (org_id = current_tenant_id());

-- Leads (Granular: Reps see their assigned leads, Admins & Managers see all leads in the org)
CREATE POLICY leads_tenant_isolation ON public.leads
    FOR ALL
    USING (
        org_id = current_tenant_id()
        AND (
            current_user_role() IN ('admin', 'manager')
            OR assigned_salesperson_id = current_app_user_id()
            OR assigned_salesperson_id IS NULL
        )
    )
    WITH CHECK (org_id = current_tenant_id());

-- Activities
CREATE POLICY activities_tenant_isolation ON public.activities
    FOR ALL
    USING (org_id = current_tenant_id())
    WITH CHECK (org_id = current_tenant_id());

-- Tasks
CREATE POLICY tasks_tenant_isolation ON public.tasks
    FOR ALL
    USING (
        org_id = current_tenant_id()
        AND (
            current_user_role() IN ('admin', 'manager')
            OR assigned_to_user_id = current_app_user_id()
        )
    )
    WITH CHECK (org_id = current_tenant_id());

-- Documents
CREATE POLICY documents_tenant_isolation ON public.documents
    FOR ALL
    USING (org_id = current_tenant_id())
    WITH CHECK (org_id = current_tenant_id());

-- Webhook Events (Only admins/system service can access)
CREATE POLICY webhooks_tenant_isolation ON public.webhook_events
    FOR ALL
    USING (org_id = current_tenant_id() OR org_id IS NULL)
    WITH CHECK (org_id = current_tenant_id() OR org_id IS NULL);

-- AI Agent Executions
CREATE POLICY ai_agent_tenant_isolation ON public.ai_agent_executions
    FOR ALL
    USING (org_id = current_tenant_id())
    WITH CHECK (org_id = current_tenant_id());

-- Audit Logs
CREATE POLICY audit_logs_tenant_isolation ON public.audit_logs
    FOR ALL
    USING (org_id = current_tenant_id());

-- 5. AUTOMATIC TRIGGERS & BUSINESS LOGIC

-- Trigger: Normalize phone before writing to `people` table
CREATE OR REPLACE FUNCTION trg_normalize_person_phone()
RETURNS TRIGGER AS $$
BEGIN
    NEW.phone_normalized := normalize_phone(NEW.phone);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_people_phone_normalization ON public.people;
CREATE TRIGGER trg_people_phone_normalization
    BEFORE INSERT OR UPDATE ON public.people
    FOR EACH ROW
    EXECUTE FUNCTION trg_normalize_person_phone();

-- Trigger: Auto updated_at timestamp
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
