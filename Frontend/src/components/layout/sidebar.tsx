"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Contact,
  Building2,
  Activity,
  ListTodo,
  ChartNoAxesCombined,
  MapPin,
  Settings,
  Home,
  Shield,
  UserCheck,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { currentUser, switchRole } = useCRM();

  // Role-Aware Navigation
  const isBoss = currentUser.role === "boss";

  const bossNavItems = [
    { label: "Overview", href: "/", icon: LayoutDashboard },
    { label: "Leads", href: "/leads", icon: Users },
    { label: "Pipeline", href: "/pipeline", icon: Kanban },
    { label: "People", href: "/people", icon: Contact },
    { label: "Projects", href: "/projects", icon: Building2 },
    { label: "Activities", href: "/activities", icon: Activity },
    { label: "Tasks", href: "/tasks", icon: ListTodo },
    { label: "Reports", href: "/reports", icon: ChartNoAxesCombined },
  ];

  const adminNavItems = [
    { label: "Users", href: "/users", icon: Users },
    { label: "Regions", href: "/regions", icon: MapPin },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const salespersonNavItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "My Leads", href: "/leads", icon: Users },
    { label: "Follow-ups", href: "/tasks", icon: ListTodo },
    { label: "Projects", href: "/projects", icon: Building2 },
    { label: "Activities", href: "/activities", icon: Activity },
  ];

  const currentNav = isBoss ? bossNavItems : salespersonNavItems;

  return (
    <aside
      className={cn(
        "w-60 shrink-0 border-r border-border bg-card flex flex-col justify-between h-full select-none",
        className
      )}
    >
      {/* Top Organization Header */}
      <div>
        <div className="h-14 px-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-subtle">
              C
            </div>
            <div className="leading-none">
              <span className="font-semibold text-xs text-foreground tracking-tight block">
                CallCRM
              </span>
              <span className="text-[10px] text-muted-foreground">Apex Realty</span>
            </div>
          </div>

          <Badge variant={isBoss ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
            {isBoss ? "Boss" : "Sales"}
          </Badge>
        </div>

        {/* Primary Navigation */}
        <div className="px-3 py-3 space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isBoss ? "Management" : "Sales Workspace"}
          </div>

          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground font-semibold shadow-subtle"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 stroke-[1.75]" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Admin Section for Boss */}
          {isBoss && (
            <div className="pt-4 space-y-1">
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Administration
              </div>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 stroke-[1.75]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Role Switching / Perspective Toggle (Live Testing Widget) */}
      <div className="p-3 border-t border-border bg-secondary/30 space-y-2">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Switch User Role
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => switchRole("boss")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium border transition-all",
              isBoss
                ? "bg-primary text-primary-foreground border-primary shadow-subtle font-semibold"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            )}
          >
            <Shield className="h-3 w-3" />
            Boss
          </button>

          <button
            type="button"
            onClick={() => switchRole("salesperson")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium border transition-all",
              !isBoss
                ? "bg-primary text-primary-foreground border-primary shadow-subtle font-semibold"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            )}
          >
            <UserCheck className="h-3 w-3" />
            Sales
          </button>
        </div>

        <div className="text-[10px] text-muted-foreground text-center pt-0.5">
          Active: <span className="font-semibold text-foreground">{currentUser.name}</span>
          {currentUser.regionName && ` (${currentUser.regionName})`}
        </div>
      </div>
    </aside>
  );
}
