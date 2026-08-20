"use client";

import * as React from "react";
import {
  CheckCircle2,
  Phone,
  MessageSquare,
  Building2,
  Clock,
  Sparkles,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActivityType } from "@/types/crm";
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
  | "Negotiating"
  | "Site Visit Booked"
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
  const [nextActionOption, setNextActionOption] = React.useState("Tomorrow 10:00 AM");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (defaultLeadId) {
      setSelectedLeadId(defaultLeadId);
    } else if (leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0].id);
    }
  }, [defaultLeadId, leads, selectedLeadId]);

  const activeLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const structuredOutcomes: { id: StructuredOutcome; label: string }[] = [
    { id: "Connected", label: "Connected" },
    { id: "No Answer", label: "No Answer" },
    { id: "Interested", label: "Interested" },
    { id: "Negotiating", label: "Negotiating" },
    { id: "Site Visit Booked", label: "Site Visit" },
    { id: "Not Interested", label: "Not Interested" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;

    setIsSubmitting(true);

    await logActivity({
      leadId: activeLead.id,
      type: activityType,
      outcome: outcome === "Site Visit Booked"
        ? "site_visit_booked"
        : outcome === "Not Interested"
        ? "not_interested"
        : outcome === "No Answer"
        ? "ringing_no_response"
        : outcome === "Negotiating"
        ? "interested"
        : "interested",
      outcomeLabel: outcome === "Site Visit Booked" ? "Site Visit Booked" : outcome,
      notes: notes || `${outcome} recorded during ${activityType} touchpoint.`,
      nextFollowUp: outcome === "Not Interested" || nextActionOption === "None" ? undefined : nextActionOption,
    });

    setIsSubmitting(false);
    onOpenChange(false);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-5 rounded-2xl shadow-modal border border-border space-y-4">
        {/* Header with Buyer & Deal Info */}
        <div className="pb-3 border-b border-border flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground">{activeLead?.personName}</h2>
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <span>{activeLead?.projectName}</span>
              <span>•</span>
              <span className="font-mono font-bold text-foreground">{formatCurrencyINR(activeLead?.budget || 0)}</span>
              {activeLead?.assignedUnitNumber && (
                <>
                  <span>•</span>
                  <span className="bg-secondary px-1.5 py-0.2 rounded font-mono text-[10px] text-foreground font-bold">
                    Unit {activeLead.assignedUnitNumber}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Channel Pill */}
          <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border">
            {[
              { type: "call" as ActivityType, icon: Phone, title: "Call" },
              { type: "whatsapp" as ActivityType, icon: MessageSquare, title: "WhatsApp" },
              { type: "site_visit" as ActivityType, icon: Building2, title: "Visit" },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activityType === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setActivityType(item.type)}
                  title={item.title}
                  className={`p-1.5 rounded-md transition-all ${
                    isSelected ? "bg-card text-foreground shadow-subtle" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* What happened? 6-Pill Outcome Grid */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">What happened?</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {structuredOutcomes.map((item) => {
                const isSelected = outcome === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setOutcome(item.id);
                      if (item.id === "Site Visit Booked") {
                        setNextActionOption("Site Visit · Tomorrow 11:00 AM");
                      } else if (item.id === "Not Interested") {
                        setNextActionOption("None");
                      }
                    }}
                    className={`h-8 px-2 rounded-lg text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1 ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-subtle font-bold"
                        : "border-border bg-card text-foreground hover:bg-secondary hover:border-border/80"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-1">
            <Label htmlFor="quick-notes" className="text-xs font-bold text-foreground">Notes</Label>
            <Input
              id="quick-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Discussed Tower C 4BHK pricing, client visiting Sunday with family"
              className="h-8 text-xs bg-secondary/30 focus:bg-card"
              autoFocus
            />
          </div>

          {/* Next Action Selector */}
          <div className="space-y-1">
            <Label htmlFor="next-action-select" className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Next action
            </Label>
            <select
              id="next-action-select"
              value={nextActionOption}
              onChange={(e) => setNextActionOption(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg border border-border bg-secondary/30 text-xs font-medium text-foreground focus:outline-none focus:bg-card"
            >
              <option value="Tomorrow 10:00 AM">Tomorrow 10:00 AM</option>
              <option value="Tomorrow 02:30 PM">Tomorrow 02:30 PM</option>
              <option value="Site Visit · Tomorrow 11:00 AM">Site Visit · Tomorrow 11:00 AM</option>
              <option value="In 3 days, 11:30 AM">In 3 days (11:30 AM)</option>
              <option value="In 1 week, 12:00 PM">In 1 week (12:00 PM)</option>
              <option value="None">No Follow-up Scheduled</option>
            </select>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="h-8 px-4 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-subtle"
            >
              Save & Schedule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

