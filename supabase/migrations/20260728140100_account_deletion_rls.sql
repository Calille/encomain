-- RLS updates for soft-deleted and anonymised users.
-- Do NOT apply to production in this session; review via --db-url separately.

-- Own-profile SELECT: allow even when soft-deleted (recovery / status messaging).
-- Hide anonymised rows from non-admin clients.
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (
    auth.uid() = id
    AND anonymised_at IS NULL
  );

-- Own-profile UPDATE: block changes once soft-deleted or anonymised
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (
    auth.uid() = id
    AND deleted_at IS NULL
    AND anonymised_at IS NULL
  )
  WITH CHECK (
    auth.uid() = id
    AND deleted_at IS NULL
    AND anonymised_at IS NULL
  );

-- Admins: can view all users including soft-deleted; anonymised only for audit
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
