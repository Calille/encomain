/**
 * Upload an audit PDF to the private outreach-audits bucket and store the path on the lead.
 * Path convention: audits/<lead_id>/<filename>.pdf
 */
import { supabase } from "./supabase";

function sanitiseFilename(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/_+/g, "_");
  const withExt = /\.pdf$/i.test(base) ? base : `${base || "audit"}.pdf`;
  return withExt.slice(0, 120);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const cleaned = base64.replace(/^data:application\/pdf;base64,/i, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function uploadLeadAuditPdf(options: {
  leadId: string;
  filename: string;
  bytes?: Uint8Array | Blob | File;
  base64?: string;
}): Promise<{ path: string } | { error: string; skipped?: boolean }> {
  const filename = sanitiseFilename(options.filename || "audit.pdf");
  const storagePath = `audits/${options.leadId}/${filename}`;

  let body: Blob | File | Uint8Array;
  if (options.bytes) {
    body = options.bytes;
  } else if (options.base64) {
    body = base64ToUint8Array(options.base64);
  } else {
    return {
      error: "No PDF bytes in import payload; skipping upload (manual upload later).",
      skipped: true,
    };
  }

  const { error: uploadError } = await supabase.storage
    .from("outreach-audits")
    .upload(storagePath, body, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update({ audit_pdf_storage_path: storagePath })
    .eq("id", options.leadId);

  if (updateError) {
    return { error: updateError.message };
  }

  return { path: storagePath };
}
