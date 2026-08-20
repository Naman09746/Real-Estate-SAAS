"use client";

import * as React from "react";
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  MessageSquare,
  SlidersHorizontal,
  CheckSquare,
  Square,
  UserCheck,
  Calendar,
  FileSpreadsheet,
  ArrowUpDown,
  Download,
  Flame,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PipelineBadge, TaskStatusBadge, DealHealthBadge, LeadScoreBadge } from "@/components/ui/status-badge";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";
import { LeadDetailModal } from "@/components/crm/lead-detail-modal";
import { QuickActivityModal } from "@/components/crm/quick-activity-modal";
import { Lead, PipelineStage, DealHealth } from "@/types/crm";

export default function LeadsPage() {
  const {
    filteredLeads,
    createLead,
    users,
    projects,
    regions,
    currentUser,
    bulkUpdateLeadsStage,
    bulkAssignLeadsRep,
    bulkScheduleFollowUp,
  } = useCRM();

  const [search, setSearch] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState<string>("all");
  const [healthFilter, setHealthFilter] = React.useState<string>("all");
  const [regionFilter, setRegionFilter] = React.useState<string>("all");
  const [salespersonFilter, setSalespersonFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"budget_desc" | "budget_asc" | "score_desc" | "recent">("score_desc");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [quickLogOpen, setQuickLogOpen] = React.useState(false);
  const [quickLogLeadId, setQuickLogLeadId] = React.useState<string | undefined>();

  // New Lead Dialog state
  const [newLeadOpen, setNewLeadOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [newBudget, setNewBudget] = React.useState("50000000");
  const [newProjectId, setNewProjectId] = React.useState(projects[0]?.id || "");
  const [newConfig, setNewConfig] = React.useState("3 BHK Luxury");

  // Bulk action states
  const [bulkRepId, setBulkRepId] = React.useState("");
  const [bulkStage, setBulkStage] = React.useState<PipelineStage | "">("");

  const salespeople = users.filter((u) => u.role === "salesperson");

  // Filtering and Sorting
  const leads = React.useMemo(() => {
    return filteredLeads
      .filter((l) => {
        const matchSearch =
          l.personName.toLowerCase().includes(search.toLowerCase()) ||
          l.phone.includes(search) ||
          l.projectName.toLowerCase().includes(search.toLowerCase()) ||
          (l.assignedUnitNumber && l.assignedUnitNumber.toLowerCase().includes(search.toLowerCase()));

        const matchStage = stageFilter === "all" || l.stage === stageFilter;
        const matchHealth = healthFilter === "all" || l.dealHealth === healthFilter;
        const matchRegion = regionFilter === "all" || l.regionId === regionFilter;
        const matchRep = salespersonFilter === "all" || l.salespersonId === salespersonFilter;

        return matchSearch && matchStage && matchHealth && matchRegion && matchRep;
      })
      .sort((a, b) => {
        if (sortBy === "budget_desc") return b.budget - a.budget;
        if (sortBy === "budget_asc") return a.budget - b.budget;
        if (sortBy === "score_desc") return (b.leadScore || 0) - (a.leadScore || 0);
        return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
      });
  }, [filteredLeads, search, stageFilter, healthFilter, regionFilter, salespersonFilter, sortBy]);

  const allSelected = leads.length > 0 && selectedIds.length === leads.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  };

  const handleLogActivity = (leadId: string) => {
    setQuickLogLeadId(leadId);
    setQuickLogOpen(true);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const proj = projects.find((p) => p.id === newProjectId) || projects[0];
    await createLead({
      personId: `per-${Date.now()}`,
      personName: newName,
      phone: newPhone,
      projectId: proj.id,
      projectName: proj.name,
      regionId: proj.regionId,
      regionName: proj.regionName,
      salespersonId: currentUser.id,
      salespersonName: currentUser.name,
      budget: Number(newBudget),
      stage: "new",
      source: "Direct Manual Entry",
      leadScore: 85,
      leadScoreLabel: "Hot",
      dealHealth: "strong",
      dealHealthReason: "Fresh manual lead inquiry",
      recommendedAction: "Initial qualifying telephone conversation",
      configurationPreference: newConfig,
      daysInStage: 0,
      nextFollowUpAt: "Today, 5:00 PM",
      followUpStatus: "due_today",
    });

    setNewName("");
    setNewPhone("");
    setNewLeadOpen(false);
  };

  const handleBulkStageChange = async (st: PipelineStage) => {
    if (selectedIds.length === 0 || !st) return;
    await bulkUpdateLeadsStage(selectedIds, st);
    setSelectedIds([]);
    setBulkStage("");
  };

  const handleBulkRepAssign = async (repId: string) => {
    if (selectedIds.length === 0 || !repId) return;
    const rep = users.find((u) => u.id === repId);
    if (!rep) return;
    await bulkAssignLeadsRep(selectedIds, rep.id, rep.name);
    setSelectedIds([]);
    setBulkRepId("");
  };

  const handleBulkFollowUp = async () => {
    if (selectedIds.length === 0) return;
    await bulkScheduleFollowUp(selectedIds, "Today", "4:00 PM");
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const targetLeads = selectedIds.length > 0
      ? leads.filter((l) => selectedIds.includes(l.id))
      : leads;

    const headers = ["Name", "Phone", "Project", "Budget", "Stage", "Score", "Health", "Rep", "FollowUp"];
    const rows = targetLeads.map((l) => [
      `"${l.personName}"`,
      `"${l.phone}"`,
      `"${l.projectName}"`,
      l.budget,
      l.stage,
      l.leadScore,
      l.dealHealth,
      `"${l.salespersonName}"`,
      `"${l.nextFollowUpAt || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `callcrm-leads-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Lead Directory & Opportunity Dossier
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enterprise database with phone validation, lead scoring, deal health telemetry, and batch actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs font-semibold gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export ({selectedIds.length > 0 ? selectedIds.length : leads.length})</span>
          </Button>
          <Button size="sm" onClick={() => setNewLeadOpen(true)} className="gap-1.5 shadow-subtle text-xs font-semibold">
            <Plus className="h-4 w-4" />
            <span>Create New Lead</span>
          </Button>
        </div>
      </div>

      {/* Floating / Sticky Bulk Actions Bar when items selected */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
              {selectedIds.length}
            </span>
            <span className="font-bold text-foreground">Leads selected</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] text-muted-foreground"
              onClick={() => setSelectedIds([])}
            >
              Clear selection
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Batch Stage Change */}
            <select
              value={bulkStage}
              onChange={(e) => handleBulkStageChange(e.target.value as PipelineStage)}
              className="h-8 px-2 rounded-md border border-border bg-card text-foreground font-medium text-xs focus:outline-none"
            >
              <option value="">Move Stage...</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="site_visit">Site Visit</option>
              <option value="negotiation">Negotiation</option>
              <option value="won">Won Deals</option>
              <option value="lost">Lost</option>
            </select>

            {/* Batch Assign Rep */}
            <select
              value={bulkRepId}
              onChange={(e) => handleBulkRepAssign(e.target.value)}
              className="h-8 px-2 rounded-md border border-border bg-card text-foreground font-medium text-xs focus:outline-none"
            >
              <option value="">Assign Rep...</option>
              {salespeople.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.regionName})
                </option>
              ))}
            </select>

            {/* Batch Schedule Follow-up */}
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold"
              onClick={handleBulkFollowUp}
            >
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Schedule Follow-up Today
            </Button>
          </div>
        </div>
      )}

      {/* Multi-Dimensional Filter Toolbar */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-56 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, project, unit..."
              className="pl-8 h-8 text-xs bg-secondary/40"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none"
          >
            <option value="all">All Stages</option>
            <option value="new">New Inflow</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="site_visit">Site Visit</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won Deals</option>
            <option value="lost">Lost</option>
          </select>

          {/* Deal Health Filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none"
          >
            <option value="all">All Health</option>
            <option value="strong">🟢 Strong</option>
            <option value="neutral">⚪ Neutral</option>
            <option value="at_risk">🔴 At Risk</option>
          </select>

          {/* Region Hub Filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none"
          >
            <option value="all">All Regions ({regions.length})</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Salesperson Filter */}
          <select
            value={salespersonFilter}
            onChange={(e) => setSalespersonFilter(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none"
          >
            <option value="all">All Reps ({salespeople.length})</option>
            {salespeople.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Sorting */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-border/80">
            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 px-2 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none"
            >
              <option value="score_desc">Lead Score (High to Low)</option>
              <option value="budget_desc">Budget (High to Low)</option>
              <option value="budget_asc">Budget (Low to High)</option>
              <option value="recent">Recently Active</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          Showing {leads.length} of {filteredLeads.length} leads
        </span>
      </div>

      {/* Enterprise Data Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center justify-center p-1 rounded hover:bg-secondary"
                aria-label="Select All"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </TableHead>
            <TableHead>Buyer & Identity</TableHead>
            <TableHead>Score & Health</TableHead>
            <TableHead>Target Project & Unit</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Assigned Rep</TableHead>
            <TableHead>Follow-up Schedule</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-xs text-muted-foreground">
                No leads found matching current search and filter criteria.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => {
              const isChecked = selectedIds.includes(lead.id);
              return (
                <TableRow
                  key={lead.id}
                  onClick={() => handleOpenLead(lead)}
                  className={`cursor-pointer transition-colors ${
                    isChecked ? "bg-primary/5 hover:bg-primary/10" : ""
                  }`}
                >
                  {/* Row Checkbox */}
                  <TableCell onClick={(e) => toggleSelectOne(lead.id, e)} className="w-10">
                    <div className="flex items-center justify-center">
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground/60 hover:text-foreground" />
                      )}
                    </div>
                  </TableCell>

                  {/* Buyer & Identity */}
                  <TableCell>
                    <div className="font-bold text-foreground text-sm">{lead.personName}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{formatPhone(lead.phone)}</div>
                  </TableCell>

                  {/* Score & Health */}
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <LeadScoreBadge score={lead.leadScore} label={lead.leadScoreLabel} />
                      <DealHealthBadge health={lead.dealHealth} reason={lead.dealHealthReason} />
                    </div>
                  </TableCell>

                  {/* Target Project & Unit */}
                  <TableCell>
                    <div className="font-medium text-foreground text-xs">{lead.projectName}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <span>{lead.regionName}</span>
                      {lead.assignedUnitNumber && (
                        <span className="font-mono font-bold text-foreground">· Unit {lead.assignedUnitNumber}</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Budget */}
                  <TableCell className="font-bold text-foreground font-mono text-xs">
                    {formatCurrencyINR(lead.budget)}
                  </TableCell>

                  {/* Stage */}
                  <TableCell>
                    <PipelineBadge stage={lead.stage} />
                  </TableCell>

                  {/* Rep */}
                  <TableCell>
                    <span className="text-xs font-semibold text-foreground">{lead.salespersonName}</span>
                  </TableCell>

                  {/* Follow-up Schedule */}
                  <TableCell>
                    <div className="space-y-1">
                      <TaskStatusBadge status={lead.followUpStatus || "upcoming"} />
                      <div className="text-[10px] text-muted-foreground font-mono">{lead.nextFollowUpAt || "—"}</div>
                    </div>
                  </TableCell>

                  {/* Instant Action */}
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center justify-center h-7 px-2 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        title="Direct Call"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </a>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center h-7 px-2 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        title="WhatsApp"
                      >
                        <MessageSquare className="h-3 w-3" />
                      </a>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs h-7 px-2 font-medium"
                        onClick={() => handleLogActivity(lead.id)}
                      >
                        Log
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Modals */}
      <LeadDetailModal
        lead={selectedLead}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onLogActivity={handleLogActivity}
      />

      <QuickActivityModal
        open={quickLogOpen}
        onOpenChange={setQuickLogOpen}
        defaultLeadId={quickLogLeadId}
      />

      {/* Manual New Lead Modal */}
      {newLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-xl border border-border p-5 space-y-4 shadow-modal animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground">Create New Lead Entry</h3>
            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Buyer Full Name</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Phone Number (Indian Standard)</label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98100 XXXXX"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Target Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.regionName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Budget (INR)</label>
                  <Input
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    type="number"
                    placeholder="50000000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Preferred Layout</label>
                  <Input
                    value={newConfig}
                    onChange={(e) => setNewConfig(e.target.value)}
                    placeholder="3 BHK + Servant"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setNewLeadOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-semibold">
                  Create Lead
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
