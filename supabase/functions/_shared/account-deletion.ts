/**
 * Shared hard-delete / anonymise helper for admin and cron paths.
 */
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export async function anonymiseUser(
  supabaseAdmin: SupabaseClient,
  userId: string,
  adminId: string | null,
  reason: string,
  actionType: string,
): Promise<{ success: boolean; error?: string }> {
  const { data: target, error: targetError } = await supabaseAdmin
    .from("users")
    .select("id, email, role, anonymised_at, deleted_at")
    .eq("id", userId)
    .maybeSingle();

  if (targetError || !target) {
    return { success: false, error: "User not found" };
  }

  if (target.anonymised_at) {
    return { success: false, error: "User already anonymised" };
  }

  if (target.role === "admin") {
    return { success: false, error: "Admin accounts cannot be hard-deleted" };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({
      email: `deleted-${userId}@theenclosure.co.uk`,
      full_name: "Deleted user",
      billing_email: null,
      billing_address: null,
      company_name: null,
      vat_number: null,
      industry: null,
      status: "deleted",
      anonymised_at: now,
      deleted_at: target.deleted_at || now,
      deletion_reason: reason,
      deleted_by: adminId,
      recovery_token: null,
      deletion_scheduled_for: null,
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Anonymise update failed:", updateError);
    return { success: false, error: updateError.message || "Failed to anonymise user" };
  }

  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (authDeleteError) {
    console.error("Auth deleteUser failed:", authDeleteError);
  }

  const { error: auditError } = await supabaseAdmin.from("admin_actions").insert({
    admin_id: adminId,
    action_type: actionType,
    target_user_id: userId,
    details: {
      reason,
      previous_email: target.email,
      system: !adminId,
    },
  });

  if (auditError) {
    console.error("admin_actions insert failed:", auditError);
  }

  return { success: true };
}
