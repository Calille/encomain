-- Create project_updates table
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  update_type TEXT NOT NULL CHECK (update_type IN ('milestone', 'progress', 'issue', 'completed')) DEFAULT 'progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_updates_website_id ON public.project_updates(website_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_user_id ON public.project_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_created_by ON public.project_updates(created_by);
CREATE INDEX IF NOT EXISTS idx_project_updates_created_at ON public.project_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_updates_type ON public.project_updates(update_type);

-- Add comment to table
COMMENT ON TABLE public.project_updates IS 'Timeline of project updates and communications';;
