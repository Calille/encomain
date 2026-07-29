-- One-off owner seed for Sentry Phase A.
-- Primary admin accounts identified on 2026-07-29:
--   Josh Wicks  joshwicks2015@gmail.com  9f9bdeae-d306-48d7-89fa-0518517f2e9f
--   Will Mitchell  williammitchell2001@gmail.com  401bff94-0783-47e0-b8d2-feff2f0a6a01
-- Note: a second Will Mitchell admin (xxkingsniperzz@gmail.com) was not seeded.

UPDATE public.users
SET
  is_owner = true,
  is_sentry_user = true
WHERE id IN (
  '9f9bdeae-d306-48d7-89fa-0518517f2e9f',
  '401bff94-0783-47e0-b8d2-feff2f0a6a01'
);
