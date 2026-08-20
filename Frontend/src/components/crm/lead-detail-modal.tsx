"use client";

import * as React from "react";
import {
  Phone,
  MessageSquare,
  Building2,
  Calendar,
  Clock,
  User,
  MapPin,
  Tag,
  CheckCircle2,
  AlertCircle,
  Plus,
  Flame,
  ShieldAlert,
  Home,
  Compass,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Lead, PipelineStage } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { PipelineBadge, TaskStatusBadge, DealHealthBadge, LeadScoreBadge, UnitStatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";

interface LeadDetailModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogActivity: (leadId: string) => void;
}

export function LeadDetailModal({
  lead,
  open,
  onOpenChange,
  onLogActivity,
}: LeadDetailModalProps) {
  const { activities, updateLeadStage, units, assignUnitToLead } = useCRM();

  if (!lead) return null;

  const leadActivities = activities.filter((a) => a.leadId === lead.id);
  const projectUnits = units.filter((u) => u.projectId === lead.projectId);

  const stages: { id: PipelineStage; label: string }[] = [
    { id: "new", label: "New" },
    { id: "contacted", label: "Contacted" },
    { id: "qualified", label: "Qualified" },
    { id: "site_visit", label: "Site Visit" },
    { id: "negotiation", label: "Negotiation" },
    { id: "won", label: "Won Deals" },
    { id: "lost", label: "Lost" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[92vh] overflow-y-auto p-5 space-y-4">
        {/* Header with Name, Stage, and Quick Call / WhatsApp */}
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl font-bold text-foreground">
                  {lead.personName}
                </DialogTitle>
                <PipelineBadge stage={lead.stage} />
                <DealHealthBadge health={lead.dealHealth} reason={lead.dealHealthReason} />
                <LeadScoreBadge score={lead.leadScore} label={lead.leadScoreLabel} />
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {formatPhone(lead.phone)} {lead.email && `• ${lead.email}`} • Source: <strong>{lead.source}</strong>
              </div>
            </div>

            {/* Direct Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 mr-1" />
                Call
              </a>
              <a
                href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                WhatsApp
              </a>
              <Button
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={() => {
                  onOpenChange(false);
                  onLogActivity(lead.id);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Log
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Action Intelligence Card (Next Recommended Action) */}
        <div className="p-3 rounded-xl border border-primary/20 bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground block">
              Next Action & Strategy
            </span>
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>{lead.nextFollowUpAt || "Follow-up required"}</span>
              <TaskStatusBadge status={lead.followUpStatus || "upcoming"} />
            </div>
            {lead.recommendedAction && (
              <p className="text-[11px] text-muted-foreground">
                Target: <strong className="text-foreground">{lead.recommendedAction}</strong>
              </p>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs self-start sm:self-center font-medium"
            onClick={() => {
              onOpenChange(false);
              onLogActivity(lead.id);
            }}
          >
            Update Next Follow-up
          </Button>
        </div>

        {/* Lead Metadata Grid & Property Interest */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl border border-border bg-card text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Project</span>
            <span className="font-bold text-foreground text-sm">{lead.projectName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Budget (INR)</span>
            <span className="font-bold text-foreground font-mono text-sm">{formatCurrencyINR(lead.budget)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Region Hub</span>
            <span className="font-semibold text-foreground">{lead.regionName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Sales Rep</span>
            <span className="font-semibold text-foreground">{lead.salespersonName}</span>
          </div>
        </div>

        {/* Property & Unit Inventory Allocation */}
        <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5 text-primary" />
              Property Preference & Inventory Allocation
            </span>
            <span className="text-muted-foreground text-[11px]">{lead.configurationPreference || "3/4 BHK Luxury"}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">
                Link Inventory Unit
              </label>
              <select
                value={lead.assignedUnitId || ""}
                onChange={(e) => assignUnitToLead(lead.id, e.target.value)}
                className="w-full h-8 px-2 rounded-md border border-border bg-secondary/50 text-foreground font-medium text-xs focus:outline-none"
              >
                <option value="">No unit assigned yet</option>
                {projectUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.tower} - {u.unitNumber} ({u.configuration} · {formatCurrencyINR(u.price)} · {u.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {lead.assignedUnitNumber && (
              <div className="p-2 rounded-lg border border-border bg-secondary/30 text-xs">
                <span className="text-muted-foreground text-[10px] block">Current Assignment:</span>
                <span className="font-bold text-foreground font-mono">Unit {lead.assignedUnitNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Stage Quick Switcher */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Pipeline Stage Transition</label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
            {stages.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => updateLeadStage(lead.id, st.id)}
                className={`py-1.5 px-1 rounded text-xs font-medium border text-center transition-all ${
                  lead.stage === st.id
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-subtle"
                    : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chronological Activity Timeline */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Activity History & Audit Trail ({leadActivities.length})
            </h4>
            <span className="text-[11px] text-muted-foreground font-mono">Immutable Log</span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {leadActivities.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground rounded-lg border border-dashed border-border">
                No activity logged yet for this lead.
              </div>
            ) : (
              leadActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg border border-border bg-card text-xs space-y-1"
                >
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

                  {act.notes && (
                    <p className="text-muted-foreground text-[11px] leading-relaxed bg-secondary/30 p-1.5 rounded">
                      "{act.notes}"
                    </p>
                  )}

                  <div className="text-[10px] text-muted-foreground/80 flex items-center justify-between pt-0.5">
                    <span>Logged by <strong>{act.userName}</strong></span>
                    {act.scheduledFollowUpAt && (
                      <span className="text-amber-800 font-semibold font-mono">
                        Next: {act.scheduledFollowUpAt}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

