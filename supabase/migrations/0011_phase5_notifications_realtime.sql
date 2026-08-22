-- ====================================================================
-- MIGRATION 0011: Phase 5 — Notifications, Real-Time Activity Feed & Alert Center
-- ====================================================================

-- 1. Extend `public.notifications` table with read_at and comprehensive types
alter table public.notifications
  add column if not exists read_at timestamptz;

-- Drop existing type check constraint if present and apply expanded domain types
alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check check (
    type in (
      'lead_created',
      'lead_assigned',
      'follow_up_due',
      'follow_up_overdue',
      'deal_at_risk',
      'sla_breach',
      'task_assigned',
      'task_overdue',
      'overdue_task',
      'team_invitation',
      'system',
      'billing',
      'security',
      'manager_escalation'
    )
  );

-- 2. Harden multi-tenant privacy RLS on notifications (users strictly see their own)
drop policy if exists "notifications_select_policy" on public.notifications;
create policy "notifications_select_policy" on public.notifications
  for select
  using (
    org_id = public.current_org_id()
    and user_id = auth.uid()
  );

drop policy if exists "notifications_update_policy" on public.notifications;
create policy "notifications_update_policy" on public.notifications
  for update
  using (
    org_id = public.current_org_id()
    and user_id = auth.uid()
  );

drop policy if exists "notifications_delete_policy" on public.notifications;
create policy "notifications_delete_policy" on public.notifications
  for delete
  using (
    org_id = public.current_org_id()
    and user_id = auth.uid()
  );

alter table public.notifications force row level security;

-- 3. User Notification Preferences Table
create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  lead_assignments boolean not null default true,
  task_reminders boolean not null default true,
  sla_alerts boolean not null default true,
  deal_health_alerts boolean not null default true,
  billing_notifications boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;
alter table public.notification_preferences force row level security;

create policy "notification_preferences_select_policy" on public.notification_preferences
  for select
  using (
    org_id = public.current_org_id()
    and user_id = auth.uid()
  );

create policy "notification_preferences_insert_policy" on public.notification_preferences
  for insert
  with check (
    org_id = public.current_org_id()
    and user_id = auth.uid()
  );

create policy "notification_preferences_update_policy" on public.notification_preferences
  for update
  using (
    org_id = public.current_org_id()
    and user_id = auth.uid()
  );

-- 4. Server-Side / Database Function to Safely Emit Idempotent Notifications
create or replace function public.emit_notification(
  p_org_id uuid,
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_priority text default 'normal',
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_link text default null,
  p_dedup_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pref record;
  v_should_send boolean := true;
  v_notif_id uuid;
begin
  -- Check user existence in profiles
  if not exists (select 1 from public.profiles where user_id = p_user_id) then
    return null;
  end if;

  -- Check user notification preferences if configured
  select *
  into v_pref
  from public.notification_preferences
  where user_id = p_user_id;

  if found then
    if p_type = 'lead_assigned' and not v_pref.lead_assignments then
      v_should_send := false;
    elsif (p_type = 'task_assigned' or p_type = 'task_overdue' or p_type = 'follow_up_due') and not v_pref.task_reminders then
      v_should_send := false;
    elsif p_type = 'sla_breach' and not v_pref.sla_alerts then
      v_should_send := false;
    elsif p_type = 'deal_at_risk' and not v_pref.deal_health_alerts then
      v_should_send := false;
    elsif p_type = 'billing' and not v_pref.billing_notifications then
      v_should_send := false;
    end if;
  end if;

  if not v_should_send then
    return null;
  end if;

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
    p_org_id,
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_priority,
    p_entity_type,
    p_entity_id,
    p_link,
    p_dedup_key
  )
  on conflict (dedup_key) do nothing
  returning id into v_notif_id;

  return v_notif_id;
end;
$$;

-- 5. Automated Lead Assignment Trigger
create or replace function public.notify_on_lead_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT' and new.salesperson_id is not null) or
     (tg_op = 'UPDATE' and new.salesperson_id is not null and new.salesperson_id is distinct from old.salesperson_id)
  then
    perform public.emit_notification(
      new.org_id,
      new.salesperson_id,
      'Lead Assigned: ' || new.person_name,
      'You have been assigned to lead "' || new.person_name || '" (Budget: ₹' || round(coalesce(new.budget, 0) / 100000, 1) || ' L).',
      'lead_assigned',
      'normal',
      'lead',
      new.id,
      '/leads',
      'lead_assign_' || new.id || '_' || new.salesperson_id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_lead_assignment on public.leads;
create trigger trg_notify_lead_assignment
  after insert or update on public.leads
  for each row execute function public.notify_on_lead_assignment();

-- 6. Automated Task Assignment Trigger
create or replace function public.notify_on_task_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT' and new.salesperson_id is not null) or
     (tg_op = 'UPDATE' and new.salesperson_id is not null and new.salesperson_id is distinct from old.salesperson_id)
  then
    perform public.emit_notification(
      new.org_id,
      new.salesperson_id,
      'Task Assigned: ' || new.title,
      'You have been assigned task "' || new.title || '" for prospect "' || new.person_name || '".',
      'task_assigned',
      'normal',
      'task',
      new.id,
      '/tasks',
      'task_assign_' || new.id || '_' || new.salesperson_id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_task_assignment on public.tasks;
create trigger trg_notify_task_assignment
  after insert or update on public.tasks
  for each row execute function public.notify_on_task_assignment();

-- 7. Realtime replication publication (safe conditional check)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.notifications;
  end if;
exception
  when duplicate_object then null;
  when others then null;
end;
$$;
