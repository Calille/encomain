/**
 * Send outreach email to a lead via Resend.
 * Accepts admin JWT or service role (batch cron).
 * Payload: { lead_id, batch_id? }
 * Respects unsubscribed_at and email_suppression. Uses warmer outreach template.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import {
  assertServiceRoleOrAdmin,
  isAuthError,
} from "../_shared/admin-auth.ts";
import { sendEmail } from "../_shared/email-service.ts";
import { renderOutreachEmail } from "../_shared/email-templates.ts";

const SITE = "https://theenclosure.co.uk";
const REPLY_DOMAIN = "reply.theenclosure.co.uk";
const PACKAGES_URL = `${SITE}/pricing`;

interface OutreachBody {
  lead_id?: string;
  batch_id?: string | null;
}

/** 32-char URL-safe token (24 random bytes, base64url without padding). */
function randomReplyToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function readSubject(lead: Record<string, unknown>): string {
  const audit = (lead.audit_data || {}) as Record<string, unknown>;
  const fromAudit =
    typeof audit.outreach_draft_subject === "string"
      ? audit.outreach_draft_subject.trim()
      : "";
  if (fromAudit) return fromAudit;
  const business = String(lead.business_name || "your business");
  return `A quick look at ${business}`;
}

function readPackage(lead: Record<string, unknown>): string | null {
  const audit = (lead.audit_data || {}) as Record<string, unknown>;
  if (typeof audit.recommended_package === "string" && audit.recommended_package.trim()) {
    return audit.recommended_package.trim();
  }
  if (typeof audit.suggested_package === "string" && audit.suggested_package.trim()) {
    return audit.suggested_package.trim();
  }
  return null;
}

async function ensureReplyToken(
  supabaseAdmin: ReturnType<typeof createClient>,
  lead: Record<string, unknown>,
): Promise<{ token: string; email: string } | { error: string }> {
  if (
    typeof lead.reply_token === "string" &&
    lead.reply_token.length > 0 &&
    typeof lead.reply_token_email === "string" &&
    lead.reply_token_email.length > 0
  ) {
    return { token: lead.reply_token, email: lead.reply_token_email };
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const token = randomReplyToken();
    const email = `${token}@${REPLY_DOMAIN}`;
    const { error } = await supabaseAdmin
      .from("leads")
      .update({ reply_token: token, reply_token_email: email })
      .eq("id", lead.id as string);

    if (!error) {
      return { token, email };
    }

    // Unique violation — regenerate
    if (error.code === "23505") {
      continue;
    }
    console.error("ensureReplyToken failed:", error);
    return { error: "Failed to allocate reply token" };
  }

  return { error: "Failed to allocate unique reply token" };
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = await assertServiceRoleOrAdmin(req);
    if (isAuthError(auth)) return auth;

    const { supabaseAdmin, callerId } = auth;

    let body: OutreachBody;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const leadId = body.lead_id?.trim();
    const batchId = body.batch_id?.trim() || null;

    if (!leadId) {
      return new Response(JSON.stringify({ error: "lead_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError || !lead) {
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (lead.unsubscribed_at) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "unsubscribed" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!lead.contact_email) {
      return new Response(JSON.stringify({ error: "Lead has no contact_email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = String(lead.contact_email).toLowerCase().trim();

    const { data: suppressed } = await supabaseAdmin
      .from("email_suppression")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (suppressed) {
      return new Response(JSON.stringify({ skipped: true, reason: "suppressed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single-send retry guard. Batch sends may resend if explicitly re-included.
    if (lead.sent_at && !batchId) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "already_sent" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const tokenResult = await ensureReplyToken(supabaseAdmin, lead);
    if ("error" in tokenResult) {
      return new Response(JSON.stringify({ error: tokenResult.error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { token, email: replyTo } = tokenResult;
    const subject = readSubject(lead);
    const personalisedBody =
      typeof lead.personalised_email_draft === "string" &&
      lead.personalised_email_draft.trim()
        ? lead.personalised_email_draft
        : "We recently reviewed your public website and wanted to share a few observations.";

    const auditUrl = `${SITE}/audit/${token}`;
    const unsubscribeUrl = `${SITE}/unsubscribe/${token}`;

    const rendered = renderOutreachEmail({
      lead: {
        business_name: String(lead.business_name),
        contact_name: lead.contact_name,
        recommended_package: readPackage(lead),
      },
      personalisedBody,
      subject,
      auditUrl,
      packagesUrl: PACKAGES_URL,
      unsubscribeUrl,
    });

    const sendResult = await sendEmail({
      to: email,
      subject: rendered.subject,
      html: rendered.html,
      from: "The Enclosure <noreply@theenclosure.co.uk>",
      replyTo,
      idempotencyKey: batchId
        ? `outreach-batch-${batchId}-${leadId}`
        : `outreach-${leadId}-${token}`,
    });

    const now = new Date().toISOString();

    if (!sendResult.success) {
      await supabaseAdmin.from("email_events").insert({
        lead_id: leadId,
        direction: "outbound",
        email_type: "outreach_failed",
        subject: rendered.subject,
        body: personalisedBody,
        sent_by: callerId,
        sent_at: now,
        error_message: sendResult.error || "Send failed",
        unsubscribe_token: token,
      });

      return new Response(JSON.stringify({ error: sendResult.error || "Failed to send" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const leadUpdate: Record<string, unknown> = {
      sent_at: now,
      status: lead.status === "new" || lead.status === "queued" ? "contacted" : lead.status,
    };
    if (batchId) {
      leadUpdate.outreach_batch_id = batchId;
    }

    await supabaseAdmin.from("leads").update(leadUpdate).eq("id", leadId);

    const { error: eventError } = await supabaseAdmin.from("email_events").insert({
      lead_id: leadId,
      direction: "outbound",
      email_type: "outreach_sent",
      subject: rendered.subject,
      body: personalisedBody,
      sent_by: callerId,
      sent_at: now,
      resend_message_id: sendResult.messageId || null,
      unsubscribe_token: token,
    });

    if (eventError) {
      console.error("Failed to record email_events:", eventError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: sendResult.messageId,
        reply_token: token,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("send-outreach-email error:", error);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
