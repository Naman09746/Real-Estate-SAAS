"use client";

import * as React from "react";
import { ListTodo, Plus, CheckCircle2, Phone, MessageSquare, Clock, Building2 } from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge } from "@/components/ui/status-badge";
import { formatPhone } from "@/lib/utils";
import { QuickActivityModal } from "@/components/crm/quick-activity-modal";

export default function TasksPage() {
  const { filteredTasks, completeTask } = useCRM();
  const [filter, setFilter] = React.useState<"all" | "due_today" | "overdue" | "upcoming">("all");
  const [quickLogOpen, setQuickLogOpen] = React.useState(false);
  const [quickLogLeadId, setQuickLogLeadId] = React.useState<string | undefined>();

  const tasks = filteredTasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const handleLog = (leadId: string) => {
    setQuickLogLeadId(leadId);
    setQuickLogOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Follow-ups & Calling Queue
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Prioritized calling list with 1-thumb dialing and WhatsApp actions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-secondary/50 p-1 rounded-lg border border-border text-xs">
          {[
            { id: "all", label: `All (${filteredTasks.length})` },
            { id: "due_today", label: "Due Today" },
            { id: "overdue", label: "Overdue" },
            { id: "upcoming", label: "Upcoming" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filter === item.id
                  ? "bg-card text-foreground font-semibold shadow-subtle"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Queue */}
      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-border bg-card text-center text-xs text-muted-foreground">
            No tasks found matching current filter.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl border border-border bg-card shadow-subtle hover:border-border/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{task.personName}</span>
                  <span className="text-muted-foreground font-mono">{formatPhone(task.phone)}</span>
                  <TaskStatusBadge status={task.status} />
                </div>

                <p className="text-foreground/90 font-medium">{task.title}</p>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {task.projectName}
                  </span>
                  <span>•</span>
                  <span>Assigned: <strong>{task.salespersonName}</strong></span>
                  {task.dueTime && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Clock className="h-3 w-3" />
                        {task.dueTime}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Fast Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`tel:${task.phone}`}
                  className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                >
                  <Phone className="h-3.5 w-3.5 mr-1" />
                  Call
                </a>

                <a
                  href={`https://wa.me/${task.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  WhatsApp
                </a>

                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 text-xs font-medium"
                  onClick={() => handleLog(task.leadId)}
                >
                  Log Activity
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <QuickActivityModal
        open={quickLogOpen}
        onOpenChange={setQuickLogOpen}
        defaultLeadId={quickLogLeadId}
      />
    </div>
  );
}
