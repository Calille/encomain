/**
 * Claim a Local Authority District for sweeping. Sentry-user JWT required.
 */
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import {
  assertSentryUserOrServiceRole,
  isAuthError,
} from "../_shared/sentry-auth.ts";

interface Body {
  ladCode?: string;
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
    if (auth.isServiceRole || !auth.caller) {
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

    const ladCode = body.ladCode?.trim();
    if (!ladCode) {
      return new Response(JSON.stringify({ error: "ladCode is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: lad, error: ladError } = await auth.supabaseAdmin
      .from("uk_local_authorities")
      .select("code, name")
      .eq("code", ladCode)
      .maybeSingle();

    if (ladError) {
      console.error("LAD lookup failed:", ladError);
      return new Response(JSON.stringify({ error: "Failed to look up LAD" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!lad) {
      return new Response(JSON.stringify({ error: "Unknown LAD code" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: activeClaim, error: claimLookupError } = await auth.supabaseAdmin
      .from("area_claims")
      .select("id, lad_code, claimed_by, claimed_at, last_activity_at, released_at, release_reason")
      .eq("lad_code", ladCode)
      .is("released_at", null)
      .maybeSingle();

    if (claimLookupError) {
      console.error("Active claim lookup failed:", claimLookupError);
      return new Response(JSON.stringify({ error: "Failed to check claims" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (activeClaim) {
      if (activeClaim.claimed_by === auth.caller.id) {
        return new Response(JSON.stringify({ claim: activeClaim }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: claimant } = await auth.supabaseAdmin
        .from("users")
        .select("full_name, email")
        .eq("id", activeClaim.claimed_by)
        .maybeSingle();

      const claimedBy =
        claimant?.full_name?.trim() ||
        claimant?.email ||
        "another team member";

      return new Response(
        JSON.stringify({
          error: "claimed",
          claimedBy,
          since: activeClaim.claimed_at,
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: inserted, error: insertError } = await auth.supabaseAdmin
      .from("area_claims")
      .insert({
        lad_code: ladCode,
        claimed_by: auth.caller.id,
      })
      .select(
        "id, lad_code, claimed_by, claimed_at, last_activity_at, released_at, release_reason",
      )
      .single();

    if (insertError) {
      // Race: another claim won the unique active index
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({
            error: "claimed",
            claimedBy: "another team member",
            since: new Date().toISOString(),
          }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      console.error("Claim insert failed:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ claim: inserted }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("claim-area error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
