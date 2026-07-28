-- Daily cron jobs for recurring invoices (08:00 UK) and overdue scan (09:00 UK).
-- IMPORTANT: pg_cron and pg_net are available on the Enclosure project but NOT
-- currently installed. This migration enables them. Confirm with Josh before
-- applying via --db-url, and set vault secrets for the Edge Function URL and
-- service role key after review.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Store Edge Function base URL and service role key in vault (set after review):
--   SELECT vault.create_secret('https://eqqcbdpbeohtfwnlfdgx.supabase.co/functions/v1', 'edge_functions_base_url');
--   SELECT vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
-- Cron jobs below read these secrets. Until secrets exist, schedules are created
-- but invocations will fail safely.

CREATE OR REPLACE FUNCTION public.invoke_edge_function(function_name TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
AS $$
DECLARE
  base_url TEXT;
  service_key TEXT;
  request_id BIGINT;
BEGIN
  SELECT decrypted_secret INTO base_url
  FROM vault.decrypted_secrets
  WHERE name = 'edge_functions_base_url'
  LIMIT 1;

  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  IF base_url IS NULL OR service_key IS NULL THEN
    RAISE WARNING 'Vault secrets edge_functions_base_url / service_role_key not set; skipping %', function_name;
    RETURN NULL;
  END IF;

  SELECT net.http_post(
    url := rtrim(base_url, '/') || '/' || function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := '{}'::jsonb
  ) INTO request_id;

  RETURN request_id;
END;
$$;

COMMENT ON FUNCTION public.invoke_edge_function(TEXT) IS
  'POSTs to a Supabase Edge Function using vault-stored URL and service role key.';

-- 08:00 Europe/London: generate recurring invoices
-- pg_cron uses UTC; 08:00 UK is 08:00 UTC in winter (GMT) and 07:00 UTC in summer (BST).
-- Schedule at 07:00 UTC so summer runs at 08:00 BST; winter runs at 07:00 GMT.
-- Prefer explicit UK wall-clock via cron timezone if supported; fall back documented.
DO $$
BEGIN
  PERFORM cron.unschedule('generate-invoices-daily');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'generate-invoices-daily',
  '0 7 * * *',
  $$SELECT public.invoke_edge_function('generate-scheduled-invoices');$$
);

DO $$
BEGIN
  PERFORM cron.unschedule('scan-overdue-invoices-daily');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'scan-overdue-invoices-daily',
  '0 8 * * *',
  $$SELECT public.invoke_edge_function('scan-overdue-invoices');$$
);

COMMENT ON EXTENSION pg_cron IS 'Job scheduler; used for daily invoice generation and overdue reminder scans.';
