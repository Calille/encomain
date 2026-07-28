-- Recurring invoice schedules. Admin-only via is_admin().

CREATE TABLE IF NOT EXISTS public.recurring_invoice_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual')),
  day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 28),
  start_date DATE NOT NULL,
  end_date DATE,
  next_invoice_date DATE NOT NULL,
  last_invoice_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_schedules_user_id
  ON public.recurring_invoice_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_next_invoice_date
  ON public.recurring_invoice_schedules(next_invoice_date);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_is_active
  ON public.recurring_invoice_schedules(is_active);

ALTER TABLE public.recurring_invoice_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage recurring_invoice_schedules"
  ON public.recurring_invoice_schedules;
CREATE POLICY "Admins manage recurring_invoice_schedules"
  ON public.recurring_invoice_schedules
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_updated_at_recurring_invoice_schedules
  ON public.recurring_invoice_schedules;
CREATE TRIGGER set_updated_at_recurring_invoice_schedules
  BEFORE UPDATE ON public.recurring_invoice_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Link invoices.schedule_id now that schedules table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'invoices_schedule_id_fkey'
  ) THEN
    ALTER TABLE public.invoices
      ADD CONSTRAINT invoices_schedule_id_fkey
      FOREIGN KEY (schedule_id)
      REFERENCES public.recurring_invoice_schedules(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_invoices_schedule_id ON public.invoices(schedule_id);

COMMENT ON TABLE public.recurring_invoice_schedules IS
  'Templates for automatically generating invoices on a schedule.';
