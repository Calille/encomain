-- Align support ticket status with open / pending / resolved / closed
UPDATE public.support_tickets
SET status = 'pending'
WHERE status IN ('in_progress', 'awaiting_response');

ALTER TABLE public.support_tickets
  DROP CONSTRAINT IF EXISTS support_tickets_status_check;

ALTER TABLE public.support_tickets
  ADD CONSTRAINT support_tickets_status_check
  CHECK (status IN ('open', 'pending', 'resolved', 'closed'));

-- Add upgrade / bespoke categories used by the portal upgrade flow
ALTER TABLE public.support_tickets
  DROP CONSTRAINT IF EXISTS support_tickets_category_check;

ALTER TABLE public.support_tickets
  ADD CONSTRAINT support_tickets_category_check
  CHECK (
    category IS NULL
    OR category IN (
      'technical',
      'billing',
      'general',
      'feature_request',
      'upgrade',
      'bespoke'
    )
  );
