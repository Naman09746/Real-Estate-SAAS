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
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Lead, PipelineStage } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { PipelineBadge, TaskStatusBadge } from "@/components/ui/status-badge";
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
  const { activities, updateLeadStage } = useCRM();

  if (!lead) return null;

  const leadActivities = activities.filter((a) => a.leadId === lead.id);

  const stages: { id: PipelineStage; label: string }[] = [
    { id: "new", label: "New" },
    { id: "contacted", label: "Contacted" },
    { id: "qualified", label: "Qualified" },
    { id: "site_visit", label: "Site Visit" },
    { id: "negotiation", label: "Negotiation" },
    { id: "won", label: "Won" },
    { id: "lost", label: "Lost" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto p-5 space-y-4">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-foreground">
                  {lead.personName}
                </DialogTitle>
                <PipelineBadge stage={lead.stage} />
              </div>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                {formatPhone(lead.phone)} {lead.email && `• ${lead.email}`}
              </div>
            </div>

            {/* Direct Quick Actions */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 mr-1" />
                Call
              </a>
              <a
                href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                WhatsApp
              </a>
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  onOpenChange(false);
                  onLogActivity(lead.id);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Log Activity
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Lead Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg border border-border bg-secondary/30 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Project</span>
            <span className="font-semibold text-foreground">{lead.projectName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Region</span>
            <span className="font-semibold text-foreground">{lead.regionName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Budget</span>
            <span className="font-semibold text-foreground">{formatCurrencyINR(lead.budget)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Salesperson</span>
            <span className="font-semibold text-foreground">{lead.salespersonName}</span>
          </div>
        </div>

        {/* Pipeline Stage Quick Switcher */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Pipeline Stage Transition</label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
            {stages.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => updateLeadStage(lead.id, st.id)}
                className={`py-1 px-1.5 rounded text-[11px] font-medium border text-center transition-all ${
                  lead.stage === st.id
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-subtle"
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
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Activity History & Timeline ({leadActivities.length})
            </h4>
            <span className="text-[11px] text-muted-foreground">Immutable Audit Log</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {leadActivities.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground rounded border border-dashed border-border">
                No activity logged yet for this lead.
              </div>
            ) : (
              leadActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-lg border border-border bg-card text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold capitalize text-foreground">
                        {act.type}
                      </span>
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

                  {act.notes && (
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      "{act.notes}"
                    </p>
                  )}

                  <div className="text-[10px] text-muted-foreground/80 flex items-center justify-between pt-0.5">
                    <span>Logged by {act.userName}</span>
                    {act.scheduledFollowUpAt && (
                      <span className="text-amber-700 font-medium">
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
