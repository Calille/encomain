/**
 * Coverage map payload for Sentry desktop and admin UI.
 * Sentry-user JWT required.
 */
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import {
  assertSentryUserOrServiceRole,
  isAuthError,
} from "../_shared/sentry-auth.ts";

Deno.serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "GET" && req.method !== "POST") {
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

    const url = new URL(req.url);
    let country = url.searchParams.get("country")?.trim() || null;
    let boundsParam = url.searchParams.get("bounds")?.trim() || null;

    if (req.method === "POST") {
      try {
        const body = (await req.json()) as {
          country?: string;
          bounds?: string;
        };
        if (body.country) country = body.country.trim();
        if (body.bounds) boundsParam = body.bounds.trim();
      } catch {
        // empty body is fine
      }
    }

    let bounds: {
      minLat: number;
      minLng: number;
      maxLat: number;
      maxLng: number;
    } | null = null;

    if (boundsParam) {
      const parts = boundsParam.split(",").map((p) => Number(p.trim()));
      if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
        bounds = {
          minLat: parts[0],
          minLng: parts[1],
          maxLat: parts[2],
          maxLng: parts[3],
        };
      } else {
        return new Response(
          JSON.stringify({
            error: "bounds must be min_lat,min_lng,max_lat,max_lng",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    let ladQuery = auth.supabaseAdmin
      .from("uk_local_authorities")
      .select(
        "code, name, country, region, centroid_lat, centroid_lng, bbox_min_lat, bbox_min_lng, bbox_max_lat, bbox_max_lng, geometry",
      );

    if (country) {
      ladQuery = ladQuery.eq("country", country);
    }

    const { data: lads, error: ladError } = await ladQuery;
    if (ladError) {
      console.error("LAD fetch failed:", ladError);
      return new Response(JSON.stringify({ error: ladError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let filtered = lads || [];
    if (bounds) {
      filtered = filtered.filter(
        (lad) =>
          lad.bbox_max_lat >= bounds!.minLat &&
          lad.bbox_min_lat <= bounds!.maxLat &&
          lad.bbox_max_lng >= bounds!.minLng &&
          lad.bbox_min_lng <= bounds!.maxLng,
      );
    }

    const codes = filtered.map((l) => l.code);

    const [
      { data: coverageRows },
      { data: myClaim },
      { data: activeClaims },
    ] = await Promise.all([
      codes.length
        ? auth.supabaseAdmin
            .from("area_coverage")
            .select("*")
            .in("lad_code", codes)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      auth.supabaseAdmin
        .from("area_claims")
        .select(
          "id, lad_code, claimed_by, claimed_at, last_activity_at, released_at, release_reason",
        )
        .eq("claimed_by", auth.caller.id)
        .is("released_at", null)
        .maybeSingle(),
      auth.supabaseAdmin
        .from("area_claims")
        .select("lad_code, claimed_by, claimed_at")
        .is("released_at", null),
    ]);

    const coverageByCode = new Map(
      (coverageRows || []).map((row) => [String(row.lad_code), row]),
    );

    const claimUserIds = [
      ...new Set(
        (activeClaims || [])
          .map((c) => c.claimed_by)
          .filter(Boolean) as string[],
      ),
    ];

    const { data: claimUsers } = claimUserIds.length
      ? await auth.supabaseAdmin
          .from("users")
          .select("id, full_name, email")
          .in("id", claimUserIds)
      : { data: [] as { id: string; full_name: string | null; email: string }[] };

    const usersById: Record<string, { display_name: string }> = {};
    for (const u of claimUsers || []) {
      usersById[u.id] = {
        display_name: u.full_name?.trim() || u.email.split("@")[0] || "User",
      };
    }

    const areas = filtered.map((lad) => {
      const cov = coverageByCode.get(lad.code) || {};
      return {
        lad_code: lad.code,
        lad_name: lad.name,
        country: lad.country,
        region: lad.region,
        centroid_lat: lad.centroid_lat,
        centroid_lng: lad.centroid_lng,
        geometry: lad.geometry,
        estimated_total: (cov as { estimated_total?: number }).estimated_total ?? null,
        discovered_count: (cov as { discovered_count?: number }).discovered_count ?? 0,
        audited_count: (cov as { audited_count?: number }).audited_count ?? 0,
        unique_cells_swept:
          (cov as { unique_cells_swept?: number }).unique_cells_swept ?? 0,
        max_sweep_count: (cov as { max_sweep_count?: number }).max_sweep_count ?? 0,
        active_claim_user_id:
          (cov as { active_claim_user_id?: string | null }).active_claim_user_id ??
          null,
        active_claim_at:
          (cov as { active_claim_at?: string | null }).active_claim_at ?? null,
      };
    });

    return new Response(
      JSON.stringify({
        areas,
        myActiveClaim: myClaim
          ? { id: myClaim.id, lad_code: myClaim.lad_code }
          : null,
        usersById,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    console.error("get-coverage-map error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
