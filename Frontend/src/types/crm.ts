export type UserRole = "boss" | "manager" | "salesperson";

export interface Organization {
  id: string;
  name: string;
  slug: string;
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

export interface ProjectContact {
  id: string;
  name: string;
  role: string;
  phone: string;
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
  email?: string;
  city?: string;
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

export type DealHealth = "strong" | "neutral" | "at_risk";
export type LeadScoreLabel = "Hot" | "Warm" | "Cold";

export interface Lead {
  id: string;
  orgId: string;
  personId: string;
  personName: string;
  phone: string;
  email?: string;
  projectId: string;
  projectName: string;
  regionId: string;
  regionName: string;
  salespersonId: string;
  salespersonName: string;
  budget: number; // in INR
  stage: PipelineStage;
  source: string;
  leadScore: number; // e.g. 92
  leadScoreLabel: LeadScoreLabel; // "Hot" | "Warm" | "Cold"
  dealHealth: DealHealth; // "strong" | "neutral" | "at_risk"
  dealHealthReason?: string; // e.g. "No activity for 4 days"
  recommendedAction?: string; // e.g. "Send Tower C vs D floor-plan comparison"
  configurationPreference?: string; // e.g. "3 BHK + Servant"
  assignedUnitId?: string;
  assignedUnitNumber?: string;
  daysInStage: number;
  lastActivityText: string;
  lastActivityAt: string;
  nextFollowUpAt?: string;
  followUpStatus?: "due_today" | "upcoming" | "overdue" | "completed";
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
  personName: string;
  userId: string;
  userName: string;
  type: ActivityType;
  outcome?: CallOutcome;
  outcomeLabel?: string;
  notes?: string;
  scheduledFollowUpAt?: string;
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
}

export interface AuditLog {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

