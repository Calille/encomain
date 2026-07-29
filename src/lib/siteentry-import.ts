/**
 * SiteEntry / Sentry lead import validation.
 * Accepts schema_version 1.0, 2.0, and 3.0.
 */

export const ACCEPTED_SCHEMA_VERSIONS = ["1.0", "2.0", "3.0"] as const;
export type SiteEntrySchemaVersion = (typeof ACCEPTED_SCHEMA_VERSIONS)[number];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface SiteEntryLead {
  business_name?: unknown;
  domain?: unknown;
  google_place_id?: unknown;
  contact_email?: unknown;
  contact_name?: unknown;
  phone?: unknown;
  address?: unknown;
  audit_findings_summary?: unknown;
  audit_data?: unknown;
  personalised_email_draft?: unknown;
  last_audited_at?: unknown;
  sentry_discovered_by?: unknown;
  sentry_first_audited_by?: unknown;
  sentry_export_batch_id?: unknown;
}

export interface SiteEntryExport {
  schema_version?: unknown;
  generated_at?: unknown;
  generator?: unknown;
  run_id?: unknown;
  leads?: unknown;
}

export function isAcceptedSchemaVersion(
  value: unknown,
): value is SiteEntrySchemaVersion {
  return (
    typeof value === "string" &&
    (ACCEPTED_SCHEMA_VERSIONS as readonly string[]).includes(value)
  );
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function optionalUuid(
  value: unknown,
  field: string,
): { ok: true; value: string | null } | { ok: false; reason: string } {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: null };
  }
  if (typeof value !== "string" || !UUID_RE.test(value.trim())) {
    return { ok: false, reason: `${field} must be a valid UUID string` };
  }
  return { ok: true, value: value.trim().toLowerCase() };
}

/**
 * Validate a single lead row. Attribution fields are optional (schema 3.0).
 * `sentry_export_batch_id` is accepted for forward compatibility but not persisted.
 */
export function validateLead(
  raw: SiteEntryLead,
): { ok: true; data: Record<string, unknown> } | { ok: false; reason: string } {
  if (typeof raw.business_name !== "string" || !raw.business_name.trim()) {
    return { ok: false, reason: "Missing business_name" };
  }
  if (typeof raw.domain !== "string" || !raw.domain.trim()) {
    return { ok: false, reason: "Missing domain" };
  }
  if (typeof raw.audit_findings_summary !== "string") {
    return { ok: false, reason: "Missing audit_findings_summary" };
  }
  if (!raw.audit_data || typeof raw.audit_data !== "object" || Array.isArray(raw.audit_data)) {
    return { ok: false, reason: "audit_data must be an object" };
  }
  if (!isIsoDate(raw.last_audited_at)) {
    return { ok: false, reason: "Invalid last_audited_at" };
  }

  const discoveredBy = optionalUuid(raw.sentry_discovered_by, "sentry_discovered_by");
  if (discoveredBy.ok === false) {
    return { ok: false, reason: discoveredBy.reason };
  }

  const firstAuditedBy = optionalUuid(
    raw.sentry_first_audited_by,
    "sentry_first_audited_by",
  );
  if (firstAuditedBy.ok === false) {
    return { ok: false, reason: firstAuditedBy.reason };
  }

  if (
    raw.sentry_export_batch_id !== undefined &&
    raw.sentry_export_batch_id !== null &&
    typeof raw.sentry_export_batch_id !== "string"
  ) {
    return { ok: false, reason: "sentry_export_batch_id must be a string when present" };
  }

  const domain = raw.domain.trim().toLowerCase();
  const email =
    typeof raw.contact_email === "string" && raw.contact_email.trim()
      ? raw.contact_email.trim().toLowerCase()
      : null;

  return {
    ok: true,
    data: {
      business_name: raw.business_name.trim(),
      domain,
      google_place_id:
        typeof raw.google_place_id === "string" && raw.google_place_id.trim()
          ? raw.google_place_id.trim()
          : null,
      contact_email: email,
      contact_name: typeof raw.contact_name === "string" ? raw.contact_name : null,
      phone: typeof raw.phone === "string" ? raw.phone : null,
      address: typeof raw.address === "string" ? raw.address : null,
      audit_findings_summary: raw.audit_findings_summary,
      audit_data: raw.audit_data,
      personalised_email_draft:
        typeof raw.personalised_email_draft === "string"
          ? raw.personalised_email_draft
          : null,
      last_audited_at: raw.last_audited_at,
      source: "siteentry",
      sentry_discovered_by: discoveredBy.value,
      sentry_first_audited_by: firstAuditedBy.value,
    },
  };
}
