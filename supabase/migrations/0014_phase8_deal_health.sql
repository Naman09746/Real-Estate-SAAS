-- ====================================================================
-- MIGRATION 0014: Phase 8 — Deterministic Deal Health Engine
-- Explainable, Activity-Driven Risk Scoring & Automated Triggers
-- ====================================================================

-- 1. Extend leads table with deterministic health scoring columns
alter table public.leads
  add column if not exists deal_health_score integer not null default 60 check (deal_health_score >= 0 and deal_health_score <= 100),
  add column if not exists deal_health_factors jsonb not null default '[]'::jsonb,
  add column if not exists deal_health_recommended_action text,
  add column if not exists deal_health_calculated_at timestamptz default now(),
  add column if not exists deal_health_manual_override jsonb default null;

-- Extend activities table with metadata column if not present
alter table public.activities
  add column if not exists metadata jsonb default '{}'::jsonb;

-- Composite indexes for efficient querying and SLA monitoring
create index if not exists idx_leads_deal_health_score
  on public.leads(org_id, deal_health, deal_health_score desc);

create index if not exists idx_leads_health_calc
  on public.leads(org_id, stage, deal_health_calculated_at);

-- 2. Stored Procedure: Calculate Deterministic Deal Health for a Single Lead
create or replace function public.calculate_lead_deal_health(
  p_lead_id uuid,
  p_now timestamptz default now()
)
returns table (
  score integer,
  status text,
  reason text,
  factors jsonb,
  recommended_action text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead record;
  v_base_score integer := 60;
  v_score integer;
  v_status text;
  v_reason text;
  v_factors jsonb := '[]'::jsonb;
  v_action text;
  v_days_inactive integer;
  v_days_in_stage integer;
  v_overdue_tasks integer;
  v_upcoming_tasks integer;
  v_recent_site_visit integer;
  v_recent_inbound integer;
  v_recent_booking integer;
  v_top_negative_type text := null;
  v_min_impact integer := 0;
begin
  -- 1. Fetch lead
  select
    l.id,
    l.org_id,
    l.stage,
    l.budget,
    l.created_at,
    l.last_activity_at,
    l.stage_entered_at,
    l.days_in_stage
  into v_lead
  from public.leads l
  where l.id = p_lead_id;

  if v_lead.id is null then
    return;
  end if;

  -- 2. Terminal Stage Handling
  if v_lead.stage = 'won' then
    score := 100;
    status := 'strong';
    reason := 'Deal successfully closed and won.';
    factors := jsonb_build_array(
      jsonb_build_object('type', 'stage_won', 'impact', 40, 'description', 'Deal won and closed successfully.')
    );
    recommended_action := 'Proceed with post-sale onboarding, documentation, and registration.';
    return next;
    return;
  elsif v_lead.stage = 'lost' then
    score := 0;
    status := 'neutral';
    reason := 'Deal marked as lost.';
    factors := jsonb_build_array(
      jsonb_build_object('type', 'stage_lost', 'impact', -60, 'description', 'Deal closed as lost.')
    );
    recommended_action := 'No active sales action required. Can be scheduled for future re-engagement.';
    return next;
    return;
  end if;

  -- 3. Gather CRM Signals
  v_days_inactive := greatest(0, floor(extract(epoch from (p_now - coalesce(v_lead.last_activity_at, v_lead.created_at))) / 86400))::integer;
  v_days_in_stage := greatest(0, floor(extract(epoch from (p_now - coalesce(v_lead.stage_entered_at, v_lead.created_at))) / 86400))::integer;

  select count(*)
  into v_overdue_tasks
  from public.tasks t
  where t.lead_id = v_lead.id
    and t.status = 'overdue';

  select count(*)
  into v_upcoming_tasks
  from public.tasks t
  where t.lead_id = v_lead.id
    and t.status in ('upcoming', 'due_today');

  select count(*)
  into v_recent_site_visit
  from public.activities a
  where a.lead_id = v_lead.id
    and a.type = 'site_visit'
    and a.occurred_at >= (p_now - interval '7 days');

  select count(*)
  into v_recent_inbound
  from public.activities a
  where a.lead_id = v_lead.id
    and a.occurred_at >= (p_now - interval '48 hours')
    and (a.type in ('whatsapp', 'call') or a.metadata->>'inbound' = 'true');

  select count(*)
  into v_recent_booking
  from public.activities a
  where a.lead_id = v_lead.id
    and a.occurred_at >= (p_now - interval '14 days')
    and a.type in ('booking', 'meeting');

  v_score := v_base_score;

  -- 4. Factor 1: Activity Recency
  if v_days_inactive = 0 then
    v_score := v_score + 20;
    v_factors := v_factors || jsonb_build_object('type', 'activity_recency', 'impact', 20, 'description', 'Recent sales touchpoint within 24 hours');
  elsif v_days_inactive <= 2 then
    v_score := v_score + 15;
    v_factors := v_factors || jsonb_build_object('type', 'activity_recency', 'impact', 15, 'description', 'Sales activity within 2 days');
  elsif v_days_inactive <= 5 then
    v_score := v_score + 8;
    v_factors := v_factors || jsonb_build_object('type', 'activity_recency', 'impact', 8, 'description', 'Sales activity within 5 days');
  elsif v_days_inactive <= 10 then
    v_score := v_score - 10;
    v_factors := v_factors || jsonb_build_object('type', 'inactivity', 'impact', -10, 'description', 'No sales activity for ' || v_days_inactive || ' days');
    if -10 < v_min_impact then v_min_impact := -10; v_top_negative_type := 'inactivity'; end if;
  else
    v_score := v_score - 20;
    v_factors := v_factors || jsonb_build_object('type', 'inactivity', 'impact', -20, 'description', 'Prolonged inactivity for ' || v_days_inactive || ' days');
    if -20 < v_min_impact then v_min_impact := -20; v_top_negative_type := 'inactivity'; end if;
  end if;

  -- 5. Factor 2: Overdue Tasks
  if v_overdue_tasks = 1 then
    v_score := v_score - 10;
    v_factors := v_factors || jsonb_build_object('type', 'overdue_tasks', 'impact', -10, 'description', '1 overdue follow-up task');
    if -10 < v_min_impact then v_min_impact := -10; v_top_negative_type := 'overdue_tasks'; end if;
  elsif v_overdue_tasks = 2 then
    v_score := v_score - 20;
    v_factors := v_factors || jsonb_build_object('type', 'overdue_tasks', 'impact', -20, 'description', '2 overdue follow-up tasks');
    if -20 < v_min_impact then v_min_impact := -20; v_top_negative_type := 'overdue_tasks'; end if;
  elsif v_overdue_tasks >= 3 then
    v_score := v_score - 30;
    v_factors := v_factors || jsonb_build_object('type', 'overdue_tasks', 'impact', -30, 'description', v_overdue_tasks || ' overdue follow-up tasks');
    if -30 < v_min_impact then v_min_impact := -30; v_top_negative_type := 'overdue_tasks'; end if;
  end if;

  -- 6. Factor 3: Stage Stagnation
  if v_lead.stage = 'negotiation' then
    if v_days_in_stage > 14 then
      v_score := v_score - 20;
      v_factors := v_factors || jsonb_build_object('type', 'stage_stagnation', 'impact', -20, 'description', 'Negotiation stalled for ' || v_days_in_stage || ' days without closing');
      if -20 < v_min_impact then v_min_impact := -20; v_top_negative_type := 'stalled_negotiation'; end if;
    elsif v_days_in_stage > 7 then
      v_score := v_score - 10;
      v_factors := v_factors || jsonb_build_object('type', 'stage_stagnation', 'impact', -10, 'description', 'Negotiation ongoing for ' || v_days_in_stage || ' days');
      if -10 < v_min_impact then v_min_impact := -10; v_top_negative_type := 'stalled_negotiation'; end if;
    end if;
  elsif v_lead.stage = 'site_visit' then
    if v_days_in_stage > 10 then
      v_score := v_score - 15;
      v_factors := v_factors || jsonb_build_object('type', 'stage_stagnation', 'impact', -15, 'description', 'Site visit stage pending for ' || v_days_in_stage || ' days without progression');
      if -15 < v_min_impact then v_min_impact := -15; v_top_negative_type := 'stalled_site_visit'; end if;
    elsif v_days_in_stage > 5 then
      v_score := v_score - 5;
      v_factors := v_factors || jsonb_build_object('type', 'stage_stagnation', 'impact', -5, 'description', 'Site visit pending for ' || v_days_in_stage || ' days');
      if -5 < v_min_impact then v_min_impact := -5; v_top_negative_type := 'stalled_site_visit'; end if;
    end if;
  elsif v_lead.stage in ('new', 'contacted') then
    if v_days_in_stage > 7 then
      v_score := v_score - 15;
      v_factors := v_factors || jsonb_build_object('type', 'stage_stagnation', 'impact', -15, 'description', 'Initial outreach stalled for ' || v_days_in_stage || ' days');
      if -15 < v_min_impact then v_min_impact := -15; v_top_negative_type := 'stalled_outreach'; end if;
    end if;
  else
    if v_days_in_stage > 15 then
      v_score := v_score - 10;
      v_factors := v_factors || jsonb_build_object('type', 'stage_stagnation', 'impact', -10, 'description', 'In ' || replace(v_lead.stage, '_', ' ') || ' stage for ' || v_days_in_stage || ' days');
      if -10 < v_min_impact then v_min_impact := -10; v_top_negative_type := 'stage_stagnation'; end if;
    end if;
  end if;

  -- 7. Factor 4: Positive Sales Signals
  if v_recent_site_visit > 0 then
    v_score := v_score + 15;
    v_factors := v_factors || jsonb_build_object('type', 'recent_site_visit', 'impact', 15, 'description', 'Site visit completed in last 7 days');
  end if;

  if v_recent_inbound > 0 then
    v_score := v_score + 10;
    v_factors := v_factors || jsonb_build_object('type', 'buyer_engagement', 'impact', 10, 'description', 'Inbound buyer response in last 48 hours');
  end if;

  if v_upcoming_tasks > 0 and v_overdue_tasks = 0 then
    v_score := v_score + 5;
    v_factors := v_factors || jsonb_build_object('type', 'scheduled_followup', 'impact', 5, 'description', 'Future follow-up scheduled');
  end if;

  if v_recent_booking > 0 then
    v_score := v_score + 10;
    v_factors := v_factors || jsonb_build_object('type', 'commercial_progress', 'impact', 10, 'description', 'Recent booking/meeting progress');
  end if;

  -- 8. Clamp Score: 0 <= score <= 100
  v_score := greatest(0, least(100, v_score));

  -- 9. Determine Status
  if v_score >= 80 then
    v_status := 'strong';
  elsif v_score >= 50 then
    v_status := 'neutral';
  else
    v_status := 'at_risk';
  end if;

  -- 10. Generate Primary Reason & Recommended Action
  if v_status = 'at_risk' then
    if v_top_negative_type = 'inactivity' then
      v_reason := 'No sales activity for ' || v_days_inactive || ' days.';
      v_action := 'Contact the buyer today via phone or WhatsApp to re-engage interest.';
    elsif v_top_negative_type = 'overdue_tasks' then
      v_reason := v_overdue_tasks || ' overdue follow-up task' || (case when v_overdue_tasks > 1 then 's' else '' end) || '.';
      v_action := 'Complete the overdue follow-up tasks immediately.';
    elsif v_top_negative_type = 'stalled_negotiation' then
      v_reason := 'Negotiation stalled for ' || v_days_in_stage || ' days without movement.';
      v_action := 'Review pricing and payment milestones with the manager and schedule a closing call.';
    elsif v_top_negative_type = 'stalled_site_visit' then
      v_reason := 'Site visit pending for ' || v_days_in_stage || ' days without follow-up.';
      v_action := 'Follow up on the site visit to capture buyer feedback and share inventory cost sheet.';
    elsif v_top_negative_type = 'stalled_outreach' then
      v_reason := 'Initial outreach stalled for ' || v_days_in_stage || ' days.';
      v_action := 'Attempt direct phone contact and share the verified project dossier.';
    else
      v_reason := 'Deal has low momentum across activity and task cadence.';
      v_action := 'Schedule an immediate check-in call with the buyer.';
    end if;
  elsif v_status = 'strong' then
    v_reason := 'High momentum: active engagement with zero overdue tasks.';
    v_action := 'Maintain regular communication and guide the buyer toward agreement and unit booking.';
  else
    v_reason := 'Active deal with standard progression cadence.';
    v_action := 'Follow the standard stage progression and execute scheduled tasks on time.';
  end if;

  score := v_score;
  status := v_status;
  reason := v_reason;
  factors := v_factors;
  recommended_action := v_action;
  return next;
end;
$$;

-- 3. Stored Procedure: Recompute Deal Health & SLAs for Organization
drop function if exists public.recompute_lead_health_and_slas(uuid);

create or replace function public.recompute_lead_health_and_slas(
  p_org_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead record;
  v_health record;
  v_today_str text;
  v_time_str text;
  v_leads_checked integer := 0;
  v_leads_updated integer := 0;
  v_tasks_marked_overdue integer := 0;
  v_deals_at_risk integer := 0;
  v_notifications_created integer := 0;
  v_new_followup_status text;
  v_health_changed boolean;
  v_followup_changed boolean;
  v_days_in_stage integer;
  v_now timestamptz := now();
  v_today_date text;
  v_manager_id uuid;
begin
  v_today_str := to_char(v_now, 'YYYY-MM-DD');
  v_time_str := to_char(v_now, 'HH24:MI:SS');
  v_today_date := v_today_str;

  -- 1. Advance Tasks: past due tasks -> 'overdue'
  with updated_overdue as (
    update public.tasks
    set status = 'overdue'
    where (p_org_id is null or org_id = p_org_id)
      and status in ('upcoming', 'due_today')
      and (
        due_date < v_today_str
        or (due_date = v_today_str and due_time is not null and due_time < v_time_str)
      )
    returning id
  )
  select count(*) into v_tasks_marked_overdue from updated_overdue;

  -- 2. Advance Tasks: upcoming due today -> 'due_today'
  update public.tasks
  set status = 'due_today'
  where (p_org_id is null or org_id = p_org_id)
    and status = 'upcoming'
    and due_date = v_today_str
    and (due_time is null or due_time >= v_time_str);

  -- 3. Iterate over leads in organization(s)
  for v_lead in
    select
      l.id,
      l.org_id,
      l.salesperson_id,
      l.person_name,
      l.stage,
      l.deal_health,
      l.deal_health_score,
      l.deal_health_reason,
      l.follow_up_status,
      l.stage_entered_at,
      l.days_in_stage,
      l.created_at
    from public.leads l
    where (p_org_id is null or l.org_id = p_org_id)
  loop
    v_leads_checked := v_leads_checked + 1;

    -- Calculate deterministic health
    select score, status, reason, factors, recommended_action
    into v_health
    from public.calculate_lead_deal_health(v_lead.id, v_now);

    -- Calculate days in stage
    v_days_in_stage := greatest(0, floor(extract(epoch from (v_now - coalesce(v_lead.stage_entered_at, v_lead.created_at))) / 86400))::integer;

    -- Calculate follow_up_status
    if exists (select 1 from public.tasks where lead_id = v_lead.id and status = 'overdue') then
      v_new_followup_status := 'overdue';
    elsif exists (select 1 from public.tasks where lead_id = v_lead.id and status = 'due_today') then
      v_new_followup_status := 'due_today';
    elsif exists (select 1 from public.tasks where lead_id = v_lead.id and status = 'upcoming') then
      v_new_followup_status := 'upcoming';
    elsif exists (select 1 from public.tasks where lead_id = v_lead.id and status = 'completed')
          and not exists (select 1 from public.tasks where lead_id = v_lead.id and status not in ('completed', 'cancelled')) then
      v_new_followup_status := 'completed';
    else
      v_new_followup_status := coalesce(v_lead.follow_up_status, 'upcoming');
    end if;

    if v_health.status = 'at_risk' then
      v_deals_at_risk := v_deals_at_risk + 1;
    end if;

    v_health_changed := (v_lead.deal_health is distinct from v_health.status)
                     or (v_lead.deal_health_score is distinct from v_health.score)
                     or (v_lead.deal_health_reason is distinct from v_health.reason);
    v_followup_changed := (v_lead.follow_up_status is distinct from v_new_followup_status);

    if v_health_changed or v_followup_changed or (v_lead.days_in_stage is distinct from v_days_in_stage) then
      v_leads_updated := v_leads_updated + 1;

      update public.leads
      set
        deal_health = v_health.status,
        deal_health_score = v_health.score,
        deal_health_reason = v_health.reason,
        deal_health_factors = v_health.factors,
        deal_health_recommended_action = v_health.recommended_action,
        deal_health_calculated_at = v_now,
        days_in_stage = greatest(0, floor(extract(epoch from (v_now - coalesce(v_lead.stage_entered_at, v_lead.created_at))) / 86400))::integer,
        follow_up_status = v_new_followup_status
      where id = v_lead.id;

      -- 4. Audit logging on transition to at_risk
      if v_lead.deal_health is distinct from 'at_risk' and v_health.status = 'at_risk' then
        insert into public.audit_log (org_id, actor_id, action, entity_type, entity_id, diff)
        values (
          v_lead.org_id,
          null,
          'deal_health_at_risk',
          'lead',
          v_lead.id,
          jsonb_build_object(
            'previous_health', v_lead.deal_health,
            'previous_score', v_lead.deal_health_score,
            'new_health', v_health.status,
            'new_score', v_health.score,
            'reason', v_health.reason,
            'recommended_action', v_health.recommended_action
          )
        );

        -- 5. Send notification to salesperson & manager (deduped per day)
        if v_lead.salesperson_id is not null then
          perform public.emit_notification(
            v_lead.org_id,
            v_lead.salesperson_id,
            'Deal At Risk: ' || v_lead.person_name,
            'Health dropped to ' || v_health.score || '/100. ' || v_health.reason,
            'deal_at_risk',
            'high',
            'lead',
            v_lead.id,
            '/leads?id=' || v_lead.id::text,
            'deal_at_risk_' || v_lead.id::text || '_' || v_today_date
          );
          v_notifications_created := v_notifications_created + 1;
        end if;
      end if;

      if v_followup_changed and v_new_followup_status = 'overdue' then
        insert into public.audit_log (org_id, actor_id, action, entity_type, entity_id, diff)
        values (
          v_lead.org_id,
          null,
          'follow_up_overdue',
          'lead',
          v_lead.id,
          jsonb_build_object(
            'previous_status', v_lead.follow_up_status,
            'new_status', v_new_followup_status
          )
        );
      end if;
    end if;
  end loop;

  return jsonb_build_object(
    'org_id', p_org_id,
    'leads_checked', v_leads_checked,
    'leads_updated', v_leads_updated,
    'tasks_marked_overdue', v_tasks_marked_overdue,
    'deals_at_risk', v_deals_at_risk,
    'notifications_created', v_notifications_created
  );
end;
$$;

-- 4. Event-Driven Triggers for Instant Health Recalculation
-- Trigger A: Recalculate on Activity Insert
create or replace function public.trg_activity_recompute_health()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_health record;
begin
  if NEW.lead_id is not null then
    select score, status, reason, factors, recommended_action
    into v_health
    from public.calculate_lead_deal_health(NEW.lead_id, now());

    if v_health.score is not null then
      update public.leads
      set
        deal_health = v_health.status,
        deal_health_score = v_health.score,
        deal_health_reason = v_health.reason,
        deal_health_factors = v_health.factors,
        deal_health_recommended_action = v_health.recommended_action,
        deal_health_calculated_at = now()
      where id = NEW.lead_id;
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_activity_recompute_deal_health on public.activities;
create trigger trg_activity_recompute_deal_health
  after insert on public.activities
  for each row
  execute function public.trg_activity_recompute_health();

-- Trigger B: Recalculate on Task Change
create or replace function public.trg_task_recompute_health()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_health record;
  v_lead_id uuid;
begin
  v_lead_id := coalesce(NEW.lead_id, OLD.lead_id);
  if v_lead_id is not null then
    select score, status, reason, factors, recommended_action
    into v_health
    from public.calculate_lead_deal_health(v_lead_id, now());

    if v_health.score is not null then
      update public.leads
      set
        deal_health = v_health.status,
        deal_health_score = v_health.score,
        deal_health_reason = v_health.reason,
        deal_health_factors = v_health.factors,
        deal_health_recommended_action = v_health.recommended_action,
        deal_health_calculated_at = now()
      where id = v_lead_id;
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_task_recompute_deal_health on public.tasks;
create trigger trg_task_recompute_deal_health
  after insert or update of status, due_date on public.tasks
  for each row
  execute function public.trg_task_recompute_health();

-- Trigger C: Recalculate on Lead Stage Change
create or replace function public.trg_lead_stage_recompute_health()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_health record;
begin
  if NEW.stage is distinct from OLD.stage then
    select score, status, reason, factors, recommended_action
    into v_health
    from public.calculate_lead_deal_health(NEW.id, now());

    if v_health.score is not null then
      NEW.deal_health := v_health.status;
      NEW.deal_health_score := v_health.score;
      NEW.deal_health_reason := v_health.reason;
      NEW.deal_health_factors := v_health.factors;
      NEW.deal_health_recommended_action := v_health.recommended_action;
      NEW.deal_health_calculated_at := now();
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_lead_stage_recompute_deal_health on public.leads;
create trigger trg_lead_stage_recompute_deal_health
  before update of stage on public.leads
  for each row
  execute function public.trg_lead_stage_recompute_health();

-- 5. Permissions
grant execute on function public.calculate_lead_deal_health(uuid, timestamptz) to authenticated;
grant execute on function public.recompute_lead_health_and_slas(uuid) to authenticated;
