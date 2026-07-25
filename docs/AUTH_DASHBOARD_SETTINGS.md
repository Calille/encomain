# Auth dashboard settings (manual)

These Auth settings are not applied by SQL migrations. Apply them in the Supabase Dashboard after reviewing this branch.

## Leaked password protection

**Status required:** Enabled  
**Why:** Flagged by the Supabase Auth security advisor (`auth_leaked_password_protection`).

**Steps:**

1. Open [Authentication settings](https://supabase.com/dashboard/project/eqqcbdpbeohtfwnlfdgx/auth/providers) (or **Authentication → Attack Protection** depending on Dashboard layout).
2. Enable **Leaked password protection** (Have I Been Pwned check).
3. Save.

**Docs:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Related migration comment: `supabase/migrations/20260725120000_lock_admin_create_user.sql`
