"use client";

import * as React from "react";
import {
  ListTodo,
  Plus,
  CheckCircle2,
  Phone,
  MessageSquare,
  Clock,
  Building2,
  AlertTriangle,
  Search,
  CheckCircle,
  CalendarCheck,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskStatusBadge } from "@/components/ui/status-badge";
import { formatPhone } from "@/lib/utils";
import { QuickActivityModal } from "@/components/crm/quick-activity-modal";

export default function TasksPage() {
  const { filteredTasks, completeTask, users } = useCRM();
  const [filter, setFilter] = React.useState<"all" | "overdue" | "due_today" | "upcoming" | "completed">("all");
  const [search, setSearch] = React.useState("");
  const [repFilter, setRepFilter] = React.useState("all");
  const [quickLogOpen, setQuickLogOpen] = React.useState(false);
  const [quickLogLeadId, setQuickLogLeadId] = React.useState<string | undefined>();

  const salespeople = users.filter((u) => u.role === "salesperson");

  const overdueCount = filteredTasks.filter((t) => t.status === "overdue").length;
  const dueTodayCount = filteredTasks.filter((t) => t.status === "due_today").length;
  const upcomingCount = filteredTasks.filter((t) => t.status === "upcoming").length;
  const completedCount = filteredTasks.filter((t) => t.status === "completed").length;

  const tasks = filteredTasks
    .filter((t) => {
      const matchFilter = filter === "all" || t.status === filter;
      const matchSearch =
        t.personName.toLowerCase().includes(search.toLowerCase()) ||
        t.phone.includes(search) ||
        t.projectName.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase());
      const matchRep = repFilter === "all" || t.salespersonId === repFilter;
      return matchFilter && matchSearch && matchRep;
    })
    .sort((a, b) => {
      // Prioritize overdue, then due_today, then upcoming
      const priorityOrder: Record<string, number> = { overdue: 0, due_today: 1, upcoming: 2, completed: 3 };
      return (priorityOrder[a.status] ?? 4) - (priorityOrder[b.status] ?? 4);
    });

  const handleLog = (leadId: string) => {
    setQuickLogLeadId(leadId);
    setQuickLogOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Follow-ups & Priority Calling Queue
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-estate outreach queue with 1-click calling, WhatsApp shortcuts, and SLA compliance tracking.
          </p>
        </div>

        {/* Priority Summary Badges */}
        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <div className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{overdueCount} Overdue</span>
            </div>
          )}
          <div className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            {dueTodayCount} Due Today
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-52 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search buyer, phone, task..."
              className="pl-8 h-8 text-xs bg-secondary/40"
            />
          </div>

          {/* Filter Segment Pills */}
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border">
            {[
              { id: "all", label: `All (${filteredTasks.length})` },
              { id: "overdue", label: `🔴 Overdue (${overdueCount})` },
              { id: "due_today", label: `🟠 Due Today (${dueTodayCount})` },
              { id: "upcoming", label: `🔵 Upcoming (${upcomingCount})` },
              { id: "completed", label: `🟢 Completed (${completedCount})` },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filter === item.id
                    ? "bg-card text-foreground font-bold shadow-subtle"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            className="h-8 px-2 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none"
          >
            <option value="all">All Sales Reps</option>
            {salespeople.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          Showing {tasks.length} tasks
        </span>
      </div>

      {/* Task Cards Queue */}
      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="p-10 rounded-xl border border-dashed border-border bg-card text-center text-xs text-muted-foreground">
            No follow-ups found for the selected filter.
          </div>
        ) : (
          tasks.map((task) => {
            const isDone = task.status === "completed";
            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border shadow-subtle transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  task.status === "overdue"
                    ? "border-rose-300 bg-rose-50/20"
                    : isDone
                    ? "border-border/60 bg-secondary/20 opacity-75"
                    : "border-border bg-card hover:border-border/90"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Instant Complete Checkbox */}
                  <button
                    type="button"
                    onClick={() => completeTask(task.id)}
                    disabled={isDone}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      isDone
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-border hover:border-primary hover:bg-primary/10"
                    }`}
                    title={isDone ? "Task Completed" : "Mark Complete"}
                  >
                    {isDone ? <CheckCircle className="h-3.5 w-3.5" /> : null}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm text-foreground ${isDone ? "line-through text-muted-foreground" : ""}`}>
                        {task.personName}
                      </span>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        {formatPhone(task.phone)}
                      </span>
                      <TaskStatusBadge status={task.status} />
                    </div>

                    <p className="text-foreground font-medium text-xs">{task.title}</p>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1 text-foreground font-semibold">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {task.projectName}
                      </span>
                      <span>•</span>
                      <span>Rep: <strong>{task.salespersonName}</strong></span>
                      {task.dueTime && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-foreground font-mono">
                            <Clock className="h-3 w-3 text-primary" />
                            {task.dueDate} at {task.dueTime}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fast Action Buttons */}
                {!isDone && (
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={`tel:${task.phone}`}
                      className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      <Phone className="h-3.5 w-3.5 mr-1" />
                      Call
                    </a>

                    <a
                      href={`https://wa.me/${task.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      WhatsApp
                    </a>

                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs font-semibold"
                      onClick={() => handleLog(task.leadId)}
                    >
                      Log
                    </Button>
                  </div>
                )}
              </div>
            );
          })
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
