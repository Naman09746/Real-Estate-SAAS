export type UserRole = "owner" | "admin" | "boss" | "manager" | "salesperson" | "closer";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan?: "starter" | "growth" | "enterprise";
  reactivationDays?: number;
}

export interface Region {
  id: string;
  orgId: string;
  name: string;
  code: string;
  activeLeadsCount?: number;
}

export interface User {
  id: string;
  orgId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  regionId?: string; // Salesperson/Manager assignment
  regionName?: string;
  avatarUrl?: string;
  followUpCompletionRate?: number;
  avgResponseTimeHours?: number;
}

export type ProjectContactRole =
  | "owner"
  | "builder"
  | "architect"
  | "engineer"
  | "guard"
  | "channel_partner"
  | "other";

export interface ProjectContact {
  id: string;
  orgId?: string;
  projectId?: string;
  personId?: string;
  name: string;
  role: ProjectContactRole | string;
  phone: string;
  notes?: string;
}

export type UnitStatus =
  | "available"
  | "hold"
  | "site_visit"
  | "negotiation"
  | "booked"
  | "sold";

export interface ProjectUnit {
  id: string;
  orgId: string;
  projectId: string;
  projectName: string;
  tower: string;
  unitNumber: string;
  floor: number;
  configuration: string;
  sizeSqFt: number;
  superAreaSqFt?: number;
  price: number;
  status: UnitStatus;
  assignedLeadId?: string;
  assignedLeadName?: string;
  assignedLeadPhone?: string;
  assignedBuyerName?: string;
  facing?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  developer: string;
  location: string;
  regionId: string;
  regionName: string;
  priceRange: string;
  status: "active" | "launching_soon" | "completed";
  activeLeadsCount: number;
  siteVisitsCount: number;
  totalUnits?: number;
  availableUnitsCount?: number;
  bookedUnitsCount?: number;
  contacts?: ProjectContact[];
}

export interface Person {
  id: string;
  orgId: string;
  name: string;
  phone: string;
  phoneNormalized?: string;
  email?: string;
  city?: string;
  source?: string;
  regionId?: string;
  regionName?: string;
  associatedProjectNames?: string[];
  preferredConfiguration?: string;
  budget?: number;
  createdAt: string;
}

export type PipelineStage =
  | "new"
  | "contacted"
  | "qualified"
  | "site_visit"
  | "negotiation"
  | "won"
  | "lost";

export interface PipelineStageConfig {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  sortOrder: number;
  color?: string;
}

export type DealHealth = "strong" | "neutral" | "at_risk";
export type LeadScoreLabel = "Hot" | "Warm" | "Cold";

export interface DealHealthFactor {
  type: string;
  impact: number;
  description: string;
}

export interface Lead {
  id: string;
  orgId: string;
  personId: string;
  personName: string;
  phone: string;
  phoneNormalized?: string;
  email?: string;
  projectId: string;
  projectName: string;
  regionId: string;
  regionName: string;
  salespersonId: string;
  salespersonName: string;
  budget: number; // in INR
  stage: PipelineStage;
  stageId?: string;
  source: string;
  leadScore: number; // e.g. 92
  leadScoreLabel: LeadScoreLabel; // "Hot" | "Warm" | "Cold"
  dealHealth: DealHealth; // "strong" | "neutral" | "at_risk"
  dealHealthScore?: number; // 0 to 100
  dealHealthReason?: string; // e.g. "No activity for 4 days"
  dealHealthFactors?: DealHealthFactor[];
  dealHealthRecommendedAction?: string;
  dealHealthCalculatedAt?: string;
  recommendedAction?: string; // e.g. "Send Tower C vs D floor-plan comparison"
  configurationPreference?: string; // e.g. "3 BHK + Servant"
  preferredFloor?: string; // e.g. "High floor (12 - 18)"
  facingPreference?: string; // e.g. "North-East / Park Facing"
  parkingRequirement?: string; // e.g. "2 Covered Car Parks"
  buyerIntent?: string; // e.g. "End-User (Primary Residence)"
  decisionMakers?: string; // e.g. "Buyer & Spouse"
  buyingSignals?: string[]; // e.g. ["Budget verified", "Unit shortlisted", "Family involved"]
  objections?: string[]; // e.g. ["Price", "Floor rise"]
  lastConversationSummary?: string; // e.g. "Customer prefers 3 BHK + servant, comparing Tower C vs D. Price is the main concern."
  suggestedNextMove?: string; // e.g. "Send Tower C vs D comparison and payment schedule."
  assignedUnitId?: string;
  assignedUnitNumber?: string;
  daysInStage: number;
  stageEnteredAt?: string;
  lastActivityText: string;
  lastActivityAt: string;
  nextFollowUpAt?: string;
  followUpStatus?: "due_today" | "upcoming" | "overdue" | "completed";
  lostAt?: string;
  lostReason?: string;
  lastResurrectedAt?: string;
  resurrectionCount?: number;
  notes?: string;
  createdAt: string;
}

export type ActivityType =
  | "call"
  | "meeting"
  | "site_visit"
  | "whatsapp"
  | "note"
  | "stage_change"
  | "booking";

export type CallOutcome =
  | "interested"
  | "site_visit_booked"
  | "call_back"
  | "not_interested"
  | "ringing_no_response"
  | "wrong_number";

export interface Activity {
  id: string;
  orgId: string;
  leadId: string;
  projectId?: string;
  personId?: string;
  personName: string;
  userId: string;
  userName: string;
  type: ActivityType;
  durationSeconds?: number;
  outcome?: CallOutcome;
  outcomeLabel?: string;
  notes?: string;
  scheduledFollowUpAt?: string;
  occurredAt?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  orgId: string;
  leadId: string;
  personName: string;
  phone: string;
  projectName: string;
  salespersonId: string;
  salespersonName: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  status: "due_today" | "upcoming" | "overdue" | "completed";
  priority: "high" | "medium" | "low";
  createdFromActivityId?: string;
}

export interface CRMDocument {
  id: string;
  orgId: string;
  projectId?: string;
  leadId?: string;
  title: string;
  fileUrl: string;
  type: "brochure" | "floor_plan" | "cost_sheet" | "kyc" | "agreement" | "photo" | "other";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details: string;
  timestamp: string;
}

export interface TeamInvitation {
  id: string;
  orgId: string;
  email: string;
  role: string;
  regionId?: string;
  regionName?: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
  createdAt: string;
}
