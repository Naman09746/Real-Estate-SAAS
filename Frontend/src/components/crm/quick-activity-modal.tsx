"use client";

import * as React from "react";
import { CheckCircle2, Phone, MessageSquare, Calendar, Building2 } from "lucide-react";
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
import { formatPhone } from "@/lib/utils";

interface QuickActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultLeadId?: string;
}

export function QuickActivityModal({
  open,
  onOpenChange,
  defaultLeadId,
}: QuickActivityModalProps) {
  const { leads, logActivity } = useCRM();
  const [selectedLeadId, setSelectedLeadId] = React.useState<string>(defaultLeadId || "");
  const [activityType, setActivityType] = React.useState<ActivityType>("call");
  const [outcome, setOutcome] = React.useState<CallOutcome>("interested");
  const [notes, setNotes] = React.useState("");
  const [nextFollowUp, setNextFollowUp] = React.useState("Tomorrow, 11:00 AM");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (defaultLeadId) {
      setSelectedLeadId(defaultLeadId);
    } else if (leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0].id);
    }
  }, [defaultLeadId, leads, selectedLeadId]);

  const activeLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;

    setIsSubmitting(true);
    await logActivity({
      leadId: activeLead.id,
      type: activityType,
      outcome: activityType === "call" ? outcome : undefined,
      outcomeLabel:
        outcome === "site_visit_booked"
          ? "Site Visit Booked"
          : outcome === "call_back"
          ? "Call Back Later"
          : outcome === "not_interested"
          ? "Not Interested"
          : "Interested",
      notes,
      nextFollowUp,
    });

    setIsSubmitting(false);
    onOpenChange(false);
    setNotes("");
  };

  const outcomes: { id: CallOutcome; label: string }[] = [
    { id: "interested", label: "Interested" },
    { id: "site_visit_booked", label: "Site Visit Booked" },
    { id: "call_back", label: "Call Back Later" },
    { id: "not_interested", label: "Not Interested" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-5">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">10-Second Activity Logger</DialogTitle>
            <Badge variant="outline" className="text-[10px] font-medium">Fast Disposition</Badge>
          </div>
          <DialogDescription className="text-xs">
            Log call or meeting outcome with automatic follow-up task creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-3">
          {/* Target Lead Selector / Summary */}
          <div className="space-y-1">
            <Label>Selected Lead</Label>
            <div className="p-2.5 rounded-lg border border-border bg-secondary/40 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground">{activeLead?.personName}</div>
                <div className="text-muted-foreground font-mono text-[11px]">
                  {formatPhone(activeLead?.phone)} • {activeLead?.projectName}
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {activeLead?.regionName}
              </Badge>
            </div>
          </div>

          {/* Activity Type Switcher */}
          <div className="space-y-1">
            <Label>Activity Channel</Label>
            <div className="grid grid-cols-3 gap-1.5">
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
                    className={`h-8 px-2 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-semibold shadow-subtle"
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

          {/* Call Outcome Grid */}
          {activityType === "call" && (
            <div className="space-y-1.5">
              <Label required>Call Outcome</Label>
              <div className="grid grid-cols-2 gap-2">
                {outcomes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOutcome(item.id)}
                    className={`h-9 px-3 text-xs font-medium rounded-md border transition-all text-left flex items-center justify-between ${
                      outcome === item.id
                        ? "border-primary bg-primary text-primary-foreground font-semibold shadow-subtle"
                        : "border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span>{item.label}</span>
                    {outcome === item.id && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Note */}
          <div className="space-y-1">
            <Label htmlFor="act-note">Brief Notes (Optional)</Label>
            <Textarea
              id="act-note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Discussed 3BHK tower B, interested in loan assistance..."
              rows={2}
              className="text-xs"
            />
          </div>

          {/* Next Follow-Up */}
          <div className="space-y-1">
            <Label htmlFor="act-fup">Next Follow-Up</Label>
            <Input
              id="act-fup"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              placeholder="e.g. Tomorrow 11:00 AM"
              className="text-xs h-8"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Save Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
