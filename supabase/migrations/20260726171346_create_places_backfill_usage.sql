-- Tracks daily Google Places usage for Enclosure lead reviews backfill.
CREATE TABLE IF NOT EXISTS public.places_backfill_usage (
  usage_date DATE PRIMARY KEY DEFAULT (CURRENT_DATE),
  leads_processed INTEGER NOT NULL DEFAULT 0,
  places_calls INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.places_backfill_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read places_backfill_usage" ON public.places_backfill_usage;
CREATE POLICY "Admins read places_backfill_usage"
  ON public.places_backfill_usage
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

COMMENT ON TABLE public.places_backfill_usage IS
  'Daily counters for Places API calls made by backfill-lead-reviews.';;
