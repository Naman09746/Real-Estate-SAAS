"use client";

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type {
  Activity,
  ActivityType,
  CRMDocument,
  Lead,
  Person,
  PipelineStage,
  Project,
  ProjectUnit,
  Region,
  Task,
  User,
  UserRole,
} from "@/types/crm";

// ============================================================================
// CLIENT-SIDE PERSISTENCE BRIDGE
// Hydrates CRM state from Supabase (RLS-enforced) and mirrors mutations.
// The in-memory context state stays the UI source of truth; every mutation is
// written through optimistically and reconciled on failure via toast + console.
// ============================================================================

export const isSyncEnabled = () => Boolean(getSupabaseClient() && isSupabaseConfigured);

type AnyRow = Record<string, any>;

const num = (v: any): number => (v === null || v === undefined ? 0 : Number(v));
const str = (v: any): string => (v === null || v === undefined ? "" : String(v));

const VALID_ACTIVITY_TYPES: ActivityType[] = [
  "call", "meeting", "site_visit", "whatsapp", "note", "stage_change", "booking",
];

function mapActivityType(t: string): ActivityType {
  return VALID_ACTIVITY_TYPES.includes(t as ActivityType) ? (t as ActivityType) : "note";
}

// ---------------------------------------------------------------- Leads ----

export function mapLeadRow(row: AnyRow): Lead {
  return {
    id: str(row.id),
    orgId: str(row.org_id),
    personId: str(row.person_id ?? ""),
    personName: str(row.person_name),
    phone: str(row.phone),
    phoneNormalized: row.phone_normalized ? str(row.phone_normalized) : undefined,
    email: row.email ? str(row.email) : undefined,
    projectId: str(row.project_id ?? ""),
    projectName: str(row.project_name),
    regionId: str(row.region_id ?? ""),
    regionName: row.region_name ? str(row.region_name) : "",
    salespersonId: str(row.salesperson_id ?? ""),
    salespersonName: row.salesperson?.full_name ? str(row.salesperson.full_name) : "",
    budget: num(row.budget),
    stage: (row.stage ?? "new") as PipelineStage,
    stageId: row.stage_id ? str(row.stage_id) : undefined,
    source: str(row.source ?? "Portal Inbound"),
    leadScore: num(row.lead_score),
    leadScoreLabel: (row.lead_score_label ?? "Warm") as Lead["leadScoreLabel"],
    dealHealth: (row.deal_health ?? "neutral") as Lead["dealHealth"],
    dealHealthReason: row.deal_health_reason ? str(row.deal_health_reason) : undefined,
    recommendedAction: row.recommended_action ? str(row.recommended_action) : undefined,
    configurationPreference: row.configuration_preference ? str(row.configuration_preference) : undefined,
    preferredFloor: row.preferred_floor ? str(row.preferred_floor) : undefined,
    facingPreference: row.facing_preference ? str(row.facing_preference) : undefined,
    buyerIntent: row.buyer_intent ? str(row.buyer_intent) : undefined,
    decisionMakers: row.decision_makers ? str(row.decision_makers) : undefined,
    buyingSignals: Array.isArray(row.buying_signals) ? row.buying_signals : undefined,
    objections: Array.isArray(row.objections) ? row.objections : undefined,
    lastConversationSummary: row.last_conversation_summary ? str(row.last_conversation_summary) : undefined,
    suggestedNextMove: row.suggested_next_move ? str(row.suggested_next_move) : undefined,
    assignedUnitId: row.assigned_unit_id ? str(row.assigned_unit_id) : undefined,
    assignedUnitNumber: row.assigned_unit_number ? str(row.assigned_unit_number) : undefined,
    daysInStage: num(row.days_in_stage),
    lastActivityText: str(row.last_activity_text ?? "Lead created"),
    lastActivityAt: str(row.last_activity_at ?? row.created_at ?? new Date().toISOString()),
    nextFollowUpAt: row.next_follow_up_at ? str(row.next_follow_up_at) : undefined,
    followUpStatus: row.follow_up_status ?? "upcoming",
    lostAt: row.lost_at ? str(row.lost_at) : undefined,
    createdAt: str(row.created_at ?? new Date().toISOString()),
  };
}

const LEAD_SELECT = `*,
  salesperson:salesperson_id (full_name)`;

export async function fetchLeads(): Promise<Lead[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .order("last_activity_at", { ascending: false })
    .limit(500);
  if (error) {
    console.error("[SYNC] Failed to load leads:", error.code);
    return null;
  }
  return (data || []).map(mapLeadRow);
}

// Lead columns we persist from the client domain model.
export function leadToRow(lead: Partial<Lead>): AnyRow {
  const row: AnyRow = {};
  const set = (col: string, val: any) => {
    if (val !== undefined) row[col] = val;
  };
  set("person_name", lead.personName);
  set("phone", lead.phone);
  set("phone_normalized", lead.phoneNormalized);
  set("email", lead.email || null);
  set("project_id", lead.projectId || null);
  set("project_name", lead.projectName);
  set("region_id", lead.regionId || null);
  set("region_name", lead.regionName);
  set("salesperson_id", lead.salespersonId || null);
  set("budget", lead.budget);
  set("stage", lead.stage);
  set("source", lead.source);
  set("lead_score", lead.leadScore);
  set("lead_score_label", lead.leadScoreLabel);
  set("deal_health", lead.dealHealth);
  set("deal_health_reason", lead.dealHealthReason || null);
  set("recommended_action", lead.recommendedAction || null);
  set("configuration_preference", lead.configurationPreference || null);
  set("preferred_floor", lead.preferredFloor || null);
  set("facing_preference", lead.facingPreference || null);
  set("buyer_intent", lead.buyerIntent || null);
  set("decision_makers", lead.decisionMakers || null);
  set("buying_signals", lead.buyingSignals || null);
  set("objections", lead.objections || null);
  set("last_conversation_summary", lead.lastConversationSummary || null);
  set("suggested_next_move", lead.suggestedNextMove || null);
  set("assigned_unit_id", lead.assignedUnitId || null);
  set("assigned_unit_number", lead.assignedUnitNumber || null);
  set("days_in_stage", lead.daysInStage);
  set("last_activity_text", lead.lastActivityText);
  set("last_activity_at", lead.lastActivityAt);
  set("next_follow_up_at", lead.nextFollowUpAt || null);
  set("follow_up_status", lead.followUpStatus);
  set("lost_at", lead.lostAt ?? null);
  return row;
}

export async function updateLeadRemote(leadId: string, patch: Partial<Lead>): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from("leads").update(leadToRow(patch)).eq("id", leadId);
  if (error) {
    console.error("[SYNC] Failed to update lead:", error.code);
    return false;
  }
  return true;
}

// ------------------------------------------------------------ Activities ----

export function activityToRow(activity: Omit<Activity, "id"> & { id?: string }): AnyRow {
  return {
    lead_id: activity.leadId || null,
    project_id: activity.projectId || null,
    person_id: activity.personId || null,
    user_id: activity.userId,
    user_name: activity.userName,
    person_name: activity.personName,
    type: activity.type === ("ai_agent" as ActivityType) ? "note" : activity.type,
    duration_seconds: activity.durationSeconds ?? 0,
    outcome: activity.outcome || null,
    outcome_label: activity.outcomeLabel || null,
    notes: activity.notes || null,
    scheduled_follow_up_at: activity.scheduledFollowUpAt || null,
  };
}

export function mapActivityRow(row: AnyRow): Activity {
  return {
    id: str(row.id),
    orgId: str(row.org_id),
    leadId: str(row.lead_id ?? ""),
    projectId: row.project_id ? str(row.project_id) : undefined,
    personId: row.person_id ? str(row.person_id) : undefined,
    personName: str(row.person_name),
    userId: str(row.user_id),
    userName: str(row.user_name),
    type: mapActivityType(str(row.type)),
    durationSeconds: num(row.duration_seconds),
    outcome: row.outcome ?? undefined,
    outcomeLabel: row.outcome_label ? str(row.outcome_label) : undefined,
    notes: row.notes ? str(row.notes) : undefined,
    scheduledFollowUpAt: row.scheduled_follow_up_at ? str(row.scheduled_follow_up_at) : undefined,
    occurredAt: row.occurred_at ? str(row.occurred_at) : undefined,
    createdAt: str(row.created_at ?? new Date().toISOString()),
  };
}

export async function fetchActivities(): Promise<Activity[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(300);
  if (error) {
    console.error("[SYNC] Failed to load activities:", error.code);
    return null;
  }
  return (data || []).map(mapActivityRow);
}

export async function insertActivityRemote(activity: Omit<Activity, "id">, orgId?: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  // org_id is NOT NULL — without it every activity insert fails under RLS.
  const org_id = activity.orgId || orgId;
  if (!org_id) {
    console.error("[SYNC] Activity insert rejected: missing org_id");
    return false;
  }
  const { error } = await supabase.from("activities").insert({ ...activityToRow(activity), org_id });
  if (error) {
    console.error("[SYNC] Failed to log activity:", error.code);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------- Tasks ----

export function mapTaskRow(row: AnyRow, salespersonName?: string): Task {
  return {
    id: str(row.id),
    orgId: str(row.org_id),
    leadId: str(row.lead_id),
    personName: str(row.person_name),
    phone: str(row.phone),
    projectName: row.project_name ? str(row.project_name) : "",
    salespersonId: str(row.salesperson_id),
    salespersonName: salespersonName || "",
    title: str(row.title),
    dueDate: str(row.due_date),
    dueTime: row.due_time ? str(row.due_time) : undefined,
    status: row.status ?? "upcoming",
    priority: row.priority ?? "medium",
    createdFromActivityId: row.created_from_activity_id ? str(row.created_from_activity_id) : undefined,
  };
}

export async function fetchTasks(): Promise<Task[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("tasks")
    .select(`*, salesperson:salesperson_id (full_name)`)
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) {
    console.error("[SYNC] Failed to load tasks:", error.code);
    return null;
  }
  return (data || []).map((row: AnyRow) => mapTaskRow(row, row.salesperson?.full_name));
}

export async function insertTaskRemote(task: Omit<Task, "id"> & { id?: string }): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from("tasks").insert({
    org_id: task.orgId, // NOT NULL — required for tenant-scoped task queue
    lead_id: task.leadId,
    salesperson_id: task.salespersonId,
    person_name: task.personName,
    phone: task.phone,
    project_name: task.projectName || null,
    title: task.title,
    due_date: task.dueDate,
    due_time: task.dueTime || null,
    status: task.status,
    priority: task.priority,
    created_from_activity_id: task.createdFromActivityId || null,
  });
  if (error) {
    console.error("[SYNC] Failed to create task:", error.code);
    return false;
  }
  return true;
}

export async function completeTaskRemote(taskId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from("tasks").update({ status: "completed" }).eq("id", taskId);
  if (error) {
    console.error("[SYNC] Failed to complete task:", error.code);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------- Units ----

export function mapUnitRow(row: AnyRow, projectName?: string): ProjectUnit {
  return {
    id: str(row.id),
    orgId: str(row.org_id),
    projectId: str(row.project_id),
    projectName: projectName || "",
    tower: str(row.tower),
    unitNumber: str(row.unit_number),
    floor: num(row.floor),
    configuration: str(row.configuration),
    sizeSqFt: num(row.super_area_sq_ft),
    price: num(row.price),
    status: row.status ?? "available",
    assignedLeadId: row.assigned_lead_id ? str(row.assigned_lead_id) : undefined,
    assignedBuyerName: row.assigned_buyer_name ? str(row.assigned_buyer_name) : undefined,
    facing: row.facing ? str(row.facing) : undefined,
  };
}

export async function fetchUnits(): Promise<ProjectUnit[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("project_units")
    .select(`*, project:project_id (name)`)
    .limit(1000);
  if (error) {
    console.error("[SYNC] Failed to load units:", error.code);
    return null;
  }
  return (data || []).map((row: AnyRow) => mapUnitRow(row, row.project?.name));
}

export async function updateUnitRemote(
  unitId: string,
  patch: { status?: ProjectUnit["status"]; assignedLeadId?: string | null; assignedBuyerName?: string | null }
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase
    .from("project_units")
    .update({
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.assignedLeadId !== undefined ? { assigned_lead_id: patch.assignedLeadId } : {}),
      ...(patch.assignedBuyerName !== undefined ? { assigned_buyer_name: patch.assignedBuyerName } : {}),
    })
    .eq("id", unitId);
  if (error) {
    console.error("[SYNC] Failed to update unit:", error.code);
    return false;
  }
  return true;
}

// ------------------------------------------------------------- Documents ----

export function mapDocumentRow(row: AnyRow): CRMDocument {
  return {
    id: str(row.id),
    orgId: str(row.org_id),
    projectId: row.project_id ? str(row.project_id) : undefined,
    leadId: row.lead_id ? str(row.lead_id) : undefined,
    title: str(row.title),
    fileUrl: str(row.file_url),
    type: row.type ?? "other",
    createdAt: str(row.created_at ?? new Date().toISOString()),
  };
}

export async function fetchDocuments(): Promise<CRMDocument[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("[SYNC] Failed to load documents:", error.code);
    return null;
  }
  return (data || []).map(mapDocumentRow);
}

export async function insertDocumentRemote(
  doc: Pick<CRMDocument, "title" | "fileUrl" | "type"> & { projectId?: string; leadId?: string; orgId?: string }
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const org_id = doc.orgId;
  if (!org_id) {
    console.error("[SYNC] Document insert rejected: missing org_id");
    return false;
  }
  const { error } = await supabase.from("documents").insert({
    org_id,
    project_id: doc.projectId || null,
    lead_id: doc.leadId || null,
    title: doc.title,
    file_url: doc.fileUrl,
    type: doc.type,
  });
  if (error) {
    console.error("[SYNC] Failed to upload document record:", error.code);
    return false;
  }
  return true;
}

export async function deleteDocumentRemote(docId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from("documents").delete().eq("id", docId);
  if (error) {
    console.error("[SYNC] Failed to delete document:", error.code);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------- People ----

export function mapPersonRow(row: AnyRow): Person {
  return {
    id: str(row.id),
    orgId: str(row.org_id),
    name: str(row.name),
    phone: str(row.phone),
    phoneNormalized: row.phone_normalized ? str(row.phone_normalized) : undefined,
    email: row.email ? str(row.email) : undefined,
    city: row.city ? str(row.city) : undefined,
    source: row.source ? str(row.source) : undefined,
    preferredConfiguration: row.preferred_configuration ? str(row.preferred_configuration) : undefined,
    budget: row.budget !== null && row.budget !== undefined ? num(row.budget) : undefined,
    createdAt: str(row.created_at ?? new Date().toISOString()),
  };
}

export async function fetchPeople(): Promise<Person[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) {
    console.error("[SYNC] Failed to load people:", error.code);
    return null;
  }
  return (data || []).map(mapPersonRow);
}

// ------------------------------------------------------------- Full load ----

export interface CrmHydration {
  orgId: string | null;
  leads: Lead[];
  activities: Activity[];
  tasks: Task[];
  units: ProjectUnit[];
  documents: CRMDocument[];
  people: Person[];
  projects: Project[];
  regions: Region[];
  users: User[];
}

export function mapDbRoleToClient(dbRole: string | null | undefined): UserRole {
  if (!dbRole) return "salesperson";
  if (["owner", "admin", "boss"].includes(dbRole)) return "boss";
  if (["manager", "closer"].includes(dbRole)) return "manager";
  return "salesperson";
}

export function mapProjectRow(row: AnyRow, regionName?: string): Project {
  return {
    id: str(row.id),
    orgId: str(row.org_id),
    name: str(row.name),
    developer: str(row.developer),
    location: str(row.location),
    regionId: str(row.region_id ?? ""),
    regionName: regionName || "",
    priceRange: row.price_range ? str(row.price_range) : "",
    status: (row.status ?? "active") as Project["status"],
    activeLeadsCount: num(row.active_leads_count),
    siteVisitsCount: 0,
  };
}

async function fetchProjects(): Promise<Project[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("projects")
    .select(`*, region:region_id (name)`)
    .order("name")
    .limit(200);
  if (error) {
    console.error("[SYNC] Failed to load projects:", error.code);
    return null;
  }
  return (data || []).map((row: AnyRow) => mapProjectRow(row, row.region?.name));
}

function mapRegionRow(row: AnyRow): Region {
  return {
    id: str(row.id),
    orgId: str(row.org_id),
    name: str(row.name),
    code: str(row.code),
  };
}

async function fetchRegions(): Promise<Region[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("regions").select("*").order("name");
  if (error) {
    console.error("[SYNC] Failed to load regions:", error.code);
    return null;
  }
  return (data || []).map(mapRegionRow);
}

function mapProfileRow(row: AnyRow, regionName?: string): User {
  return {
    id: str(row.user_id),
    orgId: str(row.org_id),
    name: str(row.full_name),
    email: "",
    phone: row.phone ? str(row.phone) : "",
    role: mapDbRoleToClient(row.role),
    regionId: row.region_id ? str(row.region_id) : undefined,
    regionName: regionName,
    avatarUrl: row.avatar_url ? str(row.avatar_url) : undefined,
    followUpCompletionRate: undefined,
    avgResponseTimeHours: undefined,
  };
}

async function fetchUsers(): Promise<User[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select(`*, region:region_id (name)`)
    .order("full_name")
    .limit(100);
  if (error) {
    console.error("[SYNC] Failed to load team:", error.code);
    return null;
  }
  return (data || []).map((row: AnyRow) => mapProfileRow(row, row.region?.name));
}

async function fetchCurrentOrgId(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.org_id ? str(data.org_id) : null;
}

/**
 * First-run seeding: a brand-new organization has an empty workspace. This
 * calls the security-definer RPC `seed_organization_sample_data()` which
 * populates the CURRENT user's org only with a representative luxury real
 * estate dataset so the cockpit is usable immediately.
 */
async function seedIfEmpty(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true });

  if (error) return; // RLS or connectivity issue — hydration will surface it
  if ((count ?? 0) > 0) return;

  const { error: rpcError } = await supabase.rpc("seed_organization_sample_data");
  if (rpcError) {
    console.error("[SYNC] Sample seeding failed:", rpcError.code);
  }
}

export async function hydrateCrmData(): Promise<CrmHydration | null> {
  if (!isSyncEnabled()) return null;
  try {
    await seedIfEmpty();

    const [orgId, leads, activities, tasks, units, documents, people, projects, regions, users] =
      await Promise.all([
        fetchCurrentOrgId(),
        fetchLeads(),
        fetchActivities(),
        fetchTasks(),
        fetchUnits(),
        fetchDocuments(),
        fetchPeople(),
        fetchProjects(),
        fetchRegions(),
        fetchUsers(),
      ]);
    // If the primary table failed to load entirely, treat hydration as failed
    // so the app can surface an error rather than a half-empty workspace.
    if (leads === null || projects === null) return null;
    return {
      orgId,
      leads,
      activities: activities || [],
      tasks: tasks || [],
      units: units || [],
      documents: documents || [],
      people: people || [],
      projects,
      regions: regions || [],
      users: users || [],
    };
  } catch (e) {
    console.error("[SYNC] Hydration failed");
    return null;
  }
}
