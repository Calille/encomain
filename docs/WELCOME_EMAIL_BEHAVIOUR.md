# Welcome email behaviour

Welcome emails are sent **once**, only when an **admin creates a user account**, tracked by `welcome_email_sent_at` on `public.users`.

## Expected behaviour

| Event | Welcome email? |
|--------|----------------|
| Admin creates a user via `/admin/users` | Yes, exactly once (after `admin-create-user` succeeds) |
| User logs in | No |
| Session restore / page refresh | No |
| `TOKEN_REFRESHED` / `USER_UPDATED` / `SIGNED_IN` | No |
| Re-invoking `send-welcome-email` for a user who already has a timestamp | No (`skipped: true`, `reason: already_sent`) |

## How it works

1. Migration `20260725120100_add_welcome_email_sent_at.sql` adds `public.users.welcome_email_sent_at` and backfills existing users with `created_at` so they are treated as already sent.
2. `src/pages/admin/users.tsx` calls `sendWelcomeEmail` once after a successful `admin-create-user` response.
3. Edge Function `send-welcome-email`:
   - Looks up the user by email
   - If `welcome_email_sent_at` is set → returns `{ skipped: true, reason: 'already_sent' }` and does not call Resend
   - If null → sends via Resend, then sets `welcome_email_sent_at = now()` only on success
4. `AuthContext` does not send welcome emails on any auth event.

## Manual resend for one user

Only do this when you intentionally want another welcome email.

```sql
-- 1. Clear the flag for that user
UPDATE public.users
SET welcome_email_sent_at = NULL
WHERE email = 'user@example.com';
```

```bash
# 2. Re-invoke the Edge Function (authenticated request)
curl -X POST "https://eqqcbdpbeohtfwnlfdgx.supabase.co/functions/v1/send-welcome-email" \
  -H "Authorization: Bearer <USER_OR_SERVICE_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","userName":"Example"}'
```

After a successful send, `welcome_email_sent_at` is set again and further calls are skipped.
