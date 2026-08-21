"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, workflowStep, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;

    if (!user || workflowStep === "auth") {
      router.replace("/login");
    } else if (workflowStep === "org") {
      router.replace("/setup-org");
    } else if (workflowStep === "plan") {
      router.replace("/choose-plan");
    } else if (workflowStep === "onboarding") {
      router.replace("/onboarding");
    }
  }, [user, workflowStep, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading sales cockpit...</p>
        </div>
      </div>
    );
  }

  // If user is ready for app
  return <AppShell />;
}
