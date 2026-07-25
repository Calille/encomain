# Supabase restore runbook — The Enclosure

**Project:** Enlcosure (`eqqcbdpbeohtfwnlfdgx`)  
**Region:** eu-west-1  
**Database host:** `db.eqqcbdpbeohtfwnlfdgx.supabase.co`  
**Last verified:** 2026-07-25

This document is operational guidance only. Do **not** run a restore unless you intend to overwrite the live database.

---

## 1. Current backup posture (as of last check)

| Check | Result (2026-07-25) |
|--------|---------------------|
| Project status | `ACTIVE_HEALTHY` |
| PITR enabled | **No** (`pitr_enabled: false`) |
| Physical backups listed via CLI | **Empty** (`backups: []`) |
| WAL-G physical backup infra flag | `walg_enabled: true` (infrastructure present; does not mean usable PITR/daily snapshots are configured) |

### How this was checked

```bash
# Project status (via Management API / MCP / Dashboard)
# Expected healthy status: ACTIVE_HEALTHY

npx supabase link --project-ref eqqcbdpbeohtfwnlfdgx
npx supabase backups list --project-ref eqqcbdpbeohtfwnlfdgx
```

Example CLI response shape:

```json
{
  "region": "eu-west-1",
  "walg_enabled": true,
  "pitr_enabled": false,
  "backups": []
}
```

### Dashboard checks (required for full picture)

1. Open [Database → Backups → Scheduled](https://supabase.com/dashboard/project/eqqcbdpbeohtfwnlfdgx/database/backups/scheduled)
2. Confirm whether daily backups appear and note the **most recent successful backup** timestamp.
3. Open [Database → Backups → Point in Time](https://supabase.com/dashboard/project/eqqcbdpbeohtfwnlfdgx/database/backups/pitr)
4. Confirm PITR add-on status and any recovery window (earliest / latest recovery points).

### Plan expectations (Supabase platform)

- **Free:** no managed daily backups; use regular `supabase db dump` off-site.
- **Pro:** daily backups, typically **7-day** retention; PITR is a paid add-on.
- **Team:** daily backups, typically **14-day** retention; PITR add-on available.
- **Enterprise:** longer retention options; PITR usually available.

If the dashboard also shows no scheduled backups, treat the project as **backup-critical** and enable Pro (or above) backups and/or schedule off-site dumps before relying on restore.

### Recent restore events

During the 2026-07-25 audit the project briefly reported status `RESTORING`, then returned to `ACTIVE_HEALTHY`. No formal restore was initiated by the engineering audit. There is no CLI history of restore events in this repo. Check Dashboard project logs / Supabase support if you need the exact cause of that `RESTORING` window.

---

## 2. How to check backup status

### Via CLI

```bash
cd /path/to/encomain
npx supabase link --project-ref eqqcbdpbeohtfwnlfdgx
npx supabase backups list --project-ref eqqcbdpbeohtfwnlfdgx
npx supabase projects list
```

Confirm the Enlcosure project shows a healthy status (not `RESTORING`, `INACTIVE`, or paused).

### Via Dashboard

| What | Where |
|------|--------|
| Project health | Project home / settings |
| Daily backups | Database → Backups → Scheduled |
| PITR | Database → Backups → Point in Time |
| Auth / API health | Project → Reports / Logs |

### Optional logical dump (off-site)

```bash
npx supabase db dump --linked -f "backups/encomain-$(Get-Date -Format yyyyMMdd-HHmmss).sql"
```

Store dumps outside the project region (for example encrypted object storage). Logical dumps do not replace managed physical backups for large/complex restores, but they are essential if managed backups are empty.

---

## 3. Restore procedures

**Warning:** A restore rewrites the live database. Coordinate downtime, notify stakeholders, and pause writes (admin UI, Edge Function traffic) first. Do not restore “to test” on production.

### 3A. Restore from a daily (scheduled) backup

1. Confirm a usable backup exists in Dashboard → Database → Backups → Scheduled.
2. Note the backup timestamp you intend to use.
3. Put the site in maintenance mode if possible (DNS / hosting banner).
4. In the Dashboard, choose **Restore** for that backup and confirm.
5. Wait until project status returns to `ACTIVE_HEALTHY` (status may show `RESTORING` meanwhile).
6. Run the integrity checks in section 5.
7. Redeploy Edge Functions only if the restore left function versions inconsistent (usually they are separate from Postgres data).
8. Smoke-test login, admin user list, and a client dashboard.

CLI note: `supabase backups restore` is intended for **PITR** timestamps when PITR is enabled. Prefer the Dashboard for scheduled daily backup restores unless CLI docs for your CLI version explicitly support that backup ID.

### 3B. Point-in-time restore (only if PITR is enabled)

Current status: **PITR is not enabled**. Enable the add-on first in Dashboard → Database → Backups → Point in Time, wait until recovery points appear, then:

```bash
# Only after PITR is enabled and you have chosen a UTC timestamp
npx supabase backups restore --help
npx supabase backups restore --project-ref eqqcbdpbeohtfwnlfdgx --timestamp "2026-07-25T10:00:00Z"
```

1. Pick a UTC timestamp within the recovery window shown in the Dashboard.
2. Run the restore (CLI or Dashboard).
3. Wait for `ACTIVE_HEALTHY`.
4. Run section 5 checks.

### 3C. Logical dump restore (emergency / free-tier style)

Use only when managed backups are unavailable and you have a recent `db dump` file.

1. Prefer restoring into a **new** Supabase project or local stack first.
2. Apply the dump with `psql` / `supabase db execute` against the target.
3. Re-link Auth if needed; Auth schema restores are sensitive. Prefer managed backup restore when available.
4. Cut over DNS / env vars only after verification.

---

## 4. If the project shows `RESTORING` unexpectedly

1. **Do not** start a second restore.
2. Check Dashboard project status and [status.supabase.com](https://status.supabase.com/) for platform incidents.
3. Check whether anyone on the team triggered a restore or branch merge.
4. Wait 15–60 minutes for large restores; watch for return to `ACTIVE_HEALTHY`.
5. If stuck beyond a reasonable window (for example more than 2 hours with no progress), contact Supabase support (section 6).
6. Avoid schema migrations, Edge Function deploys that write data, or `db reset` while restoring.
7. After recovery, run section 5 integrity checks and compare to any pre-incident row counts you have.

---

## 5. Verify data integrity after a restore

Run in the SQL Editor (Dashboard → SQL) or via a privileged connection:

```sql
SELECT 'users' AS table_name, count(*)::int AS row_count FROM public.users
UNION ALL SELECT 'websites', count(*)::int FROM public.websites
UNION ALL SELECT 'billing', count(*)::int FROM public.billing
UNION ALL SELECT 'invoices', count(*)::int FROM public.invoices
UNION ALL SELECT 'project_updates', count(*)::int FROM public.project_updates
UNION ALL SELECT 'support_tickets', count(*)::int FROM public.support_tickets
UNION ALL SELECT 'referrals', count(*)::int FROM public.referrals
UNION ALL SELECT 'ai_chat_logs', count(*)::int FROM public.ai_chat_logs
UNION ALL SELECT 'auth.users', count(*)::int FROM auth.users
ORDER BY 1;
```

### Baseline snapshot (2026-07-25, pre-change)

| Table | Row count |
|-------|----------:|
| auth.users | 3 |
| public.users | 3 |
| websites | 0 |
| billing | 0 |
| invoices | 0 |
| project_updates | 0 |

Additional checks:

```sql
-- Auth users should generally have matching public.users profiles
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;

-- Spot-check roles
SELECT role, status, count(*) FROM public.users GROUP BY 1, 2;
```

Manual smoke tests:

1. Admin login → `/admin/users` lists expected accounts.
2. Client login → `/dashboard` loads without auth errors.
3. Confirm Edge Functions still respond (for example a dry-run of an authenticated function).
4. Confirm Resend secret still present: `npx supabase secrets list`.

---

## 6. Contacting Supabase support

- **Support:** [https://supabase.com/dashboard/support](https://supabase.com/dashboard/support) (or your plan’s support channel)
- **Status page:** [https://status.supabase.com](https://status.supabase.com)

Include at least:

| Item | Example |
|------|---------|
| Project ref | `eqqcbdpbeohtfwnlfdgx` |
| Project name | Enlcosure |
| Region | eu-west-1 |
| Observed status | e.g. stuck on `RESTORING` since `<UTC time>` |
| Timeline | When issue started, last known good time |
| Actions taken | CLI commands, Dashboard clicks (no secrets) |
| Impact | Login down, empty tables, etc. |
| Backup intent | PITR timestamp or daily backup time if restore-related |

Do **not** paste service role keys, database passwords, or Resend API keys into tickets in plain shared channels without redaction.

---

## 7. Recommended hardening (follow-up, not part of this restore)

1. Confirm plan includes daily backups; if CLI `backups` stays empty, escalate plan or add off-site dumps.
2. Enable **PITR** if RPO under 24 hours is required.
3. Schedule a monthly restore drill into a throwaway project or branch.
4. Keep this runbook updated whenever plan, PITR, or retention changes.

---

*No restore was performed while writing this document.*
