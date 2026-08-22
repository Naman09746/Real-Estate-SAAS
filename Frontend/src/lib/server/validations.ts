import { z } from "zod";

// ====================================================================
// ENTERPRISE ZOD VALIDATION SCHEMAS FOR ALL INBOUND DATA
// ====================================================================

// Indian E.164 phone regex or standard 10-digit format
export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(16, "Phone number cannot exceed 16 characters")
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Invalid telephone format");

// UUID reference (project / lead / user IDs)
export const idSchema = z.string().uuid("Must be a valid identifier");

// 1. Create Lead Payload Schema
export const createLeadSchema = z.object({
  personName: z.string().min(2, "Buyer name must be at least 2 characters").max(100),
  phone: phoneSchema,
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  projectId: idSchema,
  budget: z.number().positive("Budget must be a positive number").max(10_000_000_000),
  stage: z.enum(["new", "contacted", "qualified", "site_visit", "negotiation", "won", "lost"]).default("new"),
  source: z.string().max(100).default("Website Inbound"),
  propertyType: z.string().max(100).default("Luxury Apartment"),
  configurationPreference: z.string().max(100).optional(),
  preferredFloor: z.string().max(50).optional(),
  facingPreference: z.string().max(50).optional(),
  timeline: z.string().max(100).optional(),
  assignedSalespersonId: idSchema.optional(),
  leadScore: z.number().min(0).max(100).default(75),
  leadScoreLabel: z.enum(["Hot", "Warm", "Cold"]).default("Warm"),
  dealHealth: z.enum(["strong", "neutral", "at_risk"]).default("neutral"),
  dealHealthReason: z.string().max(500).optional(),
  suggestedNextMove: z.string().max(500).optional(),
  assignedUnitNumber: z.string().max(50).optional(),
});

// 2. Update Lead Payload Schema
export const updateLeadSchema = createLeadSchema.partial().extend({
  lostReason: z.string().max(500).optional(),
});

// 3. Create Activity Log Schema (Immutable Audit)
export const createActivitySchema = z.object({
  leadId: idSchema.optional(),
  projectId: idSchema.optional(),
  personId: idSchema.optional(),
  // Only used when no lead is attached; server prefers the lead's person record.
  personName: z.string().max(200).optional(),
  type: z.enum(["call", "whatsapp", "meeting", "site_visit", "note", "stage_change", "ai_agent"]),
  outcome: z.string().max(100).optional(),
  outcomeLabel: z.string().max(100).optional(),
  notes: z.string().max(2000, "Notes cannot exceed 2000 characters"),
  durationSeconds: z.number().min(0).max(86_400).default(0),
  scheduledFollowUpAt: z.string().max(100).optional(),
  metadata: z.record(z.string().max(100), z.union([
    z.string().max(500),
    z.number(),
    z.boolean(),
    z.null(),
  ])).optional(),
});

// 3b. Lost-Lead Resurrection Scan Schema
export const resurrectScanSchema = z.object({
  daysThreshold: z
    .number()
    .int("daysThreshold must be an integer")
    .min(1, "daysThreshold must be at least 1 day")
    .max(365, "daysThreshold cannot exceed 365 days")
    .default(14),
});

// 4. Create Task Schema
export const createTaskSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  assignedToUserId: z.string().min(1, "Assignee user ID is required"),
  title: z.string().min(3, "Task title must be at least 3 characters").max(255),
  dueAt: z.string().datetime().or(z.string().min(1)),
  dueTime: z.string().max(20).optional(),
  status: z.enum(["overdue", "due_today", "upcoming", "completed"]).default("upcoming"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

// 5. WhatsApp Cloud API Webhook Inbound Schema
export const whatsappWebhookSchema = z.object({
  object: z.literal("whatsapp_business_account"),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.literal("whatsapp"),
            metadata: z.object({
              display_phone_number: z.string(),
              phone_number_id: z.string(),
            }),
            contacts: z.array(
              z.object({
                profile: z.object({
                  name: z.string(),
                }),
                wa_id: z.string(),
              })
            ).optional(),
            messages: z.array(
              z.object({
                from: z.string(),
                id: z.string(),
                timestamp: z.string(),
                text: z.object({
                  body: z.string(),
                }).optional(),
                type: z.string(),
              })
            ).optional(),
          }),
          field: z.string(),
        })
      ),
    })
  ),
});

// 6. Meta Lead Ads Webhook Payload Schema
export const metaLeadAdsWebhookSchema = z.object({
  object: z.literal("page"),
  entry: z.array(
    z.object({
      id: z.string(),
      time: z.number(),
      changes: z.array(
        z.object({
          value: z.object({
            ad_id: z.string().optional(),
            form_id: z.string(),
            leadgen_id: z.string(),
            page_id: z.string(),
          }),
          field: z.literal("leadgen"),
        })
      ),
    })
  ),
});

// 7. AI Autonomous Qualification Tool Schema
export const aiAgentQualifySchema = z.object({
  buyerName: z.string().min(2),
  phone: phoneSchema,
  budgetINR: z.number().positive(),
  budgetFormatted: z.string().optional(),
  preferredLocation: z.string().min(2),
  targetProject: z.string().optional(),
  configuration: z.string().min(2),
  purchaseTimeline: z.string().min(2),
  intentScore: z.number().min(0).max(100),
  intentLevel: z.enum(["Hot", "Warm", "Cold"]),
  buyingSignals: z.array(z.string()),
  recommendedAction: z.string(),
});
