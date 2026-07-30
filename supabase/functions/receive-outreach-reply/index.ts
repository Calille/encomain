/**
 * Resend Inbound webhook: capture replies to <token>@reply.theenclosure.co.uk.
 * Verifies Svix signature (RESEND_INBOUND_WEBHOOK_SECRET).
 * Webhook payload is metadata only — body fetched via Resend Receiving API.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendEmail } from "../_shared/email-service.ts";

const REPLY_DOMAIN = "reply.theenclosure.co.uk";
const SITE = "https://theenclosure.co.uk";
const NOTIFY_TO = "josh@theenclosure.co.uk";

type Json = Record<string, unknown>;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

/**
 * Verify Resend/Svix webhook signature.
 * Secret format: whsec_<base64>
 */
async function verifySvixSignature(
  payload: string,
  headers: Headers,
  secret: string,
): Promise<boolean> {
  const msgId = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatureHeader = headers.get("svix-signature");
  if (!msgId || !timestamp || !signatureHeader) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const ageSec = Math.abs(Date.now() / 1000 - ts);
  if (ageSec > 60 * 5) return false; // 5 minute tolerance

  const secretPart = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  const keyBytes = Uint8Array.from(atob(secretPart), (c) => c.charCodeAt(0));
  const signedContent = `${msgId}.${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent),
  );
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));

  const candidates = signatureHeader.split(" ").map((part) => {
    const [, sig] = part.split(",", 2);
    return sig || "";
  });

  return candidates.some((sig) => sig && timingSafeEqual(sig, expected));
}

function extractToken(toAddresses: string[]): string | null {
  for (const raw of toAddresses) {
    const match = String(raw)
      .toLowerCase()
      .match(/(?:^|<)?([a-z0-9_-]{16,64})@reply\.theenclosure\.co\.uk(?:>|$)/i);
    if (match?.[1]) return match[1];
  }
  return null;
}

function parseFrom(from: string): { email: string; name: string | null } {
  const angle = from.match(/^(.*?)\s*<([^>]+)>$/);
  if (angle) {
    return {
      name: angle[1].replace(/^["']|["']$/g, "").trim() || null,
      email: angle[2].trim().toLowerCase(),
    };
  }
  return { email: from.trim().toLowerCase(), name: null };
}

async function fetchReceivingBody(
  emailId: string,
  apiKey: string,
): Promise<{ text: string | null; html: string | null }> {
  try {
    const res = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      console.error("receiving.get failed", res.status, await res.text());
      return { text: null, html: null };
    }
    const data = await res.json();
    return {
      text: typeof data.text === "string" ? data.text : null,
      html: typeof data.html === "string" ? data.html : null,
    };
  } catch (err) {
    console.error("receiving.get error", err);
    return { text: null, html: null };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const secret = Deno.env.get("RESEND_INBOUND_WEBHOOK_SECRET") ?? "";
  const rawBody = await req.text();

  if (!secret) {
    console.error("RESEND_INBOUND_WEBHOOK_SECRET not set");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const valid = await verifySvixSignature(rawBody, req.headers, secret);
  if (!valid) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let event: Json;
  try {
    event = JSON.parse(rawBody) as Json;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Acknowledge non-received events so Resend does not retry forever
  if (event.type !== "email.received") {
    return new Response(JSON.stringify({ ok: true, ignored: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = (event.data || {}) as Json;
  const toList = Array.isArray(data.to)
    ? (data.to as unknown[]).map(String)
    : typeof data.to === "string"
      ? [data.to]
      : [];
  const receivedFor = Array.isArray(data.received_for)
    ? (data.received_for as unknown[]).map(String)
    : [];
  const recipients = [...toList, ...receivedFor];
  const token = extractToken(recipients);
  const fromRaw = typeof data.from === "string" ? data.from : "";
  const { email: fromEmail, name: fromName } = parseFrom(fromRaw);
  const subject = typeof data.subject === "string" ? data.subject : null;
  const resendMessageId =
    (typeof data.email_id === "string" && data.email_id) ||
    (typeof data.message_id === "string" && data.message_id) ||
    null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (!token) {
    await supabase.from("unmatched_inbound").insert({
      to_address: recipients.join(", ") || null,
      from_email: fromEmail || null,
      subject,
      resend_message_id: resendMessageId,
      raw_payload: event,
      notes: "No reply token found in recipient address",
    });
    return new Response(JSON.stringify({ ok: true, unmatched: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("id, business_name, reply_token, reply_count, first_replied_at, status")
    .eq("reply_token", token)
    .maybeSingle();

  if (!lead) {
    await supabase.from("unmatched_inbound").insert({
      to_address: `${token}@${REPLY_DOMAIN}`,
      from_email: fromEmail || null,
      subject,
      resend_message_id: resendMessageId,
      raw_payload: event,
      notes: "Token did not match any lead",
    });
    return new Response(JSON.stringify({ ok: true, unmatched: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Dedup
  if (resendMessageId) {
    const { data: existing } = await supabase
      .from("outreach_replies")
      .select("id")
      .eq("resend_message_id", resendMessageId)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const emailId = typeof data.email_id === "string" ? data.email_id : null;
  const body =
    emailId && resendKey
      ? await fetchReceivingBody(emailId, resendKey)
      : { text: null, html: null };

  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from("outreach_replies").insert({
    lead_id: lead.id,
    from_email: fromEmail || "unknown",
    from_name: fromName,
    subject,
    body_text: body.text,
    body_html: body.html,
    received_at: now,
    resend_message_id: resendMessageId,
    raw_headers: {
      to: recipients,
      message_id: data.message_id ?? null,
      email_id: data.email_id ?? null,
    },
  });

  if (insertError) {
    // Unique conflict = duplicate
    if (insertError.code === "23505") {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("outreach_replies insert failed", insertError);
    return new Response(JSON.stringify({ error: "Failed to store reply" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  await supabase
    .from("leads")
    .update({
      first_replied_at: lead.first_replied_at || now,
      reply_count: (Number(lead.reply_count) || 0) + 1,
      status: lead.status === "contacted" || lead.status === "queued" || lead.status === "new"
        ? "responded"
        : lead.status,
    })
    .eq("id", lead.id);

  await supabase.from("email_events").insert({
    lead_id: lead.id,
    direction: "inbound",
    email_type: "reply_received",
    subject,
    body: body.text || body.html,
    sent_at: now,
    resend_message_id: resendMessageId,
  });

  // Notify Josh (best-effort)
  const crmUrl = `${SITE}/admin/outreach?lead=${lead.id}`;
  await sendEmail({
    to: NOTIFY_TO,
    subject: `New reply from ${lead.business_name}`,
    html: `<p>New outreach reply from <strong>${lead.business_name}</strong>.</p>
<p>From: ${fromName ? `${fromName} &lt;${fromEmail}&gt;` : fromEmail}</p>
<p>Subject: ${subject || "(no subject)"}</p>
<p><a href="${crmUrl}">Open in CRM</a></p>`,
    from: "The Enclosure <noreply@theenclosure.co.uk>",
    replyTo: "hello@theenclosure.co.uk",
  });

  return new Response(JSON.stringify({ ok: true, lead_id: lead.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
