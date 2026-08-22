import { NextRequest } from "next/server";
import {
  apiSuccess,
  apiError,
  handleValidationError,
} from "@/lib/server/api-security";
import { updateUserRoleSchema } from "@/lib/server/validations";
import {
  getApiAuthContext,
  getServiceRoleClient,
  isLiveSupabaseAvailable,
} from "@/lib/server/supabase-server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/team/members/[id]/role - Modify user role and region (Owner/Admin only)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await getApiAuthContext();
  if (!auth) {
    return apiError("Authentication required", 401, "UNAUTHORIZED");
  }

  // Only owners and admins can modify member roles
  if (auth.role !== "owner" && auth.role !== "admin" && auth.role !== "boss") {
    return apiError("Only organization owners and administrators can modify roles", 403, "FORBIDDEN");
  }

  const { id: targetUserId } = await params;
  const serviceClient = getServiceRoleClient();
  if (!serviceClient || !isLiveSupabaseAvailable) {
    return apiError("Database service is unavailable", 503, "SERVICE_UNAVAILABLE");
  }

  try {
    const rawBody = await req.json();
    const validated = updateUserRoleSchema.parse(rawBody);

    // Target must belong to caller's org
    const { data: targetProfile, error: profileFetchErr } = await serviceClient
      .from("profiles")
      .select("user_id, org_id, role")
      .eq("user_id", targetUserId)
      .eq("org_id", auth.orgId)
      .maybeSingle();

    if (profileFetchErr || !targetProfile) {
      return apiError("Team member not found in your organization", 404, "NOT_FOUND");
    }

    // Check if target is last owner and being demoted
    if (targetProfile.role === "owner" && validated.role !== "owner") {
      const { count: ownerCount } = await serviceClient
        .from("profiles")
        .select("user_id", { count: "exact", head: true })
        .eq("org_id", auth.orgId)
        .eq("role", "owner");

      if (ownerCount !== null && ownerCount <= 1) {
        return apiError(
          "Cannot demote the sole organization owner. Assign a new owner first.",
          400,
          "LAST_OWNER_PROTECTION"
        );
      }
    }

    const updatePayload: Record<string, any> = {
      role: validated.role,
      updated_at: new Date().toISOString(),
    };
    if (validated.regionId !== undefined) {
      updatePayload.region_id = validated.regionId;
    }

    const { data: updated, error: updateErr } = await serviceClient
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", targetUserId)
      .eq("org_id", auth.orgId)
      .select("user_id, role, region_id")
      .single();

    if (updateErr) {
      console.error("[ROLE_UPDATE_ERROR]", updateErr);
      return apiError("Failed to update member role", 500, "DB_UPDATE_ERROR");
    }

    return apiSuccess(updated, 200);
  } catch (err) {
    return handleValidationError(err);
  }
}
