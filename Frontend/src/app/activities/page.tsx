"use client";

import * as React from "react";
import { Activity as ActivityIcon, Phone, MessageSquare, Building2, Calendar, User, Search, Filter, Sparkles, CheckCircle2 } from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ActivitiesPage() {
  const { activities, currentUser } = useCRM();
  const [scope, setScope] = React.useState<"my" | "team">("my");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");

  const filteredActivities = React.useMemo(() => {
    return activities.filter((act) => {
      // Scope Filter
      if (scope === "my" && act.userId !== currentUser.id) return false;

      // Type Filter
      if (typeFilter !== "all") {
        if (typeFilter === "calls" && act.type !== "call") return false;
        if (typeFilter === "whatsapp" && act.type !== "whatsapp") return false;
        if (typeFilter === "site_visits" && act.type !== "site_visit") return false;
        if (typeFilter === "bookings" && act.type !== "stage_change" && act.type !== "booking") return false;
      }

      // Search Filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchPerson = act.personName?.toLowerCase().includes(query);
        const matchUser = act.userName?.toLowerCase().includes(query);
        const matchNotes = act.notes?.toLowerCase().includes(query);
        const matchOutcome = act.outcomeLabel?.toLowerCase().includes(query);
        return matchPerson || matchUser || matchNotes || matchOutcome;
      }

      return true;
    });
  }, [activities, scope, typeFilter, search, currentUser]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Activity History & Audit Stream
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chronological audit of all calls, WhatsApp interactions, site tours, and pipeline commitments.
          </p>
        </div>

        <Badge variant="outline" className="text-xs font-mono py-1 px-3 self-start sm:self-auto">
          {filteredActivities.length} Logs Showing
        </Badge>
      </div>

      {/* Filter & Scope Toolbar */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Scope Toggle: My Activity | Team Activity */}
        <div className="inline-flex p-1 rounded-lg bg-secondary border border-border self-start">
          <button
            type="button"
            onClick={() => setScope("my")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              scope === "my"
                ? "bg-card text-foreground shadow-subtle font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Activity
          </button>
          <button
            type="button"
            onClick={() => setScope("team")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              scope === "team"
                ? "bg-card text-foreground shadow-subtle font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Team Activity
          </button>
        </div>

        {/* Activity Type Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Types" },
            { id: "calls", label: "Calls" },
            { id: "whatsapp", label: "WhatsApp" },
            { id: "site_visits", label: "Site Visits" },
            { id: "bookings", label: "Stage Changes" },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setTypeFilter(type.id)}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                typeFilter === type.id
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-subtle"
                  : "bg-secondary/60 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="pl-8 h-7 text-xs bg-secondary/40"
          />
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground bg-card rounded-xl border border-dashed border-border">
            No activity logs match your filter criteria.
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground capitalize flex items-center gap-1.5">
                    {act.type === "call" && <Phone className="h-3.5 w-3.5 text-blue-600" />}
                    {act.type === "whatsapp" && <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />}
                    {act.type === "site_visit" && <Building2 className="h-3.5 w-3.5 text-amber-600" />}
                    {act.type.replace("_", " ")}
                  </span>

                  {act.outcomeLabel && (
                    <Badge variant="secondary" className="text-[11px] font-semibold">
                      {act.outcomeLabel}
                    </Badge>
                  )}
                </div>

                <span className="text-muted-foreground font-mono text-[11px]">
                  {new Date(act.createdAt).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="text-foreground font-medium text-xs">
                Contact: <strong className="text-foreground">{act.personName}</strong>
              </div>

              {act.notes && (
                <p className="text-muted-foreground bg-secondary/40 p-2 rounded-md border border-border/40 text-[11px] leading-relaxed">
                  "{act.notes}"
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Logged by: <strong className="text-foreground">{act.userName}</strong>
                </span>
                {act.scheduledFollowUpAt && (
                  <span className="text-amber-700 font-semibold font-mono">
                    Scheduled Next: {act.scheduledFollowUpAt}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

