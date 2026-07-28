-- Tracking of automated late-payment chase emails. Admin-only via is_admin().

CREATE TABLE IF NOT EXISTS public.payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reminder_level INTEGER NOT NULL CHECK (reminder_level >= 1 AND reminder_level <= 4),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resend_message_id TEXT,
  email_status TEXT CHECK (email_status IN ('sent', 'delivered', 'bounced', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_payment_reminders_invoice_id
  ON public.payment_reminders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_user_id
  ON public.payment_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_sent_at
  ON public.payment_reminders(sent_at DESC);

ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage payment_reminders" ON public.payment_reminders;
CREATE POLICY "Admins manage payment_reminders"
  ON public.payment_reminders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMENT ON TABLE public.payment_reminders IS
  'Log of auto-sent payment chase emails. Levels 1-4: gentle, firm, final, escalation.';
