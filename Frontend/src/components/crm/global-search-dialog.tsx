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
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Lead, Project } from "@/types/crm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PipelineBadge, DealHealthBadge, LeadScoreBadge, UnitStatusBadge } from "@/components/ui/status-badge";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLead: (lead: Lead) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenQuickLog?: () => void;
  onOpenCreateLead?: () => void;
}

interface CommandItem {
  id: string;
  category: "command" | "lead" | "project" | "unit" | "person";
  title: string;
  subtitle?: string;
  badge?: string;
  icon: any;
  action: () => void;
  lead?: Lead;
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
  onSelectLead,
  onNavigateTab,
  onOpenQuickLog,
  onOpenCreateLead,
}: GlobalSearchDialogProps) {
  const { leads, projects, units, people, setSelectedProjectId } = useCRM();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

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

  // Reset search when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Build unified search items
  const items: CommandItem[] = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: CommandItem[] = [];

    // 1. Static & Dynamic Commands
    const commands: CommandItem[] = [
      {
        id: "cmd-create-lead",
        category: "command",
        title: "Create New Lead Entry",
        subtitle: "Add fresh real-estate buyer inquiry",
        icon: Plus,
        action: () => {
          onOpenChange(false);
          if (onNavigateTab) onNavigateTab("leads");
          if (onOpenCreateLead) onOpenCreateLead();
        },
      },
      {
        id: "cmd-log-call",
        category: "command",
        title: "Log Call / WhatsApp Activity",
        subtitle: "10-second rapid touchpoint recording",
        icon: Phone,
        action: () => {
          onOpenChange(false);
          if (onOpenQuickLog) onOpenQuickLog();
        },
      },
      {
        id: "cmd-overdue",
        category: "command",
        title: "Show Overdue Calling Queue",
        subtitle: "Critical follow-ups needing instant outreach",
        badge: "🔴 Urgency",
        icon: AlertTriangle,
        action: () => {
          onOpenChange(false);
          if (onNavigateTab) onNavigateTab("tasks");
        },
      },
      {
        id: "cmd-pipeline",
        category: "command",
        title: "Go to Sales Pipeline Board",
        subtitle: "Kanban deal distribution & stage matrix",
        icon: Columns3,
        action: () => {
          onOpenChange(false);
          if (onNavigateTab) onNavigateTab("pipeline");
        },
      },
      {
        id: "cmd-inventory",
        category: "command",
        title: "Open Unit Inventory Matrix",
        subtitle: "Tower → Floor → Unit availability grid",
        icon: Layers,
        action: () => {
          onOpenChange(false);
          if (onNavigateTab) onNavigateTab("projects");
        },
      },
      {
        id: "cmd-reports",
        category: "command",
        title: "Go to Executive Analytics & Reports",
        subtitle: "Conversion bottlenecks and rep SLAs",
        icon: TrendingUp,
        action: () => {
          onOpenChange(false);
          if (onNavigateTab) onNavigateTab("reports");
        },
      },
    ];

    // Filter commands by query
    if (q) {
      commands.forEach((c) => {
        if (c.title.toLowerCase().includes(q) || (c.subtitle && c.subtitle.toLowerCase().includes(q))) {
          list.push(c);
        }
      });
    } else {
      list.push(...commands.slice(0, 4));
    }

    // 2. Matched Leads
    leads.forEach((l) => {
      if (
        !q ||
        l.personName.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.projectName.toLowerCase().includes(q) ||
        (l.assignedUnitNumber && l.assignedUnitNumber.toLowerCase().includes(q))
      ) {
        list.push({
          id: `lead-${l.id}`,
          category: "lead",
          title: l.personName,
          subtitle: `${formatPhone(l.phone)} • ${l.projectName} ${l.assignedUnitNumber ? `(Unit ${l.assignedUnitNumber})` : ""} • ${formatCurrencyINR(l.budget)}`,
          badge: l.stage.toUpperCase(),
          icon: User,
          lead: l,
          action: () => {
            onOpenChange(false);
            onSelectLead(l);
          },
        });
      }
    });

    // 3. Matched Projects
    projects.forEach((p) => {
      if (!q || p.name.toLowerCase().includes(q) || p.regionName.toLowerCase().includes(q) || p.developer.toLowerCase().includes(q)) {
        list.push({
          id: `proj-${p.id}`,
          category: "project",
          title: `Open ${p.name}`,
          subtitle: `${p.regionName} • ${p.developer} • Price: ${p.priceRange}`,
          badge: `${p.activeLeadsCount} Leads`,
          icon: Building2,
          action: () => {
            onOpenChange(false);
            setSelectedProjectId(p.id);
            if (onNavigateTab) onNavigateTab("projects");
          },
        });
      }
    });

    // 4. Matched Units (when querying)
    if (q) {
      units.forEach((u) => {
        if (
          u.unitNumber.toLowerCase().includes(q) ||
          u.tower.toLowerCase().includes(q) ||
          (u.assignedLeadName && u.assignedLeadName.toLowerCase().includes(q))
        ) {
          list.push({
            id: `unit-${u.id}`,
            category: "unit",
            title: `Unit ${u.unitNumber} (${u.tower})`,
            subtitle: `${u.projectName} • ${u.configuration} • ${formatCurrencyINR(u.price)} ${u.assignedLeadName ? `• Buyer: ${u.assignedLeadName}` : ""}`,
            badge: u.status.toUpperCase(),
            icon: Home,
            action: () => {
              onOpenChange(false);
              setSelectedProjectId(u.projectId);
              if (onNavigateTab) onNavigateTab("projects");
            },
          });
        }
      });
    }

    return list;
  }, [query, leads, projects, units, onNavigateTab, onOpenCreateLead, onOpenQuickLog, onSelectLead, setSelectedProjectId]);

  // Handle keyboard navigation (Arrow Up, Down, Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < items.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : items.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[580px] overflow-hidden rounded-2xl shadow-modal border border-border">
        {/* Command Search Input */}
        <div className="flex items-center px-4 border-b border-border bg-card">
          <Search className="h-4 w-4 text-muted-foreground mr-2.5 shrink-0" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search (e.g. 'Rajesh', 'DLF', 'Create lead', 'Overdue')..."
            className="h-12 w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <kbd className="text-[10px] font-mono border border-border bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Command Results List */}
        <div className="max-h-84 overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No matching commands, leads, or property units found.
            </div>
          ) : (
            items.slice(0, 15).map((item, idx) => {
              const Icon = item.icon;
              const isHighlighted = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors ${
                    isHighlighted ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary/60 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                      isHighlighted ? "border-white/30 bg-white/10" : "border-border bg-secondary/50"
                    }`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold truncate flex items-center gap-1.5">
                        <span>{item.title}</span>
                        {item.lead && (
                          <LeadScoreBadge score={item.lead.leadScore} label={item.lead.leadScoreLabel} />
                        )}
                      </div>
                      {item.subtitle && (
                        <div className={`text-[11px] truncate ${isHighlighted ? "text-primary-foreground/80 font-normal" : "text-muted-foreground font-normal"}`}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                      isHighlighted ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-border bg-secondary/30 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>CallCRM Intelligence</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

