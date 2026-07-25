# Backend Audit — The Enclosure Client Progress Portal

**Date:** 2026-07-25  
**Scope:** Audit only (no code changes)  
**Project ref:** `eqqcbdpbeohtfwnlfdgx` (Supabase project name: “Enlcosure”)  
**Repo:** `encomain` (Vite + React frontend + Supabase Edge Functions)

---

## Executive summary

There is **no standalone Express/Fastify Node.js server**. The “backend” is:

1. **Supabase** (Postgres + Auth + PostgREST + Edge Functions on Deno)
2. **Client-side Supabase JS** calls from the Vite React app
3. **Resend** (via Edge Functions) for transactional email

Highest-severity findings:

1. **Welcome email duplication** is confirmed: triggered on every session restore for any email-confirmed user, with only in-memory dedupe.
2. **`admin_create_user` SECURITY DEFINER RPC is executable by `anon`** (Supabase security advisor).
3. **Deployed `admin-create-user` Edge Function is not in the repo**; request body fields mismatch the admin UI.
4. **Schema drift**: local `supabase-database-schema.sql` and generated types disagree with live DB; no local `supabase/migrations/`; remote has 30 migrations.
5. **Missing tables** referenced by helpers: `orders`, `payments`.
6. **npm audit:** 60 vulnerabilities (1 critical, 45 high) as of this audit run.
7. Project briefly observed in **`RESTORING`** state during audit; later returned to `ACTIVE_HEALTHY`. Treat DB availability/restore hygiene as operational risk.

---

## 1. Architecture Overview

### Framework / libraries

| Layer | Technology | Version / notes |
|--------|------------|-----------------|
| Frontend app | Vite + React 18 + TypeScript | `vite` ^5.2.0, `react` ^18.2.0 (`package.json`) |
| Backend-as-a-service | Supabase (Postgres 17.6, Auth, Edge Functions) | Project `eqqcbdpbeohtfwnlfdgx`, eu-west-1 |
| Client SDK | `@supabase/supabase-js` | ^2.45.6 (outdated vs latest ~2.109) |
| Edge runtime | Deno (`serve` from `deno.land/std@0.168.0`) | Functions under `supabase/functions/` |
| Email provider | Resend (`npm:resend@4.0.0` in Edge shared code) | `supabase/functions/_shared/email-service.ts` |
| Contact form fallback | FormSubmit.co | `src/utils/emailService.ts` |
| Lead capture | Google Apps Script / Sheets | `src/utils/googleSheets.ts` |

**Not present:** Express, Fastify, Nest, custom Node HTTP server, PM2/systemd unit, Docker Compose for API.

### Entry points and structure

```
encomain/
├── src/                          # React SPA (client)
│   ├── main.tsx                  # App bootstrap
│   ├── App.tsx                   # Routes
│   ├── lib/supabase.ts           # Supabase client
│   ├── contexts/AuthContext.tsx  # Auth + welcome-email triggers
│   ├── pages/dashboard/**        # Client progress portal
│   ├── pages/admin/**            # Admin CRUD via PostgREST
│   └── utils/*Helpers.ts         # Email/order/payment helpers
├── supabase/functions/           # Deno Edge Functions (email + admin)
│   ├── _shared/                  # Resend + HTML templates
│   ├── send-*-*/index.ts         # Email endpoints
│   └── (MISSING) admin-create-user/  # Deployed remotely only
├── supabase-database-schema.sql  # Manual schema dump (outdated)
├── emails/                       # React Email components (not used at runtime by Deno)
└── package.json                  # Frontend scripts only
```

**Server start (frontend):**

- Dev: `npm run dev` → Vite
- Build: `npm run build` / `build-no-errors`
- Preview: `npm run preview`
- Email functions: `npm run deploy:emails` → `supabase functions deploy`; local `npm run test:email` → `supabase functions serve`

**Backend hosting:** Supabase-managed (no process manager in-repo). Frontend host is not defined in-repo (no `vercel.json` / Netlify config); marketing site domain referenced as `https://theenclosure.co.uk`.

### Environment variables (names only)

| Name | Where used |
|------|------------|
| `VITE_SUPABASE_URL` | `src/lib/supabase.ts` |
| `VITE_SUPABASE_ANON_KEY` | `src/lib/supabase.ts` |
| `VITE_BASE_PATH` | `vite.config.ts` |
| `VITE_TEMPO` | `src/App.tsx` |
| `SUPABASE_PROJECT_ID` | `package.json` `types:supabase` script |
| `TEMPO` | `vite.config.ts` |
| `NODE_ENV` | `vite.config.ts` |
| `RESEND_API_KEY` | Supabase Edge secret; `email-service.ts` |
| `SUPABASE_URL` | Edge Functions (auto-injected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions (auto-injected; used by deployed `admin-create-user`) |
| `RESEND_API_KEY` (shell) | `setup-email-system.sh` / `.ps1` for secrets setup |

### `.env.example`

- **Missing.** No `.env.example` in repo.
- `.env.local` is gitignored via `*.local` (`.gitignore` line 13); not present in workspace at audit time.
- Docs (`USER-ACCOUNT-SYSTEM-README.md`, `ENVIRONMENT_CHECK.md`) document vars, but **`USER-ACCOUNT-SYSTEM-README.md` embeds a live anon JWT** — credential leak risk in git history.

---

## 2. Database

### Engine and access

- **Database:** PostgreSQL 17.6 on Supabase (`db.eqqcbdpbeohtfwnlfdgx.supabase.co`)
- **Access method:** PostgREST via `@supabase/supabase-js` (no ORM/query builder)
- **Auth:** Supabase Auth (`auth.users`); app profile in `public.users` keyed to `auth.users.id`
- **RLS:** Enabled on all public tables listed below

### Live schema (queried 2026-07-25)

#### `public.users` (3 rows)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid PK → auth.users | NO | — |
| email | text UNIQUE | NO | — |
| full_name | text | YES | — |
| role | text | NO | `'user'` |
| status | text | NO | `'active'` |
| requires_password_change | bool | YES | `false` |
| must_change_password | bool | YES | `false` |
| password_set_by_admin | bool | YES | `false` |
| password_changed_at | timestamptz | YES | — |
| current_plan | text | YES | — |
| plan_started_at | timestamptz | YES | — |
| last_login | timestamptz | YES | — |
| created_at | timestamptz | NO | `now()` |
| updated_at | timestamptz | NO | `now()` |

Indexes: `users_pkey`, `users_email_key`, `idx_users_email`, `idx_users_role`, `idx_users_status`, `idx_users_must_change_password`

#### `public.websites`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | `gen_random_uuid()` |
| user_id | uuid FK → users | |
| name | text | |
| url | text | nullable |
| status | text | default `in_progress` |
| progress_percentage | int | 0–100 check |
| created_at / updated_at | timestamptz | |

Indexes: PK, `idx_websites_user_id`, `idx_websites_status`, `idx_websites_created_at`

#### `public.billing`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → users | |
| amount | numeric | |
| currency | text | default `GBP` |
| status | text | default `pending` |
| billing_period_start / end | date | |
| paid_at | timestamptz | nullable |
| created_at | timestamptz | |

#### `public.invoices`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| billing_id | uuid FK → billing | nullable |
| user_id | uuid FK → users | |
| invoice_number | text UNIQUE | |
| amount | numeric | |
| currency | text | default `GBP` |
| status | text | default **`draft`** (SQL dump says `sent`) |
| issue_date / due_date | date | |
| paid_date | date | nullable |
| pdf_url / notes | text | nullable |
| created_at | timestamptz | |

#### `public.project_updates`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| website_id | uuid FK → websites | |
| user_id | uuid FK → users | |
| created_by | uuid FK → users | |
| title | text | |
| description | text | nullable |
| update_type | text | default `progress` |
| created_at | timestamptz | |

#### `public.support_tickets`

id, user_id, subject, message, status (`open`), priority (`normal`), category, response, responded_by, responded_at, created_at, updated_at

#### `public.referrals`

id, user_id, referred_email, referred_name, status (`pending`), reward_amount (default 250.00), reward_currency (`GBP`), credited_at, notes, created_at, updated_at

#### `public.ai_chat_logs`

id, user_id, message, response, context (jsonb), created_at

### Relationships (summary)

```
auth.users 1─1 public.users
public.users 1─* websites | billing | invoices | project_updates | support_tickets | referrals | ai_chat_logs
websites 1─* project_updates
billing 1─* invoices (optional billing_id)
users 1─* project_updates (as created_by / user_id)
```

### Migrations

| Source | Status |
|--------|--------|
| Remote Supabase migrations | **30 applied** (from `20251101130136` through `20251101174434`) |
| Local `supabase/migrations/` | **Missing entirely** |
| `supabase/config.toml` | **Missing** |
| `supabase-database-schema.sql` | Manual dump; **incomplete vs live** |

**Drift vs repo artifacts:**

| Artifact | Drift |
|----------|--------|
| `supabase-database-schema.sql` | Missing `support_tickets`, `referrals`, `ai_chat_logs`; missing password/plan columns; invoice default `sent` vs live `draft` |
| `src/types/supabase.ts` | Declares `users.name`, `phone`, `address`, `city`, `postcode`, `country` — **not on live DB**; missing live `password_set_by_admin`, `must_change_password` |
| Helpers | `orders`, `payments` tables used in code — **do not exist** live or in types |

### Unused / orphaned

- **`orders` / `payments`:** referenced by `src/utils/orderHelpers.ts`, `paymentHelpers.ts` but absent from DB → dead paths until schema exists.
- **Dual password flags:** `requires_password_change` and `must_change_password` both exist; UI mostly uses `requires_password_change`; Edge Function writes both (when body matches).
- **Marketing Edge Functions** (`send-newsletter`, `send-promotional-offer`, `send-reengagement`, `send-subscription-reminder`, `send-feedback-summary`, `send-system-error`): deployed, no in-app callers found.
- **`emails/` React Email package:** parallel to Deno HTML string templates in `_shared/email-templates.ts`; not imported by Edge Functions (see `IMPORTANT_NOTES.md`).
- **`src/pages/signup.tsx`:** exists but **not routed** in `App.tsx` (orphan page).

---

## 3. API Surface

There is **no versioned REST API** (`/api/v1/...`). Surface = Supabase PostgREST + Edge Functions + Auth endpoints.

### Edge Functions (deployed, all `verify_jwt: true`)

Base: `https://eqqcbdpbeohtfwnlfdgx.supabase.co/functions/v1/<slug>`

| Method | Endpoint | Purpose | Auth | Used by portal? |
|--------|----------|---------|------|-----------------|
| POST | `send-welcome-email` | Welcome email via Resend | JWT (any authenticated) | Yes — `AuthContext` |
| POST | `send-account-update` | Profile change notice | JWT | Yes — `AuthContext.updateProfile` |
| POST | `send-payment-receipt` | Receipt email | JWT | Yes — admin billing |
| POST | `send-failed-payment` | Failed payment alert | JWT | Helper only (no Stripe webhook) |
| POST | `send-order-confirmation` | Order confirmation | JWT | Helper only |
| POST | `send-new-order-alert` | Admin order alert | JWT | Helper only |
| POST | `send-new-user-alert` | Admin signup alert | JWT | Signup form (unrouted) |
| POST | `send-account-deletion` | Deletion confirmation | JWT | `accountHelpers` (limited use) |
| POST | `admin-create-user` | Admin creates auth+profile | JWT | Yes — `admin/users.tsx` |
| POST | `send-newsletter` | Marketing | JWT | **Dead** |
| POST | `send-promotional-offer` | Marketing | JWT | **Dead** |
| POST | `send-reengagement` | Marketing | JWT | **Dead** |
| POST | `send-subscription-reminder` | Billing reminder | JWT | **Dead** |
| POST | `send-feedback-summary` | Admin digest | JWT | **Dead** |
| POST | `send-system-error` | Admin error alert | JWT | **Dead** |

**Auth note:** `verify_jwt: true` only proves a valid Supabase JWT (or often anon key patterns depending on gateway config). Email functions do **not** verify the caller owns `body.email`. CORS is `Access-Control-Allow-Origin: *` (`email-service.ts` lines 95–98).

### PostgREST tables used by portal (via supabase-js)

| Operation pattern | Table | Auth | Portal usage |
|-------------------|-------|------|--------------|
| SELECT/UPDATE | `users` | Session + RLS | Auth, settings, admin users |
| SELECT/INSERT/UPDATE/DELETE | `websites` | Session + RLS | Dashboard progress, admin websites |
| SELECT/INSERT/UPDATE/DELETE | `billing` | Session + RLS | Payments page, admin billing |
| SELECT/INSERT/UPDATE | `invoices` | Session + RLS | Dashboard, admin billing |
| SELECT | `project_updates` | Session + RLS | Dashboard / progress |
| SELECT/INSERT | `support_tickets` | Session + RLS | Support UI |
| SELECT/INSERT | `referrals` | Session + RLS | ReferralProgram |
| INSERT | `ai_chat_logs` | Session + RLS | AISupportChat |
| INSERT | `orders` | Would fail | orderHelpers — **broken** |
| INSERT | `payments` | Would fail | paymentHelpers — **broken** |

### Auth API (Supabase-hosted)

| Flow | Client call | Location |
|------|-------------|----------|
| Login | `signInWithPassword` | `AuthContext.signIn` |
| Logout | `signOut` | `AuthContext.signOut` |
| Session | `getSession` / `onAuthStateChange` | `AuthContext` init |
| Password update | `updateUser({ password })` | `AuthContext.updatePassword` |
| Password reset | `resetPasswordForEmail` | `AuthContext.resetPassword` |
| Signup | `signUp` | `signup-form.tsx` (page not routed) |

### Versioning

**None.** No API version prefix, no changelog for Edge contracts, no OpenAPI/Swagger.

---

## 4. Authentication & Authorization

### How login works

1. Client uses anon key + persisted session in `localStorage` (`storageKey: 'supabase-auth-token'`) — `src/lib/supabase.ts` lines 17–24.
2. Email/password via Supabase Auth.
3. Profile loaded from `public.users` (`AuthContext.fetchProfile`, lines 57–80).
4. Route guards in `ProtectedRoute.tsx`: must be logged in; inactive/suspended blocked; `requires_password_change` forces `/change-password`; admin routes check `profile.role === "admin"`.

### Intended model

Docs claim **admin-created accounts only**. Reality:

- Admin UI calls Edge Function `admin-create-user` (`admin/users.tsx` lines 151–163).
- Public `SignupForm` still exists and would call `signUp` + insert profile — but `/signup` is **not registered** in `App.tsx`.
- Deployed admin function sets `email_confirm: true` (skip verification).

### Broken / insecure / inconsistent points

1. **`admin_create_user` RPC callable by `anon`** (SECURITY DEFINER) — critical advisor finding. Even if Edge Function is preferred, the RPC exposure is a privilege-escalation risk.
2. **Deployed Edge `admin-create-user` has no admin-role check** in source (fetched from Supabase). Any holder of a valid JWT could invoke it if gateway only checks JWT presence.
3. **Body field mismatch:** UI sends `requires_password_change`; deployed function reads `must_change_password` → forced password-change flag often wrong.
4. **`admin-create-user` source not in git** — cannot review/redeploy from repo safely.
5. **Remember-me hack** (`AuthContext` lines 317–330): `updateUser({ data: { session_lifetime: "transient" } })` is not a real Supabase session TTL API; also fires `USER_UPDATED` (welcome-email Path B).
6. **3-second race timeout** on `signInWithPassword` (lines 270–290) can falsely succeed/fail under slow networks.
7. **Signup form** inserts `name` column (doesn't exist live) and writes fake `auth_token` to localStorage (lines 88–91).
8. **Types/schema mismatch** on profile fields (`name`/`phone`/address*) causes TypeScript/runtime inconsistency in `updateProfile`.
9. **Leaked password protection disabled** (Supabase Auth advisor).
10. **Anon key published in markdown** (`USER-ACCOUNT-SYSTEM-README.md`, `DEPLOYMENT_COMPLETE.md`).

---

## 5. Known / Suspected Issues

### 5.1 Welcome email sent multiple times (confirmed)

#### Triggers

| Path | Location | When |
|------|----------|------|
| **Path A — session init** | `AuthContext.tsx` **105–153** | After `getSession()`, if `email_confirmed_at` is set |
| **Path B — USER_UPDATED** | `AuthContext.tsx` **184–232** | On `onAuthStateChange` event `USER_UPDATED` with confirmed email |
| Edge send | `send-welcome-email/index.ts` | POST → Resend; **no idempotency** |
| Client invoke | `emailHelpers.ts` **17–48** | `supabase.functions.invoke('send-welcome-email')` |

#### Why duplicates happen

1. **Path A runs for every returning user**, not only first verification. Condition is only `emailConfirmed && email && !refSets` (lines 111–116). Admin-created users get `email_confirm: true`, so Path A fires on **every page load** with a persisted session.
2. **Dedupe is in-memory only** (`welcomeEmailSentRef` / `welcomeEmailInProgressRef`, lines 32–33). Cleared on refresh, new tab, new device, or React remount.
3. **No DB flag** (e.g. `welcome_email_sent_at`) and Edge Function does not check prior sends.
4. **Path B still exists** for `USER_UPDATED`. `signIn` → `updateUser` for “remember me” (lines 317–327) can emit `USER_UPDATED` and send another email if Path A hasn’t marked success yet (race), or after reload.
5. **`SIGNED_IN` is skipped** (lines 233–237) but **does not prevent Path A** on subsequent visits — Path A is the main duplicate engine.
6. Success only adds to `welcomeEmailSentRef` **after** async resolve (lines 128–130). Concurrent mounts/tabs can both pass the in-progress check.

#### End-to-end duplicate sequence (typical)

```
User logs in (or reloads with session)
  → AuthProvider getSession() sees email_confirmed_at
  → Path A: invoke send-welcome-email → Resend delivers #1
  → User refreshes / opens another tab
  → refs empty again → Path A → Resend delivers #2, #3, …
```

Secondary: password/profile `updateUser` → `USER_UPDATED` → Path B → another send if refs empty.

#### Fix direction (not implemented — audit only)

- Persist `welcome_email_sent_at` on `users` (or email_events table) with unique constraint.
- Send only from a single server-side path (Auth hook / Edge on `user.created` or first confirmed event), with upsert/idempotency key.
- Remove Path A “every session” client trigger entirely.

### 5.2 Other inspection findings

| Issue | Evidence |
|-------|----------|
| Hardcoded production URLs | `AuthContext` 126–127, 205–206; many helpers |
| Hardcoded admin email | `admin@theenclosure.co.uk` in helpers / signup |
| Extensive `console.log` in auth | `AuthContext` throughout; `supabase.ts` 8–13 |
| TODO left in UI | `UpgradeOptions.tsx` line 95: `// TODO: Redirect to checkout` |
| Notification prefs not persisted | `settings.tsx` local state only; update handler logs errors |
| Shop/cart stubs | `shop.tsx` / `ProductGrid` console.log only |
| FormSubmit + Resend dual stacks | `emailService.ts` vs Edge Functions |
| Project restore observed | Supabase status `RESTORING` then `ACTIVE_HEALTHY` during audit |
| Invoice status default drift | Live `draft` vs dump `sent` |
| Duplicate toast on settings | `settings.tsx` toasts after `updateProfile` which also toasts |

### 5.3 Logging / monitoring

| Channel | Reality |
|---------|---------|
| Browser console | Heavy `[AUTH]` logging; errors often only `console.error` |
| Supabase Edge logs | Available via dashboard/CLI; no app-level aggregation |
| `send-system-error` | Deployed but **never invoked** from app code |
| APM / Sentry / LogDrain | **None found** |
| Email failures | Mostly fire-and-forget; user not notified; silent drop |

Failures often surface only as empty dashboards / toast “Failed to load…” without ops alerting.

---

## 6. Dependencies

### `npm audit` (run 2026-07-25)

| Severity | Count |
|----------|------:|
| critical | 1 |
| high | 45 |
| moderate | 9 |
| low | 5 |
| **total** | **60** |

Notable:

- **critical:** `form-data` (transitive; boundary / unsafe random)
- **high:** `vite`, `react-router` / `react-router-dom` (XSS / open redirect), `postcss`, `rollup`, `lodash`, `axios`, `ws`, etc.
- Many highs are transitive (e.g. `react-vertical-timeline-component` → old Babel; `tempo-devtools` → uuid)

`npm outdated` shows broad lag (e.g. `@supabase/supabase-js` → 2.109.x, `framer-motion` → 12.x, many Radix packages).

### Unused / removable candidates

| Package | Notes |
|---------|--------|
| `flowbite-react` | No imports found in `src/` |
| `prop-types` | Redundant with TypeScript; no clear usage |
| `react-vertical-timeline-component` | Pulls vulnerable Babel chain; verify if still used |
| Parallel `framer-motion` + `motion` | Both present; consolidate |
| Orphan helpers | `orderHelpers` / `paymentHelpers` without tables |
| Orphan page | `src/pages/signup.tsx` unrouted |
| Backup component | `header-old-backup.tsx` |
| `emails/` vs Deno templates | Duplicate email UI systems |

---

## 7. Integration Readiness (SiteEntry CLI + future systems)

### Two-way API for SiteEntry (Node/TS CLI)

**Current readiness: Low–Medium.**

| Need | Status |
|------|--------|
| Stable authenticated write API for leads/audits | **No** dedicated endpoints; would push to tables that don’t exist yet |
| Read status / payment updates | Partial via PostgREST on `billing`/`invoices`/`websites` if service role or RLS policies allow |
| Versioned contract / OpenAPI | **None** |
| Idempotent webhooks / API keys | **None** (only JWT + anon/service keys) |
| Audit trail for external writes | **None** |

**Structural blockers:**

1. No first-class API layer — CLI would talk raw PostgREST or new Edge Functions.
2. Missing `leads` / `audits` / `orders` / `payments` tables.
3. RLS is user/admin oriented; service accounts for CLI need new policies or Edge Functions with API-key auth (`verify_jwt: false` + custom secret).
4. No migration workflow in repo → schema changes are risky.
5. Email side effects are client-triggered and non-idempotent.

**Least-friction path:** New Edge Functions `siteentry-ingest` / `siteentry-status` with shared secret, service-role DB access, idempotency keys, and typed request/response — rather than exposing service role to the CLI.

### Unsubscribe / mailer system

| Piece | Status |
|-------|--------|
| Resend sending | Working pattern in Edge Functions |
| Preference storage | UI checkboxes only; **not in DB** |
| Unsubscribe links / List-Unsubscribe | **Not implemented** |
| Marketing senders | Functions exist but unwired |

Blocker: need `email_preferences` / suppression table + signed unsubscribe tokens before safe marketing.

### Stripe payments

| Piece | Status |
|-------|--------|
| Stripe SDK / webhooks | **Absent** |
| `payments` table | **Missing** (helpers assume it) |
| Checkout UI | TODO in `UpgradeOptions.tsx` |
| Billing/invoices | Manual admin CRUD only |

Blockers: schema for payments/customers/subscriptions; webhook Edge Function; reconcile with `billing`/`invoices`.

### Supabase Auth / Storage

| Piece | Status |
|-------|--------|
| Auth | **Already in use** |
| Storage buckets | Storage schema present; **no app usage** found for invoices PDFs despite `invoices.pdf_url` |
| Auth hardening | Enable leaked-password protection; lock down `admin_create_user` RPC |

---

## 8. Recommended Fix Order

| Priority | Item | Effort | Risk if deferred |
|----------|------|--------|------------------|
| **P0** | Restore/verify DB health; confirm backups; document restore runbook (observed `RESTORING`) | Small | Outage / empty portal |
| **P0** | Revoke `anon`/`public` EXECUTE on `admin_create_user` SECURITY DEFINER; require admin-only Edge path | Small | Account takeover / spam user creation |
| **P0** | Fix welcome-email idempotency (server-side flag + remove Path A session trigger) | Medium | Continued duplicate emails / Resend reputation |
| **P0** | Bring `admin-create-user` into repo; align body fields; enforce caller `is_admin()` | Medium | Broken admin UX + auth hole |
| **P1** | Export remote migrations into `supabase/migrations/`; add `config.toml`; regenerate `src/types/supabase.ts` from live | Medium | Ongoing schema drift |
| **P1** | Align `AuthContext`/`signup` with live columns (`full_name` only; drop phantom fields) | Small | Profile updates fail silently |
| **P1** | Rotate anon key if committed keys were ever production; add `.env.example`; scrub secrets from docs | Small | Credential exposure |
| **P2** | Add `payments`/`orders` or delete dead helpers; wire Stripe later intentionally | Medium–Large | False sense of payment readiness |
| **P2** | Email prefs + unsubscribe before enabling marketing functions | Medium | Compliance risk |
| **P2** | Reduce console noise; invoke `send-system-error` or Sentry on failures | Small | Silent production failures |
| **P2** | npm audit remediation (router, vite, transitive criticals); remove unused deps | Medium | Supply-chain / XSS risk |
| **P3** | Design SiteEntry Edge API (ingest + status) with API keys + idempotency | Large | Blocks external tooling |
| **P3** | Stripe webhooks + Storage for invoice PDFs | Large | Manual billing forever |
| **P3** | API versioning / OpenAPI once Edge surface stabilizes | Medium | Integration churn |

---

## Appendix A — Critical file references

| Topic | Path | Lines |
|-------|------|-------|
| Welcome Path A | `src/contexts/AuthContext.tsx` | 105–153 |
| Welcome Path B | `src/contexts/AuthContext.tsx` | 184–232 |
| In-memory dedupe refs | `src/contexts/AuthContext.tsx` | 32–33 |
| Welcome Edge Function | `supabase/functions/send-welcome-email/index.ts` | 18–120 |
| Welcome client helper | `src/utils/emailHelpers.ts` | 17–48 |
| Resend + open CORS | `supabase/functions/_shared/email-service.ts` | 8–9, 95–98 |
| Supabase client | `src/lib/supabase.ts` | 1–30 |
| Admin user create UI | `src/pages/admin/users.tsx` | 151–163 |
| Route protection | `src/components/auth/ProtectedRoute.tsx` | 9–74 |
| Schema dump (stale) | `supabase-database-schema.sql` | full file |
| Generated types (stale) | `src/types/supabase.ts` | `users` / tables |

---

## Appendix B — Live vs documented schema (users)

| Field | Live DB | `supabase-database-schema.sql` | `src/types/supabase.ts` |
|-------|---------|--------------------------------|-------------------------|
| full_name | ✓ | ✓ | ✓ |
| name / phone / address / city / postcode / country | ✗ | ✗ | ✓ (incorrect) |
| must_change_password | ✓ | ✗ | ✗ |
| password_set_by_admin | ✓ | ✗ | ✗ |
| password_changed_at | ✓ | ✗ | ✓ |
| current_plan / plan_started_at | ✓ | ✗ | ✓ |

---

*End of audit. No application code was modified; this file is the sole deliverable.*
