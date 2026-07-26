-- INVOICES TABLE POLICIES

-- Users can view their own invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all invoices
DROP POLICY IF EXISTS "Admins can view all invoices" ON public.invoices;
CREATE POLICY "Admins can view all invoices" ON public.invoices
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert invoices
DROP POLICY IF EXISTS "Admins can insert invoices" ON public.invoices;
CREATE POLICY "Admins can insert invoices" ON public.invoices
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update all invoices
DROP POLICY IF EXISTS "Admins can update all invoices" ON public.invoices;
CREATE POLICY "Admins can update all invoices" ON public.invoices
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete invoices
DROP POLICY IF EXISTS "Admins can delete invoices" ON public.invoices;
CREATE POLICY "Admins can delete invoices" ON public.invoices
  FOR DELETE
  USING (public.is_admin());;
