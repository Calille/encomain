-- Create billing table
CREATE TABLE IF NOT EXISTS public.billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'GBP', 'EUR')),
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')) DEFAULT 'pending',
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  CONSTRAINT valid_billing_period CHECK (billing_period_end > billing_period_start)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_billing_user_id ON public.billing(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON public.billing(status);
CREATE INDEX IF NOT EXISTS idx_billing_period ON public.billing(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_billing_created_at ON public.billing(created_at DESC);

-- Add comment to table
COMMENT ON TABLE public.billing IS 'Billing records for client accounts';;
