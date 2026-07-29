/**
 * Returns a short-lived signed download URL for a tool release installer.
 * Admin JWT required. Does not expose the storage path to non-admins.
 */
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import {
  assertServiceRoleOrAdmin,
  isAuthError,
} from "../_shared/admin-auth.ts";

interface Body {
  releaseId?: string;
}

const EXPIRES_IN = 60;

Deno.serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const auth = await assertServiceRoleOrAdmin(req);
  if (isAuthError(auth)) return auth;

  // Service-role cron callers are not allowed; downloads require a real admin session.
  if (!auth.callerId) {
    return new Response(
      JSON.stringify({ error: "Forbidden: admin user session required" }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const releaseId = body.releaseId?.trim();
  if (!releaseId) {
    return new Response(JSON.stringify({ error: "releaseId is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: release, error: lookupError } = await auth.supabaseAdmin
    .from("tool_releases")
    .select("id, file_path")
    .eq("id", releaseId)
    .maybeSingle();

  if (lookupError) {
    console.error("tool_releases lookup failed:", lookupError);
    return new Response(JSON.stringify({ error: "Failed to look up release" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!release?.file_path) {
    return new Response(JSON.stringify({ error: "Release not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: signed, error: signedError } = await auth.supabaseAdmin.storage
    .from("tool-installers")
    .createSignedUrl(release.file_path, EXPIRES_IN);

  if (signedError || !signed?.signedUrl) {
    console.error("createSignedUrl failed:", signedError);
    return new Response(
      JSON.stringify({ error: "Failed to generate download URL" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({ url: signed.signedUrl, expires_in: EXPIRES_IN }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
