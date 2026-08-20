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
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PipelineBadge, TaskStatusBadge } from "@/components/ui/status-badge";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";
import { Lead } from "@/types/crm";

export function BossOverview({ onSelectLead }: { onSelectLead: (lead: Lead) => void }) {
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
  } = useCRM();

  // Calculate Real KPI Metrics based on filtered data
  const totalLeads = filteredLeads.length;
  const openLeads = filteredLeads.filter((l) => l.stage !== "won" && l.stage !== "lost").length;
  const siteVisits = filteredLeads.filter((l) => l.stage === "site_visit").length;
  const wonDeals = filteredLeads.filter((l) => l.stage === "won").length;
  const followUpsDue = filteredLeads.filter((l) => l.followUpStatus === "due_today" || l.followUpStatus === "overdue").length;
  const totalPipelineValue = filteredLeads.reduce((acc, curr) => acc + (curr.budget || 0), 0);

  const salespeople = users.filter((u) => u.role === "salesperson");

  // Stage breakdown counts
  const stages = [
    { key: "new", label: "New Inflow", count: filteredLeads.filter((l) => l.stage === "new").length, color: "bg-slate-500" },
    { key: "contacted", label: "Contacted", count: filteredLeads.filter((l) => l.stage === "contacted").length, color: "bg-blue-600" },
    { key: "qualified", label: "Qualified", count: filteredLeads.filter((l) => l.stage === "qualified").length, color: "bg-indigo-600" },
    { key: "site_visit", label: "Site Visit Done", count: filteredLeads.filter((l) => l.stage === "site_visit").length, color: "bg-amber-600" },
    { key: "negotiation", label: "Negotiation", count: filteredLeads.filter((l) => l.stage === "negotiation").length, color: "bg-purple-600" },
    { key: "won", label: "Won Deals", count: filteredLeads.filter((l) => l.stage === "won").length, color: "bg-emerald-600" },
    { key: "lost", label: "Lost / Dropped", count: filteredLeads.filter((l) => l.stage === "lost").length, color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Top Filter Bar (Clean, Spacious) */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-semibold text-foreground mr-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span>Filters:</span>
          </div>

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-colors hover:bg-secondary/80 cursor-pointer"
          >
            <option value="this_month">This Month (Aug 2026)</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_quarter">Q3 2026</option>
          </select>

          {/* Region Selector */}
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-colors hover:bg-secondary/80 cursor-pointer"
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
            className="h-9 px-3 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-colors hover:bg-secondary/80 cursor-pointer"
          >
            <option value="all">All Salespeople ({salespeople.length})</option>
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
            className="h-9 px-3 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-colors hover:bg-secondary/80 cursor-pointer"
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
          className="h-9"
          onClick={() => {
            setSelectedRegionId("all");
            setSelectedSalespersonId("all");
            setSelectedProjectId("all");
          }}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Reset Filters
        </Button>
      </div>

      {/* 6 Clean Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-5">
        <Card className="p-5 flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">
            Total Inflow
          </span>
          <div className="text-3xl font-extrabold tracking-tight text-foreground">{totalLeads}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
            <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">+18%</span> vs prev mo
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">
            Open Pipeline
          </span>
          <div className="text-3xl font-extrabold tracking-tight text-foreground">{openLeads}</div>
          <div className="text-xs text-muted-foreground font-medium pt-1">Active conversations</div>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
          <span className="text-xs font-semibold text-amber-700/80 uppercase tracking-widest block">
            Site Visits Done
          </span>
          <div className="text-3xl font-extrabold tracking-tight text-amber-700">{siteVisits}</div>
          <div className="text-xs text-amber-700/80 font-medium pt-1">High intent buyers</div>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
          <span className="text-xs font-semibold text-emerald-700/80 uppercase tracking-widest block">
            Deals Closed
          </span>
          <div className="text-3xl font-extrabold tracking-tight text-emerald-700">{wonDeals}</div>
          <div className="text-xs text-emerald-700 font-semibold font-mono bg-emerald-50 rounded px-2 py-0.5 w-fit">
            ₹24.6 Cr booked
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
          <span className="text-xs font-semibold text-rose-700/80 uppercase tracking-widest block">
            Follow-ups Due
          </span>
          <div className="text-3xl font-extrabold tracking-tight text-rose-700">{followUpsDue}</div>
          <div className="text-xs text-rose-600 font-bold font-mono bg-rose-50 rounded px-2 py-0.5 w-fit">
            3 Overdue
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">
            Gross Pipeline
          </span>
          <div className="text-2xl font-extrabold tracking-tight text-foreground truncate pt-1">
            {formatCurrencyINR(totalPipelineValue)}
          </div>
          <div className="text-xs text-muted-foreground font-medium pt-1">Across all projects</div>
        </Card>
      </div>

      {/* Pipeline Stage Distribution Breakdown Bar */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Pipeline Stage Distribution
            </h3>
            <p className="text-sm text-muted-foreground">Cumulative volume across sales milestones</p>
          </div>
          <span className="text-sm font-mono text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
            {totalLeads} total deals
          </span>
        </div>

        {/* Multi-segment distribution bar */}
        <div className="h-4 w-full rounded-full bg-secondary flex overflow-hidden border border-border/80 shadow-inner">
          {stages.map((st) => {
            const pct = totalLeads > 0 ? (st.count / totalLeads) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={st.key}
                className={`${st.color} h-full transition-all duration-500 ease-out hover:opacity-90 hover:scale-y-110 cursor-help`}
                style={{ width: `${pct}%` }}
                title={`${st.label}: ${st.count} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Stage Legend Pills */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-sm">
          {stages.map((st) => (
            <div key={st.key} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${st.color} shadow-sm`} />
              <span className="text-muted-foreground font-medium">{st.label}:</span>
              <strong className="font-bold text-foreground font-mono">{st.count}</strong>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Content Area: High-Priority Deals & Activity Audit Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Priority Lead Opportunities */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                High-Priority Opportunities
              </h3>
              <p className="text-sm text-muted-foreground">Click any record to inspect chronological history or log call</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="p-5 rounded-2xl border border-border/80 bg-card hover:border-border cursor-pointer shadow-subtle hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="font-bold text-base text-foreground block">{lead.personName}</span>
                    <PipelineBadge stage={lead.stage} />
                  </div>
                  <span className="text-sm font-extrabold text-foreground font-mono bg-secondary/50 px-2.5 py-1 rounded-md border border-border/50">
                    {formatCurrencyINR(lead.budget)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-muted-foreground font-medium flex-wrap">
                  <span className="text-foreground/90">{lead.projectName}</span>
                  <span className="text-border text-xs">•</span>
                  <span>{lead.regionName}</span>
                  <span className="text-border text-xs">•</span>
                  <span>Rep: <strong className="text-foreground">{lead.salespersonName.split(" ")[0]}</strong></span>
                </div>

                <div className="text-xs text-muted-foreground bg-secondary/40 p-3 rounded-lg border border-border/40 font-mono leading-relaxed line-clamp-2">
                  {lead.lastActivityText}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 mt-1">
                  <div className="mt-3"><TaskStatusBadge status={lead.followUpStatus || "upcoming"} /></div>
                  <span className="font-bold text-foreground mt-3 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {lead.nextFollowUpAt || "No follow-up scheduled"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Immutable Calling Audit Feed */}
        <div className="xl:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Live Calling Feed
              </h3>
              <p className="text-sm text-muted-foreground">Real-time audit stream</p>
            </div>
          </div>

          <Card className="p-5 space-y-5 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-border/50 hover:scrollbar-thumb-border">
            {activities.map((act) => (
              <div key={act.id} className="text-sm pb-5 border-b border-border/50 last:border-0 last:pb-0 space-y-2.5 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold capitalize text-foreground">{act.type}</span>
                    {act.outcomeLabel && (
                      <span className="rounded bg-secondary/80 border border-border/50 px-2 py-0.5 text-xs font-semibold text-foreground">
                        {act.outcomeLabel}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono font-medium">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="font-bold text-foreground">{act.personName}</div>
                {act.notes && (
                  <p className="text-xs text-muted-foreground/90 leading-relaxed bg-secondary/30 p-2.5 rounded-lg border border-border/30">
                    "{act.notes}"
                  </p>
                )}
                <div className="text-xs text-muted-foreground flex items-center justify-between font-medium pt-1">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    {act.userName}
                  </span>
                  {act.scheduledFollowUpAt && (
                    <span className="text-amber-700 flex items-center gap-1.5 font-bold">
                      <Calendar className="h-3 w-3" />
                      {act.scheduledFollowUpAt}
                    </span>
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
