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
  Award,
  Zap,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PipelineBadge, TaskStatusBadge } from "@/components/ui/status-badge";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";
import { Lead } from "@/types/crm";
import { Sparkline } from "@/components/crm/charts/sparkline";
import { AreaTrendChart } from "@/components/crm/charts/area-trend-chart";
import { ConversionFunnel } from "@/components/crm/charts/conversion-funnel";
import { CircularProgress } from "@/components/crm/charts/circular-progress";
import { ActivityHeatmap } from "@/components/crm/charts/activity-heatmap";

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

  // Trend data arrays for sparklines (30-day velocity points)
  const leadsTrend = [18, 22, 28, 25, 34, 42, 39, 48, 56, 62, 58, 74, 82];
  const visitsTrend = [3, 5, 4, 8, 7, 12, 10, 16, 14, 19, 22, 24, 28];
  const dealsTrend = [1, 1, 2, 2, 3, 2, 4, 3, 5, 4, 6, 6, 7];
  const valueTrend = [120, 150, 140, 210, 240, 290, 310, 380, 420, 485];

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

      {/* Visual KPI Cards with Sparklines */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Inflow
            </span>
            <span className="text-[10px] text-emerald-600 font-bold font-mono">+18%</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">{totalLeads}</div>
          <Sparkline data={leadsTrend} width={100} height={24} color="#0f172a" />
        </Card>

        <Card className="p-3.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Open Pipeline
            </span>
            <span className="text-[10px] text-blue-600 font-bold font-mono">Active</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">{openLeads}</div>
          <Sparkline data={[14, 18, 16, 22, 26, 24, 28]} width={100} height={24} color="#2563eb" />
        </Card>

        <Card className="p-3.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Site Visits
            </span>
            <span className="text-[10px] text-amber-700 font-bold font-mono">+24%</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-700">{siteVisits}</div>
          <Sparkline data={visitsTrend} width={100} height={24} color="#d97706" />
        </Card>

        <Card className="p-3.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Deals Closed
            </span>
            <span className="text-[10px] text-emerald-700 font-bold font-mono">₹24.6 Cr</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-700">{wonDeals}</div>
          <Sparkline data={dealsTrend} width={100} height={24} color="#059669" />
        </Card>

        <Card className="p-3.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Follow-ups Due
            </span>
            <span className="text-[10px] text-rose-600 font-bold font-mono">3 Overdue</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-700">{followUpsDue}</div>
          <Sparkline data={[8, 12, 10, 14, 16, 12, 14]} width={100} height={24} color="#dc2626" />
        </Card>

        <Card className="p-3.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Pipeline Value
            </span>
            <span className="text-[10px] text-emerald-600 font-bold font-mono">Gross</span>
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground truncate">
            {formatCurrencyINR(totalPipelineValue)}
          </div>
          <Sparkline data={valueTrend} width={100} height={24} color="#059669" />
        </Card>
      </div>

      {/* Main Analytics Visuals: Area Trend Chart & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Velocity Multi-Area Trend Chart */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Weekly Velocity & Deal Momentum</h3>
              <p className="text-xs text-muted-foreground">Interactive lead inflow vs scheduled physical site visits</p>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">8-Week Telemetry</Badge>
          </div>
          <AreaTrendChart />
        </div>

        {/* Pipeline Conversion Funnel */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-border bg-card shadow-subtle space-y-4">
          <ConversionFunnel />
        </div>
      </div>

      {/* Regional Performance & Activity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Regional Performance Matrix */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-border bg-card shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Regional Target Completion</h3>
              <p className="text-xs text-muted-foreground">Quota progress across NCR hubs</p>
            </div>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {[
              { name: "Gurgaon Hub", leads: 142, quotaPct: 88, value: 345000000, color: "#0f172a" },
              { name: "Noida Hub", leads: 86, quotaPct: 74, value: 185000000, color: "#2563eb" },
              { name: "Delhi Hub", leads: 48, quotaPct: 62, value: 95000000, color: "#059669" },
            ].map((hub) => (
              <div
                key={hub.name}
                className="p-3 rounded-lg border border-border bg-secondary/30 flex items-center justify-between gap-3 text-xs"
              >
                <CircularProgress
                  value={hub.quotaPct}
                  size={52}
                  strokeWidth={4.5}
                  color={hub.color}
                  label={hub.name}
                  sublabel={`${hub.leads} active leads`}
                />
                <div className="text-right">
                  <div className="font-bold text-foreground font-mono">{formatCurrencyINR(hub.value)}</div>
                  <div className="text-[10px] text-muted-foreground">Target: 90%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Calling Density Matrix Heatmap */}
        <div className="lg:col-span-7 p-4 rounded-xl border border-border bg-card shadow-subtle space-y-4">
          <ActivityHeatmap />
        </div>
      </div>

      {/* Sales Rep Leaderboard & Recent Organization Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Rep Scorecard */}
        <div className="lg:col-span-4 p-4 rounded-xl border border-border bg-card shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" />
              Sales Rep Leaderboard
            </h3>
            <span className="text-[11px] text-muted-foreground">August 2026</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {[
              { name: "Rahul Sharma", region: "Gurgaon", closed: "₹14.2 Cr", visits: 16, rank: "1" },
              { name: "Pooja Verma", region: "Noida", closed: "₹8.4 Cr", visits: 11, rank: "2" },
              { name: "Amit Saxena", region: "Delhi", closed: "₹5.2 Cr", visits: 7, rank: "3" },
            ].map((rep) => (
              <div
                key={rep.name}
                className="p-2.5 rounded-lg border border-border bg-secondary/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border text-[11px] font-bold text-foreground">
                    #{rep.rank}
                  </span>
                  <div>
                    <div className="font-semibold text-foreground">{rep.name}</div>
                    <div className="text-[10px] text-muted-foreground">{rep.region} • {rep.visits} visits</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-emerald-700">{rep.closed}</div>
                  <div className="text-[10px] text-muted-foreground">Won Value</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Organization Leads Feed */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">High-Priority Opportunities</h3>
              <p className="text-xs text-muted-foreground">Real-time leads sorted by deal value and follow-up urgency</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="p-3.5 rounded-xl border border-border bg-card hover:border-border/80 cursor-pointer shadow-subtle hover:shadow-card transition-all space-y-2"
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

                <div className="text-[11px] text-muted-foreground truncate bg-secondary/50 p-1.5 rounded border border-border/40 font-mono">
                  {lead.lastActivityText}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
