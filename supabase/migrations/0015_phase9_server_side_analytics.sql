-- ====================================================================
-- MIGRATION 0015: Phase 9 — Server-Side Analytics, Reporting & Pipeline Intelligence
-- Authoritative, Secure, Tenant-Scoped PostgreSQL Aggregations
-- ====================================================================

-- 1. Targeted composite indexes for high-speed analytics queries
create index if not exists idx_leads_analytics_org_date
  on public.leads(org_id, created_at, stage);

create index if not exists idx_leads_analytics_rep_stage
  on public.leads(org_id, salesperson_id, stage, budget);

create index if not exists idx_activities_analytics_org_type
  on public.activities(org_id, occurred_at, type);

create index if not exists idx_tasks_analytics_org_status
  on public.tasks(org_id, status, due_date, salesperson_id);

-- --------------------------------------------------------------------
-- 2. PIPELINE & STAGE DISTRIBUTION ANALYTICS
-- --------------------------------------------------------------------
create or replace function public.get_pipeline_analytics(
  p_org_id uuid,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null,
  p_salesperson_id uuid default null,
  p_region_id uuid default null,
  p_project_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_summary record;
  v_stages jsonb;
  v_deal_health jsonb;
  v_forecast jsonb;
  v_total_pipeline_val numeric := 0;
  v_won_rev numeric := 0;
  v_total_leads integer := 0;
  v_active_leads integer := 0;
  v_won_leads integer := 0;
  v_lost_leads integer := 0;
  v_weighted_val numeric := 0;
begin
  -- 1. Summary aggregations across filtered leads
  select
    count(*)::integer as total_count,
    count(*) filter (where l.stage not in ('won', 'lost'))::integer as active_count,
    count(*) filter (where l.stage = 'won')::integer as won_count,
    count(*) filter (where l.stage = 'lost')::integer as lost_count,
    coalesce(sum(coalesce(l.budget, 0)) filter (where l.stage not in ('won', 'lost')), 0)::numeric as active_val,
    coalesce(sum(coalesce(l.budget, 0)) filter (where l.stage = 'won'), 0)::numeric as won_val,
    coalesce(avg(coalesce(l.budget, 0)) filter (where l.stage = 'won'), 0)::numeric as avg_won_val,
    coalesce(avg(coalesce(l.budget, 0)) filter (where l.stage not in ('won', 'lost')), 0)::numeric as avg_active_budget
  into v_summary
  from public.leads l
  where l.org_id = p_org_id
    and (p_start_date is null or l.created_at >= p_start_date)
    and (p_end_date is null or l.created_at <= p_end_date)
    and (p_salesperson_id is null or l.salesperson_id = p_salesperson_id)
    and (p_region_id is null or l.region_id = p_region_id)
    and (p_project_id is null or l.project_id = p_project_id);

  v_total_leads := coalesce(v_summary.total_count, 0);
  v_active_leads := coalesce(v_summary.active_count, 0);
  v_won_leads := coalesce(v_summary.won_count, 0);
  v_lost_leads := coalesce(v_summary.lost_count, 0);
  v_total_pipeline_val := coalesce(v_summary.active_val, 0);
  v_won_rev := coalesce(v_summary.won_val, 0);

  -- 2. Stage distribution honoring dynamic organization pipeline stages
  with stage_counts as (
    select
      coalesce(ps.slug, l.stage) as stage_slug,
      coalesce(ps.name, initcap(replace(l.stage, '_', ' '))) as stage_name,
      coalesce(ps.sort_order, 99) as sort_order,
      coalesce(ps.color, '#6366f1') as color,
      count(l.id)::integer as lead_count,
      coalesce(sum(coalesce(l.budget, 0)), 0)::numeric as stage_value
    from public.leads l
    left join public.pipeline_stages ps on ps.org_id = p_org_id and ps.slug = l.stage
    where l.org_id = p_org_id
      and (p_start_date is null or l.created_at >= p_start_date)
      and (p_end_date is null or l.created_at <= p_end_date)
      and (p_salesperson_id is null or l.salesperson_id = p_salesperson_id)
      and (p_region_id is null or l.region_id = p_region_id)
      and (p_project_id is null or l.project_id = p_project_id)
    group by coalesce(ps.slug, l.stage), coalesce(ps.name, initcap(replace(l.stage, '_', ' '))), ps.sort_order, ps.color
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'slug', sc.stage_slug,
        'name', sc.stage_name,
        'sort_order', sc.sort_order,
        'color', sc.color,
        'lead_count', sc.lead_count,
        'stage_value', sc.stage_value,
        'percentage', case when v_total_leads > 0 then round((sc.lead_count::numeric / v_total_leads::numeric) * 100, 1) else 0 end
      )
      order by sc.sort_order asc
    ),
    '[]'::jsonb
  )
  into v_stages
  from stage_counts sc;

  -- 3. Deal Health Distribution (Phase 8 integration)
  select jsonb_build_object(
    'strong_count', coalesce(count(*) filter (where l.deal_health = 'strong' and l.stage not in ('won', 'lost')), 0),
    'neutral_count', coalesce(count(*) filter (where (l.deal_health = 'neutral' or l.deal_health is null) and l.stage not in ('won', 'lost')), 0),
    'at_risk_count', coalesce(count(*) filter (where l.deal_health = 'at_risk' and l.stage not in ('won', 'lost')), 0),
    'strong_value', coalesce(sum(coalesce(l.budget, 0)) filter (where l.deal_health = 'strong' and l.stage not in ('won', 'lost')), 0),
    'neutral_value', coalesce(sum(coalesce(l.budget, 0)) filter (where (l.deal_health = 'neutral' or l.deal_health is null) and l.stage not in ('won', 'lost')), 0),
    'at_risk_value', coalesce(sum(coalesce(l.budget, 0)) filter (where l.deal_health = 'at_risk' and l.stage not in ('won', 'lost')), 0),
    'avg_health_score', coalesce(round(avg(coalesce(l.deal_health_score, 60)) filter (where l.stage not in ('won', 'lost')), 1), 60.0)
  )
  into v_deal_health
  from public.leads l
  where l.org_id = p_org_id
    and (p_start_date is null or l.created_at >= p_start_date)
    and (p_end_date is null or l.created_at <= p_end_date)
    and (p_salesperson_id is null or l.salesperson_id = p_salesperson_id)
    and (p_region_id is null or l.region_id = p_region_id)
    and (p_project_id is null or l.project_id = p_project_id);

  -- 4. Deterministic Pipeline Forecasting (Stage weights adjusted by health score)
  select coalesce(sum(
    coalesce(l.budget, 0) *
    (case l.stage
      when 'new' then 0.10
      when 'contacted' then 0.20
      when 'qualified' then 0.40
      when 'site_visit' then 0.60
      when 'negotiation' then 0.80
      else 0.25
    end) *
    (case
      when coalesce(l.deal_health_score, 60) >= 80 then 1.15
      when coalesce(l.deal_health_score, 60) <= 49 then 0.70
      else 1.00
    end)
  ), 0)::numeric
  into v_weighted_val
  from public.leads l
  where l.org_id = p_org_id
    and l.stage not in ('won', 'lost')
    and (p_start_date is null or l.created_at >= p_start_date)
    and (p_end_date is null or l.created_at <= p_end_date)
    and (p_salesperson_id is null or l.salesperson_id = p_salesperson_id)
    and (p_region_id is null or l.region_id = p_region_id)
    and (p_project_id is null or l.project_id = p_project_id);

  v_forecast := jsonb_build_object(
    'current_pipeline_value', v_total_pipeline_val,
    'weighted_pipeline_value', round(v_weighted_val, 2),
    'won_revenue', v_won_rev,
    'projected_total_revenue', round(v_won_rev + v_weighted_val, 2),
    'active_opportunities', v_active_leads
  );

  return jsonb_build_object(
    'summary', jsonb_build_object(
      'total_leads', v_total_leads,
      'active_leads', v_active_leads,
      'won_leads', v_won_leads,
      'lost_leads', v_lost_leads,
      'total_pipeline_value', v_total_pipeline_val,
      'won_revenue', v_won_rev,
      'avg_deal_value', round(coalesce(v_summary.avg_won_val, 0), 2),
      'avg_budget', round(coalesce(v_summary.avg_active_budget, 0), 2),
      'conversion_rate', case when v_total_leads > 0 then round((v_won_leads::numeric / v_total_leads::numeric) * 100, 2) else 0 end
    ),
    'stages', coalesce(v_stages, '[]'::jsonb),
    'deal_health', v_deal_health,
    'forecast', v_forecast
  );
end;
$$;


-- --------------------------------------------------------------------
-- 3. SALES REPRESENTATIVE PERFORMANCE ANALYTICS
-- --------------------------------------------------------------------
create or replace function public.get_rep_performance_analytics(
  p_org_id uuid,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null,
  p_salesperson_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reps jsonb;
begin
  with rep_leads as (
    select
      p.user_id,
      p.full_name as name,
      coalesce(u.email, '') as email,
      p.role,
      p.avatar_url,
      p.region_id,
      r.name as region_name,
      count(l.id)::integer as total_assigned,
      count(l.id) filter (where l.stage not in ('won', 'lost'))::integer as active_leads,
      count(l.id) filter (where l.stage = 'won')::integer as won_leads,
      count(l.id) filter (where l.stage = 'lost')::integer as lost_leads,
      coalesce(sum(coalesce(l.budget, 0)) filter (where l.stage not in ('won', 'lost')), 0)::numeric as active_pipeline_value,
      coalesce(sum(coalesce(l.budget, 0)) filter (where l.stage = 'won'), 0)::numeric as won_revenue,
      coalesce(avg(coalesce(l.budget, 0)) filter (where l.stage = 'won'), 0)::numeric as avg_deal_value,
      coalesce(avg(extract(epoch from (l.updated_at - l.created_at)) / 86400) filter (where l.stage = 'won'), 0)::numeric as avg_days_to_won
    from public.profiles p
    left join auth.users u on u.id = p.user_id
    left join public.regions r on r.id = p.region_id
    left join public.leads l on l.salesperson_id = p.user_id and l.org_id = p_org_id
      and (p_start_date is null or l.created_at >= p_start_date)
      and (p_end_date is null or l.created_at <= p_end_date)
    where p.org_id = p_org_id
      and (p_salesperson_id is null or p.user_id = p_salesperson_id)
    group by p.user_id, p.full_name, u.email, p.role, p.avatar_url, p.region_id, r.name
  ),
  rep_activities as (
    select
      a.user_id,
      count(*) filter (where a.type = 'call')::integer as calls_count,
      count(*) filter (where a.type = 'site_visit')::integer as visits_count,
      count(*) filter (where a.type = 'meeting')::integer as meetings_count
    from public.activities a
    where a.org_id = p_org_id
      and (p_start_date is null or a.occurred_at >= p_start_date)
      and (p_end_date is null or a.occurred_at <= p_end_date)
      and (p_salesperson_id is null or a.user_id = p_salesperson_id)
    group by a.user_id
  ),
  rep_tasks as (
    select
      t.salesperson_id as user_id,
      count(*)::integer as tasks_total,
      count(*) filter (where t.status = 'completed')::integer as tasks_completed,
      count(*) filter (where t.status = 'overdue')::integer as tasks_overdue
    from public.tasks t
    where t.org_id = p_org_id
      and (p_salesperson_id is null or t.salesperson_id = p_salesperson_id)
    group by t.salesperson_id
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'user_id', rl.user_id,
        'name', rl.name,
        'email', rl.email,
        'role', rl.role,
        'avatar_url', rl.avatar_url,
        'region_id', rl.region_id,
        'region_name', coalesce(rl.region_name, 'Unassigned'),
        'total_assigned', rl.total_assigned,
        'active_leads', rl.active_leads,
        'won_leads', rl.won_leads,
        'lost_leads', rl.lost_leads,
        'conversion_rate', case when rl.total_assigned > 0 then round((rl.won_leads::numeric / rl.total_assigned::numeric) * 100, 1) else 0 end,
        'active_pipeline_value', rl.active_pipeline_value,
        'won_revenue', rl.won_revenue,
        'avg_deal_value', round(rl.avg_deal_value, 2),
        'avg_days_to_won', round(rl.avg_days_to_won, 1),
        'calls_count', coalesce(ra.calls_count, 0),
        'site_visits_count', coalesce(ra.visits_count, 0),
        'meetings_count', coalesce(ra.meetings_count, 0),
        'tasks_total', coalesce(rt.tasks_total, 0),
        'tasks_completed', coalesce(rt.tasks_completed, 0),
        'tasks_overdue', coalesce(rt.tasks_overdue, 0),
        'sla_compliance_rate', case
          when coalesce(rt.tasks_total, 0) > 0 then
            round(((coalesce(rt.tasks_total, 0) - coalesce(rt.tasks_overdue, 0))::numeric / rt.tasks_total::numeric) * 100, 1)
          else 100.0
        end
      )
      order by rl.won_revenue desc, rl.won_leads desc, rl.total_assigned desc
    ),
    '[]'::jsonb
  )
  into v_reps
  from rep_leads rl
  left join rep_activities ra on ra.user_id = rl.user_id
  left join rep_tasks rt on rt.user_id = rl.user_id;

  return coalesce(v_reps, '[]'::jsonb);
end;
$$;


-- --------------------------------------------------------------------
-- 4. TIME-SERIES ANALYTICS (TRENDS & INFLOW TELEMETRY)
-- --------------------------------------------------------------------
create or replace function public.get_time_series_analytics(
  p_org_id uuid,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null,
  p_interval text default 'day',
  p_salesperson_id uuid default null,
  p_region_id uuid default null,
  p_project_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_end timestamptz;
  v_series jsonb;
begin
  v_start := coalesce(p_start_date, now() - interval '30 days');
  v_end := coalesce(p_end_date, now());

  with time_buckets as (
    select generate_series(
      date_trunc(case when p_interval = 'week' then 'week' when p_interval = 'month' then 'month' else 'day' end, v_start),
      date_trunc(case when p_interval = 'week' then 'week' when p_interval = 'month' then 'month' else 'day' end, v_end),
      case when p_interval = 'week' then interval '1 week' when p_interval = 'month' then interval '1 month' else interval '1 day' end
    ) as bucket_time
  ),
  lead_buckets as (
    select
      date_trunc(case when p_interval = 'week' then 'week' when p_interval = 'month' then 'month' else 'day' end, l.created_at) as b_time,
      count(*)::integer as leads_created,
      count(*) filter (where l.stage = 'won')::integer as leads_won,
      count(*) filter (where l.stage = 'lost')::integer as leads_lost,
      coalesce(sum(coalesce(l.budget, 0)) filter (where l.stage = 'won'), 0)::numeric as revenue_won
    from public.leads l
    where l.org_id = p_org_id
      and l.created_at >= v_start
      and l.created_at <= v_end
      and (p_salesperson_id is null or l.salesperson_id = p_salesperson_id)
      and (p_region_id is null or l.region_id = p_region_id)
      and (p_project_id is null or l.project_id = p_project_id)
    group by b_time
  ),
  activity_buckets as (
    select
      date_trunc(case when p_interval = 'week' then 'week' when p_interval = 'month' then 'month' else 'day' end, a.occurred_at) as b_time,
      count(*) filter (where a.type = 'site_visit')::integer as site_visits,
      count(*) filter (where a.type = 'call')::integer as calls_logged
    from public.activities a
    where a.org_id = p_org_id
      and a.occurred_at >= v_start
      and a.occurred_at <= v_end
      and (p_salesperson_id is null or a.user_id = p_salesperson_id)
    group by b_time
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'date', to_char(tb.bucket_time, 'YYYY-MM-DD'),
        'label', to_char(tb.bucket_time, case when p_interval = 'month' then 'Mon YYYY' when p_interval = 'week' then '"W"IW Mon' else 'DD Mon' end),
        'leads', coalesce(lb.leads_created, 0),
        'won', coalesce(lb.leads_won, 0),
        'lost', coalesce(lb.leads_lost, 0),
        'revenue', coalesce(lb.revenue_won, 0),
        'visits', coalesce(ab.site_visits, 0),
        'calls', coalesce(ab.calls_logged, 0)
      )
      order by tb.bucket_time asc
    ),
    '[]'::jsonb
  )
  into v_series
  from time_buckets tb
  left join lead_buckets lb on lb.b_time = tb.bucket_time
  left join activity_buckets ab on ab.b_time = tb.bucket_time;

  return coalesce(v_series, '[]'::jsonb);
end;
$$;


-- --------------------------------------------------------------------
-- 5. PIPELINE VELOCITY & SALES CYCLE DURATION
-- --------------------------------------------------------------------
create or replace function public.get_pipeline_velocity_analytics(
  p_org_id uuid,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stage_velocity jsonb;
  v_overall_cycle numeric;
  v_total_won integer;
  v_total_leads integer;
begin
  select count(*)::integer into v_total_leads from public.leads where org_id = p_org_id;

  -- 1. Stage Dwell Time based on actual days_in_stage and transitions
  with stage_stats as (
    select
      coalesce(ps.slug, l.stage) as slug,
      coalesce(ps.name, initcap(replace(l.stage, '_', ' '))) as name,
      coalesce(ps.sort_order, 99) as sort_order,
      coalesce(ps.color, '#6366f1') as color,
      count(l.id)::integer as count,
      coalesce(sum(coalesce(l.budget, 0)), 0)::numeric as value,
      coalesce(round(avg(coalesce(l.days_in_stage, 0)), 1), 0.0) as avg_days_in_stage
    from public.leads l
    left join public.pipeline_stages ps on ps.org_id = p_org_id and ps.slug = l.stage
    where l.org_id = p_org_id
      and (p_start_date is null or l.created_at >= p_start_date)
      and (p_end_date is null or l.created_at <= p_end_date)
    group by coalesce(ps.slug, l.stage), coalesce(ps.name, initcap(replace(l.stage, '_', ' '))), ps.sort_order, ps.color
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'slug', ss.slug,
        'name', ss.name,
        'sort_order', ss.sort_order,
        'color', ss.color,
        'count', ss.count,
        'value', ss.value,
        'avg_days_in_stage', ss.avg_days_in_stage,
        'conversion_pct', case when v_total_leads > 0 then round((ss.count::numeric / v_total_leads::numeric) * 100, 1) else 0 end
      )
      order by ss.sort_order asc
    ),
    '[]'::jsonb
  )
  into v_stage_velocity
  from stage_stats ss;

  -- 2. Average Sales Cycle for Won Leads (from created_at to updated_at)
  select
    coalesce(round(avg(extract(epoch from (l.updated_at - l.created_at)) / 86400), 1), 0.0),
    count(*)::integer
  into v_overall_cycle, v_total_won
  from public.leads l
  where l.org_id = p_org_id
    and l.stage = 'won'
    and (p_start_date is null or l.created_at >= p_start_date)
    and (p_end_date is null or l.created_at <= p_end_date);

  return jsonb_build_object(
    'stages', coalesce(v_stage_velocity, '[]'::jsonb),
    'avg_sales_cycle_days', coalesce(v_overall_cycle, 0.0),
    'won_deals_evaluated', coalesce(v_total_won, 0),
    'total_leads_evaluated', coalesce(v_total_leads, 0)
  );
end;
$$;


-- --------------------------------------------------------------------
-- 6. CONSOLIDATED EXECUTIVE DASHBOARD RPC
-- --------------------------------------------------------------------
create or replace function public.get_executive_dashboard_analytics(
  p_org_id uuid,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null,
  p_salesperson_id uuid default null,
  p_region_id uuid default null,
  p_project_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pipeline jsonb;
  v_reps jsonb;
  v_time_series jsonb;
  v_velocity jsonb;
  v_sla jsonb;
begin
  -- 1. Pipeline Summary & Stages
  v_pipeline := public.get_pipeline_analytics(p_org_id, p_start_date, p_end_date, p_salesperson_id, p_region_id, p_project_id);

  -- 2. Rep Performance
  v_reps := public.get_rep_performance_analytics(p_org_id, p_start_date, p_end_date, p_salesperson_id);

  -- 3. Time Series (30-day default daily buckets)
  v_time_series := public.get_time_series_analytics(p_org_id, p_start_date, p_end_date, 'day', p_salesperson_id, p_region_id, p_project_id);

  -- 4. Velocity
  v_velocity := public.get_pipeline_velocity_analytics(p_org_id, p_start_date, p_end_date);

  -- 5. SLA & Follow-up Analytics
  select jsonb_build_object(
    'total_tasks', count(*)::integer,
    'upcoming_tasks', count(*) filter (where t.status = 'upcoming')::integer,
    'due_today_tasks', count(*) filter (where t.status = 'due_today')::integer,
    'overdue_tasks', count(*) filter (where t.status = 'overdue')::integer,
    'completed_tasks', count(*) filter (where t.status = 'completed')::integer,
    'overdue_percentage', case when count(*) > 0 then round((count(*) filter (where t.status = 'overdue')::numeric / count(*)::numeric) * 100, 1) else 0 end,
    'sla_compliance_percentage', case when count(*) > 0 then round(((count(*) - count(*) filter (where t.status = 'overdue'))::numeric / count(*)::numeric) * 100, 1) else 100.0 end
  )
  into v_sla
  from public.tasks t
  where t.org_id = p_org_id
    and (p_salesperson_id is null or t.salesperson_id = p_salesperson_id);

  return jsonb_build_object(
    'pipeline', v_pipeline->'summary',
    'stages', v_pipeline->'stages',
    'deal_health', v_pipeline->'deal_health',
    'forecast', v_pipeline->'forecast',
    'reps', v_reps,
    'time_series', v_time_series,
    'velocity', v_velocity,
    'sla', v_sla
  );
end;
$$;
