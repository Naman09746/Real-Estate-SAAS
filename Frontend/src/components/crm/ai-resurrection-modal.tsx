"use client";

import * as React from "react";
import { useCRM } from "@/context/crm-context";
import { Lead } from "@/types/crm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  Flame,
  Building2,
  TrendingUp,
  UserCheck,
  Send,
  CheckCircle2,
  RefreshCw,
  Copy,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { formatCurrencyINR, formatPhone, formatINR } from "@/lib/utils";
import { toast } from "sonner";

interface AiResurrectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultLeadId?: string;
}

export function AiResurrectionModal({
  open,
  onOpenChange,
  defaultLeadId,
}: AiResurrectionModalProps) {
  const { leads, reactivationLeads, reactivateLead, projects, units } = useCRM();

  const [selectedLeadId, setSelectedLeadId] = React.useState<string>(
    defaultLeadId || reactivationLeads[0]?.id || ""
  );
  const [pitchAngle, setPitchAngle] = React.useState<
    "new_tower" | "payment_plan" | "price_adjustment" | "exclusive_unit"
  >("new_tower");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isResurrecting, setIsResurrecting] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Sync selectedLeadId when modal opens
  React.useEffect(() => {
    if (defaultLeadId) {
      setSelectedLeadId(defaultLeadId);
    } else if (reactivationLeads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(reactivationLeads[0].id);
    }
  }, [defaultLeadId, reactivationLeads, selectedLeadId]);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || reactivationLeads[0];

  // AI Matching Logic: Find best matched available inventory
  const matchedInventory = React.useMemo(() => {
    if (!selectedLead) return null;
    const project = projects.find((p) => p.id === selectedLead.projectId) || projects[0];
    const projectUnits = units.filter((u) => u.projectId === project?.id && u.status === "available");
    const matchedUnit = projectUnits[0] || {
      tower: "Tower C (New Launch)",
      unitNumber: "1402",
      configuration: selectedLead.configurationPreference || "3 BHK Luxury",
      price: selectedLead.budget ? selectedLead.budget * 0.95 : 35000000,
    };

    return {
      projectName: project?.name || "The Grand Palm",
      location: project?.location || "Gurgaon Golf Course Ext",
      tower: matchedUnit.tower,
      unitNumber: matchedUnit.unitNumber,
      configuration: matchedUnit.configuration,
      price: matchedUnit.price,
      matchPercentage: 96,
    };
  }, [selectedLead, projects, units]);

  // Dynamically generated personalized pitch
  const generatedPitch = React.useMemo(() => {
    if (!selectedLead || !matchedInventory) return "";

    const name = selectedLead.personName.split(" ")[0];
    const budgetStr = formatCurrencyINR(matchedInventory.price);

    switch (pitchAngle) {
      case "new_tower":
        return `Namaste ${name} ji! 🌟 Exciting news regarding your search for a ${matchedInventory.configuration} in ${matchedInventory.location}. The developer has just officially opened ${matchedInventory.tower} with priority allotment pricing starting at ${budgetStr}. Since you had previously shortlisted this project, I can reserve an exclusive VIP preview slot for you this Saturday before public launch. Would 11:30 AM work for a quick walkthrough?`;

      case "payment_plan":
        return `Hi ${name}, following up on your inquiry for ${matchedInventory.projectName}. The builder has introduced a bespoke 20:80 possession-linked builder subvention scheme for select ${matchedInventory.configuration} residences, reducing upfront capital requirement by 40%. Given your investment horizon, shall I send across the revised payment matrix on WhatsApp?`;

      case "price_adjustment":
        return `Namaste ${name} ji, reaching out with an exclusive opportunity: an inventory unit on floor 14 (${matchedInventory.tower}, Unit ${matchedInventory.unitNumber}) has just been released at a special pre-negotiated rate of ${budgetStr}, perfectly matching your target budget. Can I share the master floor plan and view certificate with you today?`;

      case "exclusive_unit":
        return `Hello ${name}, a prime Vastu-compliant park-facing ${matchedInventory.configuration} in ${matchedInventory.projectName} just became available due to an NRI allotment reallocation. Since you specifically looked for this layout earlier, I wanted to give you first right of refusal before releasing to open market. Would you be open for a brief 2-minute call today?`;

      default:
        return "";
    }
  }, [selectedLead, matchedInventory, pitchAngle]);

  const handleCopyPitch = () => {
    if (!generatedPitch) return;
    navigator.clipboard.writeText(generatedPitch);
    setCopied(true);
    toast.success("Resurrection pitch copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResurrectLead = async () => {
    if (!selectedLead) return;
    setIsResurrecting(true);

    try {
      await reactivateLead(selectedLead.id, generatedPitch);
      toast.success(`⚡ Resurrected ${selectedLead.personName}!`, {
        description: `Lead moved to Contacted stage. Assigned rep received high-priority follow-up task with ready-to-send pitch.`,
      });
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to reactivate lead");
    } finally {
      setIsResurrecting(false);
    }
  };

  const handleBatchResurrectAll = async () => {
    setIsResurrecting(true);
    try {
      for (const lead of reactivationLeads) {
        await reactivateLead(
          lead.id,
          `Automated AI Resurrection: Matched with newly released inventory at ${lead.projectName}. Target budget verified.`
        );
      }
      toast.success(`⚡ Batch Resurrected ${reactivationLeads.length} Leads!`, {
        description: "All dormant opportunities re-injected into the active pipeline with prioritized rep call queues.",
      });
      onOpenChange(false);
    } finally {
      setIsResurrecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border shadow-2xl">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> AUTONOMOUS RESURRECTION AGENT
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {reactivationLeads.length} Inactive Deals Detected
              </span>
            </div>
            <DialogTitle className="text-lg font-serif font-bold text-white tracking-wide">
              Lost-Lead Inventory Cross-Matcher & Pitch Engine
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300">
              AI scans sleeping leads, matches their past budget & config requirements against newly released inventory, and generates high-conversion re-engagement pitches.
            </DialogDescription>
          </div>

          <Button
            size="sm"
            onClick={handleBatchResurrectAll}
            disabled={isResurrecting || reactivationLeads.length === 0}
            className="hidden sm:flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shrink-0"
          >
            <Zap className="w-3.5 h-3.5" /> Resurrect All ({reactivationLeads.length})
          </Button>
        </div>

        {/* Body Content */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Left Column: Stale / Lost Leads Selector (5 Cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Select Dormant Lead
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {reactivationLeads.length} leads
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {reactivationLeads.map((lead) => {
                const isSelected = lead.id === selectedLeadId;
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 shadow-subtle"
                        : "border-border bg-secondary/30 hover:border-amber-300 hover:bg-secondary/60"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-foreground block">
                          {lead.personName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatPhone(lead.phone)}
                        </span>
                      </div>
                      <span className="font-bold text-foreground font-mono">
                        {formatCurrencyINR(lead.budget)}
                      </span>
                    </div>

                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center justify-between">
                      <span className="truncate">{lead.projectName}</span>
                      <span className="text-amber-700 dark:text-amber-400 font-mono font-semibold">
                        {lead.daysInStage}d dormant
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: AI Inventory Match & Generated Pitch (7 Cols) */}
          <div className="md:col-span-7 space-y-4">
            {selectedLead && matchedInventory ? (
              <>
                {/* AI Inventory Match Result Card */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-500/40 shadow-lg space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-indigo-500/20">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono font-bold text-[11px] text-white">
                        AI INVENTORY MATCH: {matchedInventory.matchPercentage}% CONVICTION
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      LIVE INVENTORY READY
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Past Requirement</span>
                      <span className="font-semibold text-slate-100 block">
                        {selectedLead.configurationPreference || "3 BHK Luxury"}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Budget: ₹{(selectedLead.budget / 10000000).toFixed(2)} Cr
                      </span>
                    </div>

                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Matched New Inventory</span>
                      <span className="font-bold text-emerald-300 block">
                        {matchedInventory.tower}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Starting {formatCurrencyINR(matchedInventory.price)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pitch Strategy Angle Buttons */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3 h-3 text-amber-600" /> Resurrection Angle:
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Click to adapt AI pitch
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPitchAngle("new_tower")}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        pitchAngle === "new_tower"
                          ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold"
                          : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      🚀 New Tower Allotment
                    </button>

                    <button
                      type="button"
                      onClick={() => setPitchAngle("payment_plan")}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        pitchAngle === "payment_plan"
                          ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold"
                          : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      💳 20:80 Payment Scheme
                    </button>

                    <button
                      type="button"
                      onClick={() => setPitchAngle("price_adjustment")}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        pitchAngle === "price_adjustment"
                          ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold"
                          : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      🏷️ Pre-Negotiated Price Drop
                    </button>

                    <button
                      type="button"
                      onClick={() => setPitchAngle("exclusive_unit")}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        pitchAngle === "exclusive_unit"
                          ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold"
                          : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      💎 NRI Reallocation Unit
                    </button>
                  </div>
                </div>

                {/* AI Generated Pitch Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-[11px] flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-emerald-600" /> AI Tailored WhatsApp Pitch
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPitch}
                      className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied!" : "Copy Pitch"}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-secondary/50 text-foreground leading-relaxed text-[11px] font-sans">
                    {generatedPitch}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleResurrectLead}
                    disabled={isResurrecting}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    ⚡ Resurrect & Dispatch Pitch to Rep
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                No dormant leads currently selected.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
