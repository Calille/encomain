# Admin Tools section

Internal distribution for The Enclosure team tool installers (starting with Sentry). Admins upload versioned binaries to a private Supabase Storage bucket and download them via short-lived signed URLs.

## What it is for

- Host Mac / Windows / Linux installers for internal desktop tools
- Track version, platform, file size, release notes, and which build is "latest" per platform
- Keep installers off public URLs; only active admins can list, upload, or download

Route: `/admin/tools` (admin-only via `ProtectedRoute requireAdmin`).

## Architecture

| Piece | Location |
| --- | --- |
| Metadata table | `public.tool_releases` |
| Storage bucket | `tool-installers` (private, 500MB file size limit) |
| Client helpers | `src/lib/tool-releases.ts` |
| Admin UI | `src/pages/admin/tools.tsx` |
| Signed download | Edge Function `get-tool-download-url` |

RLS on both the table and storage objects uses `public.is_admin()`, matching Audits, Outreach, and Suppressions.

## How to upload a new release

1. Sign in as an admin and open **Tools** in the admin sidebar.
2. On the tool card (e.g. Sentry), click **Upload new release**.
3. Confirm the tool (defaults to Sentry).
4. Enter a **semver** version (see below).
5. Choose the platform: Mac, Windows, or Linux.
6. Drag in the installer file (or click to browse).
7. Optionally add release notes (Markdown is fine; shown as plain truncated text in the table).
8. Leave **Mark as latest for this platform** on unless you are uploading an archive build.
9. Submit and wait for the progress bar to finish. A toast confirms success.

Path written to storage:

```text
<tool_slug>/<version>/<platform>/<filename>
```

Examples:

- `sentry/3.0.0/mac/Sentry-3.0.0.dmg`
- `sentry/3.0.0/windows/Sentry-Setup-3.0.0.exe`

## Semver conventions

Versions must match semantic versioning, including optional pre-release and build metadata:

- `3.0.0`
- `3.0.0-beta.1`
- `1.2.3+build.4`

Invalid: `v3`, `3.0`, `latest`.

Each `(tool_slug, version, platform)` combination is unique. Re-uploading the same triple fails until you delete the existing row (and its file).

## Expected filenames

| Platform | Typical extension | Example |
| --- | --- | --- |
| Mac | `.dmg` | `Sentry-3.0.0.dmg` |
| Windows | `.exe` | `Sentry-Setup-3.0.0.exe` |
| Linux | `.AppImage`, `.deb`, or `.tar.gz` | `Sentry-3.0.0.AppImage` |

The UI does not enforce extensions; use clear, versioned names so operators can tell builds apart.

## Latest-per-platform rule

When a release is inserted or updated with `is_latest = true`, a database trigger unsets `is_latest` on every other row for the same `(tool_slug, platform)`. The primary **Download for Mac** / **Download for Windows** buttons always point at the current latest row for that platform.

## Downloads

Download buttons never embed the storage path. The browser calls the `get-tool-download-url` Edge Function with `{ releaseId }` and the admin JWT. The function checks admin status, looks up `file_path`, and returns a signed URL valid for 60 seconds. The client then navigates to that URL.

## Bucket size / plan requirements

The `tool-installers` bucket is configured with `file_size_limit = 524288000` (500MB).

- **Free tier** default object limit is typically **50MB**. Installers larger than that will fail until the project is on a plan that allows raising the limit, and the bucket limit is set accordingly.
- **Pro** commonly supports **500MB** objects (verify in the Supabase dashboard for this project).
- Enterprise can go higher; update the migration / bucket setting if Sentry builds exceed 500MB.

Before the first real Sentry upload, confirm in Supabase → Storage → `tool-installers` that the file size limit covers your installer.

Client-side upload uses XMLHttpRequest so progress can be shown for large files. The client also rejects files over 500MB before starting the request.

## Non-goals

- No automated test suite for this feature (manual checklist below)
- No public download URLs
- No seeded placeholder releases
- No auto-update / phone-home endpoint for Sentry desktop in v3.0

## Manual verification checklist

1. `/admin/tools` renders for an admin user.
2. A non-admin signed-in user is redirected away, matching other admin routes.
3. Empty state is visible before any releases exist: "No Sentry releases uploaded yet…"
4. Upload a small test file (e.g. ~5MB dummy) as Sentry `0.0.1` for Mac — it appears in the list and is marked latest.
5. Upload `0.0.2` for Mac with "mark as latest" — `0.0.1` is no longer latest; `0.0.2` is.
6. Upload Sentry `0.0.1` for Windows — both primary download buttons become active.
7. Click **Download for Mac** — a signed URL is generated and the file downloads.
8. With a non-admin JWT in the browser console, confirm list / upload / download are denied (RLS and Edge Function 403).
9. Delete a release — row gone from `tool_releases`, object gone from `tool-installers`.
10. Mark an older version as latest via the row actions menu — the primary download button updates.
11. Edit release notes — changes persist after refresh.
