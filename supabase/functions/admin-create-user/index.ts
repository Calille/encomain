/**
 * Admin Create User Edge Function
 * Creates an auth user + public.users profile. Admin JWT required.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";

interface CreateUserBody {
  email?: string;
  password?: string;
  full_name?: string | null;
  role?: string;
  status?: string;
  /** Plan slug: essential | professional | signature | bespoke, or null/omit for none */
  current_plan?: string | null;
  /** Preferred flag name used by the admin UI */
  requires_password_change?: boolean;
  /** @deprecated Prefer requires_password_change; still accepted for older clients */
  must_change_password?: boolean;
}

const ALLOWED_PLANS = ["essential", "professional", "signature", "bespoke"] as const;

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
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorisation header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Caller client (JWT) for identity + admin check
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

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: callerProfile, error: profileLookupError } = await supabaseAdmin
      .from("users")
      .select("id, role, status")
      .eq("id", caller.id)
      .maybeSingle();

    if (profileLookupError) {
      console.error("Caller profile lookup failed:", profileLookupError);
      return new Response(JSON.stringify({ error: "Failed to verify admin privileges" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!callerProfile || callerProfile.role !== "admin" || callerProfile.status !== "active") {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: CreateUserBody;
    try {
      body = await req.json();
    } catch (_e) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = body.email?.toLowerCase().trim();
    const password = body.password;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const role = body.role || "user";
    const status = body.status || "active";

    if (!["admin", "user"].includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["active", "inactive", "suspended"].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prefer requires_password_change; fall back to deprecated must_change_password
    const requiresPasswordChange =
      body.requires_password_change !== undefined
        ? Boolean(body.requires_password_change)
        : body.must_change_password !== undefined
          ? Boolean(body.must_change_password)
          : true;

    let currentPlan: string | null = null;
    if (body.current_plan !== undefined && body.current_plan !== null && body.current_plan !== "") {
      const plan = String(body.current_plan).toLowerCase().trim();
      if (!ALLOWED_PLANS.includes(plan as (typeof ALLOWED_PLANS)[number])) {
        return new Response(JSON.stringify({ error: "Invalid current_plan value" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      currentPlan = plan;
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: body.full_name || null,
      },
    });

    if (authError) {
      console.error("Auth createUser error:", authError);
      return new Response(JSON.stringify({ error: authError.message || "Failed to create auth user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!authData.user) {
      return new Response(JSON.stringify({ error: "Failed to create user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profileInsert: Record<string, unknown> = {
      id: authData.user.id,
      email,
      full_name: body.full_name || null,
      role,
      status,
      password_set_by_admin: true,
      // Write both columns until the dual-flag schema is consolidated
      requires_password_change: requiresPasswordChange,
      must_change_password: requiresPasswordChange,
    };

    if (currentPlan) {
      profileInsert.current_plan = currentPlan;
      profileInsert.plan_started_at = new Date().toISOString();
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .insert(profileInsert)
      .select()
      .single();

    if (profileError) {
      console.error("Profile insert error:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new Response(JSON.stringify({ error: profileError.message || "Failed to create user profile" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send welcome email with temporary password (idempotent via welcome_email_sent_at)
    let welcomeEmailSent = false;
    let welcomeEmailError: string | null = null;
    try {
      const welcomeRes = await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          email,
          userName: body.full_name || email.split("@")[0],
          loginUrl: "https://theenclosure.co.uk/login",
          dashboardUrl: "https://theenclosure.co.uk/dashboard",
          temporary_password: password,
          requires_password_change: requiresPasswordChange,
        }),
      });
      const welcomeJson = await welcomeRes.json().catch(() => ({}));
      if (!welcomeRes.ok || welcomeJson?.error) {
        welcomeEmailError =
          welcomeJson?.error || `Welcome email failed with status ${welcomeRes.status}`;
        console.error("Welcome email invoke failed:", welcomeEmailError);
      } else {
        welcomeEmailSent = !welcomeJson?.skipped;
      }
    } catch (welcomeErr) {
      welcomeEmailError =
        welcomeErr instanceof Error ? welcomeErr.message : "Welcome email failed";
      console.error("Welcome email invoke exception:", welcomeErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: authData.user.id,
        email: authData.user.email,
        user: profile,
        welcomeEmailSent,
        welcomeEmailError,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("admin-create-user error:", error);
    const message = error instanceof Error ? error.message : "Failed to create user";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
