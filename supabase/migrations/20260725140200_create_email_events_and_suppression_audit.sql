-- Outreach email events and suppression removal audit trail.
-- Admin-only via is_admin(). Public unsubscribe uses an Edge Function with service role.

CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  subject TEXT,
  body TEXT,
  sent_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ,
  resend_message_id TEXT,
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  error_message TEXT,
  unsubscribe_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_lead_id ON public.email_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_events_sent_at ON public.email_events(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_unsubscribe_token
  ON public.email_events(unsubscribe_token)
  WHERE unsubscribe_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.suppression_removals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  removed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  previous_reason TEXT,
  removed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_suppression_removals_removed_at
  ON public.suppression_removals(removed_at DESC);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression_removals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage email_events" ON public.email_events;
CREATE POLICY "Admins manage email_events"
  ON public.email_events
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage suppression_removals" ON public.suppression_removals;
CREATE POLICY "Admins manage suppression_removals"
  ON public.suppression_removals
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
