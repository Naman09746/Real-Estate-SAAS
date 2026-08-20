import * as React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";

export type PipelineStageType =
  | "new"
  | "contacted"
  | "qualified"
  | "site_visit"
  | "negotiation"
  | "won"
  | "lost";

export type TaskStatusType =
  | "due_today"
  | "upcoming"
  | "overdue"
  | "completed";

const STAGE_CONFIG: Record<
  PipelineStageType,
  { label: string; variant: BadgeProps["variant"] }
> = {
  new: { label: "New", variant: "secondary" },
  contacted: { label: "Contacted", variant: "info" },
  qualified: { label: "Qualified", variant: "indigo" },
  site_visit: { label: "Site Visit", variant: "warning" },
  negotiation: { label: "Negotiation", variant: "purple" },
  won: { label: "Won", variant: "success" },
  lost: { label: "Lost", variant: "destructive" },
};

const TASK_CONFIG: Record<
  TaskStatusType,
  { label: string; variant: BadgeProps["variant"] }
> = {
  due_today: { label: "Due Today", variant: "warning" },
  upcoming: { label: "Upcoming", variant: "secondary" },
  overdue: { label: "Overdue", variant: "destructive" },
  completed: { label: "Completed", variant: "success" },
};

export function PipelineBadge({ stage }: { stage: PipelineStageType | string }) {
  const normalized = (stage.toLowerCase().replace(/\s+/g, "_") as PipelineStageType) || "new";
  const config = STAGE_CONFIG[normalized] || {
    label: stage,
    variant: "secondary",
  };

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatusType | string }) {
  const normalized = (status.toLowerCase().replace(/\s+/g, "_") as TaskStatusType) || "upcoming";
  const config = TASK_CONFIG[normalized] || {
    label: status,
    variant: "secondary",
  };

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
