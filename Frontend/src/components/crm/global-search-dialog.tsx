"use client";

import * as React from "react";
import {
  Search,
  Users,
  Building2,
  User,
  Phone,
  ArrowRight,
  Home,
  Plus,
  ListTodo,
  Columns3,
  Layers,
  Sparkles,
  Command,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Lead } from "@/types/crm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PipelineBadge, DealHealthBadge, LeadScoreBadge, UnitStatusBadge } from "@/components/ui/status-badge";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLead: (lead: Lead) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenQuickLog?: () => void;
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
  onSelectLead,
  onNavigateTab,
  onOpenQuickLog,
}: GlobalSearchDialogProps) {
  const { leads, projects, units, people } = useCRM();
  const [query, setQuery] = React.useState("");

  // Keyboard shortcut listener for Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  const matchedLeads = leads.filter(
    (l) =>
      l.personName.toLowerCase().includes(query.toLowerCase()) ||
      l.phone.includes(query) ||
      l.projectName.toLowerCase().includes(query.toLowerCase()) ||
      (l.assignedUnitNumber && l.assignedUnitNumber.toLowerCase().includes(query.toLowerCase()))
  );

  const matchedProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.regionName.toLowerCase().includes(query.toLowerCase())
  );

  const matchedUnits = units.filter(
    (u) =>
      u.unitNumber.toLowerCase().includes(query.toLowerCase()) ||
      u.tower.toLowerCase().includes(query.toLowerCase()) ||
      (u.assignedLeadName && u.assignedLeadName.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[560px] overflow-hidden rounded-xl">
        <div className="flex items-center px-4 border-b border-border bg-card">
          <Search className="h-4 w-4 text-muted-foreground mr-2.5 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, units (e.g. C-1402), projects, or commands..."
            className="h-12 w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <kbd className="text-[10px] font-mono border border-border bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions (when query is short or matches keywords) */}
          {query.trim().length === 0 && (
            <div className="space-y-1">
              <div className="px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Quick Command Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-1.5 px-1">
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    if (onOpenQuickLog) onOpenQuickLog();
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40 hover:bg-secondary text-xs text-left transition-colors text-foreground font-medium"
                >
                  <Plus className="h-3.5 w-3.5 text-primary" />
                  <span>Log Activity / Call</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    if (onNavigateTab) onNavigateTab("tasks");
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40 hover:bg-secondary text-xs text-left transition-colors text-foreground font-medium"
                >
                  <ListTodo className="h-3.5 w-3.5 text-amber-600" />
                  <span>Calling Queue</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    if (onNavigateTab) onNavigateTab("pipeline");
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40 hover:bg-secondary text-xs text-left transition-colors text-foreground font-medium"
                >
                  <Columns3 className="h-3.5 w-3.5 text-purple-600" />
                  <span>Pipeline Board</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    if (onNavigateTab) onNavigateTab("projects");
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40 hover:bg-secondary text-xs text-left transition-colors text-foreground font-medium"
                >
                  <Layers className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Unit Inventory Matrix</span>
                </button>
              </div>
            </div>
          )}

          {/* Matched Leads */}
          {matchedLeads.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Leads & Enquiries ({matchedLeads.length})
              </div>
              {matchedLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => {
                    onOpenChange(false);
                    onSelectLead(lead);
                  }}
                  className="px-2.5 py-2 rounded-lg hover:bg-secondary/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <span>{lead.personName}</span>
                      <LeadScoreBadge score={lead.leadScore} label={lead.leadScoreLabel} />
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {formatPhone(lead.phone)} • {lead.projectName} {lead.assignedUnitNumber && `(Unit ${lead.assignedUnitNumber})`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-foreground text-xs">
                      {formatCurrencyINR(lead.budget)}
                    </span>
                    <PipelineBadge stage={lead.stage} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Matched Inventory Units */}
          {matchedUnits.length > 0 && query.trim().length > 0 && (
            <div className="space-y-1 pt-1.5 border-t border-border/50">
              <div className="px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Property Inventory Units ({matchedUnits.length})
              </div>
              {matchedUnits.slice(0, 4).map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => {
                    onOpenChange(false);
                    if (onNavigateTab) onNavigateTab("projects");
                  }}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-secondary/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Home className="h-3.5 w-3.5 text-primary" />
                    <div>
                      <span className="font-bold text-foreground">{unit.tower} • Unit {unit.unitNumber}</span>
                      <span className="text-[10px] text-muted-foreground block font-mono">
                        {unit.configuration} • {formatCurrencyINR(unit.price)}
                      </span>
                    </div>
                  </div>
                  <UnitStatusBadge status={unit.status} />
                </div>
              ))}
            </div>
          )}

          {/* Matched Projects */}
          {matchedProjects.length > 0 && (
            <div className="space-y-1 pt-1.5 border-t border-border/50">
              <div className="px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Projects ({matchedProjects.length})
              </div>
              {matchedProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onOpenChange(false);
                    if (onNavigateTab) onNavigateTab("projects");
                  }}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-secondary/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-bold text-foreground">{p.name}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{p.regionName} • {p.developer}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
