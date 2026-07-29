-- Sentry Phase B: coverage map, area claims, sweep cells, ONS area stats.

CREATE OR REPLACE FUNCTION public.point_in_bbox(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  min_lat DOUBLE PRECISION,
  min_lng DOUBLE PRECISION,
  max_lat DOUBLE PRECISION,
  max_lng DOUBLE PRECISION
) RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lat IS NOT NULL
    AND lng IS NOT NULL
    AND lat BETWEEN min_lat AND max_lat
    AND lng BETWEEN min_lng AND max_lng;
$$;

COMMENT ON FUNCTION public.point_in_bbox IS
  'Fast axis-aligned bounding-box containment check for coverage aggregates.';

CREATE TABLE IF NOT EXISTS public.uk_local_authorities (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  country TEXT NOT NULL,
  centroid_lat DOUBLE PRECISION NOT NULL,
  centroid_lng DOUBLE PRECISION NOT NULL,
  bbox_min_lat DOUBLE PRECISION NOT NULL,
  bbox_min_lng DOUBLE PRECISION NOT NULL,
  bbox_max_lat DOUBLE PRECISION NOT NULL,
  bbox_max_lng DOUBLE PRECISION NOT NULL,
  geometry JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_uk_lads_country
  ON public.uk_local_authorities(country);

CREATE TABLE IF NOT EXISTS public.area_stats (
  lad_code TEXT PRIMARY KEY REFERENCES public.uk_local_authorities(code),
  total_businesses INTEGER NOT NULL,
  data_year INTEGER NOT NULL,
  data_source TEXT NOT NULL DEFAULT 'ONS UK Business Counts',
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.area_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lad_code TEXT NOT NULL REFERENCES public.uk_local_authorities(code),
  claimed_by UUID NOT NULL REFERENCES auth.users(id),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  release_reason TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_area_claims_active
  ON public.area_claims(lad_code)
  WHERE released_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_area_claims_user
  ON public.area_claims(claimed_by);

CREATE INDEX IF NOT EXISTS idx_area_claims_activity
  ON public.area_claims(last_activity_at)
  WHERE released_at IS NULL;

CREATE TABLE IF NOT EXISTS public.sweep_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  h3_index TEXT NOT NULL,
  lad_code TEXT NOT NULL REFERENCES public.uk_local_authorities(code),
  swept_by UUID NOT NULL REFERENCES auth.users(id),
  swept_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  types_used TEXT[] NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  new_discoveries INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sweep_cells_lad ON public.sweep_cells(lad_code);
CREATE INDEX IF NOT EXISTS idx_sweep_cells_h3 ON public.sweep_cells(h3_index);
CREATE INDEX IF NOT EXISTS idx_sweep_cells_user ON public.sweep_cells(swept_by);

CREATE OR REPLACE VIEW public.sweep_cell_coverage AS
SELECT
  h3_index,
  lad_code,
  COUNT(*) AS sweep_count,
  COALESCE(
    ARRAY_AGG(DISTINCT unnested_type) FILTER (WHERE unnested_type IS NOT NULL),
    ARRAY[]::TEXT[]
  ) AS types_covered,
  MAX(swept_at) AS last_swept_at
FROM public.sweep_cells
LEFT JOIN LATERAL unnest(types_used) AS unnested_type ON true
GROUP BY h3_index, lad_code;

CREATE OR REPLACE VIEW public.area_coverage AS
SELECT
  lad.code AS lad_code,
  lad.name AS lad_name,
  lad.country,
  lad.centroid_lat,
  lad.centroid_lng,
  stats.total_businesses AS estimated_total,
  COALESCE(disc.discovered_count, 0) AS discovered_count,
  COALESCE(audits.audited_count, 0) AS audited_count,
  COALESCE(cells.unique_cells_swept, 0) AS unique_cells_swept,
  COALESCE(cells.max_sweep_count, 0) AS max_sweep_count,
  claim.claimed_by AS active_claim_user_id,
  claim.claimed_at AS active_claim_at
FROM public.uk_local_authorities lad
LEFT JOIN public.area_stats stats ON stats.lad_code = lad.code
LEFT JOIN LATERAL (
  SELECT COUNT(DISTINCT sdb.id) AS discovered_count
  FROM public.sentry_discovered_businesses sdb
  WHERE public.point_in_bbox(
    sdb.latitude,
    sdb.longitude,
    lad.bbox_min_lat,
    lad.bbox_min_lng,
    lad.bbox_max_lat,
    lad.bbox_max_lng
  )
) disc ON true
LEFT JOIN LATERAL (
  SELECT COUNT(DISTINCT sa.discovered_business_id) AS audited_count
  FROM public.sentry_audits sa
  JOIN public.sentry_discovered_businesses sdb ON sdb.id = sa.discovered_business_id
  WHERE public.point_in_bbox(
    sdb.latitude,
    sdb.longitude,
    lad.bbox_min_lat,
    lad.bbox_min_lng,
    lad.bbox_max_lat,
    lad.bbox_max_lng
  )
) audits ON true
LEFT JOIN LATERAL (
  SELECT
    COUNT(DISTINCT h3_index) AS unique_cells_swept,
    MAX(cell_sweep_count) AS max_sweep_count
  FROM (
    SELECT h3_index, COUNT(*) AS cell_sweep_count
    FROM public.sweep_cells
    WHERE lad_code = lad.code
    GROUP BY h3_index
  ) t
) cells ON true
LEFT JOIN public.area_claims claim
  ON claim.lad_code = lad.code AND claim.released_at IS NULL;

ALTER TABLE public.uk_local_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sweep_cells ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sentry_users_read_lads" ON public.uk_local_authorities;
CREATE POLICY "sentry_users_read_lads"
  ON public.uk_local_authorities FOR SELECT
  USING (public.is_sentry_user());

DROP POLICY IF EXISTS "owners_write_lads" ON public.uk_local_authorities;
CREATE POLICY "owners_write_lads"
  ON public.uk_local_authorities FOR ALL
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "sentry_users_read_area_stats" ON public.area_stats;
CREATE POLICY "sentry_users_read_area_stats"
  ON public.area_stats FOR SELECT
  USING (public.is_sentry_user());

DROP POLICY IF EXISTS "owners_write_area_stats" ON public.area_stats;
CREATE POLICY "owners_write_area_stats"
  ON public.area_stats FOR ALL
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "sentry_users_read_claims" ON public.area_claims;
CREATE POLICY "sentry_users_read_claims"
  ON public.area_claims FOR SELECT
  USING (public.is_sentry_user());

DROP POLICY IF EXISTS "sentry_users_read_sweeps" ON public.sweep_cells;
CREATE POLICY "sentry_users_read_sweeps"
  ON public.sweep_cells FOR SELECT
  USING (public.is_sentry_user());

DROP POLICY IF EXISTS "sentry_users_insert_own_sweeps" ON public.sweep_cells;
CREATE POLICY "sentry_users_insert_own_sweeps"
  ON public.sweep_cells FOR INSERT
  WITH CHECK (public.is_sentry_user() AND swept_by = auth.uid());

GRANT SELECT ON public.sweep_cell_coverage TO authenticated;
GRANT SELECT ON public.area_coverage TO authenticated;

-- Daily auto-release of stale area claims (10:00 UTC ≈ mid-morning UK).
DO $$
BEGIN
  PERFORM cron.unschedule('auto-release-stale-claims-daily');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'auto-release-stale-claims-daily',
  '0 10 * * *',
  $$SELECT public.invoke_edge_function('auto-release-stale-claims');$$
);
