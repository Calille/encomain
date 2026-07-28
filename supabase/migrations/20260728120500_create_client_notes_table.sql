-- Internal admin notes about clients. Admin-only via is_admin().

CREATE TABLE IF NOT EXISTS public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_notes_user_id ON public.client_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_pinned ON public.client_notes(pinned);

ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage client_notes" ON public.client_notes;
CREATE POLICY "Admins manage client_notes"
  ON public.client_notes
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_updated_at_client_notes ON public.client_notes;
CREATE TRIGGER set_updated_at_client_notes
  BEFORE UPDATE ON public.client_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.client_notes IS 'Internal CRM notes about a client, pinned or chronological.';
