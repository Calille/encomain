/**
 * Public account recovery by token (preview + restore).
 * No JWT required; token is the capability.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";

interface RecoverBody {
  token?: string;
  action?: "preview" | "restore";
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

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: RecoverBody;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = body.token?.trim();
    const action = body.action === "restore" ? "restore" : "preview";

    if (!token) {
      return new Response(JSON.stringify({ error: "token is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select(
        "id, email, full_name, deleted_at, deletion_scheduled_for, recovery_token, anonymised_at",
      )
      .eq("recovery_token", token)
      .maybeSingle();

    if (error || !user || !user.deleted_at || user.anonymised_at) {
      return new Response(
        JSON.stringify({
          valid: false,
          error:
            "This recovery link is not valid or has expired. If you need help, contact hello@theenclosure.co.uk.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const scheduled = user.deletion_scheduled_for
      ? new Date(user.deletion_scheduled_for)
      : null;

    if (!scheduled || scheduled.getTime() <= Date.now()) {
      return new Response(
        JSON.stringify({
          valid: false,
          error:
            "This recovery link is not valid or has expired. If you need help, contact hello@theenclosure.co.uk.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (action === "preview") {
      return new Response(
        JSON.stringify({
          valid: true,
          email: user.email,
          deletion_scheduled_for: user.deletion_scheduled_for,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { error: restoreError } = await supabaseAdmin
      .from("users")
      .update({
        deleted_at: null,
        deletion_scheduled_for: null,
        deleted_by: null,
        deletion_reason: null,
        recovery_token: null,
        status: "active",
      })
      .eq("id", user.id)
      .eq("recovery_token", token);

    if (restoreError) {
      console.error("Restore failed:", restoreError);
      return new Response(JSON.stringify({ error: "Failed to restore account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabaseAdmin.from("admin_actions").insert({
      admin_id: null,
      action_type: "restore_user",
      target_user_id: user.id,
      details: { via: "recovery_token" },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your account is active again. You can sign in as normal.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("recover-account error:", error);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
