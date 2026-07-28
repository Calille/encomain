/**
 * Daily cleanup: hard-delete soft-deleted accounts past deletion_scheduled_for.
 * Auth: service role Bearer (pg_cron) or admin JWT.
 */
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import {
  assertServiceRoleOrAdmin,
  isAuthError,
} from "../_shared/admin-auth.ts";
import { anonymiseUser } from "../_shared/account-deletion.ts";

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const auth = await assertServiceRoleOrAdmin(req);
  if (isAuthError(auth)) return auth;

  const { supabaseAdmin } = auth;
  const nowIso = new Date().toISOString();

  const { data: expired, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .not("deleted_at", "is", null)
    .lt("deletion_scheduled_for", nowIso)
    .is("anonymised_at", null);

  if (error) {
    console.error("Failed to load expired soft-deletes:", error);
    return new Response(JSON.stringify({ error: "Failed to query expired accounts" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: Array<{ user_id: string; success: boolean; error?: string }> = [];

  for (const row of expired || []) {
    const result = await anonymiseUser(
      supabaseAdmin,
      row.id,
      null,
      "Automatic cleanup after 30-day recovery window",
      "auto_hard_delete_expired",
    );
    results.push({
      user_id: row.id,
      success: result.success,
      error: result.error,
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      processed: results.length,
      results,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
