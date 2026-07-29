import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const rows = JSON.parse(
  fs.readFileSync(path.join(dataDir, "lad-rows.json"), "utf8"),
);

const batchSize = 15;
const outDir = path.join(dataDir, "sql-batches");
fs.mkdirSync(outDir, { recursive: true });

function esc(s) {
  return String(s).replace(/'/g, "''");
}

let bi = 0;
for (let i = 0; i < rows.length; i += batchSize) {
  const batch = rows.slice(i, i + batchSize);
  const values = batch
    .map((r) => {
      const country = ["E", "W", "S", "N"].includes(r.country)
        ? r.country
        : String(r.code)[0];
      return `('${esc(r.code)}', '${esc(r.name)}', NULL, '${country}', ${r.lat}, ${r.lng}, ${r.minLat}, ${r.minLng}, ${r.maxLat}, ${r.maxLng}, '${esc(JSON.stringify(r.geometry))}'::jsonb)`;
    })
    .join(",\n");

  const sql = `INSERT INTO public.uk_local_authorities (code, name, region, country, centroid_lat, centroid_lng, bbox_min_lat, bbox_min_lng, bbox_max_lat, bbox_max_lng, geometry)
VALUES
${values}
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  centroid_lat = EXCLUDED.centroid_lat,
  centroid_lng = EXCLUDED.centroid_lng,
  bbox_min_lat = EXCLUDED.bbox_min_lat,
  bbox_min_lng = EXCLUDED.bbox_min_lng,
  bbox_max_lat = EXCLUDED.bbox_max_lat,
  bbox_max_lng = EXCLUDED.bbox_max_lng,
  geometry = EXCLUDED.geometry;`;

  fs.writeFileSync(
    path.join(outDir, `batch-${String(bi).padStart(3, "0")}.sql`),
    sql,
  );
  bi += 1;
}

console.log(`Wrote ${bi} batches to ${outDir}`);
