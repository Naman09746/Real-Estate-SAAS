-- ====================================================================
-- MIGRATION 0010: Phase 4 — Background Processing, SLA Monitoring,
-- Automated Follow-Up Health, Audit Logging & In-App Notifications
-- ====================================================================

-- 1. Add `stage_entered_at` to `public.leads` for accurate days_in_stage calculation
alter table public.leads
  add column if not exists stage_entered_at timestamptz not null default now();

-- Backfill stage_entered_at from created_at
update public.leads
set stage_entered_at = coalesce(created_at, now())
where stage_entered_at is null;

-- Trigger to maintain stage_entered_at whenever a lead changes stages
create or replace function public.maintain_lead_stage_timestamp()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.stage_entered_at is null then
      new.stage_entered_at := now();
    end if;
  elsif tg_op = 'UPDATE' then
    if new.stage is distinct from old.stage then
      new.stage_entered_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_maintain_stage_timestamp on public.leads;
create trigger trg_maintain_stage_timestamp
  before insert or update on public.leads
  for each row execute function public.maintain_lead_stage_timestamp();

-- --------------------------------------------------------------------
-- 2. In-App Notifications Table
-- --------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'sla_breach',
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  entity_type text,
  entity_id uuid,
  link text,
  read boolean not null default false,
  read_at timestamptz,
  dedup_key text unique,
  created_at timestamptz not null default now()
);

-- Enable RLS on notifications
alter table public.notifications enable row level security;
alter table public.notifications force row level security;

create policy "notifications_select_policy" on public.notifications
  for select
  using (
    org_id = public.current_org_id()
    and user_id = auth.uid()
  );

create policy "notifications_update_policy" on public.notifications
  for update
  using (
    org_id = public.current_org_id()
    and user_id = auth.uid()
  );

create policy "notifications_insert_policy" on public.notifications
  for insert
  with check (
    org_id = public.current_org_id() or auth.uid() is null
  );

create policy "notifications_delete_policy" on public.notifications
  for delete
  using (
    org_id = public.current_org_id()
    and user_id = auth.uid()
  );

-- Indexes on notifications
create index if not exists idx_notifications_user_read on public.notifications(user_id, read, created_at desc);
create index if not exists idx_notifications_org on public.notifications(org_id, created_at desc);
create index if not exists idx_notifications_dedup on public.notifications(dedup_key);

-- --------------------------------------------------------------------
-- 3. Automation Execution History Log
-- --------------------------------------------------------------------
create table if not exists public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.orgs(id) on delete cascade,
  job_name text not null default 'sla_health_monitor',
  status text not null check (status in ('success', 'partial_failure', 'failed')),
  leads_evaluated integer not null default 0,
  overdue_tasks_detected integer not null default 0,
  sla_breaches_detected integer not null default 0,
  notifications_created integer not null default 0,
  error_details jsonb default '{}'::jsonb,
  duration_ms integer default 0,
  created_at timestamptz not null default now()
);

alter table public.automation_logs enable row level security;

create policy "automation_logs_select_policy" on public.automation_logs
  for select
  using (
    org_id is null or (
      org_id = public.current_org_id()
      and public.current_user_role() in ('owner', 'admin', 'boss', 'manager')
    )
  );

create policy "automation_logs_insert_policy" on public.automation_logs
  for insert
  with check (true);

create index if not exists idx_automation_logs_org_created on public.automation_logs(org_id, created_at desc);

-- --------------------------------------------------------------------
-- 4. High-Performance Query Indexes
-- --------------------------------------------------------------------
create index if not exists idx_leads_sla_eval on public.leads(org_id, stage, stage_entered_at, last_activity_at);
create index if not exists idx_tasks_due_eval on public.tasks(org_id, status, due_date, salesperson_id);

-- --------------------------------------------------------------------
-- 5. Core PostgreSQL SLA & CRM Health Recomputation Function
-- --------------------------------------------------------------------
create or replace function public.recompute_lead_health_and_slas(p_org_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start_time timestamptz := clock_timestamp();
  v_org record;
  v_leads_checked integer := 0;
  v_leads_updated integer := 0;
  v_tasks_count integer := 0;
  v_deals_at_risk_count integer := 0;
  v_notifs_count integer := 0;
  v_breaches_count integer := 0;
  v_resp_sla_hours integer;
  v_inactive_days integer;
  v_stale_visit_days integer;
  v_escalate_hours integer;
  v_today_str text := to_char(now(), 'YYYY-MM-DD');
  v_time_str text := to_char(now(), 'HH24:MI');
  v_lead record;
  v_task record;
  v_manager record;
  v_recent_activity_count integer;
  v_overdue_tasks_count integer;
  v_days_inactive integer;
  v_new_health text;
  v_new_reason text;
  v_new_followup_status text;
  v_duration_ms integer;
  v_health_changed boolean;
  v_followup_changed boolean;
begin
  -- Iterate through specified org or all active orgs
  for v_org in
    select id, name, custom_settings
    from public.orgs
    where (p_org_id is null or id = p_org_id)
      and (subscription_status is null or subscription_status in ('active', 'trialing', 'past_due', 'trial'))
  loop
    -- Extract configurable SLA parameters from org custom_settings (with defaults)
    v_resp_sla_hours := coalesce((v_org.custom_settings->>'new_lead_response_sla_hours')::integer, 2);
    v_inactive_days := coalesce((v_org.custom_settings->>'inactive_lead_stale_days')::integer, 5);
    v_stale_visit_days := coalesce((v_org.custom_settings->>'site_visit_stale_days')::integer, 14);
    v_escalate_hours := coalesce((v_org.custom_settings->>'manager_escalation_sla_hours')::integer, 6);

    -- 1. BULK UPDATE: Exact days_in_stage calculation based on calendar time
    update public.leads
    set days_in_stage = greatest(0, extract(day from (now() - coalesce(stage_entered_at, created_at)))::integer)
    where org_id = v_org.id;

    -- 2. BULK UPDATE: Tasks overdue & due_today status evaluation
    -- Never overwrite completed or cancelled tasks
    update public.tasks
    set status = 'overdue'
    where org_id = v_org.id
      and status not in ('completed', 'cancelled')
      and (
        due_date < v_today_str
        or (due_date = v_today_str and due_time is not null and due_time < v_time_str)
      );

    update public.tasks
    set status = 'due_today'
    where org_id = v_org.id
      and status = 'upcoming'
      and due_date = v_today_str
      and (due_time is null or due_time >= v_time_str);

    -- 3. PER-LEAD HEALTH & SLA RECOMPUTATION
    for v_lead in
      select
        l.id,
        l.salesperson_id,
        l.person_name,
        l.stage,
        l.budget,
        l.days_in_stage,
        l.created_at,
        l.last_activity_at,
        l.next_follow_up_at,
        l.follow_up_status,
        l.deal_health,
        l.deal_health_reason
      from public.leads l
      where l.org_id = v_org.id
    loop
      v_leads_checked := v_leads_checked + 1;

      -- Check meaningful activities count in the last 48 hours
      select count(*)
      into v_recent_activity_count
      from public.activities
      where lead_id = v_lead.id
        and occurred_at >= (now() - interval '48 hours')
        and type in ('call', 'whatsapp', 'site_visit', 'meeting', 'note', 'stage_change', 'booking');

      -- Count overdue tasks on this lead
      select count(*)
      into v_overdue_tasks_count
      from public.tasks
      where lead_id = v_lead.id
        and status = 'overdue';

      -- Calculate inactive calendar days
      v_days_inactive := greatest(0, extract(day from (now() - coalesce(v_lead.last_activity_at, v_lead.created_at)))::integer);

      -- Derive follow_up_status (respecting completed and cancelled states)
      if v_overdue_tasks_count > 0 then
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

      -- 4. DETERMINISTIC DEAL HEALTH PRIORITY RULES
      -- Rule A: Lost deals
      if v_lead.stage = 'lost' then
        v_new_health := 'neutral';
        v_new_reason := 'Deal marked as lost.';

      -- Rule B: Won deals
      elsif v_lead.stage = 'won' then
        v_new_health := 'strong';
        v_new_reason := 'Deal successfully closed and won.';

      -- Rule C: AT RISK (Highest Priority for active pipeline)
      elsif v_days_inactive >= v_inactive_days then
        v_new_health := 'at_risk';
        v_new_reason := 'At risk: no sales activity for ' || v_days_inactive || ' days.';

      elsif v_overdue_tasks_count >= 2 then
        v_new_health := 'at_risk';
        v_new_reason := 'At risk: ' || v_overdue_tasks_count || ' overdue follow-up tasks.';

      elsif v_lead.stage in ('site_visit', 'negotiation') and v_lead.days_in_stage >= v_stale_visit_days and v_recent_activity_count = 0 then
        v_new_health := 'at_risk';
        v_new_reason := 'At risk: stalled in ' || replace(v_lead.stage, '_', ' ') || ' for ' || v_lead.days_in_stage || ' days without movement.';

      -- Rule D: STRONG
      elsif v_recent_activity_count > 0 and v_overdue_tasks_count = 0 then
        v_new_health := 'strong';
        v_new_reason := 'Strong: sales touchpoint completed within 48h and no overdue tasks.';

      -- Rule E: NEUTRAL
      else
        v_new_health := 'neutral';
        v_new_reason := 'Active deal with standard progression cadence.';
      end if;

      if v_new_health = 'at_risk' then
        v_deals_at_risk_count := v_deals_at_risk_count + 1;
      end if;

      v_health_changed := (v_lead.deal_health is distinct from v_new_health) or (v_lead.deal_health_reason is distinct from v_new_reason);
      v_followup_changed := (v_lead.follow_up_status is distinct from v_new_followup_status);

      -- Update lead if health, reason, or follow-up status changed
      if v_health_changed or v_followup_changed then
        v_leads_updated := v_leads_updated + 1;

        update public.leads
        set
          deal_health = v_new_health,
          deal_health_reason = v_new_reason,
          follow_up_status = v_new_followup_status
        where id = v_lead.id;

        -- 5. AUDIT LOGGING FOR MEANINGFUL STATE TRANSITIONS
        if v_health_changed and v_new_health = 'at_risk' then
          insert into public.audit_log (org_id, actor_id, action, entity_type, entity_id, diff)
          values (
            v_org.id,
            null,
            'deal_health_at_risk',
            'lead',
            v_lead.id,
            jsonb_build_object(
              'previous_health', v_lead.deal_health,
              'new_health', v_new_health,
              'reason', v_new_reason
            )
          );
        end if;

        if v_followup_changed and v_new_followup_status = 'overdue' then
          insert into public.audit_log (org_id, actor_id, action, entity_type, entity_id, diff)
          values (
            v_org.id,
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

      -- ----------------------------------------------------------------
      -- 6. SLA BREACH DETECTION & DEDUPLICATED NOTIFICATIONS
      -- ----------------------------------------------------------------

      -- A. New Lead Response SLA Breach: stage = 'new', created > v_resp_sla_hours ago, 0 activities
      if v_lead.stage = 'new'
         and v_lead.salesperson_id is not null
         and exists (select 1 from public.profiles where user_id = v_lead.salesperson_id)
         and v_lead.created_at < (now() - (v_resp_sla_hours || ' hours')::interval)
         and not exists (select 1 from public.activities where lead_id = v_lead.id)
      then
        v_breaches_count := v_breaches_count + 1;

        -- Notify assigned salesperson (deduplicated per lead per day)
        insert into public.notifications (
          org_id,
          user_id,
          title,
          message,
          type,
          priority,
          entity_type,
          entity_id,
          link,
          dedup_key
        )
        values (
          v_org.id,
          v_lead.salesperson_id,
          'SLA Alert: New Lead Needs Outreach',
          'Lead "' || v_lead.person_name || '" has not received initial outreach within the ' || v_resp_sla_hours || '-hour response SLA.',
          'sla_breach',
          'high',
          'lead',
          v_lead.id,
          '/leads',
          'sla_new_resp_' || v_lead.id || '_' || v_today_str
        )
        on conflict (dedup_key) do nothing;

        if found then
          v_notifs_count := v_notifs_count + 1;
        end if;

        -- B. Manager Escalation: If new lead uncontacted for > v_escalate_hours (e.g. 6 hrs)
        if v_lead.created_at < (now() - (v_escalate_hours || ' hours')::interval) then
          for v_manager in
            select user_id from public.profiles
            where org_id = v_org.id and role in ('owner', 'admin', 'boss', 'manager')
          loop
            insert into public.notifications (
              org_id,
              user_id,
              title,
              message,
              type,
              priority,
              entity_type,
              entity_id,
              link,
              dedup_key
            )
            values (
              v_org.id,
              v_manager.user_id,
              'Manager Escalation: SLA Response Breach',
              'Lead "' || v_lead.person_name || '" remains uncontacted for over ' || v_escalate_hours || ' hours.',
              'manager_escalation',
              'urgent',
              'lead',
              v_lead.id,
              '/leads',
              'sla_escalate_' || v_lead.id || '_' || v_manager.user_id || '_' || v_today_str
            )
            on conflict (dedup_key) do nothing;

            if found then
              v_notifs_count := v_notifs_count + 1;
            end if;
          end loop;
        end if;
      end if;

      -- C. At-Risk High-Value Lead Alert (Budget >= 1 Crore)
      if v_new_health = 'at_risk' and v_lead.budget >= 10000000 and v_lead.salesperson_id is not null and exists (select 1 from public.profiles where user_id = v_lead.salesperson_id) then
        insert into public.notifications (
          org_id,
          user_id,
          title,
          message,
          type,
          priority,
          entity_type,
          entity_id,
          link,
          dedup_key
        )
        values (
          v_org.id,
          v_lead.salesperson_id,
          'High-Value Deal At Risk',
          'High-value prospect "' || v_lead.person_name || '" (₹' || round(v_lead.budget / 10000000, 2) || ' Cr) is at risk: ' || v_new_reason,
          'deal_at_risk',
          'high',
          'lead',
          v_lead.id,
          '/leads',
          'at_risk_hival_' || v_lead.id || '_' || v_today_str
        )
        on conflict (dedup_key) do nothing;

        if found then
          v_notifs_count := v_notifs_count + 1;
        end if;
      end if;

    end loop; -- end lead loop

    -- D. Overdue Task Notifications to Reps
    for v_task in
      select t.id, t.salesperson_id, t.title, t.person_name, t.lead_id
      from public.tasks t
      where t.org_id = v_org.id
        and t.status = 'overdue'
        and t.salesperson_id is not null
        and exists (select 1 from public.profiles where user_id = t.salesperson_id)
    loop
      v_tasks_count := v_tasks_count + 1;

      insert into public.notifications (
        org_id,
        user_id,
        title,
        message,
        type,
        priority,
        entity_type,
        entity_id,
        link,
        dedup_key
      )
      values (
        v_org.id,
        v_task.salesperson_id,
        'Overdue Task: ' || v_task.title,
        'Follow-up task for "' || v_task.person_name || '" is past due.',
        'overdue_task',
        'high',
        'task',
        v_task.id,
        '/tasks',
        'task_overdue_' || v_task.id || '_' || v_today_str
      )
      on conflict (dedup_key) do nothing;

      if found then
        v_notifs_count := v_notifs_count + 1;
      end if;
    end loop; -- end task loop

  end loop; -- end org loop

  v_duration_ms := round(extract(epoch from (clock_timestamp() - v_start_time)) * 1000)::integer;

  -- Log automation execution
  insert into public.automation_logs (
    org_id,
    job_name,
    status,
    leads_evaluated,
    overdue_tasks_detected,
    sla_breaches_detected,
    notifications_created,
    duration_ms
  )
  values (
    p_org_id,
    'sla_health_monitor',
    'success',
    v_leads_checked,
    v_tasks_count,
    v_breaches_count,
    v_notifs_count,
    v_duration_ms
  );

  return jsonb_build_object(
    'success', true,
    'leads_checked', v_leads_checked,
    'leads_updated', v_leads_updated,
    'followups_marked_overdue', v_tasks_count,
    'deals_marked_at_risk', v_deals_at_risk_count,
    'notifications_created', v_notifs_count,
    'duration_ms', v_duration_ms
  );
end;
$$;
