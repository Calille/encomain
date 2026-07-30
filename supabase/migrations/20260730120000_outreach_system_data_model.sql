-- Outreach system data model: batch send, reply capture, PDF hosting, tracking.
-- Admin-only RLS via is_admin(). Edge Functions use service role for public flows.

-- ---------------------------------------------------------------------------
-- 1. outreach_batches (created before leads FK)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.outreach_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  lead_count INT NOT NULL CHECK (lead_count >= 0),
  delay_seconds INT NOT NULL DEFAULT 30 CHECK (delay_seconds >= 0),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sending', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  -- Option B queue cursor: which lead index to send next, and when
  next_lead_index INT NOT NULL DEFAULT 0 CHECK (next_lead_index >= 0),
  next_send_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_batches_status
  ON public.outreach_batches(status);

CREATE INDEX IF NOT EXISTS idx_outreach_batches_next_send_at
  ON public.outreach_batches(next_send_at)
  WHERE status = 'sending';

ALTER TABLE public.outreach_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage outreach_batches" ON public.outreach_batches;
CREATE POLICY "Admins manage outreach_batches"
  ON public.outreach_batches
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMENT ON TABLE public.outreach_batches IS
  'Queued outreach sends. Cron ticks run-outreach-batch once per minute.';
COMMENT ON COLUMN public.outreach_batches.next_lead_index IS
  'Zero-based index into the batch lead list for the next send.';
COMMENT ON COLUMN public.outreach_batches.next_send_at IS
  'Earliest time the next lead in this batch may be sent.';

-- ---------------------------------------------------------------------------
-- 2. Extend leads
-- ---------------------------------------------------------------------------

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS reply_token TEXT,
  ADD COLUMN IF NOT EXISTS reply_token_email TEXT,
  ADD COLUMN IF NOT EXISTS outreach_batch_id UUID REFERENCES public.outreach_batches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pdf_clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_replied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reply_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS audit_pdf_storage_path TEXT;
-- unsubscribed_at already exists from 20260725140100

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'leads_reply_token_key'
  ) THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_reply_token_key UNIQUE (reply_token);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leads_reply_token
  ON public.leads(reply_token)
  WHERE reply_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_outreach_batch_id
  ON public.leads(outreach_batch_id)
  WHERE outreach_batch_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_sent_at
  ON public.leads(sent_at DESC)
  WHERE sent_at IS NOT NULL;

COMMENT ON COLUMN public.leads.reply_token IS
  '32-char URL-safe token used for reply-to, audit PDF links, and unsubscribe.';
COMMENT ON COLUMN public.leads.reply_token_email IS
  'Full inbound address e.g. <token>@reply.theenclosure.co.uk.';
COMMENT ON COLUMN public.leads.audit_pdf_storage_path IS
  'Path in outreach-audits bucket: audits/<lead_id>/<filename>.pdf';

-- ---------------------------------------------------------------------------
-- 3. outreach_replies
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.outreach_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resend_message_id TEXT,
  raw_headers JSONB,
  read_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_outreach_replies_resend_message_id
  ON public.outreach_replies(resend_message_id)
  WHERE resend_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outreach_replies_lead_id
  ON public.outreach_replies(lead_id);

CREATE INDEX IF NOT EXISTS idx_outreach_replies_received_at
  ON public.outreach_replies(received_at DESC);

ALTER TABLE public.outreach_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage outreach_replies" ON public.outreach_replies;
CREATE POLICY "Admins manage outreach_replies"
  ON public.outreach_replies
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. unmatched_inbound (Resend replies we could not match to a lead)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.unmatched_inbound (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_address TEXT,
  from_email TEXT,
  subject TEXT,
  resend_message_id TEXT,
  raw_payload JSONB,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_unmatched_inbound_received_at
  ON public.unmatched_inbound(received_at DESC);

ALTER TABLE public.unmatched_inbound ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage unmatched_inbound" ON public.unmatched_inbound;
CREATE POLICY "Admins manage unmatched_inbound"
  ON public.unmatched_inbound
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. Private storage bucket: outreach-audits
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'outreach-audits',
  'outreach-audits',
  false,
  52428800,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Admins can manage objects (manual upload fallback from CRM).
DROP POLICY IF EXISTS "Admins select outreach audits" ON storage.objects;
CREATE POLICY "Admins select outreach audits"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'outreach-audits' AND public.is_admin());

DROP POLICY IF EXISTS "Admins insert outreach audits" ON storage.objects;
CREATE POLICY "Admins insert outreach audits"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'outreach-audits' AND public.is_admin());

DROP POLICY IF EXISTS "Admins update outreach audits" ON storage.objects;
CREATE POLICY "Admins update outreach audits"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'outreach-audits' AND public.is_admin())
  WITH CHECK (bucket_id = 'outreach-audits' AND public.is_admin());

DROP POLICY IF EXISTS "Admins delete outreach audits" ON storage.objects;
CREATE POLICY "Admins delete outreach audits"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'outreach-audits' AND public.is_admin());

-- Service role bypasses RLS; Edge Functions upload via service role and mint signed URLs.
COMMENT ON TABLE public.outreach_replies IS
  'Inbound replies captured via Resend Inbound webhook for reply.theenclosure.co.uk.';
