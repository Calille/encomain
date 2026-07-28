/**
 * Hard-delete / anonymise a user account (admin or system auto-cleanup).
 * Preserves invoices, tickets, websites, and payments against the anonymised row.
 */
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import {
  assertServiceRoleOrAdmin,
  isAuthError,
} from "../_shared/admin-auth.ts";
import { anonymiseUser } from "../_shared/account-deletion.ts";

interface HardDeleteBody {
  user_id?: string;
  admin_id?: string | null;
  reason?: string;
  /** Set true for cron / service-role system runs */
  system?: boolean;
}

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

  const { supabaseAdmin, callerId } = auth;

  let body: HardDeleteBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = body.user_id?.trim();
  const reason = body.reason?.trim();
  const isSystem = Boolean(body.system) && callerId === null;

  if (!userId) {
    return new Response(JSON.stringify({ error: "user_id is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!reason) {
    return new Response(JSON.stringify({ error: "reason is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let adminId: string | null = null;
  if (isSystem) {
    adminId = null;
  } else {
    if (!callerId) {
      return new Response(
        JSON.stringify({ error: "Admin JWT required for manual hard-delete" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const requestedAdmin = body.admin_id?.trim();
    if (requestedAdmin && requestedAdmin !== callerId) {
      return new Response(
        JSON.stringify({ error: "admin_id must match the authenticated admin" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    adminId = callerId;
  }

  const result = await anonymiseUser(
    supabaseAdmin,
    userId,
    adminId,
    reason,
    isSystem ? "auto_hard_delete_expired" : "hard_delete_user",
  );

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error || "Hard delete failed" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
