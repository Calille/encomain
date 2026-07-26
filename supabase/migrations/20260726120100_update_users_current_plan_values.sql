-- Align current_plan with marketing tiers: essential / professional / signature / bespoke
UPDATE public.users
SET current_plan = 'professional'
WHERE current_plan = 'growth';

UPDATE public.users
SET current_plan = 'signature'
WHERE current_plan = 'ultimate';

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_current_plan_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_current_plan_check
  CHECK (
    current_plan IS NULL
    OR current_plan IN ('essential', 'professional', 'signature', 'bespoke')
  );
