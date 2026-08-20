"use client";

import * as React from "react";
import { Search, Plus, User, Shield, Menu } from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  onOpenQuickLog: () => void;
  onOpenSearch: () => void;
  onToggleMobileMenu?: () => void;
}

export function TopBar({ onOpenQuickLog, onOpenSearch, onToggleMobileMenu }: TopBarProps) {
  const { currentUser } = useCRM();
  const isBoss = currentUser.role === "boss";

  return (
    <header className="h-14 border-b border-border bg-card/95 backdrop-blur-sm px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Mobile Menu Button & Search Trigger */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-md border border-border bg-secondary text-foreground"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Global Search Bar Trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-secondary/50 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-all w-44 sm:w-64"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate">Search leads, people...</span>
          <kbd className="hidden sm:inline-block ml-auto pointer-events-none text-[10px] font-mono border border-border/80 bg-card px-1 rounded text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Side: Quick Action & User Profile */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={onOpenQuickLog}
          className="h-8 text-xs font-semibold gap-1.5 shadow-subtle"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Log Activity</span>
          <span className="sm:hidden">Log</span>
        </Button>

        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <Avatar className="h-7 w-7 text-xs">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left leading-none">
            <div className="text-xs font-semibold text-foreground">{currentUser.name}</div>
            <div className="text-[10px] text-muted-foreground capitalize">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
