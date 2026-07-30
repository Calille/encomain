/**
 * Option B batch worker: send the next due outreach email in the earliest
 * active batch, then schedule next_send_at. Invoked by pg_cron every minute
 * (and manually via "Start batch" which sets status=sending + next_send_at).
 *
 * Payload optional: { batch_id? } — when provided, process that batch if due;
 * otherwise pick the earliest sending batch with next_send_at <= now().
 */
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import {
  assertServiceRoleOrAdmin,
  isAuthError,
} from "../_shared/admin-auth.ts";

interface Body {
  batch_id?: string;
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

    const { supabaseAdmin } = auth;
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    let body: Body = {};
    try {
      const text = await req.text();
      if (text.trim()) body = JSON.parse(text) as Body;
    } catch {
      // Empty cron body is fine
      body = {};
    }

    const nowIso = new Date().toISOString();
    let batchQuery = supabaseAdmin
      .from("outreach_batches")
      .select("*")
      .eq("status", "sending")
      .lte("next_send_at", nowIso)
      .order("started_at", { ascending: true })
      .limit(1);

    if (body.batch_id?.trim()) {
      batchQuery = supabaseAdmin
        .from("outreach_batches")
        .select("*")
        .eq("id", body.batch_id.trim())
        .eq("status", "sending")
        .limit(1);
    }

    const { data: batches, error: batchError } = await batchQuery;
    if (batchError) {
      console.error("run-outreach-batch: batch lookup failed", batchError);
      return new Response(JSON.stringify({ error: "Failed to load batch" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const batch = batches?.[0];
    if (!batch) {
      return new Response(JSON.stringify({ ok: true, sent: false, reason: "no_due_batch" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Respect next_send_at even when batch_id is forced (admin/cron race)
    if (batch.next_send_at && new Date(batch.next_send_at).getTime() > Date.now()) {
      return new Response(
        JSON.stringify({ ok: true, sent: false, reason: "not_due_yet", batch_id: batch.id }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: leads, error: leadsError } = await supabaseAdmin
      .from("leads")
      .select("id, sent_at, business_name")
      .eq("outreach_batch_id", batch.id)
      .order("created_at", { ascending: true });

    if (leadsError || !leads) {
      console.error("run-outreach-batch: leads lookup failed", leadsError);
      return new Response(JSON.stringify({ error: "Failed to load batch leads" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const index = Number(batch.next_lead_index) || 0;

    if (index >= leads.length) {
      await supabaseAdmin
        .from("outreach_batches")
        .update({
          status: "completed",
          completed_at: nowIso,
          next_send_at: null,
        })
        .eq("id", batch.id)
        .eq("status", "sending");

      return new Response(
        JSON.stringify({ ok: true, sent: false, reason: "completed", batch_id: batch.id }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const lead = leads[index];

    const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-outreach-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ lead_id: lead.id, batch_id: batch.id }),
    });

    let sendBody: Record<string, unknown> = {};
    try {
      sendBody = await sendRes.json();
    } catch {
      sendBody = {};
    }

    const hardFail = !sendRes.ok && !sendBody.skipped;
    const errorNote = hardFail
      ? `Lead ${lead.id} (${lead.business_name}): ${String(sendBody.error || sendRes.status)}`
      : null;

    const delayMs = Math.max(0, Number(batch.delay_seconds) || 30) * 1000;
    const nextIndex = index + 1;
    const finished = nextIndex >= leads.length;
    const nextSendAt = finished
      ? null
      : new Date(Date.now() + delayMs).toISOString();

    const update: Record<string, unknown> = {
      next_lead_index: nextIndex,
      next_send_at: nextSendAt,
    };

    if (errorNote) {
      const prev = typeof batch.error === "string" && batch.error ? `${batch.error}\n` : "";
      update.error = `${prev}${errorNote}`.slice(0, 8000);
    }

    if (finished) {
      update.status = "completed";
      update.completed_at = new Date().toISOString();
    }

    await supabaseAdmin
      .from("outreach_batches")
      .update(update)
      .eq("id", batch.id)
      .eq("status", "sending");

    return new Response(
      JSON.stringify({
        ok: true,
        sent: !hardFail && !sendBody.skipped,
        skipped: Boolean(sendBody.skipped),
        skip_reason: sendBody.reason || null,
        hard_fail: hardFail,
        batch_id: batch.id,
        lead_id: lead.id,
        next_lead_index: nextIndex,
        completed: finished,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("run-outreach-batch error:", error);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
