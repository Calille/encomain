-- Schedule daily auto-cleanup of expired soft-deleted accounts at 06:00 UTC.
-- Do NOT apply to production in this session; review via --db-url separately.
-- Requires invoke_edge_function from 20260728120800_schedule_billing_cron_jobs.sql
-- and vault secrets edge_functions_base_url / service_role_key.

DO $$
BEGIN
  PERFORM cron.unschedule('auto-cleanup-deleted-accounts-daily');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'auto-cleanup-deleted-accounts-daily',
  '0 6 * * *',
  $$SELECT public.invoke_edge_function('auto-cleanup-deleted-accounts');$$
);
