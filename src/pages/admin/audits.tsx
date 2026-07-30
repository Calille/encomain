import { useCallback, useMemo, useState } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { LoadError } from "../../components/ui/load-error";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "../../hooks/use-toast";
import { useCancellableLoad } from "../../hooks/useCancellableLoad";
import { FileUp, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  getImportPdfHint,
  isAcceptedSchemaVersion,
  stripEphemeralImportFields,
  validateLead,
  type SiteEntryExport,
  type SiteEntryLead,
} from "../../lib/siteentry-import";
import { uploadLeadAuditPdf } from "../../lib/outreach-pdf";

type RowStatus = "new" | "update" | "skip-unsubscribed" | "skip-invalid";

interface PreviewRow {
  key: string;
  status: RowStatus;
  business_name: string;
  domain: string;
  contact_email: string | null;
  reason?: string;
  payload?: Record<string, unknown>;
  existingId?: string;
}

interface ImportBatch {
  id: string;
  filename: string;
  schema_version: string;
  total_records: number;
  new_leads: number;
  updated_leads: number;
  skipped_unsubscribed: number;
  skipped_invalid: number;
  imported_at: string;
}

export default function AdminAuditsPage() {
  const { user } = useAuth();
  const [dragOver, setDragOver] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [schemaVersion, setSchemaVersion] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [committing, setCommitting] = useState(false);
  const [batches, setBatches] = useState<ImportBatch[]>([]);

  const loadBatches = useCallback(async (ctl: { isCancelled: () => boolean }) => {
    const { data, error } = await supabase
      .from("import_batches")
      .select("*")
      .order("imported_at", { ascending: false })
      .limit(20);
    if (ctl.isCancelled()) return;
    if (error) throw error;
    setBatches((data as ImportBatch[]) || []);
  }, []);

  const {
    loading: loadingBatches,
    error: batchesError,
    retry: retryBatches,
  } = useCancellableLoad(loadBatches);

  const counts = useMemo(() => {
    return {
      total: preview.length,
      new: preview.filter((r) => r.status === "new").length,
      update: preview.filter((r) => r.status === "update").length,
      skipUnsubscribed: preview.filter((r) => r.status === "skip-unsubscribed").length,
      skipInvalid: preview.filter((r) => r.status === "skip-invalid").length,
    };
  }, [preview]);

  const buildPreview = async (doc: SiteEntryExport, name: string) => {
    setParseError(null);
    setFilename(name);

    if (!isAcceptedSchemaVersion(doc.schema_version)) {
      setParseError(
        `Unsupported schema_version: ${String(doc.schema_version)}. Expected "1.0", "2.0", or "3.0".`,
      );
      setPreview([]);
      return;
    }
    if (!Array.isArray(doc.leads)) {
      setParseError("Invalid export: leads must be an array.");
      setPreview([]);
      return;
    }

    setSchemaVersion(String(doc.schema_version));

    const { data: existing } = await supabase
      .from("leads")
      .select("id, domain, google_place_id, contact_email");
    const { data: suppressed } = await supabase.from("email_suppression").select("email");

    const byDomain = new Map(
      (existing || []).map((l) => [String(l.domain).toLowerCase(), l])
    );
    const byPlace = new Map(
      (existing || [])
        .filter((l) => l.google_place_id)
        .map((l) => [String(l.google_place_id), l])
    );
    const suppressedSet = new Set((suppressed || []).map((s) => String(s.email).toLowerCase()));

    const rows: PreviewRow[] = doc.leads.map((raw, index) => {
      const validated = validateLead((raw || {}) as SiteEntryLead);
      if (validated.ok === false) {
        return {
          key: `invalid-${index}`,
          status: "skip-invalid" as const,
          business_name: typeof (raw as SiteEntryLead)?.business_name === "string"
            ? String((raw as SiteEntryLead).business_name)
            : "Invalid row",
          domain: typeof (raw as SiteEntryLead)?.domain === "string"
            ? String((raw as SiteEntryLead).domain)
            : "Not set",
          contact_email: null,
          reason: validated.reason,
        };
      }

      const data = validated.data;
      const email = data.contact_email as string | null;
      if (email && suppressedSet.has(email)) {
        return {
          key: `suppressed-${index}`,
          status: "skip-unsubscribed" as const,
          business_name: String(data.business_name),
          domain: String(data.domain),
          contact_email: email,
          reason: "Email is globally suppressed",
        };
      }

      const match =
        byDomain.get(String(data.domain)) ||
        (data.google_place_id ? byPlace.get(String(data.google_place_id)) : undefined);

      return {
        key: `lead-${index}-${data.domain}`,
        status: match ? ("update" as const) : ("new" as const),
        business_name: String(data.business_name),
        domain: String(data.domain),
        contact_email: email,
        payload: data,
        existingId: match?.id,
      };
    });

    setPreview(rows);
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text) as SiteEntryExport;
      await buildPreview(json, file.name);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse JSON file");
      setPreview([]);
    }
  };

  const commit = async () => {
    if (!user || !filename || !schemaVersion) return;
    setCommitting(true);

    try {
      const toInsert = preview.filter((r) => r.status === "new" && r.payload);
      const toUpdate = preview.filter((r) => r.status === "update" && r.payload && r.existingId);

      const pdfJobs: Array<{
        leadId: string;
        payload: Record<string, unknown>;
      }> = [];

      if (toInsert.length > 0) {
        const rows = toInsert.map((r) => ({
          ...stripEphemeralImportFields(r.payload!),
          status: "new",
        }));
        const { data: inserted, error } = await supabase
          .from("leads")
          .insert(rows)
          .select("id, domain");
        if (error) throw error;
        const byDomain = new Map(
          (inserted || []).map((l) => [String(l.domain).toLowerCase(), l.id]),
        );
        for (const row of toInsert) {
          const domain = String(row.payload!.domain).toLowerCase();
          const leadId = byDomain.get(domain);
          if (leadId) pdfJobs.push({ leadId, payload: row.payload! });
        }
      }

      for (const row of toUpdate) {
        const { error } = await supabase
          .from("leads")
          .update({
            ...stripEphemeralImportFields(row.payload!),
            // Never overwrite unsubscribed status via import
          })
          .eq("id", row.existingId!)
          .neq("status", "unsubscribed");
        if (error) throw error;
        pdfJobs.push({ leadId: row.existingId!, payload: row.payload! });
      }

      for (const job of pdfJobs) {
        const hint = getImportPdfHint(job.payload);
        if (!hint.path && !hint.base64) continue;
        if (!hint.base64) {
          console.info(
            `[siteentry-import] PDF path reference only for lead ${job.leadId} (${hint.path}); skipping upload.`,
          );
          continue;
        }
        const result = await uploadLeadAuditPdf({
          leadId: job.leadId,
          filename: hint.filename || "audit.pdf",
          base64: hint.base64,
        });
        if ("error" in result && !result.skipped) {
          console.warn(
            `[siteentry-import] PDF upload failed for lead ${job.leadId}:`,
            result.error,
          );
        }
      }

      const { error: batchError } = await supabase.from("import_batches").insert({
        imported_by: user.id,
        filename,
        schema_version: schemaVersion,
        total_records: counts.total,
        new_leads: counts.new,
        updated_leads: counts.update,
        skipped_unsubscribed: counts.skipUnsubscribed,
        skipped_invalid: counts.skipInvalid,
        notes: "SiteEntry manual import",
      });
      if (batchError) throw batchError;

      toast({
        title: "Import committed",
        description: `${counts.new} new, ${counts.update} updated. No emails were sent.`,
      });
      setPreview([]);
      setFilename(null);
      setSchemaVersion(null);
      retryBatches();
    } catch (err) {
      toast({
        title: "Import failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setCommitting(false);
    }
  };

  return (
    <AdminLayout title="Audits and Leads">
      <p className="mb-4 text-sm text-muted-foreground">
        Import a SiteEntry JSON export. This ingests leads only and never sends email.
      </p>

      <Card
        className={cn(
          "mb-4 border-dashed transition-colors-fast",
          dragOver && "border-accent/40 bg-accent/5"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
      >
        <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Upload className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} />
          <div>
            <p className="text-sm text-foreground">Drop a SiteEntry export here</p>
            <p className="text-xs text-muted-foreground">JSON, schema_version 1.0</p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <label className="cursor-pointer">
              <FileUp className="h-4 w-4" strokeWidth={1.5} />
              Choose file
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
          </Button>
        </CardContent>
      </Card>

      {parseError && (
        <Card className="mb-4 border-destructive/40">
          <CardContent className="py-4 text-sm text-destructive">{parseError}</CardContent>
        </Card>
      )}

      {preview.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Import preview</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {filename} · {counts.total} rows · {counts.new} new · {counts.update} updates ·{" "}
                {counts.skipUnsubscribed} suppressed · {counts.skipInvalid} invalid
              </p>
            </div>
            <Button
              size="sm"
              onClick={commit}
              disabled={committing || (counts.new === 0 && counts.update === 0)}
            >
              {committing ? "Committing…" : "Confirm import"}
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-border bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Business</th>
                  <th className="px-3 py-2">Domain</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {preview.map((row) => (
                  <tr key={row.key}>
                    <td className="px-3 py-2.5">{row.business_name}</td>
                    <td className="px-3 py-2.5 font-mono-nums text-xs">{row.domain}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{row.contact_email || "None"}</td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant={
                          row.status === "new"
                            ? "success"
                            : row.status === "update"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {row.status}
                      </Badge>
                      {row.reason && (
                        <span className="ml-2 text-xs text-muted-foreground">{row.reason}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Past import batches</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingBatches ? (
            <Skeleton className="h-24 w-full" />
          ) : batchesError ? (
            <LoadError message={batchesError} onRetry={retryBatches} />
          ) : batches.length === 0 ? (
            <EmptyState icon={FileUp} message="No imports yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs text-muted-foreground">
                  <tr>
                    <th className="px-2 py-2">When</th>
                    <th className="px-2 py-2">File</th>
                    <th className="px-2 py-2">Total</th>
                    <th className="px-2 py-2">New</th>
                    <th className="px-2 py-2">Updated</th>
                    <th className="px-2 py-2">Skipped</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {batches.map((b) => (
                    <tr key={b.id}>
                      <td className="px-2 py-2 text-muted-foreground">
                        {format(new Date(b.imported_at), "PPp")}
                      </td>
                      <td className="px-2 py-2">{b.filename}</td>
                      <td className="px-2 py-2 font-mono-nums">{b.total_records}</td>
                      <td className="px-2 py-2 font-mono-nums">{b.new_leads}</td>
                      <td className="px-2 py-2 font-mono-nums">{b.updated_leads}</td>
                      <td className="px-2 py-2 font-mono-nums">
                        {b.skipped_unsubscribed + b.skipped_invalid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
