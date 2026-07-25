# Redesign and Admin CRM Audit — `feat/redesign-and-admin-crm`

**Date:** 2026-07-25  
**Scope:** Audit only (no code fixes, no push, no deploy, no migrations applied by this audit)  
**Repo:** `encomain` (Vite + React + TypeScript + Supabase)  
**Branch tip commit:** `8dd1b7b` (identical to `master` / `origin/master`)  
**Work under review:** uncommitted working-tree changes on `feat/redesign-and-admin-crm` (not pushed; remote branch does not exist)

---

===============================================================================
1. Executive summary
===============================================================================

**Overall completeness: ~78%** of the six-phase brief is implemented in local code.

**Verdict: ready with fixes** — not ready to merge as-is. The design system, role routing, admin CRM pages, import/outreach UI, and Edge Function source are largely present and `npm run build` succeeds, but several gaps block a safe merge: work is entirely uncommitted/unpushed; CRM tables and new Edge Functions are not on production; legacy admin screens remain on the old green theme; table sort/filter gaps remain; residual emoji and em dashes exist; and deploying the frontend alone would break admin CRM pages against the current remote schema.

### Top 5 findings by severity

| # | Severity | Finding |
|---|----------|---------|
| 1 | **Critical** | CRM schema (`leads`, `import_batches`, `email_suppression`, `email_events`, `suppression_removals`) and related migrations (`20260725140000`–`20260725140200`) exist only locally. Remote project `eqqcbdpbeohtfwnlfdgx` has none of these tables. Admin Audits/Outreach/Suppressions will fail at runtime until migrations are applied carefully. |
| 2 | **Critical** | New Edge Functions `send-outreach-email` and `process-unsubscribe` are **not deployed**. Remote function list has neither slug. Unsubscribe page and outreach send are non-functional against production. |
| 3 | **High** | Entire redesign/CRM effort is **uncommitted** and the branch is **not on the remote**. Nothing is mergeable via PR until staged/committed. |
| 4 | **High** | Legacy admin pages (`users`, `billing`, `websites`, `index`) still use old dark-green `#1A4D2E`, pastel badge circles, and spinners — while the create-user flow lives on `/admin/users`. Design system not applied consistently across admin. |
| 5 | **Medium** | Clients/Payments/Outreach miss brief UX requirements: no column sorting; payments lack date-range and dedicated client filter; outreach lacks `source` and `assigned_to` filters; clients “Websites” column shows count only (no status). |

### Deployment / production actions during this work

| Action | Status |
|--------|--------|
| Pushed to remote | **No** — `git ls-remote` shows no `feat/redesign-and-admin-crm`; local HEAD equals `origin/master` |
| Migrations applied to remote | **No** — remote migration list ends at `20251101174434_add_password_tracking_fields`; no `20260725*` versions |
| Edge Functions redeployed | **No evidence of CRM functions deployed** — `send-outreach-email` / `process-unsubscribe` absent; `send-welcome-email` / `admin-create-user` still at older remote versions |

---

===============================================================================
2. Phase 0 — Design system audit
===============================================================================

### 2.1 Colour tokens

| Check | Status | Evidence |
|-------|--------|----------|
| CSS custom properties for light and dark | **Implemented** | `src/index.css` lines 11–118 (`:root` and `.dark`) |
| Accent sampled from logo blue | **Implemented** | Logo dominant blue sampled from `src/assets/images/logo.png`: **`#468EFD`** (RGB 70,142,253). Comment and tokens: `--accent: 216 98% 63%` (`src/index.css` lines 6–7, 35) which is HSL-equivalent of `#468EFD`. Dark mode accent slightly softened: `216 80% 62%` (line 92). |
| Semantic tokens used consistently | **Partially implemented** | New shell/UI (`card`, `button`, `input`, admin CRM pages, refreshed dashboard pages) use `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-accent`. Hardcoded colours remain widely in marketing components (scoped out) and **legacy admin** pages. |
| Hardcoded colours in components that should use tokens | **Present** | Notable in-scope leftovers: `src/pages/admin/users.tsx` (`#1A4D2E`, `bg-purple-100`, `bg-green-100`, spinners), `src/pages/admin/billing.tsx`, `src/pages/admin/websites.tsx`, `src/pages/admin/index.tsx`, `src/contexts/AuthContext.tsx` error UI (`bg-red-50`, `bg-red-600`), `src/components/ui/cookie-consent.tsx` (`bg-white`, `#1f4d36`). Marketing/home components retain full green palette (correctly left alone per brief). |
| Old dark green heading colour gone from `src/` | **Not implemented (still present)** | `#1A4D2E` remains across admin legacy + marketing. `#0f4c31` not found. `green-900` not a significant hit. Old green is **not** gone from authenticated admin create-user path. |

### 2.2 Typography

| Check | Status | Evidence |
|-------|--------|----------|
| Body font loaded and applied | **Implemented** | Inter loaded in `index.html` lines 8–13; applied in `src/index.css` lines 132–135 and `tailwind.config.js` lines 20–22 |
| Mono on dashboard card numerics | **Implemented** | `MetricCard` uses `font-mono` + `font-mono-nums` (`src/components/ui/metric-card.tsx` lines 45–47). Client dashboard uses `MetricCard` (`src/pages/dashboard/user-dashboard.tsx`). Admin overview/payments likewise. |
| Tabular numerals | **Implemented** | `.font-mono-nums` sets `font-variant-numeric: tabular-nums` (`src/index.css` lines 143–146) |
| Type scale 12/13/14/16/20/24/32 | **Implemented** | `tailwind.config.js` lines 24–32. Body default 14px (`src/index.css` line 135). Not inflated to oversized marketing display sizes on app pages. |

### 2.3 Radius, spacing, elevation

| Check | Status | Evidence |
|-------|--------|----------|
| Card radius ~8px | **Implemented** | `--radius: 0.5rem` (8px) in `src/index.css` line 62; `Card` uses `rounded-md` mapped to `--radius-md: 0.5rem` (`src/components/ui/card.tsx` line 12; `tailwind.config.js` lines 93–98) |
| Hairline borders, not drop shadows on cards | **Implemented** (new system) | `Card` has `shadow-none` + `border border-border` (`src/components/ui/card.tsx` line 12) |
| Lingering soft/large shadows on non-floating elements | **Partially** | New CRM cards are clean. Legacy admin still uses `shadow-sm` (`src/pages/admin/users.tsx` line 520, billing/websites/index). `boxShadow.float` defined in `tailwind.config.js` lines 99–102 for floating UI — acceptable if unused on static cards. |

### 2.4 Icons

| Check | Status | Evidence |
|-------|--------|----------|
| lucide-react, stroke 1.5 | **Mostly implemented** | Shell/nav/metric/empty-state consistently pass `strokeWidth={1.5}` (e.g. `dashboard-layout.tsx` lines 96–101, `empty-state.tsx` lines 18–20). No heroicons/react-icons found under `src/pages/admin`. |
| Pastel-circle icon backgrounds | **Removed from new CRM; remain in legacy admin** | New `MetricCard` uses plain lucide icon, no pastel circle (`metric-card.tsx` lines 38–42). Still present: `src/pages/admin/index.tsx` lines 135–202 (`bg-blue-100` / `bg-purple-100` / `bg-green-100` / `bg-yellow-100` rounded-full). |
| Emoji in codebase | **Hits remain** | See §8.1. In-scope product UI hit: `src/components/dashboard/AISupportChat.tsx` line 143 (`🎉`). |

### 2.5 Theme switching

| Check | Status | Evidence |
|-------|--------|----------|
| Theme provider + `enclosure-theme` | **Implemented** | `src/contexts/ThemeContext.tsx` lines 13, 35–44, 47–90; wired in `src/main.tsx` lines 8, 21–23 |
| System / light / dark | **Implemented** | `ThemePreference` type and toggle (`ThemeContext.tsx` line 10; `theme-toggle.tsx` lines 29–43) |
| FOUC prevention script | **Implemented** | `index.html` lines 14–27 |
| Toggle in app shell | **Implemented** | `dashboard-layout.tsx` line 191 (`ThemeToggle`) — covers client + admin shells |
| Auth pages respect theme | **Implemented** | Login (`login-form.tsx` lines 74–75), forgot-password (`forgot-password.tsx` lines 36–37), change-password (`change-password.tsx` lines 118–120) use tokens + `ThemeToggle` |
| `/unsubscribe` respects theme | **Implemented** | `unsubscribe.tsx` lines 43–46 (`app-dot-canvas` + `ThemeToggle`) |

### 2.6 App shell

| Check | Status | Evidence |
|-------|--------|----------|
| Sidebar distinct from canvas | **Implemented** | Sidebar `bg-sidebar` / `border-sidebar-border` (`dashboard-layout.tsx` lines 132–136); main `app-dot-canvas` (`line 249`) |
| Active nav: 2px accent left + tint, not pill | **Implemented** | Active: `bg-[hsl(var(--sidebar-active))]` + `w-0.5` accent bar (`dashboard-layout.tsx` lines 86–94). Not a full accent pill. |
| Dot pattern background | **Implemented** (optional) | `.app-dot-canvas` in `src/index.css` lines 150–164; used on main canvas |
| Command palette Cmd/Ctrl+K | **Implemented** | `command-palette.tsx` lines 46–55; covers client + admin navigation groups (lines 23–39, 67–85). Does **not** list Suppressions. |

### 2.7 Empty states and loading states

| Check | Status | Evidence |
|-------|--------|----------|
| Skeleton loaders | **Implemented** on new CRM / refreshed dashboards | e.g. admin overview (`dashboard.tsx` lines 99–104), clients (`clients.tsx` line 108), `ProtectedRoute` (`ProtectedRoute.tsx` lines 36–44). Legacy admin still uses spinners. |
| Empty states pattern | **Implemented** for new pages | `EmptyState`: low-opacity lucide + one muted line, no emoji (`empty-state.tsx` lines 10–24). Messages end with periods, no `!`. |

### 2.8 Micro-interactions

| Check | Status | Evidence |
|-------|--------|----------|
| Focus rings 2px accent + offset | **Implemented** | Button/Input: `ring-2 ring-ring ring-offset-2` (`button.tsx` line 8; `input.tsx` line 14); utility `.focus-ring` (`index.css` lines 170–172) |
| Subtle hover | **Implemented** | Outline buttons: border/tint (`button.tsx` lines 16–17); nav hover muted (`dashboard-layout.tsx` line 90) |
| Count-up on dashboard cards | **Implemented** | `useCountUp` (`hooks/useCountUp.ts`); used by `MetricCard` |
| ~150ms transitions, no bounce | **Implemented** | `transitionDuration.DEFAULT: 150ms` (`tailwind.config.js` line 118); `.transition-colors-fast` 150ms (`index.css` lines 166–168). Count-up uses ease-out cubic, not spring bounce. |

### 2.9 Existing pages refreshed

| Page | Path | Design status |
|------|------|---------------|
| Client dashboard | `src/pages/dashboard/user-dashboard.tsx` | **Refreshed** (tokens, MetricCard, EmptyState, DashboardLayout) |
| Website progress | `src/pages/dashboard/progress.tsx` | **Refreshed** |
| Client payments | `src/pages/dashboard/payments.tsx` | **Refreshed** |
| Support & referrals | `src/pages/dashboard/Support.tsx` | **Refreshed** shell; child components updated |
| Upgrade | `src/pages/dashboard/Upgrade.tsx` | **Refreshed** (modified) |
| Client settings | `src/pages/dashboard/settings.tsx` | **Refreshed** |
| Account settings | `src/pages/account-settings.tsx` | **Refreshed** |
| Login | `src/pages/login.tsx` + `login-form.tsx` | **Refreshed** |
| Forgot password | `src/pages/forgot-password.tsx` | **Refreshed** |
| Change password | `src/pages/change-password.tsx` | **Refreshed** |
| Signup | `src/pages/signup.tsx` | **Old marketing chrome**; form file modified but **route removed from `App.tsx`** |
| Role landing | `src/pages/role-landing.tsx` | **New** (skeleton, token bg) |
| Unsubscribe | `src/pages/unsubscribe.tsx` | **New** (tokenised) |
| Admin overview / clients / payments / audits / outreach / suppressions / settings / client-detail | `src/pages/admin/*` (new) | **New design** |
| Admin users / billing / websites / legacy index | `users.tsx`, `billing.tsx`, `websites.tsx`, `index.tsx` | **Still old style** (`#1A4D2E`, spinners) — should have been updated or visually subordinated |
| Marketing: home, services, pricing, about, contact, careers, privacy, terms | various | **Correctly left alone** (still green brand). `App.tsx` lines 66–74 comment confirms intent. |
| Orphan / unused | `src/pages/dashboard/index.tsx` | **Old style**; not the routed dashboard (`user-dashboard` is) |
| Shop | `src/pages/shop.tsx` | Not in current `App.tsx` routes; old style if present |

**Left on old design that should have been updated:** `/admin/users` (create-user entry point from Clients), `/admin/billing`, `/admin/websites`, `/admin/legacy` index.

---

===============================================================================
3. Phase 1 — Route and role separation
===============================================================================

### Routing (`src/App.tsx`)

| Brief requirement | Status | Evidence |
|-------------------|--------|----------|
| Non-admin at `/` or `/dashboard` → client dashboard | **Partial deviation** | `/` renders marketing `Home` (`App.tsx` lines 67). Client dashboard is `/dashboard` (lines 98–105). Authenticated role landing is **`/app`** (lines 88–95), not `/`. |
| Admin at `/` or `/dashboard` → `/admin/dashboard` | **Partial** | `/` stays marketing for everyone. Admin visiting `/dashboard` is redirected by `ProtectedRoute` (`ProtectedRoute.tsx` lines 77–87). Login navigates to `/app` (`login-form.tsx` lines 56–57). |
| `/admin/*` rejects non-admins (redirect) | **Implemented** | `requireAdmin` → `Navigate to="/dashboard"` (`ProtectedRoute.tsx` lines 73–75; admin routes lines 156–258 in `App.tsx`) |
| Role-aware landing waits for auth | **Implemented** | `role-landing.tsx` lines 11–20 skeleton while `loading`; then admin → `/admin/dashboard` (27–28) or client → `/dashboard` (31) |

### View as client

| Check | Status | Evidence |
|-------|--------|----------|
| Toggle exists | **Implemented** | Admin shell button sets `enclosure-view-as-client` and navigates to `/dashboard` (`dashboard-layout.tsx` lines 163–175; helpers in `ProtectedRoute.tsx` lines 5–25) |
| Reverts cleanly | **Implemented** | “Back to admin” clears flag and navigates (`dashboard-layout.tsx` lines 177–189) |
| Caveat | **Medium UX gap** | Header dropdown “Client dashboard” link (`dashboard-layout.tsx` lines 216–220) does **not** set view-as-client, so admins are bounced back to CRM by `ProtectedRoute`. |

---

===============================================================================
4. Phase 2 — Admin shell + overview + clients
===============================================================================

### 4.1 Admin shell and navigation

| Check | Status | Evidence |
|-------|--------|----------|
| `src/pages/admin/dashboard.tsx` exists | **Yes** | Overview page |
| Nav: Overview, Clients, Payments, Audits and Leads, Outreach, Settings | **Yes** (+ Suppressions extra) | `admin-layout.tsx` lines 12–20 |
| Consistent shell with client | **Yes** | Reuses `DashboardLayout` with nav override (`admin-layout.tsx` lines 29–32) |

### 4.2 Overview page

| Stat | Present? | Data source |
|------|----------|-------------|
| Total clients by status | **Yes** | Live query `users` filtered `role === "user"`, active/suspended counts (`dashboard.tsx` lines 44, 55–63, 108–115) |
| Active websites / progress summary | **Yes** | Live `websites` status counts (lines 45, 64–67, 116–123) |
| Outstanding invoiced | **Yes** | Sum of sent/overdue/**draft** (lines 68–70, 124–130) — includes drafts (possible brief drift) |
| Overdue invoices count | **Yes** | Count (lines 71, 131) |
| Open support tickets | **Yes** | open + pending (lines 72, 132) |
| Recent activity (last 10 project_updates + client name) | **Yes** | Query with join + limit 10 (lines 48–52, 135–163) |

Not stubbed with hardcoded numbers — real Supabase selects. Values use `MetricCard` → mono/tabular (`metric-card.tsx` 45–47).

### 4.3 Clients list

| Check | Status | Evidence |
|-------|--------|----------|
| Columns: name, email, plan, websites, outstanding, last login, status | **Partial** | Table headers `clients.tsx` lines 119–126. **Websites shows count only** (line 140), not status. |
| Sortable | **Not implemented** | No sort handlers |
| Filterable plan/status + search name/email | **Implemented** | Lines 71–98, filters in `useMemo` 43–55 |
| Row click → client detail | **Implemented** | Lines 131–133 → `/admin/clients/:id`; detail shows websites, invoices, tickets, activity (`client-detail.tsx` lines 84–174) |
| admin-create-user preserved | **Preserved (old UI)** | Clients links to `/admin/users` (`clients.tsx` lines 99–104). Create flow + `sendWelcomeEmail` still in `users.tsx` (~line 182). Visual style not refreshed. |

### 4.4 RLS

| Check | Status | Evidence |
|-------|--------|----------|
| `is_admin()` helper | **Present (reaffirmed)** | `supabase/migrations/20260725140000_ensure_is_admin_and_invoice_draft.sql` lines 3–15. Also existed in older migrations (`20251101141720`, `20251101130228`). |
| Admin cross-user read for users/websites/billing/invoices/support_tickets/project_updates | **Already present in older migrations** (not newly added in CRM phase) | e.g. users: `20251101141735` lines 16–20; invoices/billing/project_updates: `20251101130241` / `20251101141743` etc. Pattern: separate policies for `auth.uid() = user_id` **and** `is_admin()`. |
| Policies check ownership OR admin | **Yes** (separate policies OR’d by Postgres) | Syntactically valid. New CRM tables are admin-only only (correct for leads). |

**Note:** New CRM migrations are not applied remotely yet (§1 / §8.6).

---

===============================================================================
5. Phase 3 — Payments
===============================================================================

| Check | Status | Evidence |
|-------|--------|----------|
| `src/pages/admin/payments.tsx` exists | **Yes** | |
| Summary cards: invoiced this month / paid / outstanding / overdue | **Yes** | Lines 104–108; computations 69–87. Overdue card is **amount**, not count. |
| Table + filters (status, date range, client) | **Partial** | Status filter + text search (lines 111–128). **No date-range filter. No client dropdown** (search covers client name/email). |
| Sortable / searchable | **Searchable yes; sortable no** | |
| Mark-as-paid + view PDF | **Yes** | `markPaid` lines 89–100; PDF when `pdf_url` lines 198–204 |
| Unpaid chase view with contact email | **Yes** | Toggle lines 129–135; email shown when `unpaidOnly` lines 165–167 |
| No Stripe code added | **Confirmed** | No Stripe integration in new admin payments; only marketing copy mention elsewhere |
| New migrations for missing columns | **Minimal / sensible** | `sent_at`, `payment_method` optional columns + draft status (`20260725140000` lines 20–33) |

---

===============================================================================
6. Phase 4 — Audit import and leads data model
===============================================================================

### 6.1 Migrations (`20260725140100_create_leads_import_and_suppression.sql`)

| Table | Columns / constraints vs brief | Status |
|-------|--------------------------------|--------|
| `leads` | business_name, domain, contact_email, contact_name, phone, address, google_place_id, source, audit_data, audit_findings_summary, personalised_email_draft, status (+check), unsubscribed_at, last_audited_at, assigned_to, timestamps | **Present** (lines 3–34) |
| Indexes status, unsubscribed_at, assigned_to, domain | **Present** (lines 39–42) + `lower(domain)` unique index (36–37) |
| Unique domain case-insensitive | **Present** via normalise trigger + unique/lower index (lines 33, 36–37, 91–108) |
| Unique `google_place_id` where not null | **Present** as `UNIQUE (google_place_id)` (line 34) — Postgres allows multiple NULLs |
| `import_batches` | All count/metadata columns | **Present** (lines 44–56) |
| `email_suppression` | email, suppressed_at, reason, unsubscribe_token UNIQUE; lower(email) unique index; normalise trigger | **Present** (lines 61–71, 110–124) |
| RLS admin-only via `is_admin()` | **Present** (lines 126–152) |
| SQL quality | Generally sound. Dual uniqueness on `domain` (`UNIQUE(domain)` + `lower(domain)` index) is redundant but OK with lowercasing trigger. | |

**Drift:** none material vs brief. **Not applied remotely.**

### 6.2 Export schema doc

| Check | Status |
|-------|--------|
| `docs/SITEENTRY_EXPORT_SCHEMA.md` exists | **Yes** |
| Matches brief structure | **Yes** — `schema_version`, `generated_at`, `generator`, `run_id`, `leads[]` with specified fields (doc lines 9–57) |

### 6.3 Import page (`src/pages/admin/audits.tsx`)

| Check | Status | Evidence |
|-------|--------|----------|
| Page exists (audits.tsx, not imports.tsx) | **Yes** | Routed `/admin/audits` |
| JSON drag-and-drop | **Yes** | Lines 310–325 |
| Schema validation + clear errors | **Yes** | `schema_version !== "1.0"` (155–158); `validateLead` (66–109); parse errors (351–354) |
| Preview before commit with counts | **Yes** | Counts 141–148, UI 357–365 |
| Per-row status in preview | **Yes** | Lines 386–407 |
| Confirm upserts by domain / google_place_id | **Yes** | Match logic 213–225; insert/update 247–269 |
| Creates `import_batches` row | **Yes** | Lines 272–282 |
| Never touches suppressed emails | **Yes** | Skip in preview 202–210; commit only new/update statuses |
| Past batches listed | **Yes** | Lines 415–456 |
| Never auto-sends email | **Confirmed** | Commit path only `leads` insert/update + `import_batches` insert; toast explicitly “No emails were sent.” (285–288) |

---

===============================================================================
7. Phase 5 — Outreach and unsubscribe
===============================================================================

### 7.1 `email_events` migration

| Check | Status | Evidence |
|-------|--------|----------|
| Table + columns | **Yes** | `20260725140200_create_email_events_and_suppression_audit.sql` lines 3–19 |
| RLS admin-only | **Yes** | Lines 42–48 |
| Indexes lead_id, sent_at | **Yes** | Lines 21–22 |
| `suppression_removals` audit table | **Yes** | Lines 27–37, 50–56 |

### 7.2 Outreach page

| Check | Status | Evidence |
|-------|--------|----------|
| `outreach.tsx` exists | **Yes** | |
| Filter status, source, assigned_to, contacted | **Partial** | Status + contacted/not (`outreach.tsx` lines 176–198). **No source filter. No assigned_to filter.** Search covers business/domain/email. |
| Row → detail drawer with elements | **Mostly yes** | Sheet with contact fields, audit findings, collapsible audit JSON, draft, history (lines 244–337) |
| Editable `personalised_email_draft` | **Yes** | Lines 290–298, `saveDraft` 113–127 |
| Email history visible | **Yes** | Lines 312–336 |

### 7.3 `send-outreach-email` Edge Function

| Check | Status | Evidence |
|-------|--------|----------|
| File exists | **Yes** | `supabase/functions/send-outreach-email/index.ts` |
| Admin JWT check via `is_admin()` | **Partial** | Checks `users.role === "admin"` via service role (lines 74–85), **not** RPC `is_admin()`. Equivalent intent, not the literal helper call. |
| Suppression check before send | **Yes** | Lines 133–144 |
| Signed unsubscribe token per email | **Yes** (random 24-byte hex; stored on event) | Lines 146–147, 181–189. Not cryptographically HMAC-signed — random unguessable token. |
| Resend via shared `email-service.ts` | **Yes** | Lines 155–161 |
| Records `email_events` + `resend_message_id` | **Yes** | Lines 181–189 |
| `new` → `contacted` | **Yes** | Lines 196–202 |
| Origin-allowlisted CORS | **Yes** | `_shared/cors.ts` lines 6–26; used lines 22–24 of function |
| **Deployed?** | **No** | Absent from remote `list_edge_functions` |

### 7.4 Public unsubscribe page

| Check | Status | Evidence |
|-------|--------|----------|
| `unsubscribe.tsx` public | **Yes** | `App.tsx` line 75, no `ProtectedRoute` |
| Reads `?token=`, calls Edge Function | **Yes** | `unsubscribe.tsx` lines 15–39 → `process-unsubscribe` |
| Suppress + mark lead | **Yes** (in function) | `process-unsubscribe/index.ts` lines 86–110; upsert suppression; set lead `unsubscribed` + `unsubscribed_at` |
| Confirmation copy | **Matches brief spirit** | Lines 69–71: no emoji, no exclamation marks |
| Respects theme | **Yes** | ThemeToggle + tokens |
| **Function deployed?** | **No** | |

### 7.5 Suppressions view

| Check | Status | Evidence |
|-------|--------|----------|
| List email / when / reason | **Yes** | `suppressions.tsx` lines 95–110 |
| Remove with confirmation | **Yes** | AlertDialog lines 124–138 |
| `suppression_removals` logged | **Yes** | Insert before delete, lines 56–61 |
| Migration created | **Yes** | `20260725140200` |

---

===============================================================================
8. Cross-cutting checks
===============================================================================

### 8.1 No emoji anywhere

**Hits in `src/` (product-relevant and marketing):**

| File | Line | Content |
|------|------|---------|
| `src/components/dashboard/AISupportChat.tsx` | 143 | `🎉` in client-facing chat reply |
| `src/lib/supabase.ts` | 8, 13 | `❌` / `✅` in console logs |
| `src/components/ui/chatbot.tsx` | 17 | `👋` (marketing chatbot) |
| `src/components/pricing.tsx` | 36, 290–305, 349, 491 | `⭐`, `✅`, `⚙️`, `🎯` |
| `src/components/website-story.tsx` | 9 | `💡` |
| `src/pages/privacy-policy.tsx` | 127 | `📧` |
| `src/pages/terms-of-service.tsx` | 163 | `📧` |
| `src/components/ui/PILLNAV-USAGE.md` | multiple | docs emoji |

**`supabase/functions/`:** no emoji hits found.

**Zero-tolerance verdict for authenticated portal:** fail due to `AISupportChat.tsx:143`. Marketing leftovers are out of redesign scope but still in `src/`.

**Exclamation marks in empty-state / new CRM body copy:** EmptyState messages use periods only. Unsubscribe confirmation has no `!`. Some toasts/titles elsewhere may still use emphatic punctuation (not systematically empty-state violations).

### 8.2 British English

Targeted grep for Americanisms in user-facing page copy (`color`, `authorize`, `organize`, `favor`, `canceled`) under `src/pages/admin` and dashboard components: **no user-facing American spellings found** (CSS `justify-center` / `text-center` exempt). Edge Functions use British “authorisation” (`send-outreach-email/index.ts` line 47).

### 8.3 Em dashes (`—`)

| Area | Hits |
|------|------|
| New CRM UI as empty placeholder | `clients.tsx:136`, `payments.tsx:164`, `audits.tsx:194,390`, `outreach.tsx:230`, `suppressions.tsx:110` |
| Marketing / about / FAQ / careers / pricing / services | many pre-existing |
| Docs | `docs/RESTORE_RUNBOOK.md:1` |

Brief asked to report every hit; CRM pages introduce new em-dash placeholders contrary to a strict “no em dash” copy rule.

### 8.4 TypeScript

| Check | Result |
|-------|--------|
| `npm run build` (`tsc && vite build`) | **Succeeded** (exit 0), ~21s vite build |
| `@ts-ignore` / `@ts-expect-error` added | **None found** in `src/` |

### 8.5 Migration hygiene

| Check | Status |
|-------|--------|
| Timestamp + descriptive names | **Yes** for new `20260725*` files |
| Additive | **Yes** for CRM migrations (CREATE TABLE / ADD COLUMN / CREATE OR REPLACE function). Invoice status constraint drop/re-add is controlled. |
| Risk on production data | **Medium:** `20260725120100` backfills **all** users’ `welcome_email_sent_at` (lines 20–22) — intentional for P0. Invoice `CHECK` rewrite could fail if unexpected status values exist. |
| Hygiene issue | Local `supabase/migrations/` also contains a **full historical dump** of Nov 2025 migrations already applied remotely. Do **not** `db push` the whole folder blindly; only apply additive `20260725*` versions not yet on remote. |

### 8.6 Deployment safety

| Check | Confirmed |
|-------|-----------|
| Nothing pushed | **Yes** — no remote `feat/redesign-and-admin-crm`; HEAD = `origin/master` |
| No CRM migrations on remote | **Yes** — remote list ends `20251101174434`; tables list has no `leads` / suppression / email_events |
| No CRM Edge Functions redeployed | **Yes** — `send-outreach-email`, `process-unsubscribe` absent; local `admin-create-user` / `send-welcome-email` changes not reflected as new CRM deploys |

### 8.7 Existing functionality regressions

| Flow | Code-path assessment |
|------|----------------------|
| Client websites / invoices / support / settings / password | Still routed under `/dashboard/*` with same Supabase user-scoped queries in refreshed pages (`user-dashboard.tsx` lines 80–106; progress/payments/settings/Support). Shell preserved via `DashboardLayout`. **Likely intact** pending runtime QA. |
| P0 welcome-email | **Touched on this working tree.** `AuthContext` no longer sends welcome mail (intentional per `docs/WELCOME_EMAIL_BEHAVIOUR.md`). Trigger remains in `src/pages/admin/users.tsx` after create (~line 182). Local `send-welcome-email` now requires `welcome_email_sent_at` column — **column not on remote yet**. Deploying the new function without migration would break welcome sends. |

---

===============================================================================
9. Recommended fixes before merge
===============================================================================

| Priority | Item | Effort | Risk if deferred |
|----------|------|--------|------------------|
| **P0** | Commit work on `feat/redesign-and-admin-crm` (exclude secrets / avoid committing `supabase/.temp/*` noise) and open PR | Small | Cannot review/merge |
| **P0** | Apply **only** additive remote migrations: `20260725120000`, `20260725120100`, `20260725140000`, `20260725140100`, `20260725140200` — do not re-apply historical Nov 2025 set | Medium | Admin CRM pages query missing tables → hard failures |
| **P0** | Deploy `send-outreach-email`, `process-unsubscribe`; redeploy `send-welcome-email` + `admin-create-user` **after** `welcome_email_sent_at` migration | Medium | Outreach/unsubscribe/welcome broken or divergent from code |
| **P0** | Remove emoji from `AISupportChat.tsx:143` | Small | Violates zero-emoji portal rule |
| **P1** | Refresh `/admin/users` (and ideally billing/websites) onto AdminLayout + tokens, or clearly mark legacy | Medium | Create-user path looks broken vs CRM; brand inconsistency |
| **P1** | Clients: show website status(es); add column sorting | Medium | Brief incomplete; ops friction |
| **P1** | Payments: date-range + client filter; column sort | Medium | Brief incomplete |
| **P1** | Outreach: `source` + `assigned_to` filters | Small | Brief incomplete |
| **P1** | Fix admin dropdown “Client dashboard” to set view-as-client (or remove link) | Small | Confusing bounce loop |
| **P2** | Replace CRM em-dash placeholders (`—`) with en-dash, “None”, or empty | Small | Copy-style inconsistency |
| **P2** | Add Suppressions to command palette | Small | Discoverability |
| **P2** | Decide outstanding invoice formula (include `draft` or not) and align overview/clients/payments | Small | Inflated outstanding |
| **P3** | Remove or re-route orphan `signup` page / old `dashboard/index.tsx` | Small | Dead code confusion |
| **P3** | Call `is_admin()` RPC in Edge Functions instead of duplicating role check | Small | Drift from brief wording only |

---

===============================================================================
Appendix A — File inventory
===============================================================================

### Migrations created / present locally for this work

| File | One-line description |
|------|----------------------|
| `20260725120000_lock_admin_create_user.sql` | P0: lock down `admin_create_user` RPC |
| `20260725120100_add_welcome_email_sent_at.sql` | P0: idempotent welcome email column + backfill |
| `20260725140000_ensure_is_admin_and_invoice_draft.sql` | Reaffirm `is_admin()`; allow invoice `draft`; add `sent_at` / `payment_method` |
| `20260725140100_create_leads_import_and_suppression.sql` | `leads`, `import_batches`, `email_suppression` + RLS |
| `20260725140200_create_email_events_and_suppression_audit.sql` | `email_events`, `suppression_removals` + RLS |
| Plus historical `20251101*` copies | Already applied remotely; newly checked into local folder |

### New pages

- `src/pages/role-landing.tsx`
- `src/pages/unsubscribe.tsx`
- `src/pages/admin/dashboard.tsx`
- `src/pages/admin/clients.tsx`
- `src/pages/admin/client-detail.tsx`
- `src/pages/admin/payments.tsx`
- `src/pages/admin/audits.tsx`
- `src/pages/admin/outreach.tsx`
- `src/pages/admin/suppressions.tsx`
- `src/pages/admin/settings.tsx`

### New components / modules

- `src/components/admin/admin-layout.tsx`
- `src/components/command-palette.tsx`
- `src/components/theme-toggle.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/metric-card.tsx`
- `src/contexts/ThemeContext.tsx`
- `src/hooks/useCountUp.ts`
- `supabase/functions/_shared/cors.ts`
- `supabase/functions/admin-create-user/index.ts` (repo copy of previously remote-only function)
- `supabase/functions/send-outreach-email/index.ts`
- `supabase/functions/process-unsubscribe/index.ts`

### Modified files (one-line reason)

| File | Reason |
|------|--------|
| `index.html` | Fonts + FOUC theme script; GB lang; portal title |
| `tailwind.config.js` | Tokens, type scale, fonts, radius, 150ms default |
| `src/index.css` | Design tokens light/dark, utilities |
| `src/main.tsx` | Wrap `ThemeProvider` |
| `src/App.tsx` | Role routes, admin CRM routes, public unsubscribe |
| `src/contexts/AuthContext.tsx` | Remove login welcome-email triggers (P0) |
| `src/components/auth/ProtectedRoute.tsx` | Admin gate + view-as-client |
| `src/components/auth/login-form.tsx` | Theme + navigate `/app` |
| `src/components/auth/signup-form.tsx` | Visual refresh (route unused) |
| `src/components/dashboard/*` | Shell, chat, tickets, referrals, billing, invoices → tokens |
| `src/components/ui/{badge,button,card,dialog,input,logo,skeleton,tabs,toast}.tsx` | Tokenised primitives |
| `src/pages/login.tsx`, `forgot-password.tsx`, `change-password.tsx` | Theme-aware auth |
| `src/pages/dashboard/*`, `account-settings.tsx` | Portal redesign |
| `src/pages/admin/users.tsx`, `billing.tsx` | Minor edits; still largely old UI |
| `src/types/supabase.ts` | Types for CRM + welcome_email_sent_at |
| `src/utils/emailHelpers.ts` | Welcome skip metadata |
| `supabase/functions/_shared/email-service.ts` | Shared email adjustments |
| `supabase/functions/send-welcome-email/index.ts` | Idempotent send + allowlisted CORS |
| `package-lock.json` | Lockfile churn |
| `supabase/.temp/*` | Local CLI cache (should not commit) |

### Docs (new, untracked)

- `docs/SITEENTRY_EXPORT_SCHEMA.md`
- `docs/WELCOME_EMAIL_BEHAVIOUR.md`
- `docs/AUTH_DASHBOARD_SETTINGS.md`
- `docs/RESTORE_RUNBOOK.md`
- `BACKEND_AUDIT.md` (prior audit; unrelated deliverable)

### Deleted

- Nothing deleted from git history. Signup **route** removed from `App.tsx` (page file remains).

---

===============================================================================
Appendix B — Design token values
===============================================================================

Source: `src/index.css`. Accent sampling: logo PNG dominant blue **`#468EFD`**.

### Light (`:root`)

| Token | HSL (as stored) | Approx hex |
|-------|-----------------|------------|
| `--background` | `220 20% 97%` | `#F6F7F9` |
| `--surface` | `0 0% 100%` | `#FFFFFF` |
| `--foreground` | `222 25% 8%` | `#0F121A` |
| `--muted` | `220 14% 94%` | `#EEEFF2` |
| `--muted-foreground` | `220 10% 42%` | `#606876` |
| `--card` | `0 0% 100%` | `#FFFFFF` |
| `--card-foreground` | `222 25% 8%` | `#0F121A` |
| `--popover` | `0 0% 100%` | `#FFFFFF` |
| `--popover-foreground` | `222 25% 8%` | `#0F121A` |
| `--border` | `220 14% 88%` | `#DCDFE5` |
| `--input` | `220 14% 88%` | `#DCDFE5` |
| `--ring` | `216 98% 63%` | `#468EFD` |
| `--primary` | `216 98% 63%` | `#468EFD` |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` |
| `--secondary` | `220 14% 94%` | `#EEEFF2` |
| `--secondary-foreground` | `222 25% 12%` | `#161B26` |
| `--accent` | `216 98% 63%` | `#468EFD` |
| `--accent-foreground` | `0 0% 100%` | `#FFFFFF` |
| `--accent-50` … `--accent-950` | `216` scale 97%→18% L | tint ladder |
| `--success` | `152 45% 38%` | `#35996A` |
| `--warning` | `38 70% 46%` | `#C78A23` |
| `--destructive` | `0 62% 48%` | `#C72E2E` |
| `--sidebar` | `220 18% 96%` | `#F3F4F7` |
| `--sidebar-foreground` | `222 20% 20%` | `#292E3B` |
| `--sidebar-border` | `220 14% 90%` | `#E2E5EA` |
| `--sidebar-active` | `216 98% 63% / 0.08` | accent @ 8% |
| `--radius` | `0.5rem` | 8px |

### Dark (`.dark`)

| Token | HSL (as stored) | Approx hex |
|-------|-----------------|------------|
| `--background` | `222 18% 6%` | `#0D0E12` |
| `--surface` | `222 16% 9%` | `#13151B` |
| `--foreground` | `210 20% 96%` | `#F3F5F7` |
| `--muted` | `222 14% 14%` | `#1F2229` |
| `--muted-foreground` | `215 12% 62%` | `#929CAA` |
| `--card` / `--popover` | `222 16% 9–10%` | `#13151B` / `#15171E` |
| `--border` / `--input` | `220 12% 18%` | `#282C33` |
| `--ring` / `--accent` / `--primary` | `216 80% 62%` | `#518FEC` |
| `--accent-foreground` / `--primary-foreground` | `222 25% 8%` | `#0F121A` |
| `--success` | `152 40% 42%` | `#409870` |
| `--warning` | `38 60% 50%` | `#CC9A33` |
| `--destructive` | `0 55% 52%` | `#C84A4A` |
| `--sidebar` | `222 18% 7%` | `#0F1115` |
| `--sidebar-foreground` | `215 14% 78%` | `#B8C0CD` |
| `--sidebar-border` | `220 12% 14%` | `#1F232A` |
| `--sidebar-active` | `216 80% 62% / 0.12` | accent @ 12% |

OKLCH equivalents were not defined in the codebase (HSL custom properties only).

---

*End of audit. No code, migrations, pushes, or deploys were performed as part of this review.*
