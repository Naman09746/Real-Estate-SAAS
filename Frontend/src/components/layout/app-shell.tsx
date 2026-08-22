"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { useCRM } from "@/context/crm-context";
import { useAuth } from "@/context/auth-context";
import { BossOverview } from "@/components/crm/boss-overview";
import { SalespersonHome } from "@/components/crm/salesperson-home";
import { PipelineBoard } from "@/components/crm/pipeline-board";
import { QuickActivityModal } from "@/components/crm/quick-activity-modal";
import { GlobalSearchDialog } from "@/components/crm/global-search-dialog";
import { LeadDetailModal } from "@/components/crm/lead-detail-modal";
import { Lead } from "@/types/crm";
import { Loader2 } from "lucide-react";
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
import { LeadsPage } from "@/components/crm/pages/leads-page";
import { ReportsPage } from "@/components/crm/pages/reports-page";
import { ProjectsPage } from "@/components/crm/pages/projects-page";
import { PeoplePage } from "@/components/crm/pages/people-page";
import { ActivitiesPage } from "@/components/crm/pages/activities-page";
import { UsersPage } from "@/components/crm/pages/users-page";
import { RegionsPage } from "@/components/crm/pages/regions-page";
import { SettingsPage } from "@/components/crm/pages/settings-page";
import { TasksPage } from "@/components/crm/pages/tasks-page";
import { AiAgentCommandCenter } from "@/components/crm/ai-agent-command-center";
import { AiLeadBot } from "@/components/crm/ai-lead-bot";

export function AppShell({ initialTab }: { initialTab?: string }) {
  const router = useRouter();
  const { currentUser, leads } = useCRM();
  const { user, workflowStep, isLoading: authLoading } = useAuth();
  const isBoss = currentUser.role === "boss";

  // Auth & onboarding gating — every CRM route shares this contract.
  React.useEffect(() => {
    if (authLoading) return;
    if (!user || workflowStep === "auth") {
      router.replace("/login");
    } else if (workflowStep === "org") {
      router.replace("/setup-org");
    } else if (workflowStep === "plan") {
      router.replace("/choose-plan");
    } else if (workflowStep === "onboarding") {
      router.replace("/onboarding");
    }
  }, [user, workflowStep, authLoading, router]);

  // Navigation State with localStorage persistence
  const [activeTab, setActiveTabState] = React.useState<string>(initialTab || "overview");

  React.useEffect(() => {
    if (initialTab) return; // deep-linked tab wins over persisted state
    try {
      const savedTab = localStorage.getItem("callcrm_active_tab");
      if (savedTab) {
        setActiveTabState(savedTab);
      }
    } catch {}
  }, [initialTab]);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem("callcrm_active_tab", tab);
    } catch {}
  };

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

  // Global Keyboard Shortcuts (L, F, /, Esc)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isInput =
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          (active as HTMLElement).isContentEditable);

      // Esc closes open modals unconditionally
      if (e.key === "Escape") {
        if (quickLogOpen) setQuickLogOpen(false);
        if (detailOpen) setDetailOpen(false);
        if (searchOpen) setSearchOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
        return;
      }

      // If user is typing in a form field, do not trigger single-key hotkeys
      if (isInput) return;

      if (e.key.toLowerCase() === "l" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleOpenQuickLog();
      } else if (e.key.toLowerCase() === "f" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setActiveTab("tasks");
      } else if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickLogOpen, detailOpen, searchOpen, mobileMenuOpen]);

  // Gate rendering until the session + onboarding workflow are resolved.
  if (authLoading || !user || workflowStep !== "app") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading sales cockpit...</p>
        </div>
      </div>
    );
  }

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

          {activeTab === "ai-agent" && (
            <AiAgentCommandCenter onSelectLead={handleOpenLead} />
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
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 h-14 border-t border-border bg-card/95 backdrop-blur-sm px-4 flex items-center justify-around z-40"
          aria-label="Primary"
        >
          <button
            onClick={() => setActiveTab("overview")}
            aria-current={activeTab === "overview" ? "page" : undefined}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              activeTab === "overview" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <HomeIcon className="h-4 w-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            aria-current={activeTab === "leads" ? "page" : undefined}
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
            aria-current={activeTab === "pipeline" ? "page" : undefined}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              activeTab === "pipeline" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <Kanban className="h-4 w-4" />
            <span>Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            aria-current={activeTab === "reports" ? "page" : undefined}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              activeTab === "reports" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <ChartNoAxesCombined className="h-4 w-4" />
            <span>Reports</span>
          </button>
        </nav>
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

      {/* Floating Autonomous Lead Qualification Agent (Aria) */}
      <AiLeadBot
        onOpenLeadDetail={(leadId) => {
          const lead = leads.find((l) => l.id === leadId);
          if (lead) handleOpenLead(lead);
        }}
      />
    </div>
  );
}
