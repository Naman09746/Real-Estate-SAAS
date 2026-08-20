"use client";

import * as React from "react";
import {
  User,
  UserRole,
  Region,
  Project,
  Lead,
  Activity,
  Task,
  PipelineStage,
  CallOutcome,
  ActivityType,
} from "@/types/crm";
import {
  INITIAL_ORG,
  INITIAL_REGIONS,
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_LEADS,
  INITIAL_ACTIVITIES,
  INITIAL_TASKS,
} from "@/lib/mock-data";

interface CRMContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  regions: Region[];
  users: User[];
  projects: Project[];
  leads: Lead[];
  filteredLeads: Lead[];
  activities: Activity[];
  tasks: Task[];
  filteredTasks: Task[];
  
  // Boss Global Filters
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedSalespersonId: string;
  setSelectedSalespersonId: (id: string) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;

  // Actions
  logActivity: (params: {
    leadId: string;
    type: ActivityType;
    outcome?: CallOutcome;
    outcomeLabel?: string;
    notes?: string;
    nextFollowUp?: string;
  }) => Promise<boolean>;

  updateLeadStage: (leadId: string, stage: PipelineStage) => Promise<boolean>;
  createLead: (lead: Omit<Lead, "id" | "orgId" | "createdAt" | "lastActivityAt" | "lastActivityText">) => Promise<Lead>;
  completeTask: (taskId: string) => void;
}

const CRMContext = React.createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<User>(INITIAL_USERS[0]); // Starts as Vikram (Boss)
  const [regions] = React.useState<Region[]>(INITIAL_REGIONS);
  const [users] = React.useState<User[]>(INITIAL_USERS);
  const [projects] = React.useState<Project[]>(INITIAL_PROJECTS);
  const [leads, setLeads] = React.useState<Lead[]>(INITIAL_LEADS);
  const [activities, setActivities] = React.useState<Activity[]>(INITIAL_ACTIVITIES);
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);

  // Filters (primarily for Boss/Manager)
  const [selectedRegionId, setSelectedRegionId] = React.useState<string>("all");
  const [selectedSalespersonId, setSelectedSalespersonId] = React.useState<string>("all");
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("all");
  const [dateRange, setDateRange] = React.useState<string>("this_month");

  // Switch role convenience helper
  const switchRole = (role: UserRole) => {
    if (role === "boss") {
      setCurrentUser(INITIAL_USERS[0]); // Vikram
    } else if (role === "salesperson") {
      setCurrentUser(INITIAL_USERS[1]); // Rahul (Gurgaon salesperson)
    }
  };

  // Role-Aware Data Filtering
  const filteredLeads = React.useMemo(() => {
    return leads.filter((lead) => {
      // If Salesperson: strict data isolation - only their assigned leads
      if (currentUser.role === "salesperson") {
        return lead.salespersonId === currentUser.id;
      }

      // If Boss / Admin: apply global organizational filter dimensions
      if (selectedRegionId !== "all" && lead.regionId !== selectedRegionId) {
        return false;
      }
      if (selectedSalespersonId !== "all" && lead.salespersonId !== selectedSalespersonId) {
        return false;
      }
      if (selectedProjectId !== "all" && lead.projectId !== selectedProjectId) {
        return false;
      }
      return true;
    });
  }, [leads, currentUser, selectedRegionId, selectedSalespersonId, selectedProjectId]);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      if (currentUser.role === "salesperson") {
        return task.salespersonId === currentUser.id;
      }
      return true;
    });
  }, [tasks, currentUser]);

  // Fast 10-second activity logger
  const logActivity = async ({
    leadId,
    type,
    outcome,
    outcomeLabel,
    notes,
    nextFollowUp,
  }: {
    leadId: string;
    type: ActivityType;
    outcome?: CallOutcome;
    outcomeLabel?: string;
    notes?: string;
    nextFollowUp?: string;
  }) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return false;

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      orgId: INITIAL_ORG.id,
      leadId,
      personName: lead.personName,
      userId: currentUser.id,
      userName: currentUser.name,
      type,
      outcome,
      outcomeLabel: outcomeLabel || (outcome ? outcome.replace(/_/g, " ") : undefined),
      notes,
      scheduledFollowUpAt: nextFollowUp,
      createdAt: new Date().toISOString(),
    };

    // Update activity timeline
    setActivities((prev) => [newActivity, ...prev]);

    // Update lead record
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            lastActivityText: `${type.toUpperCase()}: ${outcomeLabel || notes || "Logged"}`,
            lastActivityAt: new Date().toISOString(),
            nextFollowUpAt: nextFollowUp || l.nextFollowUpAt,
            followUpStatus: nextFollowUp ? "due_today" : l.followUpStatus,
          };
        }
        return l;
      })
    );

    // If next follow-up requested, create a task
    if (nextFollowUp) {
      const newTask: Task = {
        id: `tsk-${Date.now()}`,
        orgId: INITIAL_ORG.id,
        leadId,
        personName: lead.personName,
        phone: lead.phone,
        projectName: lead.projectName,
        salespersonId: currentUser.id,
        salespersonName: currentUser.name,
        title: `Follow up after ${type}: ${notes || outcomeLabel || "Scheduled"}`,
        dueDate: "Today",
        status: "due_today",
        priority: "high",
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    return true;
  };

  // Safe stage transition
  const updateLeadStage = async (leadId: string, newStage: PipelineStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
    );
    return true;
  };

  // Create lead
  const createLead = async (
    leadData: Omit<Lead, "id" | "orgId" | "createdAt" | "lastActivityAt" | "lastActivityText">
  ) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      orgId: INITIAL_ORG.id,
      lastActivityText: "Lead created",
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  };

  const completeTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "completed" } : t))
    );
  };

  return (
    <CRMContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        regions,
        users,
        projects,
        leads,
        filteredLeads,
        activities,
        tasks,
        filteredTasks,
        selectedRegionId,
        setSelectedRegionId,
        selectedSalespersonId,
        setSelectedSalespersonId,
        selectedProjectId,
        setSelectedProjectId,
        dateRange,
        setDateRange,
        logActivity,
        updateLeadStage,
        createLead,
        completeTask,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = React.useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}
