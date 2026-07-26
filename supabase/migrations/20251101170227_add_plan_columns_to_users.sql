-- Add plan columns to users table
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS current_plan TEXT CHECK (current_plan IN ('essential', 'growth', 'ultimate'));

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ;;
