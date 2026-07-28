/**
 * Scan overdue invoices and send the next payment reminder level when due.
 * Invoked daily by cron (service role) or manually by an admin.
 * Sends email directly (shared helper) rather than nesting HTTP calls.
 */
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import {
  assertServiceRoleOrAdmin,
  isAuthError,
} from "../_shared/admin-auth.ts";
import {
  daysBetween,
  nextReminderLevel,
  sendPaymentReminderForInvoice,
  todayIsoDate,
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
  const today = todayIsoDate();

  let scanned = 0;
  let reminded = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from("invoices")
      .select("id, user_id, due_date, status, voided_at")
      .in("status", ["sent", "overdue"])
      .lt("due_date", today)
      .is("voided_at", null);

    if (invoicesError) {
      return new Response(
        JSON.stringify({ error: invoicesError.message || "Failed to load invoices" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    for (const invoice of invoices || []) {
      scanned += 1;

      try {
        const { data: user, error: userError } = await supabaseAdmin
          .from("users")
          .select("id, reminders_paused")
          .eq("id", invoice.user_id)
          .maybeSingle();

        if (userError || !user) {
          failed += 1;
          console.error(
            `scan-overdue-invoices ${invoice.id}: user lookup failed`,
            userError,
          );
          continue;
        }

        if (user.reminders_paused) {
          skipped += 1;
          continue;
        }

        const { data: reminders, error: remindersError } = await supabaseAdmin
          .from("payment_reminders")
          .select("reminder_level")
          .eq("invoice_id", invoice.id)
          .order("reminder_level", { ascending: false })
          .limit(1);

        if (remindersError) {
          failed += 1;
          console.error(
            `scan-overdue-invoices ${invoice.id}: reminders lookup failed`,
            remindersError,
          );
          continue;
        }

        const maxLevel =
          reminders && reminders.length > 0
            ? Number(reminders[0].reminder_level)
            : null;

        const daysOverdue = daysBetween(invoice.due_date, today);
        const level = nextReminderLevel(daysOverdue, maxLevel);

        if (!level) {
          skipped += 1;
          continue;
        }

        const result = await sendPaymentReminderForInvoice(
          supabaseAdmin,
          invoice.id,
          level,
          { callerId },
        );

        if (!result.success) {
          failed += 1;
          console.error(
            `scan-overdue-invoices ${invoice.id}: send failed`,
            result.error,
          );
          continue;
        }

        reminded += 1;
      } catch (err) {
        failed += 1;
        console.error(`scan-overdue-invoices ${invoice.id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ scanned, reminded, skipped, failed }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("scan-overdue-invoices:", error);
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
