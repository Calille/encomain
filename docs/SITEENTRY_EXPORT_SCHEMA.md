# SiteEntry export schema

Manual sync format for importing local-business website audits into The Enclosure admin CRM.

`schema_version` governs parser compatibility. The admin importer accepts `"1.0"`, `"2.0"`, and `"3.0"`.

## Top-level document

```json
{
  "schema_version": "3.0",
  "generated_at": "2026-07-25T10:00:00.000Z",
  "generator": "siteentry",
  "run_id": "run_20260725_001",
  "leads": []
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `schema_version` | string | yes | `"1.0"`, `"2.0"`, or `"3.0"` |
| `generated_at` | ISO 8601 timestamp | yes | When the export was produced |
| `generator` | string | yes | Expected `"siteentry"` |
| `run_id` | string | yes | Unique id for this export run |
| `leads` | array | yes | Zero or more lead objects |

## Lead object

```json
{
  "business_name": "Example Cafe",
  "domain": "examplecafe.co.uk",
  "google_place_id": "ChIJxxxxxxxx",
  "contact_email": "hello@examplecafe.co.uk",
  "contact_name": "Alex Smith",
  "phone": "+44 20 0000 0000",
  "address": "1 High Street, London",
  "audit_findings_summary": "Missing meta description; slow LCP; incomplete GBP categories.",
  "audit_data": {},
  "personalised_email_draft": "Hi Alex, …",
  "last_audited_at": "2026-07-24T18:30:00.000Z",
  "sentry_discovered_by": "9f9bdeae-d306-48d7-89fa-0518517f2e9f",
  "sentry_first_audited_by": "401bff94-0783-47e0-b8d2-feff2f0a6a01",
  "sentry_export_batch_id": "batch_20260729_001"
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `business_name` | string | yes | Display name |
| `domain` | string | yes | Matched case-insensitively on import |
| `google_place_id` | string \| null | no | Unique when present; used as secondary match key |
| `contact_email` | string \| null | no | Lowercased on import; checked against `email_suppression` |
| `contact_name` | string \| null | no | |
| `phone` | string \| null | no | |
| `address` | string \| null | no | |
| `audit_findings_summary` | string | yes | Short human summary |
| `audit_data` | object | yes | Full structured audit payload |
| `personalised_email_draft` | string \| null | no | Optional outreach draft |
| `last_audited_at` | ISO 8601 timestamp | yes | |
| `sentry_discovered_by` | UUID string \| null | no | Schema 3.0; written to `leads.sentry_discovered_by` |
| `sentry_first_audited_by` | UUID string \| null | no | Schema 3.0; written to `leads.sentry_first_audited_by` |
| `sentry_export_batch_id` | string \| null | no | Schema 3.0; accepted for traceability, not persisted yet |

## Import behaviour

1. Validate `schema_version` and required fields before commit.
2. Match existing leads by `domain` (preferred) or `google_place_id`.
3. Skip any lead whose `contact_email` appears in `email_suppression`.
4. Never send email during import. Ingest only.
5. Record counts on `import_batches`.
6. Schema 3.0 attribution UUIDs are stored when present; they are not resolved to live users at import time.
