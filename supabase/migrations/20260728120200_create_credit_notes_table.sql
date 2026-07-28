-- Credit notes linked to invoices. Admin-only via is_admin().

CREATE TABLE IF NOT EXISTS public.credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  credit_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  reason TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice_id ON public.credit_notes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_user_id ON public.credit_notes(user_id);

ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage credit_notes" ON public.credit_notes;
CREATE POLICY "Admins manage credit_notes"
  ON public.credit_notes
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Auto-generate credit numbers: CN-YYYY-NNNN
CREATE OR REPLACE FUNCTION public.generate_credit_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  credit_num TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO next_number FROM public.credit_notes
  WHERE credit_number LIKE 'CN-' || TO_CHAR(NOW(), 'YYYY') || '-%';

  credit_num := 'CN-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_number::TEXT, 4, '0');

  WHILE EXISTS (SELECT 1 FROM public.credit_notes WHERE credit_number = credit_num) LOOP
    next_number := next_number + 1;
    credit_num := 'CN-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_number::TEXT, 4, '0');
  END LOOP;

  RETURN credit_num;
END;
$$;

COMMENT ON TABLE public.credit_notes IS 'Credit notes reducing effective outstanding on invoices.';
COMMENT ON FUNCTION public.generate_credit_number() IS 'Returns next unique credit note number CN-YYYY-NNNN.';
