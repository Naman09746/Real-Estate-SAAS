"use client";

import * as React from "react";
import {
  Phone,
  MessageSquare,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  AlertCircle,
  TrendingUp,
  Target,
  Zap,
  Flame,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PipelineBadge, TaskStatusBadge } from "@/components/ui/status-badge";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";
import { Lead } from "@/types/crm";
import { CircularProgress } from "@/components/crm/charts/circular-progress";
import { Sparkline } from "@/components/crm/charts/sparkline";

interface SalespersonHomeProps {
  onOpenQuickLog: (leadId?: string) => void;
  onSelectLead: (lead: Lead) => void;
}

export function SalespersonHome({
  onOpenQuickLog,
  onSelectLead,
}: SalespersonHomeProps) {
  const { currentUser, filteredLeads, filteredTasks, completeTask } = useCRM();

  // Salesperson's active follow-ups
  const dueTodayTasks = filteredTasks.filter((t) => t.status === "due_today" || t.status === "overdue");

  // Pipeline stage breakdown for this salesperson
  const stageSummary = [
    { label: "New", count: filteredLeads.filter((l) => l.stage === "new").length, stage: "new", trend: [2, 4, 3, 5, 4, 6] },
    { label: "Contacted", count: filteredLeads.filter((l) => l.stage === "contacted").length, stage: "contacted", trend: [8, 12, 10, 14, 16, 18] },
    { label: "Site Visit", count: filteredLeads.filter((l) => l.stage === "site_visit").length, stage: "site_visit", trend: [2, 3, 5, 4, 6, 7] },
    { label: "Negotiation", count: filteredLeads.filter((l) => l.stage === "negotiation").length, stage: "negotiation", trend: [1, 2, 2, 3, 3, 4] },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* High-Velocity Speed Header with Target Meters */}
      <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sales Command • {currentUser.regionName || "Gurgaon Hub"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Good morning, {currentUser.name.split(" ")[0]}
          </h1>
          <p className="text-xs text-muted-foreground">
            You have <strong className="text-amber-700 font-semibold">{dueTodayTasks.length} priority calls</strong> scheduled for today.
          </p>
        </div>

        {/* Daily Quota Target Visual Gauges */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-secondary/30 p-2.5 rounded-lg border border-border">
          <CircularProgress
            value={80}
            size={48}
            strokeWidth={4}
            color="#059669"
            label="Daily Calls"
            sublabel="8 of 10 done"
          />
          <div className="h-8 w-px bg-border hidden sm:block" />
          <CircularProgress
            value={66}
            size={48}
            strokeWidth={4}
            color="#d97706"
            label="Site Visits"
            sublabel="2 booked this wk"
          />
        </div>

        {/* Primary Hero Action: + Log Activity */}
        <Button
          size="lg"
          onClick={() => onOpenQuickLog()}
          className="h-11 px-5 text-sm font-semibold shadow-subtle bg-primary text-primary-foreground hover:bg-primary-hover w-full lg:w-auto flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Log Quick Activity</span>
        </Button>
      </div>

      {/* Salesperson Personal Pipeline Summary with Mini Sparklines */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            My Active Pipeline Velocity
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono">Real-time Stage Counts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stageSummary.map((st) => (
            <div
              key={st.label}
              className="p-3.5 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between space-y-2 hover:border-border/90 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{st.label}</span>
                <PipelineBadge stage={st.stage} />
              </div>

              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-foreground font-mono">{st.count}</span>
                <Sparkline data={st.trend} width={70} height={20} color="#0f172a" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Follow-ups Today */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Today's Calling Queue</h2>
            <p className="text-xs text-muted-foreground">Tap Call or WhatsApp to engage, then save log in 10s</p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">{dueTodayTasks.length} pending</span>
        </div>

        {dueTodayTasks.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-border bg-card text-center text-xs text-muted-foreground">
            No follow-ups remaining for today. Great job!
          </div>
        ) : (
          <div className="space-y-2.5">
            {dueTodayTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-subtle hover:border-border/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{task.personName}</span>
                    <span className="text-xs text-muted-foreground font-mono">{formatPhone(task.phone)}</span>
                    <TaskStatusBadge status={task.status} />
                  </div>

                  <p className="text-xs text-foreground/90 font-medium">
                    {task.title}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{task.projectName}</span>
                    {task.dueTime && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Clock className="h-3 w-3" />
                          {task.dueTime}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Instant Actions (Optimized for 1-thumb mobile reachability) */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={`tel:${task.phone}`}
                    className="inline-flex items-center justify-center h-9 px-3 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-subtle"
                  >
                    <Phone className="h-3.5 w-3.5 mr-1.5" />
                    Call
                  </a>

                  <a
                    href={`https://wa.me/${task.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center h-9 px-3 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-subtle"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    WhatsApp
                  </a>

                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs h-9 font-medium"
                    onClick={() => onOpenQuickLog(task.leadId)}
                  >
                    Log Call
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Recent Leads List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">My Assigned Leads</h2>
          <span className="text-xs text-muted-foreground">Total {filteredLeads.length} leads</span>
        </div>

        <div className="space-y-2">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="p-3 rounded-xl border border-border bg-card hover:bg-secondary/30 cursor-pointer transition-all shadow-subtle flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{lead.personName}</span>
                  <PipelineBadge stage={lead.stage} />
                </div>
                <div className="text-muted-foreground text-[11px]">
                  {lead.projectName} • Budget: <strong className="text-foreground font-mono">{formatCurrencyINR(lead.budget)}</strong>
                </div>
              </div>

              <div className="text-right text-[11px] text-muted-foreground">
                <div className="font-medium text-foreground">{lead.nextFollowUpAt || "—"}</div>
                <div className="text-[10px] text-muted-foreground/80 truncate max-w-xs">{lead.lastActivityText}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
