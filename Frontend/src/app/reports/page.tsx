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

export default function ReportsPage() {
  const { filteredLeads, regions, users, projects, dateRange, setDateRange } = useCRM();
  const [exporting, setExporting] = React.useState(false);
  const [exported, setExported] = React.useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header with Export / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Analytics & Executive Reports
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deep-dive pipeline conversion, calling velocity, and regional revenue targets.
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
                <span>Exported</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Export to Sheets / CSV</span>
              </>
            )}
          </Button>
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

      {/* Row 3: Sales Rep Leaderboard Scorecard */}
      <div className="p-5 rounded-xl border border-border bg-card shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Sales Representative Performance Scorecard
            </h3>
            <p className="text-xs text-muted-foreground">
              Individual agent metrics: Calls logged, Site visits conducted, Won revenue, and Conversion rate
            </p>
          </div>
          <Badge variant="outline" className="text-xs">August 2026 Ranking</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-semibold text-left">
                <th className="pb-2 pl-2">Rank & Agent</th>
                <th className="pb-2">Region Hub</th>
                <th className="pb-2">Calls Logged</th>
                <th className="pb-2">Site Visits</th>
                <th className="pb-2">Won Deals</th>
                <th className="pb-2">Conversion Rate</th>
                <th className="pb-2 pr-2 text-right">Total Booking Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {[
                { rank: 1, name: "Rahul Sharma", region: "Gurgaon", calls: 84, visits: 16, won: 9, conv: "10.7%", value: 142000000 },
                { rank: 2, name: "Pooja Verma", region: "Noida", calls: 62, visits: 11, won: 6, conv: "9.6%", value: 84000000 },
                { rank: 3, name: "Amit Saxena", region: "Delhi", calls: 48, visits: 7, won: 3, conv: "6.2%", value: 52000000 },
              ].map((rep) => (
                <tr key={rep.name} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-3 pl-2 font-medium text-foreground flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary border border-border text-[10px] font-bold">
                      #{rep.rank}
                    </span>
                    <span>{rep.name}</span>
                  </td>
                  <td className="py-3 text-muted-foreground">{rep.region}</td>
                  <td className="py-3 font-mono font-medium">{rep.calls}</td>
                  <td className="py-3 font-mono font-medium text-amber-700">{rep.visits}</td>
                  <td className="py-3 font-mono font-medium text-emerald-700">{rep.won}</td>
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
