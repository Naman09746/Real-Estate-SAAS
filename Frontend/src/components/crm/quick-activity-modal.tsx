"use client";

import * as React from "react";
import {
  CheckCircle2,
  Phone,
  MessageSquare,
  Calendar,
  Building2,
  Clock,
  Sparkles,
  ChevronRight,
  User,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CallOutcome, ActivityType } from "@/types/crm";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";

interface QuickActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultLeadId?: string;
}

export type StructuredOutcome =
  | "Connected"
  | "No Answer"
  | "Interested"
  | "Site Visit Booked"
  | "Negotiating"
  | "Follow-up Required"
  | "Not Interested";

export function QuickActivityModal({
  open,
  onOpenChange,
  defaultLeadId,
}: QuickActivityModalProps) {
  const { leads, logActivity } = useCRM();
  const [selectedLeadId, setSelectedLeadId] = React.useState<string>(defaultLeadId || "");
  const [activityType, setActivityType] = React.useState<ActivityType>("call");
  const [outcome, setOutcome] = React.useState<StructuredOutcome>("Interested");
  const [notes, setNotes] = React.useState("");
  const [followUpPreset, setFollowUpPreset] = React.useState<"tomorrow" | "3days" | "1week" | "custom">("tomorrow");
  const [customFollowUp, setCustomFollowUp] = React.useState("Tomorrow, 11:00 AM");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (defaultLeadId) {
      setSelectedLeadId(defaultLeadId);
    } else if (leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0].id);
    }
  }, [defaultLeadId, leads, selectedLeadId]);

  const activeLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const structuredOutcomes: { id: StructuredOutcome; label: string; color: string }[] = [
    { id: "Connected", label: "Connected", color: "hover:border-blue-400" },
    { id: "Interested", label: "Interested", color: "hover:border-emerald-400" },
    { id: "Site Visit Booked", label: "Site Visit Booked", color: "hover:border-purple-400" },
    { id: "Negotiating", label: "Negotiating", color: "hover:border-amber-400" },
    { id: "Follow-up Required", label: "Follow-up Required", color: "hover:border-amber-400" },
    { id: "No Answer", label: "No Answer / Ringing", color: "hover:border-slate-400" },
    { id: "Not Interested", label: "Not Interested", color: "hover:border-rose-400" },
  ];

  const getResolvedFollowUp = () => {
    if (followUpPreset === "tomorrow") return "Tomorrow, 11:00 AM";
    if (followUpPreset === "3days") return "In 3 days, 11:30 AM";
    if (followUpPreset === "1week") return "In 1 week, 12:00 PM";
    return customFollowUp;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;

    setIsSubmitting(true);
    const resolvedFollowUp = getResolvedFollowUp();

    await logActivity({
      leadId: activeLead.id,
      type: activityType,
      outcome: outcome === "Site Visit Booked"
        ? "site_visit_booked"
        : outcome === "Not Interested"
        ? "not_interested"
        : outcome === "No Answer"
        ? "ringing_no_response"
        : "interested",
      outcomeLabel: outcome,
      notes: notes || `${outcome} recorded during ${activityType} touchpoint.`,
      nextFollowUp: resolvedFollowUp,
    });

    setIsSubmitting(false);
    onOpenChange(false);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-5 rounded-2xl shadow-modal border border-border space-y-3">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <DialogTitle className="text-base font-bold text-foreground">Rapid 10-Second Activity Logger</DialogTitle>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              CALL → LOG → SCHEDULE
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Fast disposition with instant follow-up commitment generation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Target Lead Selector */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-foreground">Target Buyer / Deal</Label>
            <div className="p-2.5 rounded-xl border border-border bg-secondary/40 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-foreground text-sm">{activeLead?.personName}</div>
                <div className="text-muted-foreground font-mono text-[11px]">
                  {formatPhone(activeLead?.phone)} • {activeLead?.projectName}
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-foreground font-mono">{formatCurrencyINR(activeLead?.budget || 0)}</span>
                <span className="text-[10px] text-muted-foreground block">{activeLead?.stage.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Activity Channel */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-foreground">Channel</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "call" as ActivityType, label: "Phone Call", icon: Phone },
                { type: "whatsapp" as ActivityType, label: "WhatsApp", icon: MessageSquare },
                { type: "site_visit" as ActivityType, label: "Site Visit", icon: Building2 },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = activityType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setActivityType(item.type)}
                    className={`h-9 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-subtle"
                        : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Structured Outcomes Grid */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Interaction Outcome</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {structuredOutcomes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOutcome(item.id)}
                  className={`h-8 px-2 rounded-lg text-xs font-medium border transition-all text-left truncate flex items-center justify-between ${
                    outcome === item.id
                      ? "border-primary bg-primary text-primary-foreground font-bold shadow-subtle"
                      : `border-border bg-card text-foreground ${item.color}`
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {outcome === item.id && <CheckCircle2 className="h-3 w-3 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Next Action Scheduling (1-Click Presets) */}
          <div className="space-y-1.5 p-3 rounded-xl border border-primary/20 bg-secondary/30">
            <Label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Next Action Commitment
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">Auto-generates task</span>
            </Label>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "tomorrow" as const, label: "Tomorrow" },
                { id: "3days" as const, label: "In 3 Days" },
                { id: "1week" as const, label: "In 1 Week" },
                { id: "custom" as const, label: "Custom" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setFollowUpPreset(preset.id)}
                  className={`h-8 rounded-lg text-[11px] font-semibold border transition-all ${
                    followUpPreset === preset.id
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-subtle"
                      : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {followUpPreset === "custom" && (
              <Input
                value={customFollowUp}
                onChange={(e) => setCustomFollowUp(e.target.value)}
                placeholder="e.g. Next Monday, 2:30 PM"
                className="text-xs h-8 mt-1.5 bg-card"
                autoFocus
              />
            )}
          </div>

          {/* Brief Notes (Optional) */}
          <div className="space-y-1">
            <Label htmlFor="act-note" className="text-xs font-medium text-muted-foreground">
              Conversation Note (Optional)
            </Label>
            <Input
              id="act-note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent Tower C floor plan, client ready for weekend visit"
              className="text-xs h-8 bg-card"
            />
          </div>

          <DialogFooter className="pt-2 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting} className="font-bold">
              Save & Schedule Next Action
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

