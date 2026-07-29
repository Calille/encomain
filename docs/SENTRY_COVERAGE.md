# Sentry coverage

Tracks which UK Local Authority Districts (LADs) the Sentry team has claimed and swept, and how that compares with ONS business counts.

Admin route: `/admin/coverage` (admins can view; owners can force-release claims).

## Claims

A Sentry user claims one LAD at a time via the `claim-area` Edge Function. Only one active claim exists per LAD (`released_at IS NULL`).

- Activity is tracked on `area_claims.last_activity_at` (updated by the Sentry desktop app when sweeps are recorded in Phase B).
- After **12 days** without activity, `auto-release-stale-claims` emails a warning.
- After **14 days**, the claim is released with `release_reason = 'expired'` and the claimant is emailed.
- Owners can force-release from the coverage sidebar (`release_reason = 'admin'`). Claimants can release themselves (`user`).

## Sweep cells

`sweep_cells` stores H3 resolution-8 hexes covered by Places searches. Recording cells from Sentry is Phase B desktop work; this Enclosure release creates the table and map aggregates ready for that data.

## ONS “of X estimated”

`area_stats.total_businesses` comes from the ONS *UK business: activity, size and location* workbook (Table 1 totals by LAD). It is a rough denominator for “how many of these businesses have we audited?”, not a perfect match for Google Places results.

Caveats:

- ONS counts VAT/PAYE enterprises, not websites.
- Control rounding applies in the source tables.
- Bbox matching for discoveries/audits can over-count near LAD borders until discoveries store an explicit `lad_code`.

## Seeding LAD boundaries and ONS data

```bash
# Optional: download ONS workbook into supabase/scripts/data/
curl.exe -L -o supabase/scripts/data/ukbusinessworkbook2024.xlsx \
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/business/activitysizeandlocation/datasets/ukbusinessactivitysizeandlocation/2024/ukbusinessworkbook2024.xlsx"

SUPABASE_URL=https://eqqcbdpbeohtfwnlfdgx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service_role> \
npx tsx supabase/scripts/seed-lads-and-ons.ts
```

The seed script:

1. Downloads LAD May 2024 UK **BGC** boundaries from the ONS Open Geography ArcGIS layer (generalised for browser rendering; not the heavier BFC file).
2. Simplifies polygons further and upserts `uk_local_authorities`.
3. Parses ONS workbook Table 1 (or `ons-business-counts.csv`, or NOMIS with `NOMIS_API_KEY`) into `area_stats`.

Reproducible artefacts under `supabase/scripts/data/`:

- `ons-business-counts.csv` (committed)
- Large GeoJSON / XLSX regenerable files are gitignored

Annual refresh: re-download the latest ONS workbook and re-run the seed script.

## Auto-release cron

Migration schedules pg_cron job `auto-release-stale-claims-daily` at `0 10 * * *` UTC calling `invoke_edge_function('auto-release-stale-claims')`. Requires vault secrets `edge_functions_base_url` and `service_role_key` (same as billing crons).

## Map colours

| Colour | Meaning |
| --- | --- |
| Grey | No discoveries / sweeps yet |
| Amber | At least one discovery or swept cell |
| Green | Max cell sweep count ≥ 2 and audited / estimated &gt; 40% |
| Red border | Active claim |

Basemap uses OpenStreetMap raster tiles (not CARTO).

## Force-release

On `/admin/coverage`, select a claimed LAD. Owners see **Force release**, which calls `release-area` with an admin reason.

## Edge Functions

| Function | Purpose |
| --- | --- |
| `claim-area` | Claim LAD (409 if taken, idempotent for same user) |
| `release-area` | Release claim (claimant or owner) |
| `auto-release-stale-claims` | Daily warn / expire |
| `get-coverage-map` | Areas + geometry + `myActiveClaim` for Sentry desktop |
