"use client";

import * as React from "react";
import { Activity as ActivityIcon, Phone, MessageSquare, Building2, Calendar, User } from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ActivitiesPage() {
  const { activities } = useCRM();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Activity History & Audit Stream
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable chronological record of all calls, meetings, site visits, and WhatsApp conversations.
          </p>
        </div>

        <Badge variant="outline" className="text-xs font-mono">
          {activities.length} Total Logs
        </Badge>
      </div>

      <div className="space-y-3">
        {activities.map((act) => (
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
                  {act.type}
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
                <span className="text-amber-700 font-semibold">
                  Scheduled Next: {act.scheduledFollowUpAt}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
