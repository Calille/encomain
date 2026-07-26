-- Align current_plan with marketing tiers: essential / professional / signature / bespoke
-- Order matters: drop old check before remapping to values the old check would reject.

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_current_plan_check;

-- Remap legacy plan slugs
UPDATE public.users
SET current_plan = 'professional'
WHERE current_plan = 'growth';

UPDATE public.users
SET current_plan = 'signature'
WHERE current_plan = 'ultimate';

-- Defensive: clear any unexpected values outside the new allowed set
UPDATE public.users
SET current_plan = NULL
WHERE current_plan IS NOT NULL
  AND current_plan NOT IN ('essential', 'professional', 'signature', 'bespoke');

-- essential stays as-is; NULL stays as-is
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND conname = 'users_current_plan_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_current_plan_check
      CHECK (
        current_plan IS NULL
        OR current_plan IN ('essential', 'professional', 'signature', 'bespoke')
      );
  END IF;
END $$;
