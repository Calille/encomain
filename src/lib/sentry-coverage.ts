import { supabase } from "./supabase";
import type { CoverageArea, CoverageMapResponse } from "./sentry-coverage-map";

export type AreaClaim = {
  id: string;
  lad_code: string;
  claimed_by: string;
  claimed_at: string;
  last_activity_at: string;
  released_at: string | null;
  release_reason: string | null;
};

export async function fetchCoverageMap(params?: {
  country?: string;
  bounds?: string;
}): Promise<CoverageMapResponse> {
  const { data, error } = await supabase.functions.invoke("get-coverage-map", {
    body: {
      country: params?.country ?? null,
      bounds: params?.bounds ?? null,
    },
  });

  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));
  return data as CoverageMapResponse;
}

export async function claimArea(ladCode: string): Promise<{ claim: AreaClaim }> {
  const { data, error } = await supabase.functions.invoke("claim-area", {
    body: { ladCode },
  });
  if (error) throw error;
  if (data?.error === "claimed") {
    const err = new Error("claimed") as Error & {
      claimedBy?: string;
      since?: string;
    };
    err.claimedBy = data.claimedBy;
    err.since = data.since;
    throw err;
  }
  if (data?.error) throw new Error(String(data.error));
  return data as { claim: AreaClaim };
}

export async function releaseArea(
  claimId: string,
  reason?: "user" | "admin",
): Promise<{ claim: AreaClaim }> {
  const { data, error } = await supabase.functions.invoke("release-area", {
    body: { claimId, reason },
  });
  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));
  return data as { claim: AreaClaim };
}

export async function getActiveClaimForLad(
  ladCode: string,
): Promise<AreaClaim | null> {
  const { data, error } = await supabase
    .from("area_claims")
    .select(
      "id, lad_code, claimed_by, claimed_at, last_activity_at, released_at, release_reason",
    )
    .eq("lad_code", ladCode)
    .is("released_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data as AreaClaim) || null;
}

async function getLadBbox(ladCode: string) {
  const { data, error } = await supabase
    .from("uk_local_authorities")
    .select("bbox_min_lat, bbox_min_lng, bbox_max_lat, bbox_max_lng")
    .eq("code", ladCode)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listDiscoveriesInLad(ladCode: string, limit = 10) {
  const lad = await getLadBbox(ladCode);
  if (!lad) return [];

  const { data, error } = await supabase
    .from("sentry_discovered_businesses")
    .select(
      "id, business_name, domain, website_url, first_discovered_by, first_discovered_at, latitude, longitude",
    )
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("first_discovered_at", { ascending: false })
    .limit(500);

  if (error) throw error;

  return (data || [])
    .filter((row) => {
      const lat = row.latitude as number;
      const lng = row.longitude as number;
      return (
        lat >= lad.bbox_min_lat &&
        lat <= lad.bbox_max_lat &&
        lng >= lad.bbox_min_lng &&
        lng <= lad.bbox_max_lng
      );
    })
    .slice(0, limit);
}

export async function discoveriesByMemberInLad(ladCode: string) {
  const lad = await getLadBbox(ladCode);
  if (!lad) return [] as { userId: string; count: number }[];

  const { data, error } = await supabase
    .from("sentry_discovered_businesses")
    .select("first_discovered_by, latitude, longitude")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data || []) {
    const lat = row.latitude as number;
    const lng = row.longitude as number;
    if (
      lat < lad.bbox_min_lat ||
      lat > lad.bbox_max_lat ||
      lng < lad.bbox_min_lng ||
      lng > lad.bbox_max_lng
    ) {
      continue;
    }
    const id = String(row.first_discovered_by);
    counts.set(id, (counts.get(id) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count);
}

export type SentryCoverageStats = {
  activeClaim: AreaClaim | null;
  cellsSweptThisMonth: number;
  discoveriesThisMonth: number;
  auditsThisMonth: number;
  recentClaims: Array<AreaClaim & { lad_name?: string }>;
};

export async function getUserCoverageStats(
  userId: string,
): Promise<SentryCoverageStats> {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const iso = monthStart.toISOString();

  const activeRes = await supabase
    .from("area_claims")
    .select(
      "id, lad_code, claimed_by, claimed_at, last_activity_at, released_at, release_reason",
    )
    .eq("claimed_by", userId)
    .is("released_at", null)
    .maybeSingle();

  const cellsRes = await supabase
    .from("sweep_cells")
    .select("*", { count: "exact", head: true })
    .eq("swept_by", userId)
    .gte("swept_at", iso);

  const discoveriesRes = await supabase
    .from("sentry_discovered_businesses")
    .select("*", { count: "exact", head: true })
    .eq("first_discovered_by", userId)
    .gte("first_discovered_at", iso);

  const auditsRes = await supabase
    .from("sentry_audits")
    .select("*", { count: "exact", head: true })
    .eq("audited_by", userId)
    .gte("audited_at", iso);

  const recentRes = await supabase
    .from("area_claims")
    .select(
      "id, lad_code, claimed_by, claimed_at, last_activity_at, released_at, release_reason",
    )
    .eq("claimed_by", userId)
    .order("claimed_at", { ascending: false })
    .limit(5);

  if (activeRes.error) throw activeRes.error;
  if (cellsRes.error) throw cellsRes.error;
  if (discoveriesRes.error) throw discoveriesRes.error;
  if (auditsRes.error) throw auditsRes.error;
  if (recentRes.error) throw recentRes.error;

  const codes = [...new Set((recentRes.data || []).map((c) => c.lad_code))];
  const { data: lads } = codes.length
    ? await supabase
        .from("uk_local_authorities")
        .select("code, name")
        .in("code", codes)
    : { data: [] as { code: string; name: string }[] };
  const nameByCode = new Map((lads || []).map((l) => [l.code, l.name]));

  return {
    activeClaim: (activeRes.data as AreaClaim) || null,
    cellsSweptThisMonth: cellsRes.count ?? 0,
    discoveriesThisMonth: discoveriesRes.count ?? 0,
    auditsThisMonth: auditsRes.count ?? 0,
    recentClaims: (recentRes.data || []).map((c) => ({
      ...(c as AreaClaim),
      lad_name: nameByCode.get(c.lad_code),
    })),
  };
}

export type { CoverageArea };
