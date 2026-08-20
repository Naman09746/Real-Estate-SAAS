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
}

export interface ProjectContact {
  id: string;
  name: string;
  role: string;
  phone: string;
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
  contacts?: ProjectContact[];
}

export interface Person {
  id: string;
  orgId: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
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
  lastActivityText: string;
  lastActivityAt: string;
  nextFollowUpAt?: string;
  followUpStatus?: "due_today" | "upcoming" | "overdue" | "completed";
  notes?: string;
  createdAt: string;
}

export type ActivityType = "call" | "meeting" | "site_visit" | "whatsapp" | "note";

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
