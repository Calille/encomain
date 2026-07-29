/**
 * Auth helpers for Sentry Edge Functions.
 * Accepts an active sentry-user / owner / admin JWT, or service role for cron.
 */
import { createClient, type SupabaseClient, type User } from "jsr:@supabase/supabase-js@2";
import { buildCorsHeaders } from "./cors.ts";

export type SentryAuthSuccess = {
  supabaseAdmin: SupabaseClient;
  caller: User | null;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    status: string;
    is_sentry_user: boolean;
    is_owner: boolean;
  } | null;
  isServiceRole: boolean;
};

function jsonError(req: Request, status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
  });
}

export async function assertSentryUserOrServiceRole(
  req: Request,
): Promise<SentryAuthSuccess | Response> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonError(req, 500, "Server configuration error");
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonError(req, 401, "Missing authorisation header");
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (token === serviceRoleKey) {
    return {
      supabaseAdmin,
      caller: null,
      profile: null,
      isServiceRole: true,
    };
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
    return jsonError(req, 401, "Invalid or expired session");
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, role, status, is_sentry_user, is_owner")
    .eq("id", caller.id)
    .maybeSingle();

  if (profileError) {
    console.error("Sentry profile lookup failed:", profileError);
    return jsonError(req, 500, "Failed to verify privileges");
  }

  const allowed =
    profile &&
    profile.status === "active" &&
    (profile.is_sentry_user === true ||
      profile.is_owner === true ||
      profile.role === "admin");

  if (!allowed) {
    return jsonError(req, 403, "Forbidden: sentry access required");
  }

  return {
    supabaseAdmin,
    caller,
    profile,
    isServiceRole: false,
  };
}

export function isAuthError(
  result: SentryAuthSuccess | Response,
): result is Response {
  return result instanceof Response;
}

export function isOwnerProfile(
  profile: SentryAuthSuccess["profile"],
): boolean {
  return Boolean(
    profile &&
      profile.status === "active" &&
      (profile.is_owner === true || profile.role === "admin"),
  );
}
