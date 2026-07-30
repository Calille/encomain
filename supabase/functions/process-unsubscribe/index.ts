/**
 * Public unsubscribe handler.
 * Accepts:
 *   GET  /process-unsubscribe?token=…  → friendly HTML page (Vercel rewrite target)
 *   POST { token }                     → JSON (legacy React page)
 *
 * Looks up lead.reply_token first, then falls back to email_events.unsubscribe_token
 * for older sends. Upserts email_suppression, sets lead.unsubscribed_at.
 * suppression_removals is for admin re-subscribe only — not used here.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";

interface Body {
  token?: string;
}

function successHtml(): string {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unsubscribed · The Enclosure</title>
  <style>
    body { margin: 0; font-family: Georgia, 'Times New Roman', serif; background: #F8FAF9; color: #1A1A1A; }
    .wrap { max-width: 28rem; margin: 4rem auto; padding: 2rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; }
    h1 { font-size: 1.35rem; font-weight: 600; margin: 0 0 1rem; }
    p { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 0.95rem; line-height: 1.55; color: #6b7280; margin: 0 0 1rem; }
    a { color: #1A4D2E; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>You have been unsubscribed</h1>
    <p>You will not receive further emails from The Enclosure. If this was a mistake, email <a href="mailto:hello@theenclosure.co.uk">hello@theenclosure.co.uk</a>.</p>
    <p><a href="https://theenclosure.co.uk/">Return home</a></p>
  </div>
</body>
</html>`;
}

function errorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unsubscribe · The Enclosure</title>
  <style>
    body { margin: 0; font-family: Georgia, 'Times New Roman', serif; background: #F8FAF9; color: #1A1A1A; }
    .wrap { max-width: 28rem; margin: 4rem auto; padding: 2rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; }
    h1 { font-size: 1.35rem; font-weight: 600; margin: 0 0 1rem; }
    p { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 0.95rem; line-height: 1.55; color: #6b7280; margin: 0 0 1rem; }
    a { color: #1A4D2E; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>We could not unsubscribe you</h1>
    <p>${message}</p>
    <p>Please contact <a href="mailto:hello@theenclosure.co.uk">hello@theenclosure.co.uk</a>.</p>
  </div>
</body>
</html>`;
}

async function processToken(
  supabaseAdmin: ReturnType<typeof createClient>,
  token: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  // Prefer lead.reply_token (current outreach system)
  let { data: lead } = await supabaseAdmin
    .from("leads")
    .select("id, contact_email, unsubscribed_at")
    .eq("reply_token", token)
    .maybeSingle();

  // Legacy: email_events.unsubscribe_token
  if (!lead) {
    const { data: event } = await supabaseAdmin
      .from("email_events")
      .select("id, lead_id")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (event?.lead_id) {
      const res = await supabaseAdmin
        .from("leads")
        .select("id, contact_email, unsubscribed_at")
        .eq("id", event.lead_id)
        .maybeSingle();
      lead = res.data;
    }
  }

  if (!lead?.contact_email) {
    return { ok: false, status: 404, error: "Invalid or unknown token" };
  }

  const email = String(lead.contact_email).toLowerCase().trim();
  const now = new Date().toISOString();

  // Idempotent: already unsubscribed → success page, no double-insert noise
  if (!lead.unsubscribed_at) {
    const { error: suppressError } = await supabaseAdmin.from("email_suppression").upsert(
      {
        email,
        reason: "unsubscribe_link",
        unsubscribe_token: token,
        suppressed_at: now,
      },
      { onConflict: "email" },
    );

    if (suppressError) {
      console.error("suppression upsert failed:", suppressError);
      return { ok: false, status: 500, error: "Failed to suppress email" };
    }

    await supabaseAdmin
      .from("leads")
      .update({
        status: "unsubscribed",
        unsubscribed_at: now,
      })
      .eq("id", lead.id);
  }

  return { ok: true };
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const wantsHtml = req.method === "GET" || req.method === "HEAD";

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      if (wantsHtml) {
        return new Response(errorHtml("Server configuration error."), {
          status: 500,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let token: string | undefined;

    if (req.method === "GET" || req.method === "HEAD") {
      token = new URL(req.url).searchParams.get("token")?.trim() || undefined;
    } else if (req.method === "POST") {
      let body: Body;
      try {
        body = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      token = body.token?.trim();
    } else {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!token) {
      if (wantsHtml) {
        return new Response(
          errorHtml("This unsubscribe link is missing a token."),
          { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
        );
      }
      return new Response(JSON.stringify({ error: "token is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const result = await processToken(supabaseAdmin, token);

    if (!result.ok) {
      if (wantsHtml) {
        return new Response(errorHtml(result.error), {
          status: result.status,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (wantsHtml) {
      return new Response(successHtml(), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("process-unsubscribe error:", error);
    if (req.method === "GET" || req.method === "HEAD") {
      return new Response(errorHtml("Unexpected server error."), {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
