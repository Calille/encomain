-- BILLING TABLE POLICIES

-- Users can view their own billing
DROP POLICY IF EXISTS "Users can view own billing" ON public.billing;
CREATE POLICY "Users can view own billing" ON public.billing
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all billing
DROP POLICY IF EXISTS "Admins can view all billing" ON public.billing;
CREATE POLICY "Admins can view all billing" ON public.billing
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert billing
DROP POLICY IF EXISTS "Admins can insert billing" ON public.billing;
CREATE POLICY "Admins can insert billing" ON public.billing
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update all billing
DROP POLICY IF EXISTS "Admins can update all billing" ON public.billing;
CREATE POLICY "Admins can update all billing" ON public.billing
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete billing
DROP POLICY IF EXISTS "Admins can delete billing" ON public.billing;
CREATE POLICY "Admins can delete billing" ON public.billing
  FOR DELETE
  USING (public.is_admin());;
