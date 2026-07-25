-- SiteEntry leads, import batches, and global email suppression.
-- Admin-only via is_admin(). No client access.

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  contact_email TEXT,
  contact_name TEXT,
  phone TEXT,
  address TEXT,
  google_place_id TEXT,
  source TEXT NOT NULL DEFAULT 'siteentry',
  audit_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  audit_findings_summary TEXT,
  personalised_email_draft TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN (
      'new',
      'queued',
      'contacted',
      'responded',
      'converted',
      'dead',
      'unsubscribed'
    )),
  unsubscribed_at TIMESTAMPTZ,
  last_audited_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT leads_domain_unique UNIQUE (domain),
  CONSTRAINT leads_google_place_id_unique UNIQUE (google_place_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_domain_lower
  ON public.leads (lower(domain));

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_unsubscribed_at ON public.leads(unsubscribed_at);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_domain ON public.leads(domain);

CREATE TABLE IF NOT EXISTS public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  filename TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  total_records INTEGER NOT NULL DEFAULT 0,
  new_leads INTEGER NOT NULL DEFAULT 0,
  updated_leads INTEGER NOT NULL DEFAULT 0,
  skipped_unsubscribed INTEGER NOT NULL DEFAULT 0,
  skipped_invalid INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_batches_imported_at
  ON public.import_batches(imported_at DESC);

CREATE TABLE IF NOT EXISTS public.email_suppression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  suppressed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT,
  unsubscribe_token TEXT UNIQUE,
  CONSTRAINT email_suppression_email_unique UNIQUE (email)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_suppression_email_lower
  ON public.email_suppression (lower(email));

-- Keep updated_at fresh on leads
CREATE OR REPLACE FUNCTION public.set_leads_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_leads_updated_at();

-- Normalise domain and suppression email casing
CREATE OR REPLACE FUNCTION public.normalise_lead_domain()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.domain = lower(trim(NEW.domain));
  IF NEW.contact_email IS NOT NULL THEN
    NEW.contact_email = lower(trim(NEW.contact_email));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_normalise ON public.leads;
CREATE TRIGGER trg_leads_normalise
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.normalise_lead_domain();

CREATE OR REPLACE FUNCTION public.normalise_suppression_email()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.email = lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_email_suppression_normalise ON public.email_suppression;
CREATE TRIGGER trg_email_suppression_normalise
  BEFORE INSERT OR UPDATE ON public.email_suppression
  FOR EACH ROW
  EXECUTE FUNCTION public.normalise_suppression_email();

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppression ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage leads" ON public.leads;
CREATE POLICY "Admins manage leads"
  ON public.leads
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage import_batches" ON public.import_batches;
CREATE POLICY "Admins manage import_batches"
  ON public.import_batches
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage email_suppression" ON public.email_suppression;
CREATE POLICY "Admins manage email_suppression"
  ON public.email_suppression
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
