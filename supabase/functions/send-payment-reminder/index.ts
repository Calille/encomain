/**
 * Manually send a payment reminder for a single invoice.
 * Auth: service role Bearer or admin JWT.
 *
 * Body: { invoice_id: string, reminder_level: 1 | 2 | 3 | 4 }
 */
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import {
  assertServiceRoleOrAdmin,
  isAuthError,
} from "../_shared/admin-auth.ts";
import {
  sendPaymentReminderForInvoice,
  type ReminderLevel,
} from "../_shared/payment-reminders.ts";

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

  const auth = await assertServiceRoleOrAdmin(req);
  if (isAuthError(auth)) return auth;

  const { supabaseAdmin, callerId } = auth;

  let body: { invoice_id?: string; reminder_level?: number };
  try {
    body = await req.json();
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const invoiceId = body.invoice_id?.trim();
  const reminderLevel = body.reminder_level;

  if (!invoiceId) {
    return new Response(JSON.stringify({ error: "invoice_id is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (![1, 2, 3, 4].includes(Number(reminderLevel))) {
    return new Response(
      JSON.stringify({ error: "reminder_level must be 1, 2, 3, or 4" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const result = await sendPaymentReminderForInvoice(
      supabaseAdmin,
      invoiceId,
      Number(reminderLevel) as ReminderLevel,
      { callerId },
    );

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error || "Failed to send reminder" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("send-payment-reminder:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
