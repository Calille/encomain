/**
 * Public audit PDF redirect.
 * GET/POST ?token= (lead.reply_token). Records first pdf click, then 302 to a signed URL.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

const SITE = "https://theenclosure.co.uk";
const SIGNED_URL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getToken(req: Request): string | null {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("token")?.trim();
  if (fromQuery) return fromQuery;
  return null;
}

function redirect(to: string, status = 302): Response {
  return new Response(null, {
    status,
    headers: {
      Location: to,
      "Cache-Control": "no-store",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (req.method !== "GET" && req.method !== "POST" && req.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  const token = getToken(req);
  const invalidRedirect = redirect(`${SITE}/#audit-link-invalid`);

  if (!token) {
    return invalidRedirect;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("get-audit-pdf: missing env");
    return invalidRedirect;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, audit_pdf_storage_path, pdf_clicked_at, status")
    .eq("reply_token", token)
    .maybeSingle();

  if (leadError || !lead) {
    return invalidRedirect;
  }

  if (!lead.audit_pdf_storage_path) {
    console.warn("get-audit-pdf: lead has no audit PDF", lead.id);
    return invalidRedirect;
  }

  // First click only
  if (!lead.pdf_clicked_at) {
    const now = new Date().toISOString();
    await supabase
      .from("leads")
      .update({ pdf_clicked_at: now })
      .eq("id", lead.id)
      .is("pdf_clicked_at", null);

    await supabase.from("email_events").insert({
      lead_id: lead.id,
      direction: "outbound",
      email_type: "pdf_clicked",
      subject: "Audit PDF clicked",
      sent_at: now,
    });
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from("outreach-audits")
    .createSignedUrl(lead.audit_pdf_storage_path, SIGNED_URL_SECONDS);

  if (signedError || !signed?.signedUrl) {
    console.error("get-audit-pdf: signed URL failed", signedError);
    return invalidRedirect;
  }

  if (req.method === "HEAD") {
    return new Response(null, {
      status: 302,
      headers: { Location: signed.signedUrl, "Cache-Control": "no-store" },
    });
  }

  return redirect(signed.signedUrl);
});
