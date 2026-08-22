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
  Sparkles,
  Check,
  AlertTriangle,
  Layers,
  Car,
  Compass as CompassIcon,
  Users2,
  FileText,
  UploadCloud,
  FileCheck,
  Trash2,
  ExternalLink,
  Download,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Lead, PipelineStage, CRMDocument } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { PipelineBadge, TaskStatusBadge, DealHealthBadge, LeadScoreBadge, UnitStatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";
import { WhatsAppActionModal } from "@/components/crm/whatsapp-action-modal";

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
  const { activities, updateLeadStage, units, assignUnitToLead, documents, uploadDocument, deleteDocument } = useCRM();

  const [whatsappModalOpen, setWhatsappModalOpen] = React.useState(false);
  const [showUploadDocForm, setShowUploadDocForm] = React.useState(false);
  const [docTitle, setDocTitle] = React.useState("");
  const [docType, setDocType] = React.useState<CRMDocument["type"]>("kyc");
  const [docUrl, setDocUrl] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);

  if (!lead) return null;

  const leadActivities = activities.filter((a) => a.leadId === lead.id);
  const projectUnits = units.filter((u) => u.projectId === lead.projectId);
  const alternativeUnits = projectUnits.filter(
    (u) => u.id !== lead.assignedUnitId && u.status === "available"
  );

  // Documents attached to this lead or this project
  const leadDocuments = documents.filter((d) => d.leadId === lead.id);
  const projectDocuments = documents.filter((d) => d.projectId === lead.projectId);

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    setIsUploading(true);
    await uploadDocument({
      title: docTitle.trim(),
      type: docType,
      leadId: lead.id,
      projectId: lead.projectId,
      fileUrl: docUrl.trim() || `https://storage.callcrm.in/vault/${docTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`,
    });

    setDocTitle("");
    setDocUrl("");
    setShowUploadDocForm(false);
    setIsUploading(false);
  };

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
    <>
      <WhatsAppActionModal
        lead={lead}
        open={whatsappModalOpen}
        onOpenChange={setWhatsappModalOpen}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[780px] max-h-[92vh] overflow-y-auto p-6 space-y-5 rounded-2xl border border-border shadow-modal">
          {/* 1. HEADER WITH IDENTITY, STAGE, HEALTH, AND ACTIONS */}
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-xl font-bold text-foreground">
                    {lead.personName}
                  </DialogTitle>
                  <PipelineBadge stage={lead.stage} />
                  <LeadScoreBadge score={lead.leadScore} label={lead.leadScoreLabel} />
                  <DealHealthBadge health={lead.dealHealth} reason={lead.dealHealthReason} />
                </div>
                <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                  <span>{formatPhone(lead.phone)}</span>
                  {lead.email && <span>• {lead.email}</span>}
                  <span>• Rep: <strong>{lead.salespersonName}</strong></span>
                </div>
              </div>

              {/* Direct 1-Click Operational Action Bar */}
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <a
                  href={`tel:${lead.phone}`}
                  className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 mr-1" />
                  Call
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-semibold border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  onClick={() => setWhatsappModalOpen(true)}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                  WhatsApp Assistant
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs font-semibold"
                  onClick={() => {
                    onOpenChange(false);
                    onLogActivity(lead.id);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Log Touchpoint
                </Button>
              </div>
            </div>
          </DialogHeader>

        {/* 2. REAL ESTATE SALES CONTEXT: STRATEGY & SUGGESTED NEXT MOVE */}
        <div className="p-4 rounded-xl border border-primary/20 bg-secondary/30 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Real Estate Sales Strategy & Next Move
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              Follow-up: <strong>{lead.nextFollowUpAt || "Today"}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-card border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Last Conversation Narrative:
              </span>
              <p className="text-foreground/90 font-medium leading-relaxed">
                {lead.lastConversationSummary || lead.lastActivityText || "Initial inquiry captured."}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-card border border-primary/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-primary block">
                Recommended Action:
              </span>
              <p className="text-foreground font-semibold leading-relaxed">
                {lead.suggestedNextMove || lead.recommendedAction || "Call customer to schedule next milestone."}
              </p>
            </div>
          </div>
        </div>

        {/* 3. BUYING SIGNALS & OBJECTIONS (REAL ESTATE SPECIFIC) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Buying Signals */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Confirmed Buying Signals
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(lead.buyingSignals || ["Pre-approved loan", "Site visit completed"]).map((sig, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-[11px] font-medium"
                >
                  ✓ {sig}
                </span>
              ))}
            </div>
          </div>

          {/* Objections */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              Active Objections / Friction
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(lead.objections || ["Evaluating competitor project"]).map((obj, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-amber-100/70 border border-amber-300 text-amber-900 text-[11px] font-medium"
                >
                  ⚠ {obj}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4. BUYER REQUIREMENTS PROFILE */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              Buyer Requirements Profile
            </span>
            <span className="text-xs font-mono font-bold text-foreground">
              Budget: {formatCurrencyINR(lead.budget)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Configuration</span>
              <span className="font-semibold text-foreground">{lead.configurationPreference || "3/4 BHK Luxury"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Floor Preference</span>
              <span className="font-semibold text-foreground">{lead.preferredFloor || "Middle to High"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Facing & Vastu</span>
              <span className="font-semibold text-foreground">{lead.facingPreference || "North-East / Park"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Parking Bay</span>
              <span className="font-semibold text-foreground">{lead.parkingRequirement || "2 Covered Bays"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Buyer Intent</span>
              <span className="font-semibold text-foreground">{lead.buyerIntent || "End Use"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Decision Makers</span>
              <span className="font-semibold text-foreground">{lead.decisionMakers || "Buyer + Family"}</span>
            </div>
          </div>
        </div>

        {/* 5. PROJECT, INVENTORY LINKAGE & ALTERNATIVE UNITS */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5 text-primary" />
              Target Project & Unit Allocation
            </span>
            <span className="text-xs font-semibold text-muted-foreground">{lead.projectName} ({lead.regionName})</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
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
              <div className="p-2 rounded-lg border border-primary/30 bg-primary/5 text-xs">
                <span className="text-muted-foreground text-[10px] block">Assigned Unit:</span>
                <span className="font-bold text-primary font-mono">Unit {lead.assignedUnitNumber}</span>
              </div>
            )}
          </div>

          {/* Alternative Available Units in this Project */}
          {alternativeUnits.length > 0 && (
            <div className="pt-2 border-t border-border/60">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1.5">
                Alternative Matching Inventory in {lead.projectName}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {alternativeUnits.slice(0, 2).map((alt) => (
                  <div
                    key={alt.id}
                    className="p-2 rounded-lg border border-border bg-secondary/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground font-mono">{alt.unitNumber}</span>
                      <span className="text-[11px] text-muted-foreground ml-1.5">({alt.configuration} · {alt.facing})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-foreground font-mono">{formatCurrencyINR(alt.price)}</span>
                      <button
                        type="button"
                        onClick={() => assignUnitToLead(lead.id, alt.id)}
                        className="text-[10px] text-primary font-bold hover:underline block"
                      >
                        Assign This Unit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 6. PIPELINE STAGE QUICK SWITCHER */}
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

        {/* 7. DOCUMENT VAULT & KYC FILES */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                Document Vault & KYC Files ({leadDocuments.length + projectDocuments.length})
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUploadDocForm(!showUploadDocForm)}
              className="h-7 text-[11px] font-semibold gap-1"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              {showUploadDocForm ? "Cancel" : "Upload File / KYC"}
            </Button>
          </div>

          {/* Quick Upload Form */}
          {showUploadDocForm && (
            <form onSubmit={handleUploadDoc} className="p-3 bg-secondary/40 rounded-lg border border-border space-y-2.5 animate-in fade-in-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Aadhar Card / Pan Card / Token Cheque Copy"
                    className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                    Document Category
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value="kyc">Buyer KYC (Aadhar/PAN)</option>
                    <option value="agreement">Booking Agreement / Cheque</option>
                    <option value="cost_sheet">Cost Sheet</option>
                    <option value="brochure">Project Brochure</option>
                    <option value="floor_plan">Floor Plan</option>
                    <option value="other">Other Document</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUploading}
                  className="h-7 text-xs font-semibold"
                >
                  <FileCheck className="h-3.5 w-3.5 mr-1" />
                  Save to Vault
                </Button>
              </div>
            </form>
          )}

          {/* Document list */}
          <div className="space-y-2">
            {leadDocuments.length === 0 && projectDocuments.length === 0 ? (
              <div className="p-3 text-center text-muted-foreground text-[11px] rounded-lg border border-dashed border-border">
                No KYC or project collateral files attached yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Lead-specific KYC / Agreements */}
                {leadDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-foreground truncate text-[11px]">{doc.title}</p>
                        <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                          {doc.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        title="Download / View"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteDocument(doc.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Project Collateral (Brochures / Floor Plans) */}
                {projectDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Download className="h-3.5 w-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-foreground truncate text-[11px]">{doc.title}</p>
                        <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                          Project {doc.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-muted-foreground hover:text-primary transition-colors shrink-0"
                      title="Download / Share with Buyer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 8. CHRONOLOGICAL ACTIVITY TIMELINE */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Activity History & Audit Trail ({leadActivities.length})
            </h4>
            <span className="text-[11px] text-muted-foreground font-mono">Immutable Log</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
                      &ldquo;{act.notes}&rdquo;
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
    </>
  );
}


