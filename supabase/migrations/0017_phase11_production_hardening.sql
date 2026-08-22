-- ====================================================================
-- MIGRATION 0017: Phase 11 — Final Production Hardening & Security
-- Concurrency Locks, Unique Constraints, Owner Preservation & Invariants
-- ====================================================================

-- 1. Database Invariant Constraints (Defensive Data Hygiene)
alter table public.leads
  drop constraint if exists chk_leads_budget_non_negative,
  add constraint chk_leads_budget_non_negative check (budget is null or budget >= 0);

alter table public.project_units
  drop constraint if exists chk_units_price_positive,
  add constraint chk_units_price_positive check (price > 0);

alter table public.project_units
  drop constraint if exists chk_units_floor_bounds,
  add constraint chk_units_floor_bounds check (floor >= -5 and floor <= 200);

alter table public.project_units
  drop constraint if exists chk_units_area_positive,
  add constraint chk_units_area_positive check (super_area_sq_ft is null or super_area_sq_ft > 0);

-- Unique index to prevent duplicate unit numbers within the same tower of a project
create unique index if not exists idx_project_units_org_proj_tower_unit
  on public.project_units(org_id, project_id, tower, unit_number);

-- 2. Owner Preservation Guard: Prevent demoting or deleting the last owner in an org
create or replace function public.trg_guard_owner_preservation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_count integer;
begin
  -- For UPDATE: if demoting from owner to non-owner within the same organization
  if (TG_OP = 'UPDATE') then
    if old.role = 'owner' and new.role != 'owner' and old.org_id = new.org_id then
      select count(*) into v_owner_count
      from public.profiles
      where org_id = old.org_id and role = 'owner' and user_id != old.user_id;

      if v_owner_count < 1 then
        raise exception 'LAST_OWNER_DEMOTION_FORBIDDEN: Organization must retain at least one active owner';
      end if;
    end if;
    return new;
  end if;

  -- For DELETE: if deleting an owner profile
  if (TG_OP = 'DELETE') then
    if old.role = 'owner' then
      select count(*) into v_owner_count
      from public.profiles
      where org_id = old.org_id and role = 'owner' and user_id != old.user_id;

      if v_owner_count < 1 then
        raise exception 'LAST_OWNER_DELETION_FORBIDDEN: Cannot delete the sole remaining organization owner';
      end if;
    end if;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_profiles_owner_preservation on public.profiles;
create trigger trg_profiles_owner_preservation
  before update or delete on public.profiles
  for each row execute function public.trg_guard_owner_preservation();


-- 3. Atomic Unit Reservation / Double-Booking Prevention RPC
create or replace function public.reserve_project_unit(
  p_org_id uuid,
  p_unit_id uuid,
  p_lead_id uuid,
  p_user_id uuid,
  p_status text default 'booked',
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_unit record;
  v_lead record;
  v_user record;
  v_activity_id uuid;
  v_prev_status text;
begin
  -- 1. Validate caller role / existence
  select * into v_user
  from public.profiles
  where user_id = p_user_id and org_id = p_org_id;

  if v_user.user_id is null then
    return jsonb_build_object('success', false, 'error', 'UNAUTHORIZED_CALLER');
  end if;

  -- 2. Validate lead existence in org
  select * into v_lead
  from public.leads
  where id = p_lead_id and org_id = p_org_id;

  if v_lead.id is null then
    return jsonb_build_object('success', false, 'error', 'LEAD_NOT_FOUND');
  end if;

  -- 3. Lock the target unit with FOR UPDATE to eliminate concurrency race conditions
  select u.*, p.name as project_name
  into v_unit
  from public.project_units u
  join public.projects p on p.id = u.project_id
  where u.id = p_unit_id and u.org_id = p_org_id
  for update;

  if v_unit.id is null then
    return jsonb_build_object('success', false, 'error', 'UNIT_NOT_FOUND');
  end if;

  v_prev_status := v_unit.status;

  -- 4. Check availability: can only reserve if status is 'available' (or already held by this same lead)
  if v_unit.status not in ('available', 'hold') or (v_unit.status = 'hold' and v_unit.assigned_lead_id is not null and v_unit.assigned_lead_id != p_lead_id) then
    return jsonb_build_object(
      'success', false,
      'error', 'UNIT_NOT_AVAILABLE',
      'currentStatus', v_unit.status,
      'unitNumber', v_unit.unit_number,
      'tower', v_unit.tower
    );
  end if;

  -- 5. Atomically update unit status and assign lead
  update public.project_units
  set
    status = p_status,
    assigned_lead_id = p_lead_id,
    assigned_buyer_name = v_lead.person_name,
    updated_at = now()
  where id = p_unit_id;

  -- 6. Link unit on lead record
  update public.leads
  set
    assigned_unit_id = p_unit_id,
    assigned_unit_number = v_unit.tower || ' - ' || v_unit.unit_number,
    stage = case when p_status = 'booked' then 'negotiation' else stage end,
    last_activity_text = 'Unit ' || v_unit.tower || ' ' || v_unit.unit_number || ' status updated to ' || p_status,
    last_activity_at = now(),
    updated_at = now()
  where id = p_lead_id;

  -- 7. Insert Activity record
  insert into public.activities (
    org_id,
    lead_id,
    project_id,
    user_id,
    user_name,
    person_name,
    type,
    outcome,
    outcome_label,
    notes,
    occurred_at
  ) values (
    p_org_id,
    p_lead_id,
    v_unit.project_id,
    p_user_id,
    v_user.full_name,
    v_lead.person_name,
    'booking',
    p_status,
    'Unit Reserved: ' || v_unit.tower || ' ' || v_unit.unit_number,
    coalesce(p_notes, 'Unit reserved via atomic reservation engine.'),
    now()
  ) returning id into v_activity_id;

  -- 8. Audit Log
  insert into public.audit_log (
    org_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    diff
  ) values (
    p_org_id,
    p_user_id,
    'unit_reserved',
    'project_unit',
    p_unit_id,
    jsonb_build_object(
      'previous_status', v_prev_status,
      'new_status', p_status,
      'lead_id', p_lead_id,
      'activity_id', v_activity_id
    )
  );

  return jsonb_build_object(
    'success', true,
    'unitId', p_unit_id,
    'leadId', p_lead_id,
    'status', p_status,
    'activityId', v_activity_id
  );
end;
$$;
