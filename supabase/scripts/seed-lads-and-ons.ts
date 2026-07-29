/**
 * Seed UK Local Authority Districts and ONS business counts into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx supabase/scripts/seed-lads-and-ons.ts
 *
 * Optional:
 *   NOMIS_API_KEY=...   # for live NOMIS fetch of NM_142_1
 *   SKIP_DOWNLOAD=1     # reuse files under supabase/scripts/data/
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");

const GEOJSON_PATH = path.join(dataDir, "lad-may-2024-uk-bgc.geojson");
const ROWS_PATH = path.join(dataDir, "lad-rows.json");
const ONS_CSV_PATH = path.join(dataDir, "ons-business-counts.csv");

const ARC_GIS_LAYER =
  "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Local_Authority_Districts_May_2024_Boundaries_UK_BGC/FeatureServer/0/query";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name}`);
  return value;
}

function simplifyRing(
  ring: number[][],
  step = 3,
): number[][] {
  if (ring.length <= 8) {
    return ring.map((p) => [Number(p[0].toFixed(4)), Number(p[1].toFixed(4))]);
  }
  const out: number[][] = [];
  for (let i = 0; i < ring.length; i += step) {
    out.push([Number(ring[i][0].toFixed(4)), Number(ring[i][1].toFixed(4))]);
  }
  const first = out[0];
  const last = out[out.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) out.push([...first]);
  return out;
}

function simplifyGeom(g: {
  type: string;
  coordinates: unknown;
}): { type: string; coordinates: unknown } {
  if (g.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: (g.coordinates as number[][][]).map((r) => simplifyRing(r)),
    };
  }
  if (g.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: (g.coordinates as number[][][][]).map((p) =>
        p.map((r) => simplifyRing(r)),
      ),
    };
  }
  return g;
}

function bbox(g: { coordinates: unknown }): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  const walk = (c: unknown) => {
    if (Array.isArray(c) && typeof c[0] === "number") {
      const lng = c[0] as number;
      const lat = c[1] as number;
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    } else if (Array.isArray(c)) {
      c.forEach(walk);
    }
  };
  walk(g.coordinates);
  return { minLat, maxLat, minLng, maxLng };
}

async function downloadLadGeoJson(): Promise<void> {
  if (process.env.SKIP_DOWNLOAD === "1" && fs.existsSync(GEOJSON_PATH)) {
    console.log("Reusing existing GeoJSON");
    return;
  }

  const all: unknown[] = [];
  let offset = 0;
  while (true) {
    const url = `${ARC_GIS_LAYER}?where=1%3D1&outFields=LAD24CD,LAD24NM,LONG,LAT&outSR=4326&f=geojson&resultRecordCount=200&resultOffset=${offset}`;
    console.log(`Fetching LADs offset=${offset}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ArcGIS HTTP ${res.status}`);
    const json = (await res.json()) as { features?: unknown[] };
    const feats = json.features || [];
    all.push(...feats);
    if (feats.length < 200) break;
    offset += 200;
  }

  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    GEOJSON_PATH,
    JSON.stringify({ type: "FeatureCollection", features: all }),
  );
  console.log(`Saved ${all.length} LAD features to ${GEOJSON_PATH}`);
}

function buildRows(): Array<Record<string, unknown>> {
  const geo = JSON.parse(fs.readFileSync(GEOJSON_PATH, "utf8")) as {
    features: Array<{
      properties: {
        LAD24CD: string;
        LAD24NM: string;
        LONG?: number;
        LAT?: number;
      };
      geometry: { type: string; coordinates: unknown };
    }>;
  };

  const rows = geo.features.map((f) => {
    const code = f.properties.LAD24CD;
    const name = f.properties.LAD24NM;
    const country = code?.[0] || "E";
    const geometry = simplifyGeom(f.geometry);
    const b = bbox(geometry);
    const lat = Number(
      (f.properties.LAT ?? (b.minLat + b.maxLat) / 2).toFixed(6),
    );
    const lng = Number(
      (f.properties.LONG ?? (b.minLng + b.maxLng) / 2).toFixed(6),
    );
    return {
      code,
      name,
      country,
      lat,
      lng,
      minLat: b.minLat,
      minLng: b.minLng,
      maxLat: b.maxLat,
      maxLng: b.maxLng,
      geometry,
    };
  });

  fs.writeFileSync(ROWS_PATH, JSON.stringify(rows));
  console.log(`Prepared ${rows.length} simplified LAD rows`);
  return rows;
}

async function fetchOnsCsv(): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const workbookPath = path.join(dataDir, "ukbusinessworkbook2024.xlsx");

  // Prefer local ONS workbook Table 1 totals when present.
  if (fs.existsSync(workbookPath)) {
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.readFile(workbookPath);
      const sheet = wb.Sheets["Table 1"];
      if (sheet) {
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
        for (const row of rows.slice(4)) {
          const label = String(row?.[0] ?? "");
          const match = label.match(/^([EWSN]\d{8})\b/);
          if (!match) continue;
          const total = Number(row[row.length - 1]);
          if (Number.isFinite(total)) map.set(match[1], Math.round(total));
        }
        const csv = [
          "geography_code,total_businesses",
          ...[...map.entries()].map(([code, total]) => `${code},${total}`),
        ].join("\n");
        fs.writeFileSync(ONS_CSV_PATH, csv);
        console.log(`Parsed ${map.size} geography totals from ONS workbook Table 1`);
        return map;
      }
    } catch (err) {
      console.warn("Failed to parse ONS workbook; falling back to CSV/NOMIS", err);
    }
  }

  if (fs.existsSync(ONS_CSV_PATH)) {
    console.log(`Reading ONS CSV from ${ONS_CSV_PATH}`);
    const text = fs.readFileSync(ONS_CSV_PATH, "utf8").trim();
    if (text) {
      const lines = text.split(/\r?\n/);
      const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const codeIdx = header.findIndex((h) =>
        /geography_code|lad.?code|code/i.test(h),
      );
      const valueIdx = header.findIndex((h) =>
        /obs_value|total|count|business/i.test(h),
      );
      if (codeIdx >= 0 && valueIdx >= 0) {
        for (const line of lines.slice(1)) {
          if (!line.trim()) continue;
          const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          const code = cols[codeIdx];
          const value = Number(cols[valueIdx]);
          if (code && Number.isFinite(value)) map.set(code, Math.round(value));
        }
        console.log(`Parsed ${map.size} ONS rows from local CSV`);
        return map;
      }
    }
  }

  const nomisKey = process.env.NOMIS_API_KEY;
  if (nomisKey) {
    const url =
      `https://www.nomisweb.co.uk/api/v01/dataset/NM_142_1.data.csv` +
      `?geography=TYPE464&date=latest&industry=2092957697` +
      `&employment_sizeband=0&legal_status=0&measures=20100` +
      `&uid=${encodeURIComponent(nomisKey)}`;
    console.log("Fetching NOMIS NM_142_1…");
    const res = await fetch(url);
    const text = await res.text();
    fs.writeFileSync(ONS_CSV_PATH, text);
    if (!text.trim()) {
      console.warn("NOMIS returned empty body; area_stats will use zeros");
      return map;
    }
    const lines = text.trim().split(/\r?\n/);
    for (const line of lines.slice(1)) {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const code = cols.find((c) => /^[EWSN]\d{8}$/.test(c));
      const value = Number(cols[cols.length - 1]);
      if (code && Number.isFinite(value)) map.set(code, Math.round(value));
    }
    console.log(`Parsed ${map.size} ONS rows from NOMIS`);
    return map;
  }

  console.warn(
    "No ONS workbook/CSV and no NOMIS_API_KEY; inserting area_stats with total_businesses = 0 (refresh later).",
  );
  return map;
}

async function main() {
  const supabaseUrl = requireEnv("SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  fs.mkdirSync(dataDir, { recursive: true });
  await downloadLadGeoJson();
  const rows = buildRows();
  const ons = await fetchOnsCsv();

  const batchSize = 25;
  let upserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).map((r) => ({
      code: r.code as string,
      name: r.name as string,
      region: null,
      country: r.country as string,
      centroid_lat: r.lat as number,
      centroid_lng: r.lng as number,
      bbox_min_lat: r.minLat as number,
      bbox_min_lng: r.minLng as number,
      bbox_max_lat: r.maxLat as number,
      bbox_max_lng: r.maxLng as number,
      geometry: r.geometry,
    }));
    const { error } = await supabase.from("uk_local_authorities").upsert(batch, {
      onConflict: "code",
    });
    if (error) throw error;
    upserted += batch.length;
    console.log(`Upserted LADs ${upserted}/${rows.length}`);
  }

  const statsRows = rows.map((r) => ({
    lad_code: r.code as string,
    total_businesses: ons.get(r.code as string) ?? 0,
    data_year: 2024,
    data_source: ons.size
      ? "ONS UK Business Counts (UK business workbook 2024 Table 1)"
      : "Pending ONS refresh",
    refreshed_at: new Date().toISOString(),
  }));

  const matchedStats = statsRows.filter((r) => r.total_businesses > 0).length;

  let statsUpserted = 0;
  for (let i = 0; i < statsRows.length; i += batchSize) {
    const batch = statsRows.slice(i, i + batchSize);
    const { error } = await supabase.from("area_stats").upsert(batch, {
      onConflict: "lad_code",
    });
    if (error) throw error;
    statsUpserted += batch.length;
    console.log(`Upserted area_stats ${statsUpserted}/${statsRows.length}`);
  }

  console.log("Seed complete.");
  console.log(`  uk_local_authorities: ${upserted}`);
  console.log(`  area_stats: ${statsUpserted} (LAD matches with totals: ${matchedStats})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
