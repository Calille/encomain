-- WEBSITES TABLE POLICIES

-- Users can view their own websites
DROP POLICY IF EXISTS "Users can view own websites" ON public.websites;
CREATE POLICY "Users can view own websites" ON public.websites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all websites
DROP POLICY IF EXISTS "Admins can view all websites" ON public.websites;
CREATE POLICY "Admins can view all websites" ON public.websites
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert websites
DROP POLICY IF EXISTS "Admins can insert websites" ON public.websites;
CREATE POLICY "Admins can insert websites" ON public.websites
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update all websites
DROP POLICY IF EXISTS "Admins can update all websites" ON public.websites;
CREATE POLICY "Admins can update all websites" ON public.websites
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete websites
DROP POLICY IF EXISTS "Admins can delete websites" ON public.websites;
CREATE POLICY "Admins can delete websites" ON public.websites
  FOR DELETE
  USING (public.is_admin());;
