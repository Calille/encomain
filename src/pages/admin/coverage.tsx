import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Map as MapIcon } from "lucide-react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { LoadError } from "../../components/ui/load-error";
import { Skeleton } from "../../components/ui/skeleton";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Map,
  MapControls,
  MapGeoJSON,
  useMap,
  type MapRef,
} from "../../components/ui/map";
import { useAuth } from "../../contexts/AuthContext";
import { useCancellableLoad } from "../../hooks/useCancellableLoad";
import { toast } from "../../hooks/use-toast";
import {
  discoveriesByMemberInLad,
  fetchCoverageMap,
  getActiveClaimForLad,
  listDiscoveriesInLad,
  releaseArea,
  type CoverageArea,
} from "../../lib/sentry-coverage";
import {
  OSM_MAP_STYLE,
  areasToFeatureCollection,
  coverageStatus,
} from "../../lib/sentry-coverage-map";
import { listSentryUsers } from "../../lib/sentry-team";

type CountryFilter = "all" | "E" | "W" | "S" | "N";
type StatusFilter = "all" | "claimed" | "unclaimed" | "complete";

function FitToFeature({
  feature,
}: {
  feature: GeoJSON.Feature | null;
}) {
  const { map, isLoaded } = useMap();
  useEffect(() => {
    if (!map || !isLoaded || !feature) return;
    try {
      const coords: number[][] = [];
      const walk = (c: unknown) => {
        if (Array.isArray(c) && typeof c[0] === "number") {
          coords.push(c as number[]);
        } else if (Array.isArray(c)) {
          c.forEach(walk);
        }
      };
      walk((feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon).coordinates);
      if (coords.length === 0) return;
      let minLng = 180;
      let maxLng = -180;
      let minLat = 90;
      let maxLat = -90;
      for (const [lng, lat] of coords) {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 40, duration: 600 },
      );
    } catch {
      // ignore fit errors on degenerate geometry
    }
  }, [map, isLoaded, feature]);
  return null;
}

export default function AdminCoveragePage() {
  const { isOwner } = useAuth();
  const mapRef = useRef<MapRef>(null);
  const [country, setCountry] = useState<CountryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [showDiscoveries, setShowDiscoveries] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [areas, setAreas] = useState<CoverageArea[]>([]);
  const [usersById, setUsersById] = useState<
    Record<string, { display_name: string }>
  >({});
  const [sentryUsers, setSentryUsers] = useState<
    { id: string; full_name: string | null; email: string }[]
  >([]);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [memberBars, setMemberBars] = useState<
    { userId: string; count: number; label: string }[]
  >([]);
  const [recentDiscoveries, setRecentDiscoveries] = useState<
    {
      id: string;
      business_name: string;
      domain: string;
      first_discovered_at: string;
    }[]
  >([]);
  const [releasing, setReleasing] = useState(false);

  const load = useCallback(async (ctl: { isCancelled: () => boolean }) => {
    const [mapData, users] = await Promise.all([
      fetchCoverageMap(country === "all" ? undefined : { country }),
      listSentryUsers(),
    ]);
    if (ctl.isCancelled()) return;
    setAreas(mapData.areas || []);
    setUsersById(mapData.usersById || {});
    setSentryUsers(
      users.map((u) => ({ id: u.id, full_name: u.full_name, email: u.email })),
    );
  }, [country]);

  const { loading, error, retry } = useCancellableLoad(load);

  const filteredAreas = useMemo(() => {
    return areas.filter((area) => {
      if (ownerFilter !== "all" && area.active_claim_user_id !== ownerFilter) {
        return false;
      }
      const st = coverageStatus(area);
      if (status === "claimed" && !area.active_claim_user_id) return false;
      if (status === "unclaimed" && area.active_claim_user_id) return false;
      if (status === "complete" && st !== "complete") return false;
      return true;
    });
  }, [areas, ownerFilter, status]);

  const selected = useMemo(
    () => filteredAreas.find((a) => a.lad_code === selectedCode) || null,
    [filteredAreas, selectedCode],
  );

  const featureCollection = useMemo(
    () => areasToFeatureCollection(filteredAreas),
    [filteredAreas],
  );

  const selectedFeature = useMemo(() => {
    if (!selected) return null;
    return featureCollection.features.find(
      (f) => f.properties?.lad_code === selected.lad_code,
    ) as GeoJSON.Feature | null;
  }, [featureCollection, selected]);

  useEffect(() => {
    if (!selected) {
      setClaimId(null);
      setMemberBars([]);
      setRecentDiscoveries([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [claim, byMember, recent] = await Promise.all([
          getActiveClaimForLad(selected.lad_code),
          discoveriesByMemberInLad(selected.lad_code),
          listDiscoveriesInLad(selected.lad_code, 10),
        ]);
        if (cancelled) return;
        setClaimId(claim?.id ?? null);
        setMemberBars(
          byMember.map((row) => ({
            userId: row.userId,
            count: row.count,
            label:
              usersById[row.userId]?.display_name ||
              sentryUsers.find((u) => u.id === row.userId)?.full_name ||
              sentryUsers.find((u) => u.id === row.userId)?.email ||
              row.userId.slice(0, 8),
          })),
        );
        setRecentDiscoveries(
          recent.map((r) => ({
            id: r.id,
            business_name: r.business_name,
            domain: r.domain,
            first_discovered_at: r.first_discovered_at,
          })),
        );
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "Failed to load area detail",
            description: err instanceof Error ? err.message : "Unknown error",
            variant: "destructive",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selected, usersById, sentryUsers]);

  const discoveryNote =
    isOwner && showDiscoveries
      ? "Discovery markers load in the selected area detail list; dense map pins arrive with Phase B Sentry sweep recording."
      : null;

  const auditedPct = selected
    ? selected.estimated_total && selected.estimated_total > 0
      ? Math.round((selected.audited_count / selected.estimated_total) * 100)
      : null
    : null;

  const maxBar = Math.max(1, ...memberBars.map((b) => b.count));

  const onForceRelease = async () => {
    if (!claimId) return;
    setReleasing(true);
    try {
      await releaseArea(claimId, "admin");
      toast({ title: "Claim released", description: selected?.lad_name });
      setClaimId(null);
      retry();
    } catch (err) {
      toast({
        title: "Release failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setReleasing(false);
    }
  };

  return (
    <AdminLayout title="Sentry coverage">
      <p className="mb-4 text-sm text-muted-foreground">
        Which areas have been swept, by whom, and how thoroughly
      </p>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label>Country</Label>
          <Select
            value={country}
            onValueChange={(v) => setCountry(v as CountryFilter)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="E">England</SelectItem>
              <SelectItem value="W">Wales</SelectItem>
              <SelectItem value="S">Scotland</SelectItem>
              <SelectItem value="N">Northern Ireland</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as StatusFilter)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
              <SelectItem value="unclaimed">Unclaimed</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Claimant</Label>
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {sentryUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.full_name || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2 pb-2">
            <Switch
              id="show-discoveries"
              checked={showDiscoveries}
              onCheckedChange={setShowDiscoveries}
            />
            <Label htmlFor="show-discoveries">Show discoveries (zoom in)</Label>
          </div>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-[560px] w-full" />
      ) : error ? (
        <LoadError message={error} onRetry={retry} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="overflow-hidden">
            <div className="h-[560px] w-full">
              <Map
                ref={mapRef}
                className="h-full w-full rounded-md"
                center={[-2.5, 54.2]}
                zoom={5.4}
                styles={{ light: OSM_MAP_STYLE, dark: OSM_MAP_STYLE }}
              >
                <MapControls showZoom showLocate={false} />
                <FitToFeature feature={selectedFeature} />
                <MapGeoJSON
                  id="lad-coverage"
                  data={featureCollection}
                  promoteId="lad_code"
                  interactive
                  fillPaint={{
                    "fill-color": ["get", "fill"],
                    "fill-opacity": 0.55,
                  }}
                  linePaint={{
                    "line-color": [
                      "case",
                      [">", ["get", "claimed"], 0],
                      "#ef4444",
                      "#374151",
                    ],
                    "line-width": [
                      "case",
                      [">", ["get", "claimed"], 0],
                      2.5,
                      0.8,
                    ],
                  }}
                  onClick={(e) => {
                    const code = e.feature.properties?.lad_code as
                      | string
                      | undefined;
                    if (code) setSelectedCode(code);
                  }}
                />
              </Map>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-border px-3 py-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#9ca3af]" />{" "}
                No discoveries
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />{" "}
                Swept
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#22c55e]" />{" "}
                Complete
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-[#ef4444]" />{" "}
                Claimed border
              </span>
            </div>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">
                {selected ? selected.lad_name : "Select an area"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {!selected ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <MapIcon className="h-8 w-8" strokeWidth={1.5} />
                  <p>Click a Local Authority District on the map.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{selected.lad_code}</Badge>
                    <Badge variant="secondary">
                      {selected.country === "E"
                        ? "England"
                        : selected.country === "W"
                          ? "Wales"
                          : selected.country === "S"
                            ? "Scotland"
                            : "Northern Ireland"}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-2xl font-semibold tabular-nums">
                      {selected.audited_count}
                      <span className="text-base font-normal text-muted-foreground">
                        {" "}
                        of ~{selected.estimated_total ?? "?"} audited
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      {auditedPct != null ? `${auditedPct}% of ONS estimate` : "ONS estimate pending"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium">Claim</p>
                    {selected.active_claim_user_id ? (
                      <div className="space-y-2">
                        <p>
                          {usersById[selected.active_claim_user_id]
                            ?.display_name || "Team member"}{" "}
                          since{" "}
                          {selected.active_claim_at
                            ? format(new Date(selected.active_claim_at), "PP")
                            : "unknown"}
                        </p>
                        {isOwner && claimId && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={releasing}
                            onClick={onForceRelease}
                          >
                            {releasing ? "Releasing…" : "Force release"}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Unclaimed</p>
                    )}
                  </div>

                  <div>
                    <p className="font-medium">Coverage</p>
                    <p className="text-muted-foreground">
                      {selected.unique_cells_swept} cells swept · max sweep count{" "}
                      {selected.max_sweep_count}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 font-medium">Discoveries by member</p>
                    {memberBars.length === 0 ? (
                      <p className="text-muted-foreground">None yet</p>
                    ) : (
                      <div className="space-y-2">
                        {memberBars.map((bar) => (
                          <div key={bar.userId}>
                            <div className="mb-0.5 flex justify-between text-xs">
                              <span>{bar.label}</span>
                              <span className="tabular-nums">{bar.count}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted">
                              <div
                                className="h-1.5 rounded-full bg-accent"
                                style={{
                                  width: `${Math.round((bar.count / maxBar) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 font-medium">Recent discoveries</p>
                    {discoveryNote && (
                      <p className="mb-2 text-xs text-muted-foreground">
                        {discoveryNote}
                      </p>
                    )}
                    {recentDiscoveries.length === 0 ? (
                      <p className="text-muted-foreground">None yet</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {recentDiscoveries.map((d) => (
                          <li key={d.id} className="text-xs">
                            <span className="font-medium">{d.business_name}</span>
                            <span className="text-muted-foreground">
                              {" "}
                              · {d.domain}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/admin/outreach">View leads in outreach</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
