"use client";

import * as React from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { UserRole } from "@/types/crm";

export type WorkflowStep = "auth" | "org" | "plan" | "onboarding" | "app";

export interface AuthOrg {
  id: string;
  name: string;
  slug: string;
  teamSize: string;
  primaryRegion: string;
  plan?: "starter" | "growth" | "enterprise";
  billingCycle?: "monthly" | "yearly";
  trialActive?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface OnboardingData {
  importedLeadsCount: number;
  invitedEmails: string[];
  pipelineConfigured: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  org: AuthOrg | null;
  workflowStep: WorkflowStep;
  isLoading: boolean;
  isConfigured: boolean;
  onboardingData: OnboardingData;
  
  // Actions
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  
  saveOrgSetup: (orgData: { name: string; teamSize: string; primaryRegion: string }) => void;
  selectPlan: (plan: "starter" | "growth" | "enterprise", billingCycle: "monthly" | "yearly") => void;
  completeOnboardingStep: (step: "leads" | "team" | "pipeline", payload?: any) => void;
  skipOnboarding: () => void;
  setWorkflowStep: (step: WorkflowStep) => void;
  resetWorkflow: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "callcrm_auth_user",
  ORG: "callcrm_auth_org",
  STEP: "callcrm_workflow_step",
  ONBOARDING: "callcrm_onboarding_data",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [org, setOrg] = React.useState<AuthOrg | null>(null);
  const [workflowStep, setWorkflowStepState] = React.useState<WorkflowStep>("auth");
  const [isLoading, setIsLoading] = React.useState(true);
  const [onboardingData, setOnboardingData] = React.useState<OnboardingData>({
    importedLeadsCount: 0,
    invitedEmails: [],
    pipelineConfigured: false,
  });

  // Restore session from Supabase or localStorage on mount
  React.useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      const supabase = getSupabaseClient();

      if (supabase && isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
              role: "boss",
              avatarUrl: session.user.user_metadata?.avatar_url,
            };
            setUser(authUser);
          }
        } catch (e) {
          console.warn("Supabase auth session fetch failed, fallback to local storage:", e);
        }
      }

      // Restore local state
      try {
        const savedUserStr = localStorage.getItem(STORAGE_KEYS.USER);
        const savedOrgStr = localStorage.getItem(STORAGE_KEYS.ORG);
        const savedStep = localStorage.getItem(STORAGE_KEYS.STEP) as WorkflowStep | null;
        const savedOnboardingStr = localStorage.getItem(STORAGE_KEYS.ONBOARDING);

        const parsedUser: AuthUser | null = savedUserStr ? JSON.parse(savedUserStr) : null;
        const parsedOrg: AuthOrg | null = savedOrgStr ? JSON.parse(savedOrgStr) : null;

        if (parsedUser && !user) {
          setUser(parsedUser);
        }
        if (parsedOrg) {
          setOrg(parsedOrg);
        }
        if (savedStep) {
          setWorkflowStepState(savedStep);
        } else if (parsedUser) {
          setWorkflowStepState(parsedOrg ? (parsedOrg.plan ? "app" : "plan") : "org");
        }
        if (savedOnboardingStr) {
          setOnboardingData(JSON.parse(savedOnboardingStr));
        }
      } catch (e) {
        console.warn("Could not read auth from localStorage", e);
      } finally {
        setIsLoading(false);
      }

      // Supabase Auth listener
      if (supabase && isSupabaseConfigured) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
              role: "boss",
              avatarUrl: session.user.user_metadata?.avatar_url,
            };
            setUser(authUser);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
            if (!org) {
              setWorkflowStepState("org");
              localStorage.setItem(STORAGE_KEYS.STEP, "org");
            }
          } else {
            // Keep local mock user if Supabase is logged out
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      }
    }

    initAuth();
  }, []);

  const setWorkflowStep = (step: WorkflowStep) => {
    setWorkflowStepState(step);
    try {
      localStorage.setItem(STORAGE_KEYS.STEP, step);
    } catch {}
  };

  const signUp = async (email: string, password: string, name: string) => {
    const supabase = getSupabaseClient();
    
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: name,
            role: "boss",
          };
          setUser(authUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
          setWorkflowStep("org");
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to sign up" };
      }
    }

    // Fallback/Demo instant signup
    const demoUser: AuthUser = {
      id: `usr-${Date.now()}`,
      email,
      name,
      role: "boss",
    };
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
    setWorkflowStep("org");
    return { success: true };
  };

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || email.split("@")[0],
            role: "boss",
          };
          setUser(authUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
          // If they already have an org and plan, go to app, else continue setup
          if (org?.plan) {
            setWorkflowStep("app");
          } else if (org) {
            setWorkflowStep("plan");
          } else {
            setWorkflowStep("org");
          }
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to sign in" };
      }
    }

    // Fallback/Demo instant signin
    const demoUser: AuthUser = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      role: "boss",
    };
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
    
    if (org?.plan) {
      setWorkflowStep("app");
    } else if (org) {
      setWorkflowStep("plan");
    } else {
      setWorkflowStep("org");
    }
    return { success: true };
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient();
    
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/setup-org`,
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to initialize Google login" };
      }
    }

    // Fallback/Demo Google signin
    const demoUser: AuthUser = {
      id: `usr-google-${Date.now()}`,
      email: "partner@realtysaas.in",
      name: "SaaS Partner",
      role: "boss",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
    setWorkflowStep("org");
    return { success: true };
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setOrg(null);
    setWorkflowStep("auth");
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ORG);
      localStorage.removeItem(STORAGE_KEYS.STEP);
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING);
    } catch {}
  };

  const saveOrgSetup = (orgData: { name: string; teamSize: string; primaryRegion: string }) => {
    const newOrg: AuthOrg = {
      id: `org-${Date.now()}`,
      name: orgData.name,
      slug: orgData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      teamSize: orgData.teamSize,
      primaryRegion: orgData.primaryRegion,
    };
    setOrg(newOrg);
    localStorage.setItem(STORAGE_KEYS.ORG, JSON.stringify(newOrg));
    setWorkflowStep("plan");
  };

  const selectPlan = (plan: "starter" | "growth" | "enterprise", billingCycle: "monthly" | "yearly") => {
    if (!org) return;
    const updatedOrg: AuthOrg = {
      ...org,
      plan,
      billingCycle,
      trialActive: true,
    };
    setOrg(updatedOrg);
    localStorage.setItem(STORAGE_KEYS.ORG, JSON.stringify(updatedOrg));
    setWorkflowStep("onboarding");
  };

  const completeOnboardingStep = (step: "leads" | "team" | "pipeline", payload?: any) => {
    setOnboardingData((prev) => {
      let updated = { ...prev };
      if (step === "leads" && payload?.count) {
        updated.importedLeadsCount = payload.count;
      } else if (step === "team" && payload?.emails) {
        updated.invitedEmails = payload.emails;
      } else if (step === "pipeline") {
        updated.pipelineConfigured = true;
      }
      localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(updated));
      return updated;
    });
  };

  const skipOnboarding = () => {
    setWorkflowStep("app");
  };

  const resetWorkflow = () => {
    setUser(null);
    setOrg(null);
    setWorkflowStep("auth");
    setOnboardingData({
      importedLeadsCount: 0,
      invitedEmails: [],
      pipelineConfigured: false,
    });
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        org,
        workflowStep,
        isLoading,
        isConfigured: isSupabaseConfigured,
        onboardingData,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        saveOrgSetup,
        selectPlan,
        completeOnboardingStep,
        skipOnboarding,
        setWorkflowStep,
        resetWorkflow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
