"use client";

import * as React from "react";
import { useCRM } from "@/context/crm-context";
import { Lead, PipelineStage } from "@/types/crm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";
import { Building2, User, Phone, MessageSquare, ArrowRight } from "lucide-react";
import { PipelineBadge } from "@/components/ui/status-badge";

const STAGES: { id: PipelineStage; label: string; headerColor: string }[] = [
  { id: "new", label: "New", headerColor: "border-slate-300 bg-slate-50" },
  { id: "contacted", label: "Contacted", headerColor: "border-blue-300 bg-blue-50" },
  { id: "qualified", label: "Qualified", headerColor: "border-indigo-300 bg-indigo-50" },
  { id: "site_visit", label: "Site Visit", headerColor: "border-amber-300 bg-amber-50" },
  { id: "negotiation", label: "Negotiation", headerColor: "border-purple-300 bg-purple-50" },
  { id: "won", label: "Won Deals", headerColor: "border-emerald-300 bg-emerald-50" },
  { id: "lost", label: "Lost", headerColor: "border-rose-300 bg-rose-50" },
];

export function PipelineBoard({ onSelectLead }: { onSelectLead: (lead: Lead) => void }) {
  const { filteredLeads, updateLeadStage } = useCRM();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Deals & Opportunities Pipeline</h2>
          <p className="text-xs text-muted-foreground">Kanban view with instant stage transitions and Indian pricing</p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          Total {filteredLeads.length} Leads
        </Badge>
      </div>

      {/* Horizontal Scrollable Kanban Columns */}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1">
        {STAGES.map((st) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === st.id);
          const stageTotalValue = stageLeads.reduce((acc, curr) => acc + (curr.budget || 0), 0);

          return (
            <div
              key={st.id}
              className="w-72 shrink-0 rounded-xl border border-border bg-secondary/30 flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className={`p-3 rounded-t-xl border-b border-border/80 ${st.headerColor} flex items-center justify-between`}>
                <div>
                  <span className="font-semibold text-xs text-foreground block">{st.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatCurrencyINR(stageTotalValue)}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {stageLeads.length}
                </Badge>
              </div>

              {/* Column Cards */}
              <div className="p-2 space-y-2 overflow-y-auto flex-1">
                {stageLeads.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-muted-foreground rounded border border-dashed border-border/60">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="p-3 rounded-lg border border-border bg-card shadow-subtle hover:border-border/90 cursor-pointer space-y-2 text-xs transition-all hover:shadow-card"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="font-semibold text-foreground">{lead.personName}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {formatPhone(lead.phone)}
                          </div>
                        </div>
                        <span className="font-bold text-foreground text-xs">
                          {formatCurrencyINR(lead.budget)}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1 text-foreground/80 truncate">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{lead.projectName}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span>{lead.regionName}</span>
                          <span>Rep: <strong>{lead.salespersonName.split(" ")[0]}</strong></span>
                        </div>
                      </div>

                      {/* Quick stage advance dropdown */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="pt-1.5 border-t border-border/50 flex items-center justify-between text-[11px]"
                      >
                        <span className="text-muted-foreground text-[10px]">Move to:</span>
                        <select
                          value={lead.stage}
                          onChange={(e) => updateLeadStage(lead.id, e.target.value as PipelineStage)}
                          className="text-[10px] font-medium h-6 rounded border border-border bg-secondary px-1 text-foreground focus:outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
