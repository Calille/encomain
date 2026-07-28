/**
 * Auth helper for cron / privileged Edge Functions.
 * Accepts either the service role Bearer token or an active admin JWT.
 */
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { buildCorsHeaders } from "./cors.ts";

export type AdminAuthSuccess = {
  supabaseAdmin: SupabaseClient;
  /** Null when invoked with the service role key (e.g. pg_cron). */
  callerId: string | null;
};

/**
 * Returns admin client + caller id, or an HTTP Response error.
 */
export async function assertServiceRoleOrAdmin(
  req: Request,
): Promise<AdminAuthSuccess | Response> {
  const corsHeaders = buildCorsHeaders(req);
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

  const token = authHeader.slice("Bearer ".length).trim();
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (token === serviceRoleKey) {
    return { supabaseAdmin, callerId: null };
  }

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

  const { data: callerProfile, error: profileLookupError } = await supabaseAdmin
    .from("users")
    .select("id, role, status")
    .eq("id", caller.id)
    .maybeSingle();

  if (profileLookupError) {
    console.error("Caller profile lookup failed:", profileLookupError);
    return new Response(
      JSON.stringify({ error: "Failed to verify admin privileges" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (
    !callerProfile ||
    callerProfile.role !== "admin" ||
    callerProfile.status !== "active"
  ) {
    return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return { supabaseAdmin, callerId: caller.id };
}

export function isAuthError(
  result: AdminAuthSuccess | Response,
): result is Response {
  return result instanceof Response;
}
