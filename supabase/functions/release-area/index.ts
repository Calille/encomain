/**
 * Release an area claim. Claimant or owner JWT required.
 */
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import {
  assertSentryUserOrServiceRole,
  isAuthError,
  isOwnerProfile,
} from "../_shared/sentry-auth.ts";

interface Body {
  claimId?: string;
  reason?: string;
}

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

  try {
    const auth = await assertSentryUserOrServiceRole(req);
    if (isAuthError(auth)) return auth;
    if (auth.isServiceRole || !auth.caller || !auth.profile) {
      return new Response(JSON.stringify({ error: "User JWT required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    const claimId = body.claimId?.trim();
    if (!claimId) {
      return new Response(JSON.stringify({ error: "claimId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: claim, error: claimError } = await auth.supabaseAdmin
      .from("area_claims")
      .select(
        "id, lad_code, claimed_by, claimed_at, last_activity_at, released_at, release_reason",
      )
      .eq("id", claimId)
      .maybeSingle();

    if (claimError) {
      console.error("Claim lookup failed:", claimError);
      return new Response(JSON.stringify({ error: "Failed to look up claim" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!claim) {
      return new Response(JSON.stringify({ error: "Claim not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (claim.released_at) {
      return new Response(JSON.stringify({ claim }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isClaimant = claim.claimed_by === auth.caller.id;
    const owner = isOwnerProfile(auth.profile);

    if (!isClaimant && !owner) {
      return new Response(
        JSON.stringify({ error: "Forbidden: claimant or owner required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const releaseReason =
      body.reason === "admin" || (!isClaimant && owner) ? "admin" : "user";

    const { data: updated, error: updateError } = await auth.supabaseAdmin
      .from("area_claims")
      .update({
        released_at: new Date().toISOString(),
        release_reason: releaseReason,
      })
      .eq("id", claimId)
      .select(
        "id, lad_code, claimed_by, claimed_at, last_activity_at, released_at, release_reason",
      )
      .single();

    if (updateError) {
      console.error("Claim release failed:", updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ claim: updated }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("release-area error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
