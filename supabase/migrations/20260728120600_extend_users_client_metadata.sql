-- Client-level billing metadata and reminder controls on users.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS industry TEXT;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS billing_email TEXT;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS billing_address TEXT;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS vat_number TEXT;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS payment_terms_days INTEGER NOT NULL DEFAULT 14;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS account_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS reminders_paused BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.users.company_name IS 'Client company or trading name.';
COMMENT ON COLUMN public.users.industry IS 'Client industry or sector.';
COMMENT ON COLUMN public.users.billing_email IS 'Finance contact email, separate from account email.';
COMMENT ON COLUMN public.users.billing_address IS 'Billing address for invoices.';
COMMENT ON COLUMN public.users.vat_number IS 'VAT registration number if applicable.';
COMMENT ON COLUMN public.users.payment_terms_days IS 'Days until invoice due date; default 14.';
COMMENT ON COLUMN public.users.account_manager_id IS 'Admin assigned as account manager for this client.';
COMMENT ON COLUMN public.users.reminders_paused IS
  'When true, automated late-payment reminders are not sent for this client.';
