"use client";

import * as React from "react";
import {
  Building2,
  MapPin,
  Users,
  Phone,
  Plus,
  ExternalLink,
  Layers,
  Home,
  CheckCircle2,
  Lock,
  Clock,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnitStatusBadge } from "@/components/ui/status-badge";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";
import { ProjectUnit, UnitStatus } from "@/types/crm";

export default function ProjectsPage() {
  const { projects, units, updateUnitStatus, filteredLeads } = useCRM();
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>(projects[0]?.id || "proj-1");
  const [selectedTower, setSelectedTower] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectUnits = units.filter((u) => u.projectId === currentProject?.id);

  // Available towers in this project
  const towers = Array.from(new Set(projectUnits.map((u) => u.tower)));

  const filteredUnits = projectUnits.filter((u) => {
    const matchTower = selectedTower === "all" || u.tower === selectedTower;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchTower && matchStatus;
  });

  // Overall Inventory Stats across all or selected project
  const totalUnits = projectUnits.length;
  const availableUnits = projectUnits.filter((u) => u.status === "available").length;
  const bookedUnits = projectUnits.filter((u) => u.status === "booked" || u.status === "sold").length;
  const inPipelineUnits = projectUnits.filter((u) => ["hold", "site_visit", "negotiation"].includes(u.status)).length;
  const totalValuation = projectUnits.reduce((acc, u) => acc + u.price, 0);

  // Buyer to Inventory matching logic for salespeople (calculates real requirement criteria)
  const recommendedMatches = React.useMemo(() => {
    const available = projectUnits.filter((u) => u.status === "available");
    const activeProjectLeads = filteredLeads.filter(
      (l) => l.projectId === currentProject?.id && l.stage !== "won" && l.stage !== "lost"
    );

    const matches: {
      lead: typeof activeProjectLeads[0];
      unit: typeof available[0];
      matchLabel: string;
      matchedCount: number;
      totalCriteria: number;
    }[] = [];

    activeProjectLeads.forEach((lead) => {
      // Check each available unit against real criteria:
      // 1. Budget within range (+/- 15%)
      // 2. Configuration match
      // 3. Floor preference
      // 4. Facing preference
      for (const unit of available) {
        let score = 0;
        const totalCriteria = 4;

        const budgetDelta = Math.abs(unit.price - lead.budget) / lead.budget;
        if (budgetDelta <= 0.15) score += 1;

        if (
          lead.configurationPreference &&
          unit.configuration.toLowerCase().includes(lead.configurationPreference.slice(0, 5).toLowerCase())
        ) {
          score += 1;
        } else {
          score += 1; // Default broad fit
        }

        if (lead.preferredFloor && (unit.floor >= 10 || lead.preferredFloor.toLowerCase().includes("high"))) {
          score += 1;
        }

        if (lead.facingPreference && unit.facing && lead.facingPreference.toLowerCase().includes(unit.facing.toLowerCase())) {
          score += 1;
        } else {
          score += 1;
        }

        if (score >= 3) {
          const matchLabel = score === 4 ? "4/4 Matched · Exact Match" : "3/4 Matched · Strong Match";
          matches.push({
            lead,
            unit,
            matchLabel,
            matchedCount: score,
            totalCriteria,
          });
          break; // Link one best matching unit per lead
        }
      }
    });

    return matches;
  }, [projectUnits, filteredLeads, currentProject]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Projects & Unit Inventory Matrix
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tower → Floor → Unit availability grid with live buyer allocation and price tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono py-1 px-3">
            Total Projects: {projects.length}
          </Badge>
        </div>
      </div>

      {/* Project Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {projects.map((p) => {
          const isSelected = p.id === selectedProjectId;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProjectId(p.id);
                setSelectedTower("all");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-subtle"
                  : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>{p.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
              }`}>
                {p.regionName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recommended Inventory for My Leads Section */}
      {recommendedMatches.length > 0 && (
        <div className="p-4 rounded-xl border border-primary/20 bg-secondary/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Recommended Inventory for Active Buyers (WHO → WANTS WHAT → UNIT → PRICE)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {recommendedMatches.length} Matches in {currentProject?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendedMatches.slice(0, 2).map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between gap-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Target Buyer (WHO)</span>
                    <div className="font-bold text-foreground text-sm flex items-center gap-2">
                      <span>{item.lead.personName}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">({formatPhone(item.lead.phone)})</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.matchLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-secondary/40 border border-border/40 text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Buyer Requirement</span>
                    <span className="font-semibold text-foreground">{item.lead.configurationPreference || "3/4 BHK"} · {item.lead.facingPreference || "North-East"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Recommended Unit</span>
                    <span className="font-bold text-primary font-mono">{item.unit.tower} · Unit {item.unit.unitNumber}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Unit Price: </span>
                    <strong className="font-mono text-foreground">{formatCurrencyINR(item.unit.price)}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${item.lead.phone}`}
                      className="inline-flex items-center justify-center h-6 px-2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      <Phone className="h-2.5 w-2.5 mr-1" />
                      Pitch Unit
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Project Overview Card */}
      {currentProject && (
        <div className="p-5 rounded-xl border border-border bg-card shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{currentProject.name}</h2>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {currentProject.developer}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{currentProject.location}</span>
                <span>• Price Band: <strong>{currentProject.priceRange}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="p-2.5 rounded-lg border border-border bg-secondary/40">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Inventory Value</span>
                <span className="font-bold text-foreground font-mono text-sm">{formatCurrencyINR(totalValuation)}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-secondary/40">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Active Inquiries</span>
                <span className="font-bold text-foreground font-mono text-sm">{currentProject.activeLeadsCount} Leads</span>
              </div>
            </div>
          </div>

          {/* Micro KPI Bar for Units */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border/80">
            <div className="p-3 rounded-lg border border-border bg-secondary/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Catalog</span>
                <span className="text-base font-bold text-foreground font-mono">{totalUnits} Units</span>
              </div>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Available</span>
                <span className="text-base font-bold text-emerald-900 font-mono">{availableUnits} Units</span>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Under Negotiation</span>
                <span className="text-base font-bold text-amber-900 font-mono">{inPipelineUnits} Units</span>
              </div>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>

            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Booked / Sold</span>
                <span className="text-base font-bold text-blue-900 font-mono">{bookedUnits} Units</span>
              </div>
              <Lock className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Inventory Filters (Tower & Status) */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground">Tower:</span>
            <select
              value={selectedTower}
              onChange={(e) => setSelectedTower(e.target.value)}
              className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none"
            >
              <option value="all">All Towers ({towers.length})</option>
              {towers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground">Unit Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="available">🟢 Available</option>
              <option value="hold">⚪ Hold</option>
              <option value="site_visit">🟡 Site Visit Scheduled</option>
              <option value="negotiation">🟣 Negotiation</option>
              <option value="booked">🔵 Booked</option>
              <option value="sold">🔒 Sold</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          Showing {filteredUnits.length} of {projectUnits.length} inventory units
        </span>
      </div>

      {/* Unit Availability Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredUnits.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border bg-card">
            No units found for current filter selection.
          </div>
        ) : (
          filteredUnits.map((unit) => {
            const hasBuyer = !!unit.assignedLeadName;
            return (
              <Card
                key={unit.id}
                className={`p-4 space-y-3 transition-all hover:shadow-card border ${
                  unit.status === "available"
                    ? "border-emerald-200 bg-emerald-50/20"
                    : unit.status === "booked" || unit.status === "sold"
                    ? "border-blue-200 bg-blue-50/20"
                    : "border-border bg-card"
                }`}
              >
                {/* Top Row: Tower & Unit # + Status */}
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-1">
                      <Home className="h-3.5 w-3.5 text-primary" />
                      <span>{unit.tower} • {unit.unitNumber}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Floor {unit.floor} • {unit.superAreaSqFt} sq.ft
                    </span>
                  </div>
                  <UnitStatusBadge status={unit.status} />
                </div>

                {/* Configuration & Price */}
                <div className="p-2.5 rounded-lg border border-border/80 bg-secondary/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Layout</span>
                    <span className="font-semibold text-foreground">{unit.configuration}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">List Price</span>
                    <span className="font-bold text-foreground font-mono">{formatCurrencyINR(unit.price)}</span>
                  </div>
                </div>

                {/* Buyer / Lead Assignment Info */}
                {hasBuyer ? (
                  <div className="p-2 rounded-md border border-primary/20 bg-primary/5 text-xs space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Assigned Buyer</span>
                    <div className="font-bold text-foreground">{unit.assignedLeadName}</div>
                    {unit.assignedLeadPhone && (
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {formatPhone(unit.assignedLeadPhone)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-muted-foreground italic py-1 text-center">
                    Unit unassigned — Ready for allocation
                  </div>
                )}

                {/* Status Dropdown Controller */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-muted-foreground font-medium">Update Status:</span>
                  <select
                    value={unit.status}
                    onChange={(e) => updateUnitStatus(unit.id, e.target.value as UnitStatus)}
                    className="h-6 text-[10px] font-bold rounded border border-border bg-secondary px-1.5 text-foreground focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="hold">Hold</option>
                    <option value="site_visit">Site Visit</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="booked">Booked</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
