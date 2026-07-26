-- Add password tracking fields to users table
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS password_set_by_admin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_must_change_password 
  ON public.users(must_change_password) 
  WHERE must_change_password = TRUE;;
