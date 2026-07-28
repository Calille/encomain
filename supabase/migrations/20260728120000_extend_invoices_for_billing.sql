-- Extend invoices for description, void flow, and payment reference.
-- notes and payment_method already exist from earlier migrations; re-assert safely.

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS voided_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS void_reason TEXT;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS schedule_id UUID;

-- Allow voided status used by admin billing workspace
ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoices_status_check;

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'voided'));

COMMENT ON COLUMN public.invoices.description IS 'Line item description shown on the invoice.';
COMMENT ON COLUMN public.invoices.notes IS 'Internal notes on the invoice.';
COMMENT ON COLUMN public.invoices.voided_at IS 'When the invoice was voided; null if active.';
COMMENT ON COLUMN public.invoices.voided_by IS 'Admin who voided the invoice.';
COMMENT ON COLUMN public.invoices.void_reason IS 'Reason recorded when voiding.';
COMMENT ON COLUMN public.invoices.payment_method IS 'bank_transfer, stripe, cash, other.';
COMMENT ON COLUMN public.invoices.payment_reference IS 'Bank ref, Stripe payment ID, etc.';
COMMENT ON COLUMN public.invoices.schedule_id IS 'Optional link to recurring_invoice_schedules when generated from a schedule.';
