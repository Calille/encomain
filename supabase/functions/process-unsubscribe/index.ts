/**
 * Public unsubscribe handler.
 * Looks up email_events.unsubscribe_token, suppresses the address, marks the lead.
 * No auth required. Origin-allowlisted CORS.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";

interface Body {
  token?: string;
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

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: Body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = body.token?.trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "token is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: event, error: eventError } = await supabaseAdmin
      .from("email_events")
      .select("id, lead_id, unsubscribe_token")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: "Invalid or unknown token" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: lead } = await supabaseAdmin
      .from("leads")
      .select("id, contact_email")
      .eq("id", event.lead_id)
      .maybeSingle();

    if (!lead?.contact_email) {
      return new Response(JSON.stringify({ error: "Lead email not found for token" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = String(lead.contact_email).toLowerCase().trim();

    const { error: suppressError } = await supabaseAdmin.from("email_suppression").upsert(
      {
        email,
        reason: "unsubscribe_link",
        unsubscribe_token: token,
        suppressed_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

    if (suppressError) {
      console.error("suppression upsert failed:", suppressError);
      return new Response(JSON.stringify({ error: "Failed to suppress email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabaseAdmin
      .from("leads")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", lead.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("process-unsubscribe error:", error);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
