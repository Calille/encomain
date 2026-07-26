-- ============================================
-- BILLING TABLE POLICIES
-- ============================================

-- Users can view their own billing records
CREATE POLICY "Users can view own billing"
  ON public.billing FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all billing records
CREATE POLICY "Admins can view all billing"
  ON public.billing FOR SELECT
  USING (public.is_admin());

-- Admins can insert billing records
CREATE POLICY "Admins can insert billing"
  ON public.billing FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update billing records
CREATE POLICY "Admins can update billing"
  ON public.billing FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete billing records
CREATE POLICY "Admins can delete billing"
  ON public.billing FOR DELETE
  USING (public.is_admin());

-- ============================================
-- INVOICES TABLE POLICIES
-- ============================================

-- Users can view their own invoices
CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices"
  ON public.invoices FOR SELECT
  USING (public.is_admin());

-- Admins can insert invoices
CREATE POLICY "Admins can insert invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update invoices
CREATE POLICY "Admins can update invoices"
  ON public.invoices FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete invoices
CREATE POLICY "Admins can delete invoices"
  ON public.invoices FOR DELETE
  USING (public.is_admin());

-- ============================================
-- PROJECT_UPDATES TABLE POLICIES
-- ============================================

-- Users can view updates for their websites
CREATE POLICY "Users can view own project updates"
  ON public.project_updates FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.websites
      WHERE websites.id = project_updates.website_id
      AND websites.user_id = auth.uid()
    )
  );

-- Admins can view all project updates
CREATE POLICY "Admins can view all project updates"
  ON public.project_updates FOR SELECT
  USING (public.is_admin());

-- Admins can insert project updates
CREATE POLICY "Admins can insert project updates"
  ON public.project_updates FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update project updates
CREATE POLICY "Admins can update project updates"
  ON public.project_updates FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete project updates
CREATE POLICY "Admins can delete project updates"
  ON public.project_updates FOR DELETE
  USING (public.is_admin());;
