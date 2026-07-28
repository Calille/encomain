/**
 * Soft-delete a user account (self or admin).
 * Sets deleted_at + 30-day recovery window, invalidates sessions, sends email.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email-service.ts";
import { renderAccountDeletionEmail } from "../_shared/email-templates.ts";

interface DeleteBody {
  user_id?: string;
  initiated_by?: string;
  reason?: string;
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorisation header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: DeleteBody;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = body.user_id?.trim();
    const initiatedBy = body.initiated_by?.trim();
    const reason = body.reason?.trim() || null;

    if (!userId || !initiatedBy) {
      return new Response(
        JSON.stringify({ error: "user_id and initiated_by are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const supabaseCaller = createClient(supabaseUrl, anonKey || serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await supabaseCaller.auth.getUser();

    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isSelfDelete = initiatedBy === userId;

    if (isSelfDelete) {
      if (caller.id !== userId) {
        return new Response(
          JSON.stringify({ error: "You can only delete your own account" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } else {
      const { data: callerProfile } = await supabaseAdmin
        .from("users")
        .select("id, role, status")
        .eq("id", caller.id)
        .maybeSingle();

      if (
        !callerProfile ||
        callerProfile.role !== "admin" ||
        callerProfile.status !== "active" ||
        caller.id !== initiatedBy
      ) {
        return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: target, error: targetError } = await supabaseAdmin
      .from("users")
      .select("id, email, full_name, role, status, deleted_at, anonymised_at")
      .eq("id", userId)
      .maybeSingle();

    if (targetError || !target) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (target.anonymised_at) {
      return new Response(JSON.stringify({ error: "User has already been permanently deleted" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (target.deleted_at) {
      return new Response(JSON.stringify({ error: "Account is already deactivated" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isSelfDelete && target.role === "admin") {
      return new Response(
        JSON.stringify({
          error:
            "Admin accounts cannot be self-deleted. Ask another admin to deactivate the account.",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const now = new Date();
    const scheduled = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const recoveryToken = randomToken();
    const recoveryUrl = `https://theenclosure.co.uk/recover-account?token=${recoveryToken}`;

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        deleted_at: now.toISOString(),
        deletion_scheduled_for: scheduled.toISOString(),
        deleted_by: initiatedBy,
        deletion_reason: reason,
        recovery_token: recoveryToken,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Soft-delete update failed:", updateError);
      return new Response(JSON.stringify({ error: "Failed to deactivate account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      // Invalidate all sessions for the user (best-effort)
      await supabaseAdmin.auth.admin.signOut(userId);
    } catch (signOutErr) {
      console.error("Failed to invalidate sessions:", signOutErr);
    }

    const emailHtml = renderAccountDeletionEmail({
      userName: target.full_name || "there",
      deletionDate: scheduled.toISOString(),
      recoveryUrl,
      recoveryExpiryDate: scheduled.toISOString(),
    });

    const sendResult = await sendEmail({
      to: target.email,
      subject: "Account deletion confirmed",
      html: emailHtml,
      from: "The Enclosure <noreply@theenclosure.co.uk>",
      replyTo: "hello@theenclosure.co.uk",
      idempotencyKey: `account-deletion-${userId}-${now.toISOString().slice(0, 10)}`,
    });

    if (!sendResult.success) {
      console.error("Account deletion email failed:", sendResult.error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        deletion_scheduled_for: scheduled.toISOString(),
        emailSent: sendResult.success,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("delete-account error:", error);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
