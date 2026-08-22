"use client";

import * as React from "react";
import {
  ChartNoAxesCombined,
  Download,
  Calendar,
  Filter,
  Award,
  Target,
  FileSpreadsheet,
  Share2,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Zap,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyINR } from "@/lib/utils";
import { AreaTrendChart } from "@/components/crm/charts/area-trend-chart";
import { ConversionFunnel } from "@/components/crm/charts/conversion-funnel";
import { CircularProgress } from "@/components/crm/charts/circular-progress";
import { ActivityHeatmap } from "@/components/crm/charts/activity-heatmap";

export function ReportsPage() {
  const { filteredLeads, regions, users, projects, dateRange, setDateRange } = useCRM();
  const [exporting, setExporting] = React.useState(false);
  const [exported, setExported] = React.useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 800);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header with Export / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Executive Analytics & Management Intelligence
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational pipeline analytics with actionable management diagnosis (Data → What it means → What to do).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-border bg-card text-xs text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="this_month">This Month (Aug 2026)</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_quarter">Q3 2026</option>
            <option value="ytd">Year-to-Date (2026)</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            isLoading={exporting}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            {exported ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Exported to CSV</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Row 0: Management Actionable Insights (Data -> What this means -> Action) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Insight Card 1 */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <span>Conversion Velocity Insight</span>
          </div>
          <div className="text-foreground/90 space-y-1 leading-relaxed">
            <p className="font-semibold">
              Qualified → Site Visit conversion is <strong>42%</strong> (12% above NCR luxury benchmark).
            </p>
            <p className="text-muted-foreground text-[11px]">
              <strong>Action:</strong> Allocate 2 additional junior reps to accelerate top-of-funnel lead qualification for DLF The Arbour.
            </p>
          </div>
        </div>

        {/* Insight Card 2 */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Follow-up SLA Bottleneck</span>
          </div>
          <div className="text-foreground/90 space-y-1 leading-relaxed">
            <p className="font-semibold">
              3 high-ticket buyer leads in Noida Hub have had no touchpoint in <strong>&gt; 48 hours</strong>.
            </p>
            <p className="text-muted-foreground text-[11px]">
              <strong>Action:</strong> Trigger automated WhatsApp reminder or reassign to Pooja Verma to protect deal health.
            </p>
          </div>
        </div>

        {/* Insight Card 3 */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span>High-Demand Unit Allocation</span>
          </div>
          <div className="text-foreground/90 space-y-1 leading-relaxed">
            <p className="font-semibold">
              <strong>4 BHK Penthouses</strong> at Max Estates 128 have 3 concurrent buyers in negotiation.
            </p>
            <p className="text-muted-foreground text-[11px]">
              <strong>Action:</strong> Enforce strict 48-hour token deadline before releasing inventory holds to waitlist.
            </p>
          </div>
        </div>
      </div>

      {/* Row 1: Pipeline Conversion Funnel & Lead Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-5 rounded-xl border border-border bg-card shadow-subtle space-y-4">
          <ConversionFunnel />
        </div>

        <div className="lg:col-span-6 p-5 rounded-xl border border-border bg-card shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Weekly Velocity Telemetry</h3>
              <p className="text-xs text-muted-foreground">Historical lead inflow vs physical site visits</p>
            </div>
            <Badge variant="secondary" className="text-[10px] font-mono">8-Week View</Badge>
          </div>
          <AreaTrendChart />
        </div>
      </div>

      {/* Row 2: Regional Performance Targets & Calling Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Regional Hub Quotas */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-border bg-card shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Regional Target Completion</h3>
              <p className="text-xs text-muted-foreground">Monthly quota execution across hubs</p>
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

        {/* 7-Day Calling Density Heatmap */}
        <div className="lg:col-span-7 p-5 rounded-xl border border-border bg-card shadow-subtle space-y-4">
          <ActivityHeatmap />
        </div>
      </div>

      {/* Row 3: Sales Rep Leaderboard & SLA Compliance Scorecard */}
      <div className="p-5 rounded-xl border border-border bg-card shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Sales Representative Performance & SLA Adherence
            </h3>
            <p className="text-xs text-muted-foreground">
              Individual agent metrics: Calls, Site visits, Response speed, Follow-up SLA compliance, and Won revenue
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">August 2026 Ranking</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold text-left">
                <th className="pb-2.5 pl-2">Rank & Agent</th>
                <th className="pb-2.5">Region Hub</th>
                <th className="pb-2.5">Calls Logged</th>
                <th className="pb-2.5">Site Visits</th>
                <th className="pb-2.5">Avg Response</th>
                <th className="pb-2.5">Follow-up SLA</th>
                <th className="pb-2.5">Won Deals</th>
                <th className="pb-2.5">Conv. Rate</th>
                <th className="pb-2.5 pr-2 text-right">Total Won Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {[
                { rank: 1, name: "Rahul Sharma", region: "Gurgaon", calls: 84, visits: 16, response: "14 mins", sla: "96%", won: 9, conv: "10.7%", value: 142000000 },
                { rank: 2, name: "Pooja Verma", region: "Noida", calls: 62, visits: 11, response: "22 mins", sla: "91%", won: 6, conv: "9.6%", value: 84000000 },
                { rank: 3, name: "Amit Saxena", region: "Delhi", calls: 48, visits: 7, response: "38 mins", sla: "84%", won: 3, conv: "6.2%", value: 52000000 },
              ].map((rep) => (
                <tr key={rep.name} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-3 pl-2 font-semibold text-foreground flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary border border-border text-[10px] font-bold">
                      #{rep.rank}
                    </span>
                    <span>{rep.name}</span>
                  </td>
                  <td className="py-3 text-muted-foreground">{rep.region}</td>
                  <td className="py-3 font-mono font-medium">{rep.calls}</td>
                  <td className="py-3 font-mono font-semibold text-amber-800">{rep.visits}</td>
                  <td className="py-3 font-mono text-muted-foreground">{rep.response}</td>
                  <td className="py-3 font-mono font-bold text-emerald-700">{rep.sla}</td>
                  <td className="py-3 font-mono font-bold text-emerald-800">{rep.won}</td>
                  <td className="py-3 font-mono font-bold text-foreground">{rep.conv}</td>
                  <td className="py-3 pr-2 text-right font-mono font-bold text-foreground">
                    {formatCurrencyINR(rep.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
