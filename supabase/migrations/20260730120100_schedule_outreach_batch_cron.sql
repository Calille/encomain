-- Schedule run-outreach-batch every minute (Option B: one email per tick).
-- Reuses public.invoke_edge_function from 20260728120800_schedule_billing_cron_jobs.
-- Josh must confirm vault secrets (edge_functions_base_url, service_role_key) before deploy.

DO $$
BEGIN
  PERFORM cron.unschedule('run-outreach-batch-tick');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'run-outreach-batch-tick',
  '* * * * *',
  $$SELECT public.invoke_edge_function('run-outreach-batch');$$
);

COMMENT ON EXTENSION pg_cron IS
  'Job scheduler; billing daily jobs plus outreach batch tick every minute.';
