-- Referrals RLS Policies

-- Users can view their own referrals
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own referrals
DROP POLICY IF EXISTS "Users can create own referrals" ON public.referrals;
CREATE POLICY "Users can create own referrals" ON public.referrals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all referrals
DROP POLICY IF EXISTS "Admins can view all referrals" ON public.referrals;
CREATE POLICY "Admins can view all referrals" ON public.referrals
  FOR SELECT
  USING (public.is_admin());

-- Admins can update all referrals
DROP POLICY IF EXISTS "Admins can update all referrals" ON public.referrals;
CREATE POLICY "Admins can update all referrals" ON public.referrals
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());;
