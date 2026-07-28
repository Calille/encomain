/**
 * Send outreach email to a lead via Resend.
 * Admin JWT required. Respects email_suppression. Never emails suppressed addresses.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email-service.ts";
import { renderEmail } from "../_shared/email-base-template.ts";

interface OutreachBody {
  lead_id?: string;
  subject?: string;
  body_html?: string;
}

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorisation header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseCaller = createClient(supabaseUrl, anonKey || serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await supabaseCaller.auth.getUser();

    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: callerProfile } = await supabaseAdmin
      .from("users")
      .select("id, role, status")
      .eq("id", caller.id)
      .maybeSingle();

    if (!callerProfile || callerProfile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
    const subject = body.subject?.trim();
    const bodyHtml = body.body_html?.trim();

    if (!leadId || !subject || !bodyHtml) {
      return new Response(
        JSON.stringify({ error: "lead_id, subject, and body_html are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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

    const unsubscribeToken = randomToken();
    const unsubscribeUrl = `https://theenclosure.co.uk/unsubscribe?token=${unsubscribeToken}`;
    const leadName = lead.business_name || lead.contact_name || 'there';
    const emailHtml = renderEmail({
      preheader: subject,
      heading: subject,
      bodyBlocks: [
        {
          type: 'text',
          content: `<p style="margin: 0 0 12px 0;">Hi ${leadName},</p>${bodyHtml}`,
        },
        {
          type: 'signoff',
          content:
            '<p style="margin: 0 0 12px 0;">Cheers,</p><p style="margin: 0 0 12px 0;">The Enclosure team</p>',
        },
      ],
      footerNote: `You are receiving this because we audited a public business website. <a href="${unsubscribeUrl}" style="color: #1A4D2E; text-decoration: underline;">Unsubscribe</a> to stop further emails from The Enclosure.`,
    });

    const sendResult = await sendEmail({
      to: email,
      subject,
      html: emailHtml,
      from: "The Enclosure <noreply@theenclosure.co.uk>",
      replyTo: "hello@theenclosure.co.uk",
      idempotencyKey: `outreach-${leadId}-${unsubscribeToken}`,
    });

    if (!sendResult.success) {
      await supabaseAdmin.from("email_events").insert({
        lead_id: leadId,
        direction: "outbound",
        subject,
        body: bodyHtml,
        sent_by: caller.id,
        sent_at: new Date().toISOString(),
        error_message: sendResult.error || "Send failed",
        unsubscribe_token: unsubscribeToken,
      });

      return new Response(JSON.stringify({ error: sendResult.error || "Failed to send" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: eventError } = await supabaseAdmin.from("email_events").insert({
      lead_id: leadId,
      direction: "outbound",
      subject,
      body: bodyHtml,
      sent_by: caller.id,
      sent_at: new Date().toISOString(),
      resend_message_id: sendResult.messageId || null,
      unsubscribe_token: unsubscribeToken,
    });

    if (eventError) {
      console.error("Failed to record email_events:", eventError);
    }

    if (lead.status === "new") {
      await supabaseAdmin
        .from("leads")
        .update({ status: "contacted" })
        .eq("id", leadId)
        .eq("status", "new");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: sendResult.messageId,
        unsubscribe_token: unsubscribeToken,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("send-outreach-email error:", error);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
