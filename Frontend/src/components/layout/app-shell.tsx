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
} from "lucide-react";
import LeadsPage from "@/app/leads/page";
import ReportsPage from "@/app/reports/page";
import ProjectsPage from "@/app/projects/page";
import PeoplePage from "@/app/people/page";
import ActivitiesPage from "@/app/activities/page";
import UsersPage from "@/app/users/page";
import RegionsPage from "@/app/regions/page";
import SettingsPage from "@/app/settings/page";
import TasksPage from "@/app/tasks/page";

export function AppShell() {
  const { currentUser } = useCRM();
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

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  };

  const handleOpenQuickLog = (leadId?: string) => {
    setQuickLogLeadId(leadId);
    setQuickLogOpen(true);
  };

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

          {activeTab === "leads" && <LeadsPage />}

          {activeTab === "pipeline" && (
            <div className="space-y-6 max-w-7xl mx-auto">
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
        onNavigateTab={setActiveTab}
        onOpenQuickLog={() => handleOpenQuickLog()}
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
