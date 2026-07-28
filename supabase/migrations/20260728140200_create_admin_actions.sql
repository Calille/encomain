-- Admin action audit log for hard-delete and related privileged actions.
-- Do NOT apply to production in this session; review via --db-url separately.

CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id
  ON public.admin_actions (admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user_id
  ON public.admin_actions (target_user_id);

CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at
  ON public.admin_actions (created_at DESC);

COMMENT ON TABLE public.admin_actions IS
  'Audit log for privileged admin actions (hard delete, restore, auto cleanup).';

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read admin_actions" ON public.admin_actions;
CREATE POLICY "Admins can read admin_actions" ON public.admin_actions
  FOR SELECT
  USING (public.is_admin());

-- No INSERT/UPDATE/DELETE policies for authenticated roles: writes via service role only.
