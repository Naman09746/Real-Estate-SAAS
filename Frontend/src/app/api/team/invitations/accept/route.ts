import { NextRequest } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import {
  apiSuccess,
  apiError,
  handleValidationError,
  checkRateLimit,
} from "@/lib/server/api-security";
import {
  getApiAuthContext,
  getServiceRoleClient,
  isLiveSupabaseAvailable,
} from "@/lib/server/supabase-server";
import { createNotification } from "@/lib/server/notifications";

const acceptInviteSchema = z.object({
  token: z.string().min(10, "Invalid invitation token"),
});

// POST /api/team/invitations/accept - Accept invitation and join organization
export async function POST(req: NextRequest) {
  const auth = await getApiAuthContext();
  if (!auth) {
    return apiError("Authentication required to accept an invitation", 401, "UNAUTHORIZED");
  }

  const rateCheck = checkRateLimit(`accept_inv_${auth.userId}`, 10, 60000);
  if (!rateCheck.allowed) {
    return apiError("Too many attempts. Please try again later.", 429, "RATE_LIMIT_EXCEEDED");
  }

  const serviceClient = getServiceRoleClient();
  if (!serviceClient || !isLiveSupabaseAvailable) {
    return apiError("Database service is unavailable", 503, "SERVICE_UNAVAILABLE");
  }

  try {
    const rawBody = await req.json();
    const { token } = acceptInviteSchema.parse(rawBody);

    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    // 1. Find valid pending invitation
    const { data: invite, error: inviteErr } = await serviceClient
      .from("invitations")
      .select("*")
      .eq("token_hash", tokenHash)
      .eq("status", "pending")
      .maybeSingle();

    if (inviteErr || !invite) {
      return apiError("Invalid or expired invitation token", 404, "INVALID_TOKEN");
    }

    if (new Date(invite.expires_at) < new Date()) {
      await serviceClient
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invite.id);
      return apiError("This invitation has expired", 410, "INVITATION_EXPIRED");
    }

    // 2. Bind authenticated user to organization with assigned role & region
    const { error: profileErr } = await serviceClient
      .from("profiles")
      .upsert({
        user_id: auth.userId,
        org_id: invite.org_id,
        role: invite.role,
        region_id: invite.region_id || null,
        updated_at: new Date().toISOString(),
      });

    if (profileErr) {
      console.error("[INVITATION_ACCEPT_ERROR]", profileErr);
      return apiError("Failed to update user profile with invitation", 500, "PROFILE_UPDATE_ERROR");
    }

    // 3. Mark invitation as accepted
    await serviceClient
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    // 4. Notify the inviter / org owners
    if (invite.invited_by) {
      await createNotification({
        orgId: invite.org_id,
        userId: invite.invited_by,
        title: "Invitation Accepted",
        message: `A new team member (${invite.email}) has joined as ${invite.role}.`,
        type: "team_invitation",
        priority: "normal",
        entityType: "team",
        link: "/users",
        dedupKey: `notif_inv_acc_${invite.id}`,
      });
    }

    return apiSuccess(
      {
        accepted: true,
        orgId: invite.org_id,
        role: invite.role,
        regionId: invite.region_id,
      },
      200
    );
  } catch (err) {
    return handleValidationError(err);
  }
}
