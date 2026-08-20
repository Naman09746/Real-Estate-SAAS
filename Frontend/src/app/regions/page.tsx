"use client";

import * as React from "react";
import { MapPin, Plus, Building2, Users } from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RegionsPage() {
  const { regions, filteredLeads, users } = useCRM();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Regional Operating Hubs
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Regional organizational dimensions for data scoping, permission enforcement, and reporting.
          </p>
        </div>

        <Button size="sm" className="gap-1.5 shadow-subtle">
          <Plus className="h-4 w-4" />
          <span>Add Region</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {regions.map((r) => {
          const regionReps = users.filter((u) => u.regionId === r.id);
          const regionLeads = filteredLeads.filter((l) => l.regionId === r.id);

          return (
            <Card key={r.id} className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">{r.name} Hub</h3>
                  <span className="text-xs text-muted-foreground font-mono">Code: {r.code}</span>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {r.code}
                </Badge>
              </div>

              <div className="space-y-2 p-3 rounded-lg border border-border bg-secondary/30 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Leads:</span>
                  <strong className="font-mono text-foreground">{regionLeads.length}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assigned Sales Reps:</span>
                  <strong className="font-mono text-foreground">{regionReps.length}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex justify-end">
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                  Configure Hub
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
