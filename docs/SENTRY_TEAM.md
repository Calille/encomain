# Sentry team

Admin section for managing who can run the Sentry desktop app against The Enclosure’s shared Supabase project.

Route: `/admin/sentry-team` (owners only).

## Purpose

Sentry discovers local businesses, runs website audits, and exports qualified leads into Enclosure. Phase A stores discoveries and audits in shared tables so the team works from one source of truth, and keeps API keys server-side instead of on each laptop.

## Roles

### Owner

- Can open **Sentry team** and invite or manage members
- Can edit Google Places and PageSpeed API keys and qualification thresholds
- Can delete audits (RLS: `public.is_owner()`)
- Admins (`users.role = 'admin'`) are treated as owners by `public.is_owner()` even without the `is_owner` flag

### Sentry user

- Can authenticate to Sentry and call the `sentry-config` Edge Function
- Can insert and update `sentry_discovered_businesses`
- Can insert `sentry_audits` (as themselves)
- Can export leads into Enclosure (importer / future Sentry sync)
- Cannot invite others or edit shared API keys unless also an owner

## Inviting someone

1. Open **Sentry team** → **Invite user**
2. Enter their email
3. Optionally enable **Grant owner permissions**
4. Submit

**Existing Enclosure user:** `invite-sentry-user` updates `public.users` in place (`is_sentry_user = true`, and `is_owner` as requested). No new Auth account is created.

**Brand-new email:** Supabase Auth sends a magic-link invite with redirect `sentry://onboarding` (handled by the Sentry desktop app). A `public.users` row is upserted with the role flags.

## Revoking access

**Revoke Sentry access** sets `is_sentry_user = false`. Historical rows in `sentry_discovered_businesses` and `sentry_audits` remain. The user can no longer create new discoveries or audits under RLS.

Owner status is separate: use **Remove owner** / **Make owner** to change `is_owner`. Demotion asks for confirmation.

## Sentry configuration

Owners save keys and qualification settings to the singleton `sentry_config` row (`id = 1`).

The desktop app calls the `sentry-config` Edge Function with the user’s JWT. The function checks `is_sentry_user` / owner / admin, then returns:

- `google_places_api_key`
- `pagespeed_api_key`
- `qualification_config`

Keys are never embedded in the desktop build. Non-sentry JWTs receive 401/403.

## Lead attribution (schema 3.0)

Imports may include optional UUID fields:

- `sentry_discovered_by` → `leads.sentry_discovered_by`
- `sentry_first_audited_by` → `leads.sentry_first_audited_by`
- `sentry_export_batch_id` (accepted, not persisted yet)

Used later for payment and attribution tracking.

## Related artefacts

| Artefact | Location |
| --- | --- |
| Migration | `supabase/migrations/20260729120000_sentry_phase_a.sql` |
| Owner seed | `supabase/seed_owners.sql` |
| Invite function | `supabase/functions/invite-sentry-user` |
| Config function | `supabase/functions/sentry-config` |
| Admin UI | `src/pages/admin/sentry-team.tsx` |
| Client helpers | `src/lib/sentry-team.ts` |
