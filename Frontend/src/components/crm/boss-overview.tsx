"use client";

import * as React from "react";
import {
  TrendingUp,
  Building2,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Filter,
  RefreshCw,
  Phone,
  MessageSquare,
  ChevronRight,
  Target,
  Flame,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PipelineBadge, TaskStatusBadge, DealHealthBadge, LeadScoreBadge } from "@/components/ui/status-badge";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";
import { Lead, PipelineStage } from "@/types/crm";

export function BossOverview({
  onSelectLead,
  onNavigateToTab,
}: {
  onSelectLead: (lead: Lead) => void;
  onNavigateToTab?: (tab: string) => void;
}) {
  const {
    filteredLeads,
    regions,
    users,
    projects,
    activities,
    selectedRegionId,
    setSelectedRegionId,
    selectedSalespersonId,
    setSelectedSalespersonId,
    selectedProjectId,
    setSelectedProjectId,
    dateRange,
    setDateRange,
    updateLeadStage,
  } = useCRM();

  const [activeStageFilter, setActiveStageFilter] = React.useState<PipelineStage | "all">("all");

  // Calculate Real KPI Metrics based on filtered data
  const totalLeads = filteredLeads.length;
  const openLeads = filteredLeads.filter((l) => l.stage !== "won" && l.stage !== "lost").length;
  const siteVisits = filteredLeads.filter((l) => l.stage === "site_visit").length;
  const wonDeals = filteredLeads.filter((l) => l.stage === "won").length;
  const followUpsDue = filteredLeads.filter((l) => l.followUpStatus === "due_today" || l.followUpStatus === "overdue").length;
  const overdueCount = filteredLeads.filter((l) => l.followUpStatus === "overdue").length;
  const totalPipelineValue = filteredLeads.reduce((acc, curr) => acc + (curr.budget || 0), 0);
  const wonValue = filteredLeads.filter((l) => l.stage === "won").reduce((acc, curr) => acc + (curr.budget || 0), 0);

  const salespeople = users.filter((u) => u.role === "salesperson");

  // Needs Attention Items
  const overdueLeads = filteredLeads.filter((l) => l.followUpStatus === "overdue");
  const atRiskDeals = filteredLeads.filter((l) => l.dealHealth === "at_risk");
  const upcomingSiteVisits = filteredLeads.filter((l) => l.stage === "site_visit");
  const stagnantNegotiations = filteredLeads.filter((l) => l.stage === "negotiation" && l.daysInStage >= 3);

  // Stage breakdown counts & values
  const stages: { key: PipelineStage; label: string; count: number; value: number; color: string; avgDays: number }[] = [
    {
      key: "new",
      label: "New Inflow",
      count: filteredLeads.filter((l) => l.stage === "new").length,
      value: filteredLeads.filter((l) => l.stage === "new").reduce((a, c) => a + c.budget, 0),
      color: "bg-slate-500",
      avgDays: 1,
    },
    {
      key: "contacted",
      label: "Contacted",
      count: filteredLeads.filter((l) => l.stage === "contacted").length,
      value: filteredLeads.filter((l) => l.stage === "contacted").reduce((a, c) => a + c.budget, 0),
      color: "bg-blue-600",
      avgDays: 2,
    },
    {
      key: "qualified",
      label: "Qualified",
      count: filteredLeads.filter((l) => l.stage === "qualified").length,
      value: filteredLeads.filter((l) => l.stage === "qualified").reduce((a, c) => a + c.budget, 0),
      color: "bg-indigo-600",
      avgDays: 5,
    },
    {
      key: "site_visit",
      label: "Site Visit",
      count: filteredLeads.filter((l) => l.stage === "site_visit").length,
      value: filteredLeads.filter((l) => l.stage === "site_visit").reduce((a, c) => a + c.budget, 0),
      color: "bg-amber-600",
      avgDays: 3,
    },
    {
      key: "negotiation",
      label: "Negotiation",
      count: filteredLeads.filter((l) => l.stage === "negotiation").length,
      value: filteredLeads.filter((l) => l.stage === "negotiation").reduce((a, c) => a + c.budget, 0),
      color: "bg-purple-600",
      avgDays: 4,
    },
    {
      key: "won",
      label: "Deals Closed",
      count: filteredLeads.filter((l) => l.stage === "won").length,
      value: filteredLeads.filter((l) => l.stage === "won").reduce((a, c) => a + c.budget, 0),
      color: "bg-emerald-600",
      avgDays: 12,
    },
    {
      key: "lost",
      label: "Lost / Stalled",
      count: filteredLeads.filter((l) => l.stage === "lost").length,
      value: filteredLeads.filter((l) => l.stage === "lost").reduce((a, c) => a + c.budget, 0),
      color: "bg-rose-500",
      avgDays: 8,
    },
  ];

  // Displayed Leads based on stage filter
  const displayedOpportunities = activeStageFilter === "all"
    ? filteredLeads
    : filteredLeads.filter((l) => l.stage === activeStageFilter);

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto">
      {/* Top Global Filter Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold text-foreground mr-1">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span>Dimensions:</span>
          </div>

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-secondary"
          >
            <option value="this_month">This Month (Aug 2026)</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_quarter">Q3 2026</option>
          </select>

          {/* Region Selector */}
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-secondary"
          >
            <option value="all">All Regions ({regions.length})</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} Region
              </option>
            ))}
          </select>

          {/* Salesperson Selector */}
          <select
            value={selectedSalespersonId}
            onChange={(e) => setSelectedSalespersonId(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-secondary"
          >
            <option value="all">All Sales Reps ({salespeople.length})</option>
            {salespeople.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.regionName || "Sales"})
              </option>
            ))}
          </select>

          {/* Project Selector */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-secondary"
          >
            <option value="all">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs font-semibold gap-1.5"
          onClick={() => {
            setSelectedRegionId("all");
            setSelectedSalespersonId("all");
            setSelectedProjectId("all");
            setActiveStageFilter("all");
          }}
        >
          <RefreshCw className="h-3 w-3" />
          Reset Filters
        </Button>
      </div>

      {/* Action Center: Needs Attention (Crucial Manager Decision Hub) */}
      <Card className="p-4 sm:p-5 border-amber-200/80 bg-amber-50/30 space-y-3 shadow-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              !
            </span>
            <div>
              <h3 className="text-sm font-bold text-foreground">Action Center · Needs Attention</h3>
              <p className="text-xs text-muted-foreground">
                {overdueCount + atRiskDeals.length + upcomingSiteVisits.length} priority items requiring immediate managerial decision
              </p>
            </div>
          </div>
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab("tasks")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All Tasks</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
          {/* Overdue Follow-up alert */}
          <div
            onClick={() => onNavigateToTab ? onNavigateToTab("tasks") : null}
            className="p-3 rounded-lg border border-rose-200 bg-card hover:bg-rose-50/40 cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-700 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                {overdueCount} Overdue Follow-ups
              </span>
              <Badge variant="destructive" className="text-[10px] px-1 py-0 font-mono">Urgent</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {overdueLeads[0] ? `${overdueLeads[0].personName} (${overdueLeads[0].projectName}) waiting` : "High priority calls pending"}
            </p>
          </div>

          {/* At-Risk High Value Deal */}
          <div
            onClick={() => atRiskDeals[0] && onSelectLead(atRiskDeals[0])}
            className="p-3 rounded-lg border border-orange-200 bg-card hover:bg-orange-50/40 cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-orange-800 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-orange-600" />
                {atRiskDeals.length} Deal at Risk
              </span>
              <span className="font-bold font-mono text-[11px] text-foreground">
                {atRiskDeals[0] ? formatCurrencyINR(atRiskDeals[0].budget) : "—"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug truncate">
              {atRiskDeals[0] ? `${atRiskDeals[0].personName}: ${atRiskDeals[0].dealHealthReason}` : "No high-value deals stalled"}
            </p>
          </div>

          {/* Site Visits Today / Tomorrow */}
          <div
            onClick={() => setActiveStageFilter("site_visit")}
            className="p-3 rounded-lg border border-amber-200 bg-card hover:bg-amber-50/40 cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-amber-600" />
                {upcomingSiteVisits.length} Site Visits Pending
              </span>
              <Badge variant="warning" className="text-[10px] px-1 py-0">High Intent</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {upcomingSiteVisits[0] ? `${upcomingSiteVisits[0].personName} · ${upcomingSiteVisits[0].projectName}` : "Physical visits scheduled"}
            </p>
          </div>

          {/* Negotiations Stagnant */}
          <div
            onClick={() => setActiveStageFilter("negotiation")}
            className="p-3 rounded-lg border border-purple-200 bg-card hover:bg-purple-50/40 cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-800 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-purple-600" />
                {stagnantNegotiations.length} In Final Negotiation
              </span>
              <Badge variant="purple" className="text-[10px] px-1 py-0">Closing</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {stagnantNegotiations[0] ? `${stagnantNegotiations[0].personName} evaluating unit pricing` : "Active commercial talks"}
            </p>
          </div>
        </div>
      </Card>

      {/* 6 Actionable Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <Card
          onClick={() => setActiveStageFilter("all")}
          className="p-4 flex flex-col justify-between space-y-2 hover:border-border/90 cursor-pointer transition-all hover:shadow-subtle"
        >
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Total Inflow
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{totalLeads}</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
            <span className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-bold">+18%</span> vs prev mo
          </div>
        </Card>

        <Card
          onClick={() => setActiveStageFilter("qualified")}
          className="p-4 flex flex-col justify-between space-y-2 hover:border-border/90 cursor-pointer transition-all hover:shadow-subtle"
        >
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Open Pipeline
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{openLeads}</div>
          <div className="text-[11px] text-muted-foreground font-medium">Active enquiries</div>
        </Card>

        <Card
          onClick={() => setActiveStageFilter("site_visit")}
          className="p-4 flex flex-col justify-between space-y-2 hover:border-amber-300 cursor-pointer transition-all hover:shadow-subtle bg-amber-50/20"
        >
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Site Visits Done
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-700">{siteVisits}</div>
          <div className="text-[11px] text-amber-800 font-medium">Physical site walkthroughs</div>
        </Card>

        <Card
          onClick={() => setActiveStageFilter("won")}
          className="p-4 flex flex-col justify-between space-y-2 hover:border-emerald-300 cursor-pointer transition-all hover:shadow-subtle bg-emerald-50/20"
        >
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Deals Closed
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-700">{wonDeals}</div>
          <div className="text-[11px] text-emerald-700 font-bold font-mono">
            {formatCurrencyINR(wonValue)} booked
          </div>
        </Card>

        <Card
          onClick={() => onNavigateToTab && onNavigateToTab("tasks")}
          className="p-4 flex flex-col justify-between space-y-2 hover:border-rose-300 cursor-pointer transition-all hover:shadow-subtle bg-rose-50/20"
        >
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
            Follow-ups Due
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-700">{followUpsDue}</div>
          <div className="text-[11px] text-rose-700 font-bold font-mono">
            {overdueCount} Overdue
          </div>
        </Card>

        <Card
          onClick={() => setActiveStageFilter("all")}
          className="p-4 flex flex-col justify-between space-y-2 hover:border-border/90 cursor-pointer transition-all hover:shadow-subtle"
        >
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Gross Pipeline
          </span>
          <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate pt-0.5">
            {formatCurrencyINR(totalPipelineValue)}
          </div>
          <div className="text-[11px] text-muted-foreground font-medium">Across all projects</div>
        </Card>
      </div>

      {/* Deal Health & Risk Intelligence Spotlight */}
      {atRiskDeals.length > 0 && (
        <Card className="p-4 sm:p-5 border-border space-y-3 bg-card shadow-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <h3 className="text-sm font-bold text-foreground">Deal Health & Risk Intelligence</h3>
            </div>
            <span className="text-[11px] text-muted-foreground">Automated Stagnation & SLA Check</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {atRiskDeals.map((lead) => (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 hover:border-rose-300 cursor-pointer space-y-2 text-xs transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{lead.personName}</span>
                      <DealHealthBadge health="at_risk" reason={lead.dealHealthReason} />
                      <LeadScoreBadge score={lead.leadScore} label={lead.leadScoreLabel} />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {lead.projectName} • Rep: <strong>{lead.salespersonName}</strong>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-foreground font-mono">
                    {formatCurrencyINR(lead.budget)}
                  </span>
                </div>

                <div className="p-2 rounded bg-card border border-rose-200/80 text-[11px] space-y-1">
                  <div className="text-rose-700 font-semibold flex items-center gap-1">
                    <span>🔴 Risk:</span>
                    <span>{lead.dealHealthReason}</span>
                  </div>
                  <div className="text-foreground/90 font-medium">
                    <span>Next Action: </span>
                    <strong className="text-primary">{lead.recommendedAction || "Call buyer immediately"}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Last active: {new Date(lead.lastActivityAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:${lead.phone}`}
                      className="inline-flex items-center h-6 px-2 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call Rep
                    </a>
                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center h-6 px-2 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Interactive Pipeline Stage Distribution & Milestone Bar */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Pipeline Velocity & Conversion Flow</h3>
            </div>
            <p className="text-xs text-muted-foreground">Click any milestone stage to filter opportunities below</p>
          </div>
          <div className="flex items-center gap-2">
            {activeStageFilter !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => setActiveStageFilter("all")}
              >
                Clear Stage Filter
              </Button>
            )}
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2.5 py-0.5 rounded border border-border">
              {totalLeads} total deals · {formatCurrencyINR(totalPipelineValue)}
            </span>
          </div>
        </div>

        {/* Multi-segment distribution bar */}
        <div className="h-3.5 w-full rounded-full bg-secondary flex overflow-hidden border border-border">
          {stages.map((st) => {
            const pct = totalLeads > 0 ? (st.count / totalLeads) * 100 : 0;
            if (pct === 0) return null;
            const isSelected = activeStageFilter === st.key;
            return (
              <div
                key={st.key}
                onClick={() => setActiveStageFilter(activeStageFilter === st.key ? "all" : st.key)}
                className={`${st.color} h-full transition-all duration-300 cursor-pointer hover:opacity-90 ${
                  isSelected ? "ring-2 ring-foreground" : ""
                }`}
                style={{ width: `${pct}%` }}
                title={`${st.label}: ${st.count} (${pct.toFixed(1)}%) • ${formatCurrencyINR(st.value)}`}
              />
            );
          })}
        </div>

        {/* Stage Legend Pills with Conversion Data */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 text-xs">
          {stages.map((st) => {
            const isSelected = activeStageFilter === st.key;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setActiveStageFilter(isSelected ? "all" : st.key)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "bg-secondary border-primary font-bold shadow-subtle"
                    : "bg-card border-border hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`h-2 w-2 rounded-full ${st.color}`} />
                  <span className="font-semibold text-foreground text-[11px] truncate">{st.label}</span>
                </div>
                <div className="font-bold text-foreground font-mono text-sm">{st.count}</div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">{formatCurrencyINR(st.value)}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Content Split: Opportunities & Live Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Lead Opportunities */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-bold text-foreground">
                  Opportunities {activeStageFilter !== "all" && `(${activeStageFilter.toUpperCase().replace("_", " ")})`}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">Click any record for 360° lead dossier, unit allocation, or quick activity</p>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{displayedOpportunities.length} shown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayedOpportunities.map((lead) => (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="p-4 rounded-xl border border-border bg-card hover:border-border/90 cursor-pointer shadow-subtle hover:shadow-card transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{lead.personName}</span>
                      <PipelineBadge stage={lead.stage} />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span>{lead.projectName}</span>
                      {lead.assignedUnitNumber && (
                        <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                          Unit {lead.assignedUnitNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-foreground font-mono bg-secondary px-2 py-0.5 rounded border border-border">
                    {formatCurrencyINR(lead.budget)}
                  </span>
                </div>

                {/* Score and Deal Health row */}
                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <LeadScoreBadge score={lead.leadScore} label={lead.leadScoreLabel} />
                  <DealHealthBadge health={lead.dealHealth} reason={lead.dealHealthReason} />
                </div>

                <div className="text-[11px] text-muted-foreground bg-secondary/40 p-2 rounded-md border border-border/40 font-mono leading-relaxed line-clamp-2">
                  {lead.lastActivityText}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50 text-muted-foreground">
                  <TaskStatusBadge status={lead.followUpStatus || "upcoming"} />
                  <span className="font-medium text-foreground">{lead.nextFollowUpAt || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Immutable Calling Audit Feed */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-bold text-foreground">Live Activity Feed</h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">Immutable Stream</span>
          </div>

          <Card className="p-4 space-y-3 max-h-[580px] overflow-y-auto">
            {activities.map((act) => (
              <div key={act.id} className="text-xs pb-3 border-b border-border/50 last:border-0 last:pb-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold capitalize text-foreground flex items-center gap-1">
                      {act.type === "call" && <Phone className="h-3 w-3 text-blue-600" />}
                      {act.type === "whatsapp" && <MessageSquare className="h-3 w-3 text-emerald-600" />}
                      {act.type === "site_visit" && <Building2 className="h-3 w-3 text-amber-600" />}
                      {act.type}
                    </span>
                    {act.outcomeLabel && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                        {act.outcomeLabel}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="font-semibold text-foreground">{act.personName}</div>
                {act.notes && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed bg-secondary/30 p-1.5 rounded">
                    "{act.notes}"
                  </p>
                )}
                <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-0.5">
                  <span>Logged by {act.userName}</span>
                  {act.scheduledFollowUpAt && (
                    <span className="text-amber-800 font-semibold font-mono">Next: {act.scheduledFollowUpAt}</span>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

