-- Allow email_events to record transactional emails to clients (not only leads).

ALTER TABLE public.email_events
  ALTER COLUMN lead_id DROP NOT NULL;

ALTER TABLE public.email_events
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.email_events
  ADD COLUMN IF NOT EXISTS email_type TEXT;

CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON public.email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email_type ON public.email_events(email_type);

COMMENT ON COLUMN public.email_events.user_id IS
  'Client recipient when the email is transactional rather than lead outreach.';
COMMENT ON COLUMN public.email_events.email_type IS
  'Category such as payment_reminder, payment_receipt, invoice, ticket, welcome.';
