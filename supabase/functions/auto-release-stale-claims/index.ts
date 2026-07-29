/**
 * Daily cron: warn at 12 days idle, auto-release claims at 14 days idle.
 * Invoked with service role via pg_cron / invoke_edge_function.
 */
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import {
  assertSentryUserOrServiceRole,
  isAuthError,
} from "../_shared/sentry-auth.ts";
import { sendEmail } from "../_shared/email-service.ts";

const MS_DAY = 24 * 60 * 60 * 1000;

Deno.serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = await assertSentryUserOrServiceRole(req);
    if (isAuthError(auth)) return auth;

    // Cron uses service role; owners may also trigger manually.
    if (!auth.isServiceRole) {
      const owner =
        auth.profile &&
        (auth.profile.is_owner === true || auth.profile.role === "admin");
      if (!owner) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const now = Date.now();
    const expireBefore = new Date(now - 14 * MS_DAY).toISOString();
    const warnBefore = new Date(now - 12 * MS_DAY).toISOString();

    const { data: activeClaims, error: listError } = await auth.supabaseAdmin
      .from("area_claims")
      .select(
        "id, lad_code, claimed_by, claimed_at, last_activity_at, released_at",
      )
      .is("released_at", null);

    if (listError) {
      console.error("List claims failed:", listError);
      return new Response(JSON.stringify({ error: listError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toExpire = (activeClaims || []).filter(
      (c) => c.last_activity_at < expireBefore,
    );
    const toWarn = (activeClaims || []).filter(
      (c) =>
        c.last_activity_at < warnBefore &&
        c.last_activity_at >= expireBefore,
    );

    const releasedIds: string[] = [];
    const warnedIds: string[] = [];

    for (const claim of toExpire) {
      const { error: updateError } = await auth.supabaseAdmin
        .from("area_claims")
        .update({
          released_at: new Date().toISOString(),
          release_reason: "expired",
        })
        .eq("id", claim.id)
        .is("released_at", null);

      if (updateError) {
        console.error("Expire claim failed:", claim.id, updateError);
        continue;
      }
      releasedIds.push(claim.id);
    }

    const userIds = [
      ...new Set([
        ...toExpire.map((c) => c.claimed_by),
        ...toWarn.map((c) => c.claimed_by),
      ]),
    ];

    const { data: users } = userIds.length
      ? await auth.supabaseAdmin
          .from("users")
          .select("id, email, full_name")
          .in("id", userIds)
      : { data: [] as { id: string; email: string; full_name: string | null }[] };

    const userById = new Map((users || []).map((u) => [u.id, u]));

    const { data: lads } = await auth.supabaseAdmin
      .from("uk_local_authorities")
      .select("code, name");
    const ladName = new Map((lads || []).map((l) => [l.code, l.name]));

    const byUser = (claims: typeof toExpire) => {
      const map = new Map<string, typeof toExpire>();
      for (const c of claims) {
        const list = map.get(c.claimed_by) || [];
        list.push(c);
        map.set(c.claimed_by, list);
      }
      return map;
    };

    for (const [userId, claims] of byUser(toExpire)) {
      const user = userById.get(userId);
      if (!user?.email) continue;
      const names = claims
        .map((c) => ladName.get(c.lad_code) || c.lad_code)
        .join(", ");
      await sendEmail({
        to: user.email,
        subject: "Sentry area claim released after inactivity",
        html: `<p>Hello${user.full_name ? ` ${user.full_name}` : ""},</p>
<p>Your Sentry claim${claims.length > 1 ? "s" : ""} for <strong>${names}</strong>
${claims.length > 1 ? "have" : "has"} been released after 14 days without activity.</p>
<p>You can claim the area again from Sentry when you are ready to continue sweeping.</p>
<p>The Enclosure</p>`,
        idempotencyKey: `sentry-claim-expired-${claims.map((c) => c.id).join("-")}`,
      });
    }

    for (const [userId, claims] of byUser(toWarn)) {
      const user = userById.get(userId);
      if (!user?.email) continue;
      const names = claims
        .map((c) => ladName.get(c.lad_code) || c.lad_code)
        .join(", ");
      const result = await sendEmail({
        to: user.email,
        subject: "Sentry area claim expires in two days",
        html: `<p>Hello${user.full_name ? ` ${user.full_name}` : ""},</p>
<p>Your Sentry claim${claims.length > 1 ? "s" : ""} for <strong>${names}</strong>
will be released in about two days unless you record new sweep activity.</p>
<p>Open Sentry and continue sweeping to keep the claim active.</p>
<p>The Enclosure</p>`,
        idempotencyKey: `sentry-claim-warn-${new Date().toISOString().slice(0, 10)}-${claims.map((c) => c.id).join("-")}`,
      });
      if (result.success) {
        for (const c of claims) warnedIds.push(c.id);
      }
    }

    return new Response(
      JSON.stringify({
        released: releasedIds.length,
        warned: warnedIds.length,
        releasedIds,
        warnedIds,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    console.error("auto-release-stale-claims error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
