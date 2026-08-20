"use client";

import * as React from "react";
import { Search, Users, Building2, User, Phone, ArrowRight } from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Lead } from "@/types/crm";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PipelineBadge } from "@/components/ui/status-badge";
import { formatPhone } from "@/lib/utils";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLead: (lead: Lead) => void;
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
  onSelectLead,
}: GlobalSearchDialogProps) {
  const { leads, projects } = useCRM();
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
      l.projectName.toLowerCase().includes(query.toLowerCase())
  );

  const matchedProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[500px] overflow-hidden rounded-xl">
        <div className="flex items-center px-3.5 border-b border-border bg-card">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, phone numbers, projects..."
            className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <kbd className="text-[10px] font-mono border border-border bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-3">
          {/* Leads */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Leads ({matchedLeads.length})
            </div>
            {matchedLeads.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">No matching leads</div>
            ) : (
              matchedLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => {
                    onOpenChange(false);
                    onSelectLead(lead);
                  }}
                  className="px-2.5 py-2 rounded-lg hover:bg-secondary/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground">{lead.personName}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {formatPhone(lead.phone)} • {lead.projectName}
                    </div>
                  </div>
                  <PipelineBadge stage={lead.stage} />
                </div>
              ))
            )}
          </div>

          {/* Projects */}
          <div className="space-y-1 pt-2 border-t border-border/50">
            <div className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Projects ({matchedProjects.length})
            </div>
            {matchedProjects.map((p) => (
              <div
                key={p.id}
                className="px-2.5 py-1.5 rounded-lg hover:bg-secondary/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{p.name}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{p.regionName}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
