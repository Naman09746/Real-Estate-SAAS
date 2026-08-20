"use client";

import * as React from "react";
import {
  User,
  UserRole,
  Region,
  Project,
  ProjectUnit,
  UnitStatus,
  Person,
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
  INITIAL_UNITS,
  INITIAL_PEOPLE,
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
  units: ProjectUnit[];
  people: Person[];
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
  updateUnitStatus: (unitId: string, status: UnitStatus, leadId?: string, buyerName?: string) => Promise<boolean>;
  assignUnitToLead: (leadId: string, unitId: string) => Promise<boolean>;
  bulkUpdateLeadsStage: (leadIds: string[], stage: PipelineStage) => Promise<boolean>;
  bulkAssignLeadsRep: (leadIds: string[], repId: string, repName: string) => Promise<boolean>;
  bulkScheduleFollowUp: (leadIds: string[], dueDate: string, dueTime?: string) => Promise<boolean>;
}

const CRMContext = React.createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<User>(INITIAL_USERS[0]); // Starts as Vikram (Boss)
  const [regions] = React.useState<Region[]>(INITIAL_REGIONS);
  const [users] = React.useState<User[]>(INITIAL_USERS);
  const [projects] = React.useState<Project[]>(INITIAL_PROJECTS);
  const [units, setUnits] = React.useState<ProjectUnit[]>(INITIAL_UNITS);
  const [people, setPeople] = React.useState<Person[]>(INITIAL_PEOPLE);
  const [leads, setLeads] = React.useState<Lead[]>(INITIAL_LEADS);
  const [activities, setActivities] = React.useState<Activity[]>(INITIAL_ACTIVITIES);
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);

  // Filters (primarily for Boss/Manager) with localStorage persistence
  const [selectedRegionId, setSelectedRegionIdState] = React.useState<string>("all");
  const [selectedSalespersonId, setSelectedSalespersonIdState] = React.useState<string>("all");
  const [selectedProjectId, setSelectedProjectIdState] = React.useState<string>("all");
  const [dateRange, setDateRangeState] = React.useState<string>("this_month");

  // Restore saved filters on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("callcrm_global_filters");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedRegionId) setSelectedRegionIdState(parsed.selectedRegionId);
        if (parsed.selectedSalespersonId) setSelectedSalespersonIdState(parsed.selectedSalespersonId);
        if (parsed.selectedProjectId) setSelectedProjectIdState(parsed.selectedProjectId);
        if (parsed.dateRange) setDateRangeState(parsed.dateRange);
      }
    } catch (e) {
      console.warn("Could not load saved filters", e);
    }
  }, []);

  const setSelectedRegionId = (id: string) => {
    setSelectedRegionIdState(id);
    try {
      const saved = JSON.parse(localStorage.getItem("callcrm_global_filters") || "{}");
      localStorage.setItem("callcrm_global_filters", JSON.stringify({ ...saved, selectedRegionId: id }));
    } catch {}
  };

  const setSelectedSalespersonId = (id: string) => {
    setSelectedSalespersonIdState(id);
    try {
      const saved = JSON.parse(localStorage.getItem("callcrm_global_filters") || "{}");
      localStorage.setItem("callcrm_global_filters", JSON.stringify({ ...saved, selectedSalespersonId: id }));
    } catch {}
  };

  const setSelectedProjectId = (id: string) => {
    setSelectedProjectIdState(id);
    try {
      const saved = JSON.parse(localStorage.getItem("callcrm_global_filters") || "{}");
      localStorage.setItem("callcrm_global_filters", JSON.stringify({ ...saved, selectedProjectId: id }));
    } catch {}
  };

  const setDateRange = (range: string) => {
    setDateRangeState(range);
    try {
      const saved = JSON.parse(localStorage.getItem("callcrm_global_filters") || "{}");
      localStorage.setItem("callcrm_global_filters", JSON.stringify({ ...saved, dateRange: range }));
    } catch {}
  };

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

  // Fast activity logger with interconnected state updates
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

    // Update lead record & stage progression if outcome dictates
    let updatedStage = lead.stage;
    if (outcomeLabel === "Site Visit Booked" && ["new", "contacted", "qualified"].includes(lead.stage)) {
      updatedStage = "site_visit";
    } else if (outcomeLabel === "Negotiating" && ["new", "contacted", "qualified", "site_visit"].includes(lead.stage)) {
      updatedStage = "negotiation";
    } else if (outcomeLabel === "Not Interested") {
      updatedStage = "lost";
    }

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            stage: updatedStage,
            dealHealth: outcomeLabel === "Not Interested" ? "neutral" : "strong",
            dealHealthReason: outcomeLabel === "Not Interested" ? "Marked Not Interested" : `Recent ${type} touchpoint: ${outcomeLabel || "Connected"}`,
            lastActivityText: `${type.toUpperCase()}: ${outcomeLabel || notes || "Logged"}`,
            lastActivityAt: new Date().toISOString(),
            lastConversationSummary: notes ? notes : l.lastConversationSummary,
            nextFollowUpAt: nextFollowUp || l.nextFollowUpAt,
            followUpStatus: nextFollowUp ? "due_today" : l.followUpStatus,
          };
        }
        return l;
      })
    );

    // Auto-complete any existing pending tasks for this lead since the rep just completed outreach
    setTasks((prev) =>
      prev.map((t) => {
        if (t.leadId === leadId && t.status !== "completed") {
          return { ...t, status: "completed" };
        }
        return t;
      })
    );

    // If next follow-up requested, create a fresh prioritized task
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
        title: `Follow-up commitment: ${outcomeLabel || "Outreach"} (${nextFollowUp})`,
        dueDate: "Today",
        dueTime: nextFollowUp.includes(",") ? nextFollowUp.split(",")[1]?.trim() : "11:00 AM",
        status: "due_today",
        priority: "high",
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    return true;
  };

  // Safe stage transition with unit & lead health synchronization
  const updateLeadStage = async (leadId: string, newStage: PipelineStage) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return false;

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const isWon = newStage === "won";
          return {
            ...l,
            stage: newStage,
            daysInStage: 0,
            dealHealth: isWon ? "strong" : l.dealHealth,
            lastActivityText: `Stage changed to ${newStage.toUpperCase().replace("_", " ")}`,
            lastActivityAt: new Date().toISOString(),
            followUpStatus: isWon ? "completed" : l.followUpStatus,
          };
        }
        return l;
      })
    );

    // Log stage change activity
    const stageActivity: Activity = {
      id: `act-${Date.now()}`,
      orgId: INITIAL_ORG.id,
      leadId,
      personName: lead.personName,
      userId: currentUser.id,
      userName: currentUser.name,
      type: newStage === "won" ? "booking" : "stage_change",
      outcomeLabel: `Advanced to ${newStage.replace("_", " ").toUpperCase()}`,
      notes: `Pipeline milestone updated to ${newStage}`,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [stageActivity, ...prev]);

    // If assigned a unit and won, update unit status to booked/sold
    if (lead.assignedUnitId) {
      if (newStage === "won") {
        setUnits((prev) =>
          prev.map((u) => (u.id === lead.assignedUnitId ? { ...u, status: "booked" } : u))
        );
      } else if (newStage === "lost") {
        setUnits((prev) =>
          prev.map((u) =>
            u.id === lead.assignedUnitId
              ? { ...u, status: "available", assignedLeadId: undefined, assignedBuyerName: undefined }
              : u
          )
        );
      } else if (newStage === "negotiation") {
        setUnits((prev) =>
          prev.map((u) => (u.id === lead.assignedUnitId ? { ...u, status: "negotiation" } : u))
        );
      } else if (newStage === "site_visit") {
        setUnits((prev) =>
          prev.map((u) => (u.id === lead.assignedUnitId ? { ...u, status: "site_visit" } : u))
        );
      }
    }

    return true;
  };

  // Create lead with people table synchronization
  const createLead = async (
    leadData: Omit<Lead, "id" | "orgId" | "createdAt" | "lastActivityAt" | "lastActivityText">
  ) => {
    const newId = `lead-${Date.now()}`;
    const newLead: Lead = {
      ...leadData,
      id: newId,
      orgId: INITIAL_ORG.id,
      dealHealth: leadData.dealHealth || "strong",
      leadScore: leadData.leadScore || 85,
      leadScoreLabel: leadData.leadScoreLabel || "Hot",
      daysInStage: 0,
      lastActivityText: "Lead created and verified",
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setLeads((prev) => [newLead, ...prev]);

    // Ensure person exists in people database
    setPeople((prev) => {
      if (prev.some((p) => p.phone === leadData.phone)) {
        return prev;
      }
      return [
        {
          id: leadData.personId || `per-${Date.now()}`,
          orgId: INITIAL_ORG.id,
          name: leadData.personName,
          phone: leadData.phone,
          email: leadData.email,
          city: leadData.regionName,
          regionId: leadData.regionId,
          regionName: leadData.regionName,
          preferredConfiguration: leadData.configurationPreference,
          budget: leadData.budget,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });

    return newLead;
  };

  const completeTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "completed" } : t))
    );

    if (task) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === task.leadId
            ? { ...l, followUpStatus: "completed", lastActivityText: `Task completed: ${task.title}` }
            : l
        )
      );
    }
  };

  const updateUnitStatus = async (
    unitId: string,
    status: UnitStatus,
    leadId?: string,
    buyerName?: string
  ) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          return {
            ...u,
            status,
            assignedLeadId: leadId !== undefined ? leadId : u.assignedLeadId,
            assignedBuyerName: buyerName !== undefined ? buyerName : u.assignedBuyerName,
          };
        }
        return u;
      })
    );
    return true;
  };

  const assignUnitToLead = async (leadId: string, unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    const lead = leads.find((l) => l.id === leadId);
    if (!unit || !lead) return false;

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              assignedUnitId: unit.id,
              assignedUnitNumber: unit.unitNumber,
              lastActivityText: `Assigned unit ${unit.unitNumber} (${unit.tower})`,
            }
          : l
      )
    );

    setUnits((prev) =>
      prev.map((u) =>
        u.id === unitId
          ? {
              ...u,
              assignedLeadId: lead.id,
              assignedBuyerName: lead.personName,
              status: lead.stage === "won" ? "booked" : lead.stage === "negotiation" ? "negotiation" : "hold",
            }
          : u
      )
    );

    return true;
  };

  const bulkUpdateLeadsStage = async (leadIds: string[], stage: PipelineStage) => {
    setLeads((prev) =>
      prev.map((l) =>
        leadIds.includes(l.id)
          ? {
              ...l,
              stage,
              daysInStage: 0,
              lastActivityText: `Bulk update: moved to ${stage.toUpperCase()}`,
              lastActivityAt: new Date().toISOString(),
            }
          : l
      )
    );
    return true;
  };

  const bulkAssignLeadsRep = async (leadIds: string[], repId: string, repName: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        leadIds.includes(l.id)
          ? {
              ...l,
              salespersonId: repId,
              salespersonName: repName,
              lastActivityText: `Reassigned to ${repName}`,
              lastActivityAt: new Date().toISOString(),
            }
          : l
      )
    );
    return true;
  };

  const bulkScheduleFollowUp = async (leadIds: string[], dueDate: string, dueTime?: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        leadIds.includes(l.id)
          ? {
              ...l,
              nextFollowUpAt: `${dueDate}${dueTime ? `, ${dueTime}` : ""}`,
              followUpStatus: dueDate.toLowerCase().includes("today") ? "due_today" : "upcoming",
            }
          : l
      )
    );

    const targetLeads = leads.filter((l) => leadIds.includes(l.id));
    const newTasks: Task[] = targetLeads.map((l) => ({
      id: `tsk-${Date.now()}-${l.id}`,
      orgId: INITIAL_ORG.id,
      leadId: l.id,
      personName: l.personName,
      phone: l.phone,
      projectName: l.projectName,
      salespersonId: l.salespersonId,
      salespersonName: l.salespersonName,
      title: `Scheduled Follow-up for ${l.personName}`,
      dueDate,
      dueTime,
      status: dueDate.toLowerCase().includes("today") ? "due_today" : "upcoming",
      priority: "high",
    }));

    setTasks((prev) => [...newTasks, ...prev]);
    return true;
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
        units,
        people,
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
        updateUnitStatus,
        assignUnitToLead,
        bulkUpdateLeadsStage,
        bulkAssignLeadsRep,
        bulkScheduleFollowUp,
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

