"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { useCRM } from "@/context/crm-context";
import { QuickActivityModal } from "@/components/crm/quick-activity-modal";
import { GlobalSearchDialog } from "@/components/crm/global-search-dialog";
import { LeadDetailModal } from "@/components/crm/lead-detail-modal";
import { Lead } from "@/types/crm";
import {
  Home,
  Users,
  Kanban,
  ListTodo,
  Plus,
  ChartNoAxesCombined,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser } = useCRM();

  // Modals state
  const [quickLogOpen, setQuickLogOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/10">
      {/* Desktop Persistent Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw]">
            <Sidebar className="h-full w-full" />
          </div>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar
          onOpenQuickLog={() => setQuickLogOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Scrollable Page Views */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation (1-Thumb Reachability) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 border-t border-border bg-card/95 backdrop-blur-sm px-4 flex items-center justify-around z-40">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              pathname === "/" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>

          <Link
            href="/leads"
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              pathname === "/leads" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Leads</span>
          </Link>

          {/* Quick 10s Activity Hero Button on Mobile */}
          <button
            type="button"
            onClick={() => setQuickLogOpen(true)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-card -translate-y-2 border-2 border-background"
            aria-label="Quick Log Activity"
          >
            <Plus className="h-5 w-5" />
          </button>

          <Link
            href="/pipeline"
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              pathname === "/pipeline" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <Kanban className="h-4 w-4" />
            <span>Pipeline</span>
          </Link>

          <Link
            href="/reports"
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              pathname === "/reports" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <ChartNoAxesCombined className="h-4 w-4" />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {/* Global Interactive Modals */}
      <QuickActivityModal
        open={quickLogOpen}
        onOpenChange={setQuickLogOpen}
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
        onLogActivity={() => setQuickLogOpen(true)}
      />
    </div>
  );
}
