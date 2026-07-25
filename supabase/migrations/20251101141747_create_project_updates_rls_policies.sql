-- PROJECT UPDATES TABLE POLICIES

-- Users can view their own project updates
DROP POLICY IF EXISTS "Users can view own updates" ON public.project_updates;
CREATE POLICY "Users can view own updates" ON public.project_updates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all project updates
DROP POLICY IF EXISTS "Admins can view all updates" ON public.project_updates;
CREATE POLICY "Admins can view all updates" ON public.project_updates
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert project updates
DROP POLICY IF EXISTS "Admins can insert updates" ON public.project_updates;
CREATE POLICY "Admins can insert updates" ON public.project_updates
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update all project updates
DROP POLICY IF EXISTS "Admins can update all updates" ON public.project_updates;
CREATE POLICY "Admins can update all updates" ON public.project_updates
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete project updates
DROP POLICY IF EXISTS "Admins can delete updates" ON public.project_updates;
CREATE POLICY "Admins can delete updates" ON public.project_updates
  FOR DELETE
  USING (public.is_admin());;
