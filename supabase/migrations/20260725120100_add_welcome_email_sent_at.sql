-- =============================================================================
-- P0.3 Add welcome_email_sent_at for idempotent welcome emails
-- =============================================================================
-- Prevents duplicate welcome emails by recording when Resend successfully
-- delivered a welcome message for a user. The send-welcome-email Edge Function
-- checks this column before sending.
-- =============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_users_welcome_email_sent_at
  ON public.users (welcome_email_sent_at);

COMMENT ON COLUMN public.users.welcome_email_sent_at IS
  'Set when the welcome email has been successfully sent via Resend. NULL means not yet sent.';

-- Backfill existing users: they have already received welcome emails in production
-- (often multiple times). Mark them as sent so the Edge Function skips them.
UPDATE public.users
SET welcome_email_sent_at = COALESCE(welcome_email_sent_at, created_at)
WHERE welcome_email_sent_at IS NULL;
