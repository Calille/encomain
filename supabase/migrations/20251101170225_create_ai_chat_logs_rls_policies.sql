-- AI Chat Logs RLS Policies

-- Users can view their own chat logs
DROP POLICY IF EXISTS "Users can view own chat logs" ON public.ai_chat_logs;
CREATE POLICY "Users can view own chat logs" ON public.ai_chat_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own chat logs
DROP POLICY IF EXISTS "Users can create own chat logs" ON public.ai_chat_logs;
CREATE POLICY "Users can create own chat logs" ON public.ai_chat_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all chat logs
DROP POLICY IF EXISTS "Admins can view all chat logs" ON public.ai_chat_logs;
CREATE POLICY "Admins can view all chat logs" ON public.ai_chat_logs
  FOR SELECT
  USING (public.is_admin());;
