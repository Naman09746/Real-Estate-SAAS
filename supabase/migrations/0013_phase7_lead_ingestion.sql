-- ====================================================================
-- MIGRATION 0013: Phase 7 — Lead Ingestion Automation
-- Meta Lead Ads + WhatsApp Ingestion Pipeline & Atomic Assignment
-- ====================================================================

-- 1. Extend webhook_sources with optional project mapping & config
alter table public.webhook_sources
  add column if not exists project_id uuid references public.projects(id) on delete set null,
  add column if not exists config jsonb default '{}'::jsonb;

-- 2. Extend webhook_events for retry tracking & entity linking
alter table public.webhook_events
  drop constraint if exists webhook_events_status_check;

alter table public.webhook_events
  add constraint webhook_events_status_check
  check (status in ('pending', 'processing', 'processed', 'failed', 'retryable', 'dead_letter'));

alter table public.webhook_events
  add column if not exists lead_id uuid references public.leads(id) on delete set null,
  add column if not exists person_id uuid references public.people(id) on delete set null,
  add column if not exists retry_count integer not null default 0,
  add column if not exists last_error text;

-- 3. Extend leads table with marketing attribution fields
alter table public.leads
  add column if not exists campaign_id text,
  add column if not exists campaign_name text,
  add column if not exists adset_id text,
  add column if not exists adset_name text,
  add column if not exists ad_id text,
  add column if not exists ad_name text,
  add column if not exists form_id text,
  add column if not exists form_name text,
  add column if not exists external_lead_id text,
  add column if not exists raw_inbound_payload jsonb,
  add column if not exists inbound_timestamp timestamptz default now();

-- Unique constraint on external_lead_id per organization to enforce database-level dedup
create unique index if not exists idx_leads_org_external_lead_id
  on public.leads(org_id, external_lead_id)
  where external_lead_id is not null;

-- 4. Atomic Concurrency-Safe Round-Robin Assignment State
create table if not exists public.org_assignment_state (
  org_id uuid not null references public.orgs(id) on delete cascade,
  region_id uuid not null default '00000000-0000-0000-0000-000000000000'::uuid,
  last_assigned_user_id uuid references public.profiles(user_id) on delete set null,
  assignment_counter bigint not null default 0,
  updated_at timestamptz default now(),
  primary key (org_id, region_id)
);

-- 5. Stored Procedure: Atomic Round-Robin Salesperson Assignment
create or replace function public.assign_next_salesperson(
  p_org_id uuid,
  p_region_id uuid default null
)
returns table (
  salesperson_id uuid,
  salesperson_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_full_name text;
  v_effective_region uuid;
  v_rep_count bigint;
  v_counter bigint;
  v_offset bigint;
begin
  v_effective_region := coalesce(p_region_id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- 1. Ensure state row exists
  insert into public.org_assignment_state (org_id, region_id, assignment_counter, updated_at)
    values (p_org_id, v_effective_region, 0, now())
    on conflict (org_id, region_id)
    do nothing;

  -- 2. Lock row and atomically increment counter
  update public.org_assignment_state
    set assignment_counter = assignment_counter + 1,
        updated_at = now()
    where org_id = p_org_id and region_id = v_effective_region
    returning assignment_counter into v_counter;

  if v_counter is null then
    v_counter := 1;
  end if;

  -- 3. Count eligible salespeople
  select count(*)
    into v_rep_count
    from public.profiles pr
    where pr.org_id = p_org_id
      and (p_region_id is null or pr.region_id = p_region_id)
      and pr.role in ('salesperson', 'closer');

  if v_rep_count > 0 then
    v_offset := (v_counter - 1) % v_rep_count;
    select pr.user_id, pr.full_name
      into v_user_id, v_full_name
      from public.profiles pr
      where pr.org_id = p_org_id
        and (p_region_id is null or pr.region_id = p_region_id)
        and pr.role in ('salesperson', 'closer')
      order by pr.created_at asc, pr.user_id asc
      limit 1
      offset v_offset;
  end if;

  -- 4. Fallback to any active org member if no salespeople found
  if v_user_id is null then
    select count(*) into v_rep_count from public.profiles pr where pr.org_id = p_org_id;
    if v_rep_count > 0 then
      v_offset := (v_counter - 1) % v_rep_count;
      select pr.user_id, pr.full_name
        into v_user_id, v_full_name
        from public.profiles pr
        where pr.org_id = p_org_id
        order by pr.created_at asc, pr.user_id asc
        limit 1
        offset v_offset;
    end if;
  end if;

  if v_user_id is not null then
    salesperson_id := v_user_id;
    salesperson_name := v_full_name;
    return next;
  end if;
end;
$$;



grant all on public.org_assignment_state to authenticated;
grant execute on function public.assign_next_salesperson(uuid, uuid) to authenticated;
