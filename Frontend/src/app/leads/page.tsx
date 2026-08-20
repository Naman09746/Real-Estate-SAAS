"use client";

import * as React from "react";
import { Users, Search, Plus, Filter, Phone, MessageSquare, SlidersHorizontal } from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PipelineBadge, TaskStatusBadge } from "@/components/ui/status-badge";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";
import { LeadDetailModal } from "@/components/crm/lead-detail-modal";
import { QuickActivityModal } from "@/components/crm/quick-activity-modal";
import { Lead, PipelineStage } from "@/types/crm";

export default function LeadsPage() {
  const { filteredLeads, createLead, users, projects, regions, currentUser } = useCRM();
  const [search, setSearch] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState<string>("all");
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

  const leads = filteredLeads.filter((l) => {
    const matchSearch =
      l.personName.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.projectName.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || l.stage === stageFilter;
    return matchSearch && matchStage;
  });

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
      nextFollowUpAt: "Today, 5:00 PM",
      followUpStatus: "due_today",
    });

    setNewName("");
    setNewPhone("");
    setNewLeadOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Lead Directory & Pipeline Records
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active real estate buyer enquiries with phone normalization and stage tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setNewLeadOpen(true)} className="gap-1.5 shadow-subtle">
            <Plus className="h-4 w-4" />
            <span>Create New Lead</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-xl border border-border bg-card shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-56 sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by buyer name, phone, project..."
              className="pl-8 h-8 text-xs"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-border bg-secondary/50 text-foreground font-medium focus:outline-none"
          >
            <option value="all">All Stages ({filteredLeads.length})</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="site_visit">Site Visit</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won Deals</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          Showing {leads.length} of {filteredLeads.length} leads
        </span>
      </div>

      {/* Data Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Buyer / Contact</TableHead>
            <TableHead>Target Project</TableHead>
            <TableHead>Region Hub</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Assigned Sales Rep</TableHead>
            <TableHead>Follow-up Schedule</TableHead>
            <TableHead className="text-right">Instant Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              onClick={() => handleOpenLead(lead)}
              className="cursor-pointer"
            >
              <TableCell>
                <div className="font-semibold text-foreground">{lead.personName}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{formatPhone(lead.phone)}</div>
              </TableCell>
              <TableCell className="font-medium text-foreground">{lead.projectName}</TableCell>
              <TableCell><span className="text-xs text-muted-foreground">{lead.regionName}</span></TableCell>
              <TableCell className="font-semibold text-foreground font-mono">{formatCurrencyINR(lead.budget)}</TableCell>
              <TableCell><PipelineBadge stage={lead.stage} /></TableCell>
              <TableCell><span className="text-xs font-medium">{lead.salespersonName}</span></TableCell>
              <TableCell><TaskStatusBadge status={lead.followUpStatus || "upcoming"} /></TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5">
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex items-center justify-center h-7 px-2 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </a>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs h-7 px-2"
                    onClick={() => handleLogActivity(lead.id)}
                  >
                    Log
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
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
          <div className="w-full max-w-md bg-card rounded-xl border border-border p-5 space-y-4 shadow-modal">
            <h3 className="text-base font-bold text-foreground">Create New Lead</h3>
            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Buyer Full Name</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Phone Number</label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98100 XXXXX"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Target Project</label>
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
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Budget (INR)</label>
                <Input
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  type="number"
                  placeholder="50000000"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setNewLeadOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
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
