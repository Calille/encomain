-- Threaded messages for support tickets (Option A)
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  author_role TEXT NOT NULL CHECK (author_role IN ('client', 'admin')),
  message TEXT NOT NULL CHECK (char_length(message) >= 1 AND char_length(message) <= 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_created
  ON public.support_ticket_messages(ticket_id, created_at);

ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Clients can read messages on their own tickets
DROP POLICY IF EXISTS "Clients can view messages on own tickets" ON public.support_ticket_messages;
CREATE POLICY "Clients can view messages on own tickets"
  ON public.support_ticket_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND t.user_id = auth.uid()
    )
  );

-- Clients can add follow-ups on their own non-closed tickets
DROP POLICY IF EXISTS "Clients can insert messages on own tickets" ON public.support_ticket_messages;
CREATE POLICY "Clients can insert messages on own tickets"
  ON public.support_ticket_messages
  FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND author_role = 'client'
    AND EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id
        AND t.user_id = auth.uid()
        AND t.status IN ('open', 'pending')
    )
  );

-- Admins can read all messages
DROP POLICY IF EXISTS "Admins can view all ticket messages" ON public.support_ticket_messages;
CREATE POLICY "Admins can view all ticket messages"
  ON public.support_ticket_messages
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert responses
DROP POLICY IF EXISTS "Admins can insert ticket messages" ON public.support_ticket_messages;
CREATE POLICY "Admins can insert ticket messages"
  ON public.support_ticket_messages
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    AND author_id = auth.uid()
    AND author_role = 'admin'
  );

-- Seed from existing tickets before attaching the sync trigger
INSERT INTO public.support_ticket_messages (ticket_id, author_id, author_role, message, created_at)
SELECT t.id, t.user_id, 'client', t.message, t.created_at
FROM public.support_tickets t
WHERE NOT EXISTS (
  SELECT 1 FROM public.support_ticket_messages m WHERE m.ticket_id = t.id
);

INSERT INTO public.support_ticket_messages (ticket_id, author_id, author_role, message, created_at)
SELECT
  t.id,
  COALESCE(t.responded_by, t.user_id),
  'admin',
  t.response,
  COALESCE(t.responded_at, t.updated_at)
FROM public.support_tickets t
WHERE t.response IS NOT NULL
  AND char_length(trim(t.response)) > 0
  AND NOT EXISTS (
    SELECT 1
    FROM public.support_ticket_messages m
    WHERE m.ticket_id = t.id
      AND m.author_role = 'admin'
      AND m.message = t.response
  );

-- Keep ticket metadata in sync when a message is posted
CREATE OR REPLACE FUNCTION public.on_support_ticket_message_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.support_tickets
  SET
    updated_at = NOW(),
    status = CASE
      WHEN NEW.author_role = 'client' AND status IN ('pending', 'resolved') THEN 'open'
      WHEN NEW.author_role = 'admin' AND status = 'open' THEN 'pending'
      ELSE status
    END,
    response = CASE WHEN NEW.author_role = 'admin' THEN NEW.message ELSE response END,
    responded_by = CASE WHEN NEW.author_role = 'admin' THEN NEW.author_id ELSE responded_by END,
    responded_at = CASE WHEN NEW.author_role = 'admin' THEN NOW() ELSE responded_at END
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS support_ticket_message_after_insert ON public.support_ticket_messages;
CREATE TRIGGER support_ticket_message_after_insert
  AFTER INSERT ON public.support_ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.on_support_ticket_message_insert();

-- Auto-create the opening client message when a ticket is created
CREATE OR REPLACE FUNCTION public.on_support_ticket_insert_seed_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.support_ticket_messages (
    ticket_id,
    author_id,
    author_role,
    message,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.user_id,
    'client',
    NEW.message,
    NEW.created_at
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS support_ticket_after_insert_seed_message ON public.support_tickets;
CREATE TRIGGER support_ticket_after_insert_seed_message
  AFTER INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.on_support_ticket_insert_seed_message();
