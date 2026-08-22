-- ====================================================================
-- MIGRATION 0016: Phase 10 — Multi-Factor Resurrection Engine
-- Production-Grade, Tenant-Isolated, Deterministic Lost-Lead Matching
-- ====================================================================

-- 1. Schema Extensions for Leads (Resurrection History & Cooldown Tracking)
alter table public.leads
  add column if not exists last_resurrected_at timestamptz,
  add column if not exists resurrection_count integer not null default 0;

-- 2. Performance Indexes for Inventory Search & Candidate Retrieval
create index if not exists idx_leads_resurrection_eval
  on public.leads(org_id, stage, days_in_stage, last_resurrected_at);

create index if not exists idx_project_units_resurrection_matching
  on public.project_units(org_id, status, project_id, price);

-- --------------------------------------------------------------------
-- 3. CANDIDATE MATCHING & MULTI-FACTOR SCORING FOR A SPECIFIC LEAD
-- --------------------------------------------------------------------
create or replace function public.find_resurrection_candidates(
  p_org_id uuid,
  p_lead_id uuid,
  p_limit integer default 5,
  p_min_score integer default 60
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead record;
  v_candidates jsonb;
begin
  -- 1. Load lead details ensuring strict tenant isolation
  select
    l.id,
    l.org_id,
    l.person_name,
    l.phone,
    l.email,
    l.project_id,
    l.project_name,
    l.region_id,
    l.budget,
    l.configuration_preference,
    l.preferred_floor,
    l.facing_preference,
    l.buyer_intent,
    l.lost_reason,
    l.lost_at,
    l.stage,
    l.days_in_stage,
    l.last_resurrected_at,
    l.salesperson_id
  into v_lead
  from public.leads l
  where l.id = p_lead_id and l.org_id = p_org_id;

  if v_lead.id is null then
    return '[]'::jsonb;
  end if;

  -- 2. Query available units and calculate deterministic multi-factor score
  with available_pool as (
    select
      u.id as unit_id,
      u.project_id,
      p.name as project_name,
      p.location as project_location,
      p.region_id as project_region_id,
      u.tower,
      u.unit_number,
      u.floor,
      u.configuration,
      u.super_area_sq_ft,
      u.price,
      u.facing,
      u.status,
      u.created_at,
      u.updated_at
    from public.project_units u
    join public.projects p on p.id = u.project_id and p.org_id = p_org_id
    where u.org_id = p_org_id
      and u.status = 'available'
  ),
  scored_units as (
    select
      ap.*,
      -- A. Project Match (40 pts)
      case
        when v_lead.project_id is not null and ap.project_id = v_lead.project_id then 40
        when v_lead.project_name is not null and lower(ap.project_name) = lower(v_lead.project_name) then 40
        when v_lead.region_id is not null and ap.project_region_id = v_lead.region_id then 25
        when v_lead.project_id is null and v_lead.project_name is null then 25 -- neutral baseline if no preference specified
        else 0
      end as project_score,

      -- B. Budget Fit (30 pts)
      case
        when coalesce(v_lead.budget, 0) <= 0 then 15 -- neutral baseline if no budget specified
        when abs(ap.price - v_lead.budget) / v_lead.budget <= 0.05 then 30
        when abs(ap.price - v_lead.budget) / v_lead.budget <= 0.10 then 25
        when abs(ap.price - v_lead.budget) / v_lead.budget <= 0.15 then 18
        when abs(ap.price - v_lead.budget) / v_lead.budget <= 0.20 then 10
        else 0
      end as budget_score,

      -- C. Configuration Fit (20 pts)
      case
        when v_lead.configuration_preference is null or trim(v_lead.configuration_preference) = '' then 12 -- neutral
        when lower(replace(ap.configuration, ' ', '')) = lower(replace(v_lead.configuration_preference, ' ', '')) then 20
        when lower(ap.configuration) like '%' || lower(trim(v_lead.configuration_preference)) || '%'
          or lower(v_lead.configuration_preference) like '%' || lower(trim(ap.configuration)) || '%' then 15
        else 0
      end as config_score,

      -- D. Floor Fit (5 pts)
      case
        when v_lead.preferred_floor is null or trim(v_lead.preferred_floor) = '' then 5 -- neutral
        when lower(v_lead.preferred_floor) in ('high', 'top') and ap.floor >= 12 then 5
        when lower(v_lead.preferred_floor) in ('mid', 'middle') and ap.floor between 5 and 11 then 5
        when lower(v_lead.preferred_floor) in ('low', 'ground') and ap.floor between 1 and 4 then 5
        when v_lead.preferred_floor ~ '^[0-9]+$' and ap.floor = v_lead.preferred_floor::integer then 5
        when abs(ap.floor - coalesce(nullif(regexp_replace(v_lead.preferred_floor, '[^0-9]', '', 'g'), '')::integer, ap.floor)) <= 3 then 3
        else 0
      end as floor_score,

      -- E. Facing Fit (5 pts)
      case
        when v_lead.facing_preference is null or trim(v_lead.facing_preference) = '' then 5 -- neutral
        when ap.facing is not null and lower(trim(ap.facing)) = lower(trim(v_lead.facing_preference)) then 5
        when ap.facing is not null and (
          lower(ap.facing) like '%' || lower(trim(v_lead.facing_preference)) || '%' or
          lower(v_lead.facing_preference) like '%' || lower(trim(ap.facing)) || '%'
        ) then 3
        else 0
      end as facing_score,

      -- F. Recency Bonus (Up to +5 pts for inventory released in last 14 days)
      case
        when ap.created_at >= (now() - interval '14 days') or ap.updated_at >= (now() - interval '14 days') then 5
        else 0
      end as recency_bonus,

      -- Budget discrepancy percentage for explainability
      case
        when coalesce(v_lead.budget, 0) > 0 then
          round(((ap.price - v_lead.budget) / v_lead.budget) * 100, 1)
        else 0.0
      end as budget_diff_pct
    from available_pool ap
  ),
  totaled_units as (
    select
      su.*,
      least(100, (su.project_score + su.budget_score + su.config_score + su.floor_score + su.facing_score + su.recency_bonus)) as total_score
    from scored_units su
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'unit', jsonb_build_object(
          'id', tu.unit_id,
          'projectId', tu.project_id,
          'projectName', tu.project_name,
          'location', tu.project_location,
          'tower', tu.tower,
          'unitNumber', tu.unit_number,
          'floor', tu.floor,
          'configuration', tu.configuration,
          'superAreaSqFt', tu.super_area_sq_ft,
          'price', tu.price,
          'facing', tu.facing,
          'status', tu.status
        ),
        'score', jsonb_build_object(
          'total', tu.total_score,
          'project', tu.project_score,
          'budget', tu.budget_score,
          'configuration', tu.config_score,
          'floor', tu.floor_score,
          'facing', tu.facing_score,
          'recency', tu.recency_bonus,
          'tier', case
            when tu.total_score >= 90 then 'excellent'
            when tu.total_score >= 75 then 'strong'
            when tu.total_score >= 60 then 'possible'
            else 'weak'
          end,
          'tierLabel', case
            when tu.total_score >= 90 then 'Excellent Match'
            when tu.total_score >= 75 then 'Strong Match'
            when tu.total_score >= 60 then 'Possible Match'
            else 'Weak Match'
          end
        ),
        'reasons', jsonb_build_array(
          case
            when tu.project_score = 40 then 'Exact preferred project match (' || tu.project_name || ')'
            when tu.project_score = 25 and v_lead.region_id is not null then 'Property located in buyer preferred regional territory'
            when tu.project_score = 25 then 'Compatible development matching buyer profile'
            else 'Alternative project offering in active portfolio'
          end,
          case
            when coalesce(v_lead.budget, 0) <= 0 then 'Unit priced at catalog market value'
            when tu.budget_diff_pct = 0.0 then 'Exact target budget match'
            when tu.budget_diff_pct < 0 then 'Unit price is ' || abs(tu.budget_diff_pct) || '% below buyer budget'
            when tu.budget_diff_pct <= 5.0 then 'Unit price is within 5% of target budget'
            else 'Unit is ' || tu.budget_diff_pct || '% above target budget'
          end,
          case
            when tu.config_score = 20 then 'Exact layout configuration match (' || tu.configuration || ')'
            when tu.config_score = 15 then 'Compatible layout configuration (' || tu.configuration || ')'
            else 'Alternative configuration'
          end,
          case
            when tu.facing_score = 5 and v_lead.facing_preference is not null then 'Preferred ' || tu.facing || ' facing orientation'
            when tu.facing is not null then tu.facing || ' facing layout'
            else 'Standard layout'
          end,
          case
            when tu.floor_score = 5 and v_lead.preferred_floor is not null then 'Preferred floor height (Floor ' || tu.floor || ')'
            else 'Floor ' || tu.floor
          end
        )
      )
      order by tu.total_score desc, tu.price asc
    ),
    '[]'::jsonb
  )
  into v_candidates
  from (
    select * from totaled_units
    where total_score >= p_min_score
    order by total_score desc, price asc
    limit p_limit
  ) tu;

  return coalesce(v_candidates, '[]'::jsonb);
end;
$$;


-- --------------------------------------------------------------------
-- 4. BATCH RESURRECTION OPPORTUNITY SCANNER
-- --------------------------------------------------------------------
create or replace function public.scan_resurrection_opportunities(
  p_org_id uuid,
  p_days_threshold integer default null,
  p_limit integer default 20,
  p_min_score integer default 60,
  p_force boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_effective_threshold integer;
  v_scanned_count integer := 0;
  v_opportunities jsonb;
begin
  -- Resolve days threshold: parameter -> org reactivation_days setting -> default 60
  if p_days_threshold is not null and p_days_threshold > 0 then
    v_effective_threshold := p_days_threshold;
  else
    select coalesce(o.reactivation_days, 60) into v_effective_threshold
    from public.orgs o
    where o.id = p_org_id;
  end if;

  v_effective_threshold := coalesce(v_effective_threshold, 60);

  with eligible_leads as (
    select
      l.id,
      l.person_name,
      l.phone,
      l.email,
      l.project_name,
      l.budget,
      l.configuration_preference,
      l.stage,
      l.days_in_stage,
      l.lost_reason,
      l.lost_at,
      l.last_activity_at,
      l.last_resurrected_at,
      l.salesperson_id,
      p.full_name as salesperson_name
    from public.leads l
    left join public.profiles p on p.user_id = l.salesperson_id
    where l.org_id = p_org_id
      -- Exclude actively advancing won leads
      and l.stage != 'won'
      -- Eligible: lost stage OR stale beyond threshold
      and (l.stage = 'lost' or l.days_in_stage >= v_effective_threshold)
      -- Respect lost reasons: do not resurrect opted_out or explicit do_not_contact unless forced
      and (p_force or coalesce(l.lost_reason, '') not in ('opted_out', 'do_not_contact', 'unsubscribed'))
      -- Respect 30-day resurrection cooldown unless forced
      and (p_force or l.last_resurrected_at is null or l.last_resurrected_at <= (now() - interval '30 days'))
    order by
      case when l.stage = 'lost' then 1 else 2 end asc,
      l.budget desc,
      l.days_in_stage desc
    limit p_limit
  ),
  lead_matches as (
    select
      el.*,
      public.find_resurrection_candidates(p_org_id, el.id, 3, p_min_score) as candidates
    from eligible_leads el
  )
  select
    coalesce(count(*)::integer, 0),
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'leadId', lm.id,
          'personName', lm.person_name,
          'phone', lm.phone,
          'email', lm.email,
          'projectName', lm.project_name,
          'budget', lm.budget,
          'configurationPreference', lm.configuration_preference,
          'currentStage', lm.stage,
          'daysInactive', lm.days_in_stage,
          'lostReason', lm.lost_reason,
          'lostAt', lm.lost_at,
          'lastResurrectedAt', lm.last_resurrected_at,
          'salespersonId', lm.salesperson_id,
          'salespersonName', lm.salesperson_name,
          'topCandidate', lm.candidates->0,
          'candidateCount', jsonb_array_length(lm.candidates),
          'allCandidates', lm.candidates,
          'bestMatchScore', coalesce((lm.candidates->0->'score'->>'total')::integer, 0),
          'bestMatchTier', coalesce(lm.candidates->0->'score'->>'tier', 'none')
        )
        order by coalesce((lm.candidates->0->'score'->>'total')::integer, 0) desc, lm.budget desc
      ) filter (where jsonb_array_length(lm.candidates) > 0),
      '[]'::jsonb
    )
  into v_scanned_count, v_opportunities
  from lead_matches lm;

  return jsonb_build_object(
    'scannedCount', coalesce(v_scanned_count, 0),
    'matchedCount', coalesce(jsonb_array_length(v_opportunities), 0),
    'opportunities', coalesce(v_opportunities, '[]'::jsonb)
  );
end;
$$;


-- --------------------------------------------------------------------
-- 5. ATOMIC LEAD RESURRECTION EXECUTION (MUTATION RPC)
-- --------------------------------------------------------------------
create or replace function public.execute_lead_resurrection(
  p_org_id uuid,
  p_lead_id uuid,
  p_user_id uuid,
  p_unit_id uuid default null,
  p_pitch text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead record;
  v_unit record;
  v_user record;
  v_activity_id uuid;
  v_task_id uuid;
  v_notes text;
  v_task_title text;
  v_health_result record;
begin
  -- 1. Verify lead in org
  select * into v_lead
  from public.leads
  where id = p_lead_id and org_id = p_org_id
  for update;

  if v_lead.id is null then
    return jsonb_build_object('success', false, 'error', 'Lead not found or unauthorized');
  end if;

  -- 2. Verify executing user in org
  select * into v_user
  from public.profiles
  where user_id = p_user_id and org_id = p_org_id;

  if v_user.user_id is null then
    return jsonb_build_object('success', false, 'error', 'User not found in organization');
  end if;

  -- 3. Optional unit details
  if p_unit_id is not null then
    select u.*, p.name as project_name
    into v_unit
    from public.project_units u
    join public.projects p on p.id = u.project_id
    where u.id = p_unit_id and u.org_id = p_org_id;
  end if;

  v_notes := coalesce(p_pitch, 'Lead resurrected with newly matched inventory opportunity.');
  v_task_title := '⚡ Reactivation Call: ' || v_lead.person_name || ' (' || coalesce(v_unit.project_name, v_lead.project_name, 'Catalog Match') || ')';

  -- 4. Update Lead to 'contacted' stage, reset days_in_stage, record resurrection timestamp
  update public.leads
  set
    stage = 'contacted',
    days_in_stage = 0,
    stage_entered_at = now(),
    last_activity_at = now(),
    last_activity_text = 'Lead Resurrected: Inventory match assigned',
    last_resurrected_at = now(),
    resurrection_count = coalesce(resurrection_count, 0) + 1,
    follow_up_status = 'due_today',
    next_follow_up_at = 'Today, 12:00 PM',
    lost_at = null,
    updated_at = now()
  where id = p_lead_id;

  -- 5. Insert Activity record
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
    coalesce(v_unit.project_id, v_lead.project_id),
    p_user_id,
    v_user.full_name,
    v_lead.person_name,
    'stage_change',
    'resurrected',
    'Lead Reactivated',
    v_notes,
    now()
  ) returning id into v_activity_id;

  -- 6. Insert Task for assigned salesperson
  insert into public.tasks (
    org_id,
    lead_id,
    salesperson_id,
    person_name,
    phone,
    project_name,
    title,
    due_date,
    due_time,
    status,
    priority,
    created_at
  ) values (
    p_org_id,
    p_lead_id,
    coalesce(v_lead.salesperson_id, p_user_id),
    v_lead.person_name,
    v_lead.phone,
    coalesce(v_unit.project_name, v_lead.project_name, 'Catalog Match'),
    v_task_title,
    to_char(now(), 'YYYY-MM-DD'),
    '12:00 PM',
    'due_today',
    'high',
    now()
  ) returning id into v_task_id;

  -- 7. Recalculate deterministic Phase 8 Deal Health
  select * into v_health_result
  from public.calculate_lead_deal_health(p_lead_id, now());

  if v_health_result.status is not null then
    update public.leads
    set
      deal_health = v_health_result.status,
      deal_health_score = v_health_result.score,
      deal_health_reason = v_health_result.reason,
      deal_health_factors = v_health_result.factors,
      deal_health_recommended_action = v_health_result.recommended_action
    where id = p_lead_id;
  end if;

  -- 8. Emit notification for assigned salesperson
  if v_lead.salesperson_id is not null then
    perform public.emit_notification(
      p_org_id,
      v_lead.salesperson_id,
      '⚡ Lead Resurrected: ' || v_lead.person_name,
      'A lost lead has been reactivated with high-conviction inventory match.',
      'lead_assigned',
      'high',
      'lead',
      p_lead_id,
      '/leads',
      'resurrect_' || p_lead_id || '_' || to_char(now(), 'YYYYMMDD')
    );
  end if;

  -- 9. Insert Audit Log
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
    'lead_resurrected',
    'lead',
    p_lead_id,
    jsonb_build_object(
      'previous_stage', v_lead.stage,
      'new_stage', 'contacted',
      'unit_id', p_unit_id,
      'task_id', v_task_id,
      'activity_id', v_activity_id
    )
  );

  return jsonb_build_object(
    'success', true,
    'leadId', p_lead_id,
    'stage', 'contacted',
    'taskId', v_task_id,
    'activityId', v_activity_id,
    'healthScore', coalesce(v_health_result.score, 60),
    'dealHealth', coalesce(v_health_result.status, 'neutral')
  );
end;
$$;
