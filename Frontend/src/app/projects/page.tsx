"use client";

import * as React from "react";
import { Building2, MapPin, Users, Phone, Plus, ExternalLink } from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  const { projects } = useCRM();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Residential & Commercial Projects
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active developer projects with inventory pricing, developer points of contact, and live lead counts.
          </p>
        </div>

        <Button size="sm" className="gap-1.5 shadow-subtle">
          <Plus className="h-4 w-4" />
          <span>Add Project</span>
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Card key={p.id} className="p-5 space-y-4 hover:border-border/90 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">{p.name}</h3>
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {p.regionName}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>{p.location}</span>
                </div>
              </div>
              <span className="font-bold text-sm text-foreground font-mono bg-secondary px-2.5 py-1 rounded border border-border">
                {p.priceRange}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-secondary/30 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Developer</span>
                <span className="font-semibold text-foreground">{p.developer}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Active Opportunities</span>
                <span className="font-bold text-foreground font-mono">{p.activeLeadsCount} leads</span>
              </div>
            </div>

            {p.contacts && p.contacts.length > 0 && (
              <div className="pt-2 border-t border-border/60 text-xs flex items-center justify-between">
                <div className="text-muted-foreground text-[11px]">
                  Site RM: <strong className="text-foreground">{p.contacts[0].name}</strong> ({p.contacts[0].phone})
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                  View Leads
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
