-- Already applied to production on 2026-07-28 as 20260728140219_create_tool_releases.
-- Restored in-repo for schema history when recovering the Tools frontend from stash.
-- Version matches the remote schema_migrations row so deploys will not re-apply it.

-- Internal tool installer releases (admin-only) + private storage bucket.
-- Assumed storage file_size_limit: 500MB (524288000 bytes). Raise if Pro/Enterprise allows larger installers.

CREATE TABLE IF NOT EXISTS public.tool_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  version TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('mac', 'windows', 'linux')),
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  release_notes TEXT,
  is_latest BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_slug, version, platform)
);

CREATE INDEX IF NOT EXISTS idx_tool_releases_slug_platform
  ON public.tool_releases(tool_slug, platform);

CREATE INDEX IF NOT EXISTS idx_tool_releases_latest
  ON public.tool_releases(tool_slug, platform, is_latest)
  WHERE is_latest = true;

ALTER TABLE public.tool_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read tool releases"
  ON public.tool_releases FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert tool releases"
  ON public.tool_releases FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update tool releases"
  ON public.tool_releases FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete tool releases"
  ON public.tool_releases FOR DELETE
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.unset_other_latest_releases()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_latest = true THEN
    UPDATE public.tool_releases
    SET is_latest = false
    WHERE tool_slug = NEW.tool_slug
      AND platform = NEW.platform
      AND id != NEW.id
      AND is_latest = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_unset_other_latest_releases ON public.tool_releases;
CREATE TRIGGER trg_unset_other_latest_releases
  BEFORE INSERT OR UPDATE ON public.tool_releases
  FOR EACH ROW
  EXECUTE FUNCTION public.unset_other_latest_releases();

-- Private bucket for installer binaries (admin RLS on storage.objects).
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('tool-installers', 'tool-installers', false, 524288000)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit;

CREATE POLICY "Admins can select tool installers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tool-installers' AND public.is_admin());

CREATE POLICY "Admins can insert tool installers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tool-installers' AND public.is_admin());

CREATE POLICY "Admins can update tool installers"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tool-installers' AND public.is_admin())
  WITH CHECK (bucket_id = 'tool-installers' AND public.is_admin());

CREATE POLICY "Admins can delete tool installers"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tool-installers' AND public.is_admin());
