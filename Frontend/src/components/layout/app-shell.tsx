"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { useCRM } from "@/context/crm-context";
import { BossOverview } from "@/components/crm/boss-overview";
import { SalespersonHome } from "@/components/crm/salesperson-home";
import { PipelineBoard } from "@/components/crm/pipeline-board";
import { QuickActivityModal } from "@/components/crm/quick-activity-modal";
import { GlobalSearchDialog } from "@/components/crm/global-search-dialog";
import { LeadDetailModal } from "@/components/crm/lead-detail-modal";
import { Lead } from "@/types/crm";
import {
  Home as HomeIcon,
  Users,
  Kanban,
  ListTodo,
  Plus,
  ChartNoAxesCombined,
  Building2,
  Contact,
  Activity as ActivityIcon,
  Shield,
  MapPin,
  Settings,
  Search,
  Phone,
  MessageSquare,
  Filter,
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PipelineBadge, TaskStatusBadge } from "@/components/ui/status-badge";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ReportsPage from "@/app/reports/page";
import ProjectsPage from "@/app/projects/page";
import PeoplePage from "@/app/people/page";
import ActivitiesPage from "@/app/activities/page";
import UsersPage from "@/app/users/page";
import RegionsPage from "@/app/regions/page";
import SettingsPage from "@/app/settings/page";
import TasksPage from "@/app/tasks/page";

export function AppShell() {
  const { currentUser, filteredLeads } = useCRM();
  const isBoss = currentUser.role === "boss";

  // Navigation State
  const [activeTab, setActiveTab] = React.useState<string>("overview");

  // Modals state
  const [quickLogOpen, setQuickLogOpen] = React.useState(false);
  const [quickLogLeadId, setQuickLogLeadId] = React.useState<string | undefined>();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  // Leads table search
  const [leadSearch, setLeadSearch] = React.useState("");
  const [leadStageFilter, setLeadStageFilter] = React.useState("all");

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  };

  const handleOpenQuickLog = (leadId?: string) => {
    setQuickLogLeadId(leadId);
    setQuickLogOpen(true);
  };

  const leadsList = filteredLeads.filter((l) => {
    const matchSearch =
      l.personName.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.phone.includes(leadSearch) ||
      l.projectName.toLowerCase().includes(leadSearch.toLowerCase());
    const matchStage = leadStageFilter === "all" || l.stage === leadStageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/10">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        className="hidden md:flex"
      />

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw]">
            <Sidebar
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              className="h-full w-full"
            />
          </div>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar
          onOpenQuickLog={() => handleOpenQuickLog()}
          onOpenSearch={() => setSearchOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {activeTab === "overview" && (
            isBoss ? (
              <BossOverview onSelectLead={handleOpenLead} />
            ) : (
              <SalespersonHome
                onOpenQuickLog={handleOpenQuickLog}
                onSelectLead={handleOpenLead}
              />
            )
          )}

          {activeTab === "leads" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Lead Directory & Pipeline Records
                    </h1>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Active buyer enquiries with contact identity and stage tracking.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-card shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative w-56 sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      placeholder="Search buyer name, phone, project..."
                      className="pl-8 h-8 text-xs"
                    />
                  </div>

                  <select
                    value={leadStageFilter}
                    onChange={(e) => setLeadStageFilter(e.target.value)}
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
                  Showing {leadsList.length} of {filteredLeads.length} leads
                </span>
              </div>

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
                  {leadsList.map((lead) => (
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
                            onClick={() => handleOpenQuickLog(lead.id)}
                          >
                            Log
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === "pipeline" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <Kanban className="h-5 w-5 text-primary" />
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Sales Pipeline & Opportunity Board
                    </h1>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Drag and drop or fast advance leads through the sales pipeline.
                  </p>
                </div>
              </div>
              <PipelineBoard onSelectLead={handleOpenLead} />
            </div>
          )}

          {activeTab === "tasks" && <TasksPage />}
          {activeTab === "reports" && <ReportsPage />}
          {activeTab === "projects" && <ProjectsPage />}
          {activeTab === "people" && <PeoplePage />}
          {activeTab === "activities" && <ActivitiesPage />}
          {activeTab === "users" && <UsersPage />}
          {activeTab === "regions" && <RegionsPage />}
          {activeTab === "settings" && <SettingsPage />}
        </main>

        {/* Mobile Bottom Navigation (1-Thumb Reachability) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 border-t border-border bg-card/95 backdrop-blur-sm px-4 flex items-center justify-around z-40">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              activeTab === "overview" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <HomeIcon className="h-4 w-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              activeTab === "leads" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Leads</span>
          </button>

          {/* Quick 10s Activity Hero Button on Mobile */}
          <button
            type="button"
            onClick={() => handleOpenQuickLog()}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-card -translate-y-2 border-2 border-background"
            aria-label="Quick Log Activity"
          >
            <Plus className="h-5 w-5" />
          </button>

          <button
            onClick={() => setActiveTab("pipeline")}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              activeTab === "pipeline" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <Kanban className="h-4 w-4" />
            <span>Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              activeTab === "reports" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <ChartNoAxesCombined className="h-4 w-4" />
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* Global Interactive Modals */}
      <QuickActivityModal
        open={quickLogOpen}
        onOpenChange={setQuickLogOpen}
        defaultLeadId={quickLogLeadId}
      />

      <GlobalSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelectLead={handleOpenLead}
      />

      <LeadDetailModal
        lead={selectedLead}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onLogActivity={(id) => handleOpenQuickLog(id)}
      />
    </div>
  );
}
