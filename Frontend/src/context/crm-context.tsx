"use client";

import * as React from "react";
import {
  User,
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
  CRMDocument,
} from "@/types/crm";
import {
  INITIAL_REGIONS,
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_UNITS,
  INITIAL_PEOPLE,
  INITIAL_LEADS,
  INITIAL_ACTIVITIES,
  INITIAL_TASKS,
  INITIAL_DOCUMENTS,
} from "@/lib/mock-data";
import { normalizePhone } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase";
import {
  isSyncEnabled,
  hydrateCrmData,
  fetchLeads,
  fetchTasks,
  fetchActivities,
  mapLeadRow,
  leadToRow,
  updateLeadRemote,
  insertActivityRemote,
  insertTaskRemote,
  completeTaskRemote,
  updateUnitRemote,
  insertDocumentRemote,
  deleteDocumentRemote,
} from "@/lib/persistence/crm-sync";
import { reportError } from "@/lib/observability/reporter";
import { scheduleRetry, onWriteAbandoned } from "@/lib/persistence/retry-queue";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

interface CRMContextType {
  currentUser: User;
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
  documents: CRMDocument[];
  reactivationLeads: Lead[];

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

  // Document Vault Actions
  uploadDocument: (doc: Omit<CRMDocument, "id" | "orgId" | "createdAt">) => Promise<CRMDocument>;
  deleteDocument: (docId: string) => Promise<boolean>;

  // Lost Lead Reactivation Action
  reactivateLead: (leadId: string, customPitch?: string) => Promise<boolean>;
}

const CRMContext = React.createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, isLoading: authLoading } = useAuth();

  // Seeded with the demo dataset; replaced wholesale by live Supabase data
  // whenever an authenticated session exists.
  const [regions, setRegions] = React.useState<Region[]>(INITIAL_REGIONS);
  const [users, setUsers] = React.useState<User[]>(INITIAL_USERS);
  const [projects, setProjects] = React.useState<Project[]>(INITIAL_PROJECTS);
  const [units, setUnits] = React.useState<ProjectUnit[]>(INITIAL_UNITS);
  const [people, setPeople] = React.useState<Person[]>(INITIAL_PEOPLE);
  const [leads, setLeads] = React.useState<Lead[]>(INITIAL_LEADS);
  const [activities, setActivities] = React.useState<Activity[]>(INITIAL_ACTIVITIES);
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);
  const [documents, setDocuments] = React.useState<CRMDocument[]>(INITIAL_DOCUMENTS);

  const [currentOrgId, setCurrentOrgId] = React.useState<string>("");

  // Identity comes from the authenticated session — never from client input.
  const currentUser = React.useMemo<User>(() => {
    if (authUser) {
      return {
        id: authUser.id,
        orgId: currentOrgId,
        name: authUser.name,
        email: authUser.email,
        phone: "",
        role: authUser.role,
        avatarUrl: authUser.avatarUrl,
      };
    }
    return INITIAL_USERS[0]; // demo mode only
  }, [authUser, currentOrgId]);

  // --------------------------------------------------------------------
  // Hydration: load live tenant data once per authenticated session, then
  // keep leads in sync across sessions/devices via a realtime channel.
  // --------------------------------------------------------------------
  React.useEffect(() => {
    if (!isSyncEnabled() || authLoading || !authUser) return;

    let cancelled = false;
    let refetchTimer: ReturnType<typeof setTimeout> | null = null;
    let channel: ReturnType<NonNullable<ReturnType<typeof getSupabaseClient>>["channel"]> | null = null;

    (async () => {
      const data = await hydrateCrmData();
      if (cancelled) return;
      if (!data) {
        reportError("crm.hydrate", new Error("CRM hydration returned null"));
        toast.error("Live CRM data could not be loaded. Showing demo dataset.");
        return;
      }
      setCurrentOrgId(data.orgId || "");
      setRegions(data.regions.length ? data.regions : INITIAL_REGIONS);
      setUsers(data.users.length ? data.users : INITIAL_USERS);
      setProjects(data.projects);
      setUnits(data.units);
      setPeople(data.people);
      setLeads(data.leads);
      setActivities(data.activities);
      setTasks(data.tasks);
      setDocuments(data.documents);

      // Realtime: any change from ANY session/device triggers a debounced
      // refetch per entity — simple, correct, and avoids patch-order bugs.
      const supabase = getSupabaseClient();
      if (supabase) {
        const debouncedRefetch = (fetcher: () => Promise<unknown>, apply: (data: any) => void) => {
          return () => {
            if (refetchTimer) clearTimeout(refetchTimer);
            refetchTimer = setTimeout(async () => {
              if (cancelled) return;
              try {
                const fresh = await fetcher();
                if (!cancelled && fresh) apply(fresh);
              } catch (e) {
                reportError("crm.realtime", e);
              }
            }, 1500);
          };
        };

        channel = supabase
          .channel("crm-realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "leads" },
            debouncedRefetch(fetchLeads, (rows) => setLeads(rows))
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "tasks" },
            debouncedRefetch(fetchTasks, (rows) => setTasks(rows))
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "activities" },
            debouncedRefetch(fetchActivities, (rows) => setActivities(rows))
          )
          .subscribe();
      }
    })();

    return () => {
      cancelled = true;
      if (refetchTimer) clearTimeout(refetchTimer);
      channel?.unsubscribe();
    };
  }, [authUser?.id, authLoading]);

  // Surface writes that exhausted their retry budget — real potential loss.
  React.useEffect(() => {
    return onWriteAbandoned((label, attempts) => {
      reportError("crm.sync.abandoned", new Error("Write abandoned after retries"), {
        label,
        attempts,
      });
      toast.error(`"${label}" could not be saved after ${attempts} attempts. Please verify your data.`);
    });
  }, []);

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

  // Stable callbacks — recreated never, so consumers can rely on identity.
  const persistFilter = React.useCallback((key: string, value: string) => {
    try {
      const saved = JSON.parse(localStorage.getItem("callcrm_global_filters") || "{}");
      localStorage.setItem("callcrm_global_filters", JSON.stringify({ ...saved, [key]: value }));
    } catch {}
  }, []);

  const setSelectedRegionId = React.useCallback(
    (id: string) => {
      setSelectedRegionIdState(id);
      persistFilter("selectedRegionId", id);
    },
    [persistFilter]
  );

  const setSelectedSalespersonId = React.useCallback(
    (id: string) => {
      setSelectedSalespersonIdState(id);
      persistFilter("selectedSalespersonId", id);
    },
    [persistFilter]
  );

  const setSelectedProjectId = React.useCallback(
    (id: string) => {
      setSelectedProjectIdState(id);
      persistFilter("selectedProjectId", id);
    },
    [persistFilter]
  );

  const setDateRange = React.useCallback(
    (range: string) => {
      setDateRangeState(range);
      persistFilter("dateRange", range);
    },
    [persistFilter]
  );

  // Fire-and-forget remote sync wrapper. Local state stays optimistic; failures
  // are queued for automatic retry (online/focus/timer) and surfaced honestly.
  const syncRemote = React.useCallback(async (label: string, fn: () => Promise<boolean>) => {
    try {
      const ok = await fn();
      if (!ok) {
        scheduleRetry(label, fn);
        toast.warning(`${label} saved locally — will retry automatically.`);
      }
    } catch (e) {
      reportError("crm.sync", e, { label });
      scheduleRetry(label, fn);
      toast.warning(`${label} saved locally — will retry automatically.`);
    }
  }, []);

  // Multi-Tenant & Role-Aware Data Filtering
  const filteredLeads = React.useMemo(() => {
    return leads.filter((lead) => {
      // 1. Hard Multi-Tenant Isolation: Never show records from another organization
      if (lead.orgId && currentUser.orgId && lead.orgId !== currentUser.orgId) {
        return false;
      }

      // 2. If Salesperson: strict data isolation - only their assigned leads
      if (currentUser.role === "salesperson") {
        return lead.salespersonId === currentUser.id;
      }

      // 3. If Boss / Admin: apply global organizational filter dimensions
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
      // 1. Hard Multi-Tenant Isolation
      if (task.orgId && currentUser.orgId && task.orgId !== currentUser.orgId) {
        return false;
      }

      // 2. Salesperson Isolation
      if (currentUser.role === "salesperson") {
        return task.salespersonId === currentUser.id;
      }
      return true;
    });
  }, [tasks, currentUser]);

  // Fast activity logger with interconnected state updates
  const logActivity = React.useCallback(async ({
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
      orgId: lead.orgId || currentUser.orgId,
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

    const stageChanged = updatedStage !== lead.stage;

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
    const pendingTaskIds = tasks
      .filter((t) => t.leadId === leadId && t.status !== "completed")
      .map((t) => t.id);

    setTasks((prev) =>
      prev.map((t) => {
        if (t.leadId === leadId && t.status !== "completed") {
          return { ...t, status: "completed" as const };
        }
        return t;
      })
    );

    // If next follow-up requested, create a fresh prioritized task
    let newTask: Task | null = null;
    if (nextFollowUp) {
      newTask = {
        id: `tsk-${Date.now()}`,
        orgId: lead.orgId || currentUser.orgId,
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
      setTasks((prev) => [newTask!, ...prev]);
    }

    // ---- Remote write-through ----
    if (isSyncEnabled()) {
      const { id: _actId, ...activityRow } = newActivity;
      void syncRemote("Activity", () => insertActivityRemote(activityRow));
      void syncRemote("Lead update", () =>
        updateLeadRemote(leadId, {
          stage: updatedStage,
          dealHealth: outcomeLabel === "Not Interested" ? "neutral" : "strong",
          lastActivityText: `${type.toUpperCase()}: ${outcomeLabel || notes || "Logged"}`,
          lastActivityAt: newActivity.createdAt,
          lastConversationSummary: notes ?? lead.lastConversationSummary,
          nextFollowUpAt: nextFollowUp ?? lead.nextFollowUpAt,
          followUpStatus: nextFollowUp ? "due_today" : lead.followUpStatus,
        })
      );
      for (const taskId of pendingTaskIds) {
        void syncRemote("Task completion", () => completeTaskRemote(taskId));
      }
      if (newTask) {
        const { id: _tskId, ...taskRow } = newTask;
        void syncRemote("Follow-up task", () => insertTaskRemote(taskRow));
      }
    }

    toast.success(`Logged ${type.toUpperCase()}: ${outcomeLabel || "Touchpoint recorded"}`);
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, tasks, currentUser.id, currentUser.orgId, currentUser.name, syncRemote]);

  const updateLeadStage = React.useCallback(async (leadId: string, newStage: PipelineStage) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) {
      toast.error("Lead not found");
      return false;
    }

    const nowIso = new Date().toISOString();
    const isWon = newStage === "won";

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const nowLost = newStage === "lost";
          return {
            ...l,
            stage: newStage,
            daysInStage: 0,
            lostAt: nowLost ? nowIso : l.lostAt,
            dealHealth: isWon ? "strong" : l.dealHealth,
            lastActivityText: `Stage changed to ${newStage.toUpperCase().replace("_", " ")}`,
            lastActivityAt: nowIso,
            followUpStatus: isWon ? "completed" : l.followUpStatus,
          };
        }
        return l;
      })
    );

    // Log stage change activity
    const stageActivity: Activity = {
      id: `act-${Date.now()}`,
      orgId: lead.orgId || currentUser.orgId,
      leadId,
      personName: lead.personName,
      userId: currentUser.id,
      userName: currentUser.name,
      type: newStage === "won" ? "booking" : "stage_change",
      outcomeLabel: `Advanced to ${newStage.replace("_", " ").toUpperCase()}`,
      notes: `Pipeline milestone updated to ${newStage}`,
      createdAt: nowIso,
    };
    setActivities((prev) => [stageActivity, ...prev]);

    // If assigned a unit and won, update unit status to booked/sold
    let unitPatch: Partial<ProjectUnit> | null = null;
    if (lead.assignedUnitId) {
      if (newStage === "won") unitPatch = { status: "booked" };
      else if (newStage === "lost")
        unitPatch = { status: "available", assignedLeadId: undefined, assignedBuyerName: undefined };
      else if (newStage === "negotiation") unitPatch = { status: "negotiation" };
      else if (newStage === "site_visit") unitPatch = { status: "site_visit" };

      if (unitPatch) {
        setUnits((prev) =>
          prev.map((u) => (u.id === lead.assignedUnitId ? { ...u, ...unitPatch } : u))
        );
      }
    }

    // ---- Remote write-through ----
    if (isSyncEnabled()) {
      void syncRemote("Stage change", () =>
        updateLeadRemote(leadId, {
          stage: newStage,
          daysInStage: 0,
          ...(isWon ? { followUpStatus: "completed" as const } : {}),
          ...(newStage === "lost" ? { lostAt: nowIso } : {}),
          lastActivityText: `Stage changed to ${newStage.toUpperCase().replace("_", " ")}`,
          lastActivityAt: nowIso,
        })
      );
      const { id: _actId, ...actRow } = stageActivity;
      void syncRemote("Stage activity", () => insertActivityRemote(actRow));
      if (lead.assignedUnitId && unitPatch) {
        void syncRemote("Inventory update", () =>
          updateUnitRemote(lead.assignedUnitId!, {
            status: unitPatch!.status,
            assignedLeadId: unitPatch!.assignedLeadId ?? null,
            assignedBuyerName: unitPatch!.assignedBuyerName ?? null,
          })
        );
      }
    }

    toast.success(`Advanced ${lead.personName} → ${newStage.replace("_", " ").toUpperCase()}`);
    return true;
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, currentUser.id, currentUser.orgId, currentUser.name, syncRemote]);

  const createLead = React.useCallback(async (
    leadData: Omit<Lead, "id" | "orgId" | "createdAt" | "lastActivityAt" | "lastActivityText">
  ) => {
    const normalizedPhone = normalizePhone(leadData.phone);

    // ---- Live path: write through Supabase (RLS-enforced), then reflect locally ----
    if (isSyncEnabled() && authUser && currentOrgId) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          // 1. People dedup anchor within this org
          let personDbId: string | null = null;
          const existingPersonRow = people.find(
            (p) =>
              !p.id.startsWith("per-") &&
              ((p.phoneNormalized && p.phoneNormalized === normalizedPhone) ||
                normalizePhone(p.phone) === normalizedPhone)
          );

          if (existingPersonRow) {
            personDbId = existingPersonRow.id;
          } else {
            const { data: newPerson, error: personError } = await supabase
              .from("people")
              .insert({
                org_id: currentOrgId,
                name: leadData.personName,
                phone: leadData.phone,
                phone_normalized: normalizedPhone,
                email: leadData.email || null,
                source: leadData.source || "Direct",
              })
              .select("id")
              .single();
            if (personError) throw personError;
            personDbId = newPerson.id;
          }

          // 2. Insert the lead
          if (!personDbId) throw new Error("person-resolution-failed");
          const draftLead: Omit<Lead, "id" | "createdAt"> = {
            ...leadData,
            orgId: currentOrgId,
            personId: personDbId,
            phoneNormalized: normalizedPhone,
            daysInStage: 0,
            lastActivityText: existingPersonRow
              ? `Linked to master contact ${existingPersonRow.name}`
              : "Lead created and verified",
            lastActivityAt: new Date().toISOString(),
          };

          const { data: row, error: leadError } = await supabase
            .from("leads")
            .insert({ ...leadToRow(draftLead), org_id: currentOrgId, person_id: personDbId })
            .select(`*, salesperson:salesperson_id (full_name)`)
            .single();
          if (leadError) throw leadError;

          const createdLead = mapLeadRow(row);
          setLeads((prev) => [createdLead, ...prev]);

          // Reflect the person record locally too
          if (!existingPersonRow) {
            setPeople((prev) => [
              {
                id: personDbId!,
                orgId: currentOrgId,
                name: leadData.personName,
                phone: leadData.phone,
                phoneNormalized: normalizedPhone,
                email: leadData.email,
                city: leadData.regionName,
                regionId: leadData.regionId,
                regionName: leadData.regionName,
                associatedProjectNames: leadData.projectName ? [leadData.projectName] : [],
                preferredConfiguration: leadData.configurationPreference,
                budget: leadData.budget,
                createdAt: createdLead.createdAt,
              },
              ...prev,
            ]);
          }

          if (existingPersonRow) {
            toast.success(`Matched existing contact: ${existingPersonRow.name}`);
          } else {
            toast.success(`Added new lead: ${createdLead.personName}`);
          }
          return createdLead;
        } catch (e) {
          console.error("[CRM] Live lead creation failed");
          toast.error("Could not save lead to the server. Check your connection and retry.");
          throw e;
        }
      }
    }

    // ---- Demo path (no Supabase configured): in-memory only ----
    const newId = `lead-${Date.now()}`;
    const existingPerson = people.find(
      (p) =>
        (p.phoneNormalized && p.phoneNormalized === normalizedPhone) ||
        normalizePhone(p.phone) === normalizedPhone
    );

    const resolvedPersonId = existingPerson ? existingPerson.id : (leadData.personId || `per-${Date.now()}`);

    const newLead: Lead = {
      ...leadData,
      id: newId,
      orgId: currentUser.orgId || "demo-org",
      personId: resolvedPersonId,
      phoneNormalized: normalizedPhone,
      dealHealth: leadData.dealHealth || "strong",
      leadScore: leadData.leadScore || 85,
      leadScoreLabel: leadData.leadScoreLabel || "Hot",
      daysInStage: 0,
      lastActivityText: existingPerson
        ? `Linked to master contact ${existingPerson.name}`
        : "Lead created and verified",
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setLeads((prev) => [newLead, ...prev]);

    setPeople((prev) => {
      const idx = prev.findIndex(
        (p) =>
          (p.phoneNormalized && p.phoneNormalized === normalizedPhone) ||
          normalizePhone(p.phone) === normalizedPhone
      );

      if (idx !== -1) {
        const existing = prev[idx];
        const updatedProjects = existing.associatedProjectNames ? [...existing.associatedProjectNames] : [];
        if (leadData.projectName && !updatedProjects.includes(leadData.projectName)) {
          updatedProjects.push(leadData.projectName);
        }
        const updated = [...prev];
        updated[idx] = {
          ...existing,
          phoneNormalized: normalizedPhone,
          associatedProjectNames: updatedProjects,
          budget: Math.max(existing.budget || 0, leadData.budget || 0),
        };
        return updated;
      }

      return [
        {
          id: resolvedPersonId,
          orgId: newLead.orgId,
          name: leadData.personName,
          phone: leadData.phone,
          phoneNormalized: normalizedPhone,
          email: leadData.email,
          city: leadData.regionName,
          regionId: leadData.regionId,
          regionName: leadData.regionName,
          associatedProjectNames: leadData.projectName ? [leadData.projectName] : [],
          preferredConfiguration: leadData.configurationPreference,
          budget: leadData.budget,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });

    if (existingPerson) {
      toast.success(`Matched existing contact: ${existingPerson.name}`);
    } else {
      toast.success(`Added new lead: ${newLead.personName}`);
    }
    return newLead;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people, currentOrgId, authUser, syncRemote]);

  const completeTask = React.useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "completed" as const } : t))
    );

    if (task) {
      toast.success(`Task completed for ${task.personName}`);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === task.leadId
            ? { ...l, followUpStatus: "completed", lastActivityText: `Task completed: ${task.title}` }
            : l
        )
      );

      if (isSyncEnabled()) {
        void syncRemote("Task completion", () => completeTaskRemote(taskId));
        void syncRemote("Lead update", () =>
          updateLeadRemote(task.leadId, {
            followUpStatus: "completed",
            lastActivityText: `Task completed: ${task.title}`,
          })
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, syncRemote]);

  const updateUnitStatus = React.useCallback(async (
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

    if (isSyncEnabled()) {
      void syncRemote("Inventory update", () =>
        updateUnitRemote(unitId, {
          status,
          assignedLeadId: leadId ?? null,
          assignedBuyerName: buyerName ?? null,
        })
      );
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncRemote]);

  const assignUnitToLead = React.useCallback(async (leadId: string, unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    const lead = leads.find((l) => l.id === leadId);
    if (!unit || !lead) return false;

    const nextStatus =
      lead.stage === "won" ? ("booked" as const) : lead.stage === "negotiation" ? ("negotiation" as const) : ("hold" as const);

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
              status: nextStatus,
            }
          : u
      )
    );

    if (isSyncEnabled()) {
      void syncRemote("Inventory assignment", () =>
        updateUnitRemote(unitId, {
          status: nextStatus,
          assignedLeadId: lead.id,
          assignedBuyerName: lead.personName,
        })
      );
      void syncRemote("Lead update", () =>
        updateLeadRemote(leadId, {
          assignedUnitId: unit.id,
          assignedUnitNumber: unit.unitNumber,
          lastActivityText: `Assigned unit ${unit.unitNumber} (${unit.tower})`,
        })
      );
    }

    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, leads, syncRemote]);

  const bulkUpdateLeadsStage = React.useCallback(async (leadIds: string[], stage: PipelineStage) => {
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

    if (isSyncEnabled()) {
      await Promise.all(
        leadIds.map((id) =>
          syncRemote("Bulk stage change", () =>
            updateLeadRemote(id, {
              stage,
              daysInStage: 0,
              lastActivityText: `Bulk update: moved to ${stage.toUpperCase()}`,
              lastActivityAt: new Date().toISOString(),
            })
          )
        )
      );
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncRemote]);

  const bulkAssignLeadsRep = React.useCallback(async (leadIds: string[], repId: string, repName: string) => {
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

    if (isSyncEnabled()) {
      await Promise.all(
        leadIds.map((id) =>
          syncRemote("Reassignment", () =>
            updateLeadRemote(id, {
              salespersonId: repId,
              lastActivityText: `Reassigned to ${repName}`,
              lastActivityAt: new Date().toISOString(),
            })
          )
        )
      );
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncRemote]);

  const bulkScheduleFollowUp = React.useCallback(async (leadIds: string[], dueDate: string, dueTime?: string) => {
    const followUpAt = `${dueDate}${dueTime ? `, ${dueTime}` : ""}`;
    const isToday = dueDate.toLowerCase().includes("today");

    setLeads((prev) =>
      prev.map((l) =>
        leadIds.includes(l.id)
          ? {
              ...l,
              nextFollowUpAt: followUpAt,
              followUpStatus: isToday ? "due_today" : "upcoming",
            }
          : l
      )
    );

    const targetLeads = leads.filter((l) => leadIds.includes(l.id));
    const newTasks: Task[] = targetLeads.map((l) => ({
      id: `tsk-${Date.now()}-${l.id}`,
      orgId: l.orgId || currentUser.orgId,
      leadId: l.id,
      personName: l.personName,
      phone: l.phone,
      projectName: l.projectName,
      salespersonId: l.salespersonId,
      salespersonName: l.salespersonName,
      title: `Scheduled Follow-up for ${l.personName}`,
      dueDate,
      dueTime,
      status: isToday ? "due_today" : "upcoming",
      priority: "high",
    }));

    setTasks((prev) => [...newTasks, ...prev]);

    if (isSyncEnabled()) {
      await Promise.all([
        ...leadIds.map((id) =>
          syncRemote("Schedule update", () =>
            updateLeadRemote(id, {
              nextFollowUpAt: followUpAt,
              followUpStatus: isToday ? "due_today" : "upcoming",
            })
          )
        ),
        ...newTasks.map((t) => {
          const { id: _tid, ...row } = t;
          return syncRemote("Follow-up task", () => insertTaskRemote(row));
        }),
      ]);
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, syncRemote]);

  // Document Vault methods
  const uploadDocument = React.useCallback(async (docData: Omit<CRMDocument, "id" | "orgId" | "createdAt">): Promise<CRMDocument> => {
    const newDoc: CRMDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      orgId: currentUser.orgId || "demo-org",
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    toast.success(`Uploaded document: "${newDoc.title}"`);

    if (isSyncEnabled()) {
      const { id: _docId, createdAt: _createdAt, ...docRow } = newDoc;
      void syncRemote("Document", () => insertDocumentRemote(docRow));
    }
    return newDoc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.orgId, syncRemote]);

  const deleteDocument = React.useCallback(async (docId: string): Promise<boolean> => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    toast.success("Document removed from vault");

    if (isSyncEnabled()) {
      void syncRemote("Document deletion", () => deleteDocumentRemote(docId));
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncRemote]);

  // Lost Lead Reactivation Engine: Detect sleeping/lost leads with Tenant Isolation
  const reactivationLeads = React.useMemo(() => {
    return leads.filter((l) => {
      if (l.orgId && currentUser.orgId && l.orgId !== currentUser.orgId) return false;
      // Either explicitly lost, or no activity for > 14 days and still not won
      if (l.stage === "lost") return true;
      if (l.daysInStage >= 14 && l.stage !== "won") return true;
      return false;
    });
  }, [leads, currentUser]);

  const reactivateLead = React.useCallback(async (leadId: string, customPitch?: string): Promise<boolean> => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return false;

    const nowIso = new Date().toISOString();

    // Advance back to contacted
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              stage: "contacted",
              daysInStage: 0,
              dealHealth: "strong",
              dealHealthReason: "Reactivated via automated speed-to-lead engine",
              lastActivityText: "Reactivated: New project outreach initiated",
              lastActivityAt: nowIso,
              nextFollowUpAt: "Today, 12:00 PM",
              followUpStatus: "due_today",
              lostAt: undefined,
            }
          : l
      )
    );

    // Log Activity
    const reactivationAct: Activity = {
      id: `act-${Date.now()}`,
      orgId: lead.orgId || currentUser.orgId,
      leadId: lead.id,
      personName: lead.personName,
      userId: currentUser.id,
      userName: currentUser.name,
      type: "stage_change",
      outcomeLabel: "Lead Reactivated",
      notes: customPitch || "Reactivated lead with new high-conviction luxury inventory pitch.",
      createdAt: nowIso,
    };
    setActivities((prev) => [reactivationAct, ...prev]);

    // Create high-priority task for rep
    const reactTask: Task = {
      id: `tsk-react-${Date.now()}`,
      orgId: lead.orgId || currentUser.orgId,
      leadId: lead.id,
      personName: lead.personName,
      phone: lead.phone,
      projectName: lead.projectName,
      salespersonId: lead.salespersonId || currentUser.id,
      salespersonName: lead.salespersonName || currentUser.name,
      title: `⚡ Reactivation Call: ${lead.personName} (${lead.projectName})`,
      dueDate: "Today",
      dueTime: "12:00 PM",
      status: "due_today",
      priority: "high",
    };
    setTasks((prev) => [reactTask, ...prev]);

    if (isSyncEnabled()) {
      void syncRemote("Reactivation", () =>
        updateLeadRemote(leadId, {
          stage: "contacted",
          daysInStage: 0,
          dealHealth: "strong",
          dealHealthReason: "Reactivated via automated speed-to-lead engine",
          lastActivityText: "Reactivated: New project outreach initiated",
          lastActivityAt: nowIso,
          nextFollowUpAt: "Today, 12:00 PM",
          followUpStatus: "due_today",
        })
      );
      const { id: _aid, ...actRow } = reactivationAct;
      void syncRemote("Reactivation activity", () => insertActivityRemote(actRow));
      const { id: _tid, ...taskRow } = reactTask;
      void syncRemote("Reactivation task", () => insertTaskRemote(taskRow));
    }

    toast.success(`⚡ Reactivated ${lead.personName}! High-priority task created.`);
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, currentUser.id, currentUser.orgId, currentUser.name, syncRemote]);

  // Memoized context value: prevents the entire consumer tree (~46 edges)
  // from re-rendering on every keystroke/mutation anywhere in the app.
  const contextValue = React.useMemo(
    () => ({
      currentUser,
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
      documents,
      reactivationLeads,
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
      uploadDocument,
      deleteDocument,
      reactivateLead,
    }),
    [
      currentUser,
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
      documents,
      reactivationLeads,
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
      uploadDocument,
      deleteDocument,
      reactivateLead,
    ]
  );

  return <CRMContext.Provider value={contextValue}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const context = React.useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}
