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
    <div className="space-y-6">
      {/* Top Filter Bar (Compact, Business-first) */}
      <div className="p-3 rounded-xl border border-border bg-card shadow-subtle flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-foreground mr-1">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Filters:</span>
          </div>

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="this_month">This Month (Aug 2026)</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_quarter">Q3 2026</option>
          </select>

          {/* Region Selector */}
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
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
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
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
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
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
          className="h-8 text-xs"
          onClick={() => {
            setSelectedRegionId("all");
            setSelectedSalespersonId("all");
            setSelectedProjectId("all");
          }}
        >
          <RefreshCw className="h-3 w-3 mr-1.5" />
          Reset Filters
        </Button>
      </div>

      {/* 6 Clean Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Inflow
          </span>
          <div className="text-2xl font-bold tracking-tight text-foreground">{totalLeads}</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-semibold">+18%</span> vs prev mo
          </div>
        </Card>

        <Card className="p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Open Pipeline
          </span>
          <div className="text-2xl font-bold tracking-tight text-foreground">{openLeads}</div>
          <div className="text-[11px] text-muted-foreground font-medium">Active conversations</div>
        </Card>

        <Card className="p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Site Visits Done
          </span>
          <div className="text-2xl font-bold tracking-tight text-amber-700">{siteVisits}</div>
          <div className="text-[11px] text-amber-700 font-medium">High intent buyers</div>
        </Card>

        <Card className="p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Deals Closed
          </span>
          <div className="text-2xl font-bold tracking-tight text-emerald-700">{wonDeals}</div>
          <div className="text-[11px] text-emerald-700 font-semibold font-mono">₹24.6 Cr booked</div>
        </Card>

        <Card className="p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Follow-ups Due
          </span>
          <div className="text-2xl font-bold tracking-tight text-rose-700">{followUpsDue}</div>
          <div className="text-[11px] text-rose-600 font-medium font-mono">3 Overdue</div>
        </Card>

        <Card className="p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Gross Pipeline
          </span>
          <div className="text-xl font-bold tracking-tight text-foreground truncate">
            {formatCurrencyINR(totalPipelineValue)}
          </div>
          <div className="text-[11px] text-muted-foreground font-medium">Across all projects</div>
        </Card>
      </div>

      {/* Pipeline Stage Distribution Breakdown Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground">Pipeline Stage Distribution</h3>
            <p className="text-xs text-muted-foreground">Cumulative volume across sales milestones</p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">{totalLeads} total deals</span>
        </div>

        {/* Multi-segment distribution bar */}
        <div className="h-3 w-full rounded-md bg-secondary flex overflow-hidden border border-border/60">
          {stages.map((st) => {
            const pct = totalLeads > 0 ? (st.count / totalLeads) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={st.key}
                className={`${st.color} h-full transition-all duration-300`}
                style={{ width: `${pct}%` }}
                title={`${st.label}: ${st.count} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Stage Legend Pills */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs">
          {stages.map((st) => (
            <div key={st.key} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${st.color}`} />
              <span className="text-muted-foreground">{st.label}:</span>
              <strong className="font-semibold text-foreground font-mono">{st.count}</strong>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Content Area: High-Priority Deals & Activity Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Lead Opportunities */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">High-Priority Opportunities</h3>
              <p className="text-xs text-muted-foreground">Click any record to inspect chronological history or log call</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="p-3.5 rounded-xl border border-border bg-card hover:border-border/80 cursor-pointer shadow-subtle hover:shadow-card transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{lead.personName}</span>
                    <PipelineBadge stage={lead.stage} />
                  </div>
                  <span className="text-xs font-bold text-foreground font-mono">{formatCurrencyINR(lead.budget)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-foreground/90 font-medium">{lead.projectName}</span>
                  <span>•</span>
                  <span>{lead.regionName}</span>
                  <span>•</span>
                  <span>Rep: <strong>{lead.salespersonName.split(" ")[0]}</strong></span>
                </div>

                <div className="text-[11px] text-muted-foreground truncate bg-secondary/50 p-2 rounded-md border border-border/40 font-mono">
                  {lead.lastActivityText}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground">
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
            <h3 className="text-sm font-bold text-foreground">Live Calling Feed</h3>
            <span className="text-[11px] text-muted-foreground font-mono">Audit Stream</span>
          </div>

          <Card className="p-3.5 space-y-3 max-h-[560px] overflow-y-auto">
            {activities.map((act) => (
              <div key={act.id} className="text-xs pb-3 border-b border-border/60 last:border-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold capitalize text-foreground">{act.type}</span>
                    {act.outcomeLabel && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                        {act.outcomeLabel}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="font-medium text-foreground">{act.personName}</div>
                {act.notes && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed bg-secondary/30 p-1.5 rounded">
                    "{act.notes}"
                  </p>
                )}
                <div className="text-[10px] text-muted-foreground/80 flex items-center justify-between">
                  <span>Logged by {act.userName}</span>
                  {act.scheduledFollowUpAt && (
                    <span className="text-amber-700 font-semibold">Next: {act.scheduledFollowUpAt}</span>
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
