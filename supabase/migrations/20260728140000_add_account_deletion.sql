-- Account soft-delete / recovery columns on public.users
-- Do NOT apply to production in this session; review via --db-url separately.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deletion_reason TEXT,
  ADD COLUMN IF NOT EXISTS recovery_token TEXT,
  ADD COLUMN IF NOT EXISTS anonymised_at TIMESTAMPTZ;

-- Unique recovery token when present
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_recovery_token_unique
  ON public.users (recovery_token)
  WHERE recovery_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_deleted_at
  ON public.users (deleted_at);

CREATE INDEX IF NOT EXISTS idx_users_deletion_scheduled_for
  ON public.users (deletion_scheduled_for);

-- Allow hard-delete status value
DO $$
BEGIN
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_status_check;
EXCEPTION WHEN undefined_object THEN
  NULL;
END $$;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_status_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_status_check
  CHECK (status IN ('active', 'inactive', 'suspended', 'deleted'));

COMMENT ON COLUMN public.users.deleted_at IS 'When the account was soft-deleted.';
COMMENT ON COLUMN public.users.deletion_scheduled_for IS 'When auto hard-delete runs (deleted_at + 30 days).';
COMMENT ON COLUMN public.users.deleted_by IS 'User or admin who initiated deletion.';
COMMENT ON COLUMN public.users.deletion_reason IS 'Optional reason, required for admin hard-delete.';
COMMENT ON COLUMN public.users.recovery_token IS 'Token for the public recovery link.';
COMMENT ON COLUMN public.users.anonymised_at IS 'When personal data was wiped by hard-delete.';
