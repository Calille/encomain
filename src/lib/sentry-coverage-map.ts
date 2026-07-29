/** OpenStreetMap raster style for MapLibre (non-commercial CARTO alternative). */
export const OSM_MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster" as const,
      source: "osm",
    },
  ],
};

export type CoverageStatus = "none" | "swept" | "complete" | "claimed";

export type CoverageArea = {
  lad_code: string;
  lad_name: string;
  country: string;
  region?: string | null;
  centroid_lat: number;
  centroid_lng: number;
  geometry: GeoJSON.Geometry;
  estimated_total: number | null;
  discovered_count: number;
  audited_count: number;
  unique_cells_swept: number;
  max_sweep_count: number;
  active_claim_user_id: string | null;
  active_claim_at: string | null;
};

export type CoverageMapResponse = {
  areas: CoverageArea[];
  myActiveClaim: { id: string; lad_code: string } | null;
  usersById: Record<string, { display_name: string }>;
};

export function coverageFillColour(area: CoverageArea): string {
  const estimated = area.estimated_total ?? 0;
  const auditedRatio = estimated > 0 ? area.audited_count / estimated : 0;
  const fullyCovered =
    area.max_sweep_count >= 2 &&
    area.unique_cells_swept > 0 &&
    auditedRatio > 0.4;

  if (fullyCovered) return "#22c55e"; // green
  if (area.unique_cells_swept > 0 || area.discovered_count > 0) return "#f59e0b"; // amber
  return "#9ca3af"; // grey
}

export function coverageStatus(area: CoverageArea): CoverageStatus {
  const estimated = area.estimated_total ?? 0;
  const auditedRatio = estimated > 0 ? area.audited_count / estimated : 0;
  if (
    area.max_sweep_count >= 2 &&
    area.unique_cells_swept > 0 &&
    auditedRatio > 0.4
  ) {
    return "complete";
  }
  if (area.unique_cells_swept > 0 || area.discovered_count > 0) return "swept";
  return "none";
}

export function areasToFeatureCollection(
  areas: CoverageArea[],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: areas.map((area) => ({
      type: "Feature",
      id: area.lad_code,
      properties: {
        lad_code: area.lad_code,
        lad_name: area.lad_name,
        country: area.country,
        fill: coverageFillColour(area),
        claimed: area.active_claim_user_id ? 1 : 0,
        status: coverageStatus(area),
      },
      geometry: area.geometry,
    })),
  };
}
