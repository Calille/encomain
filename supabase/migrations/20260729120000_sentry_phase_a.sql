-- Sentry Phase A: team roles, shared discovery/audits, config, lead attribution.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_sentry_user BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_owner BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.is_sentry_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT is_sentry_user OR is_owner OR role = 'admin'
      FROM public.users
      WHERE id = auth.uid()
    ),
    false
  );
$$;

COMMENT ON FUNCTION public.is_sentry_user() IS
  'True when the caller is a Sentry user, owner, or admin.';

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT is_owner OR role = 'admin'
      FROM public.users
      WHERE id = auth.uid()
    ),
    false
  );
$$;

COMMENT ON FUNCTION public.is_owner() IS
  'True when the caller is an Enclosure owner or admin.';

CREATE TABLE IF NOT EXISTS public.sentry_discovered_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT UNIQUE,
  domain TEXT NOT NULL,
  business_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  google_rating REAL,
  review_count INTEGER,
  google_category TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  first_discovered_by UUID NOT NULL REFERENCES auth.users(id),
  first_discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sentry_discovered_domain
  ON public.sentry_discovered_businesses(domain);

CREATE INDEX IF NOT EXISTS idx_sentry_discovered_place
  ON public.sentry_discovered_businesses(place_id)
  WHERE place_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sentry_discovered_discoverer
  ON public.sentry_discovered_businesses(first_discovered_by);

CREATE TABLE IF NOT EXISTS public.sentry_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discovered_business_id UUID NOT NULL
    REFERENCES public.sentry_discovered_businesses(id) ON DELETE CASCADE,
  audited_by UUID NOT NULL REFERENCES auth.users(id),
  audited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  overall_score INTEGER NOT NULL,
  audit_data JSONB NOT NULL,
  discovered_email TEXT,
  email_source TEXT,
  qualified BOOLEAN,
  qualification_reasons TEXT[],
  personalised_email_subject TEXT,
  personalised_email_body TEXT,
  recommended_package_id TEXT,
  is_first_audit BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_sentry_audits_business
  ON public.sentry_audits(discovered_business_id, audited_at DESC);

CREATE INDEX IF NOT EXISTS idx_sentry_audits_first
  ON public.sentry_audits(discovered_business_id)
  WHERE is_first_audit = true;

CREATE INDEX IF NOT EXISTS idx_sentry_audits_auditor
  ON public.sentry_audits(audited_by);

CREATE OR REPLACE FUNCTION public.set_first_audit_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.sentry_audits
    WHERE discovered_business_id = NEW.discovered_business_id
      AND id != NEW.id
  ) THEN
    NEW.is_first_audit := true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_first_audit_flag ON public.sentry_audits;
CREATE TRIGGER trg_set_first_audit_flag
  BEFORE INSERT ON public.sentry_audits
  FOR EACH ROW
  EXECUTE FUNCTION public.set_first_audit_flag();

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS sentry_discovered_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS sentry_first_audited_by UUID REFERENCES auth.users(id);

CREATE TABLE IF NOT EXISTS public.sentry_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  google_places_api_key TEXT,
  pagespeed_api_key TEXT,
  qualification_config JSONB NOT NULL DEFAULT '{
    "maxOverallScore": 75,
    "minOverallScore": 35,
    "complianceFailQualifies": true,
    "securityFailQualifies": true,
    "requireEmail": true
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

INSERT INTO public.sentry_config (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.sentry_discovered_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentry_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentry_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sentry_users_select_discovered" ON public.sentry_discovered_businesses;
CREATE POLICY "sentry_users_select_discovered"
  ON public.sentry_discovered_businesses FOR SELECT
  USING (public.is_sentry_user());

DROP POLICY IF EXISTS "sentry_users_insert_discovered" ON public.sentry_discovered_businesses;
CREATE POLICY "sentry_users_insert_discovered"
  ON public.sentry_discovered_businesses FOR INSERT
  WITH CHECK (public.is_sentry_user() AND first_discovered_by = auth.uid());

DROP POLICY IF EXISTS "sentry_users_update_discovered" ON public.sentry_discovered_businesses;
CREATE POLICY "sentry_users_update_discovered"
  ON public.sentry_discovered_businesses FOR UPDATE
  USING (public.is_sentry_user());

DROP POLICY IF EXISTS "sentry_users_select_audits" ON public.sentry_audits;
CREATE POLICY "sentry_users_select_audits"
  ON public.sentry_audits FOR SELECT
  USING (public.is_sentry_user());

DROP POLICY IF EXISTS "sentry_users_insert_audits" ON public.sentry_audits;
CREATE POLICY "sentry_users_insert_audits"
  ON public.sentry_audits FOR INSERT
  WITH CHECK (public.is_sentry_user() AND audited_by = auth.uid());

DROP POLICY IF EXISTS "owners_delete_audits" ON public.sentry_audits;
CREATE POLICY "owners_delete_audits"
  ON public.sentry_audits FOR DELETE
  USING (public.is_owner());

DROP POLICY IF EXISTS "sentry_users_read_config" ON public.sentry_config;
CREATE POLICY "sentry_users_read_config"
  ON public.sentry_config FOR SELECT
  USING (public.is_sentry_user());

DROP POLICY IF EXISTS "owners_update_config" ON public.sentry_config;
CREATE POLICY "owners_update_config"
  ON public.sentry_config FOR UPDATE
  USING (public.is_owner());

-- Owners can list team member profiles (admin policy already covers admins).
DROP POLICY IF EXISTS "owners_select_users_for_sentry" ON public.users;
CREATE POLICY "owners_select_users_for_sentry"
  ON public.users FOR SELECT
  USING (public.is_owner());

-- Restricted flag updates: owners must not get a blanket UPDATE on users.
CREATE OR REPLACE FUNCTION public.revoke_sentry_access(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Forbidden: owner role required';
  END IF;
  UPDATE public.users
  SET is_sentry_user = false
  WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_sentry_owner(target_user_id UUID, grant_owner BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Forbidden: owner role required';
  END IF;
  UPDATE public.users
  SET is_owner = grant_owner
  WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.revoke_sentry_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_sentry_owner(UUID, BOOLEAN) TO authenticated;
