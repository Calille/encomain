/**
 * Generate invoices from active recurring_invoice_schedules.
 * Invoked daily by cron (service role) or manually by an admin.
 */
import { buildCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email-service.ts";
import { renderInvoiceIssuedEmail } from "../_shared/email-templates.ts";
import {
  assertServiceRoleOrAdmin,
  isAuthError,
} from "../_shared/admin-auth.ts";

type ScheduleFrequency = "monthly" | "quarterly" | "annual";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Next invoice date from today, using day_of_month (1-28).
 * monthly = +1 month, quarterly = +3 months, annual = +1 year.
 */
function computeNextInvoiceDate(
  frequency: ScheduleFrequency,
  dayOfMonth: number,
  fromDate: string,
): string {
  const [yStr, mStr] = fromDate.split("-");
  let year = Number(yStr);
  let month = Number(mStr); // 1-12

  if (frequency === "monthly") {
    month += 1;
  } else if (frequency === "quarterly") {
    month += 3;
  } else {
    year += 1;
  }

  while (month > 12) {
    month -= 12;
    year += 1;
  }

  const day = Math.min(Math.max(dayOfMonth, 1), 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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

  const auth = await assertServiceRoleOrAdmin(req);
  if (isAuthError(auth)) return auth;

  const { supabaseAdmin, callerId } = auth;
  const today = todayIsoDate();

  let generated = 0;
  let failed = 0;
  let ended = 0;
  const errors: string[] = [];

  try {
    const { data: schedules, error: schedulesError } = await supabaseAdmin
      .from("recurring_invoice_schedules")
      .select(
        "id, user_id, template_description, amount, currency, frequency, day_of_month, end_date, next_invoice_date, notes, is_active",
      )
      .eq("is_active", true)
      .lte("next_invoice_date", today);

    if (schedulesError) {
      return new Response(
        JSON.stringify({ error: schedulesError.message || "Failed to load schedules" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    for (const schedule of schedules || []) {
      try {
        if (schedule.end_date && today > schedule.end_date) {
          await supabaseAdmin
            .from("recurring_invoice_schedules")
            .update({ is_active: false })
            .eq("id", schedule.id);
          ended += 1;
          continue;
        }

        const { data: user, error: userError } = await supabaseAdmin
          .from("users")
          .select("id, email, billing_email, full_name, payment_terms_days")
          .eq("id", schedule.user_id)
          .maybeSingle();

        if (userError || !user) {
          failed += 1;
          errors.push(
            `Schedule ${schedule.id}: ${userError?.message || "user not found"}`,
          );
          continue;
        }

        const termsDays =
          typeof user.payment_terms_days === "number" && user.payment_terms_days >= 0
            ? user.payment_terms_days
            : 14;
        const dueDate = addDays(today, termsDays);

        let invoiceNumber: string | null = null;
        const { data: rpcNumber, error: rpcError } = await supabaseAdmin.rpc(
          "generate_invoice_number",
        );
        if (!rpcError && typeof rpcNumber === "string" && rpcNumber) {
          invoiceNumber = rpcNumber;
        }

        const insertPayload: Record<string, unknown> = {
          user_id: schedule.user_id,
          amount: schedule.amount,
          currency: schedule.currency || "GBP",
          description: schedule.template_description,
          notes: schedule.notes || null,
          issue_date: today,
          due_date: dueDate,
          status: "sent",
          sent_at: new Date().toISOString(),
          schedule_id: schedule.id,
        };

        if (invoiceNumber) {
          insertPayload.invoice_number = invoiceNumber;
        } else {
          // Trigger set_invoice_number fills blank / null
          insertPayload.invoice_number = "";
        }

        const { data: invoice, error: insertError } = await supabaseAdmin
          .from("invoices")
          .insert(insertPayload)
          .select("id, invoice_number, amount, currency, issue_date, due_date, description")
          .single();

        if (insertError || !invoice) {
          failed += 1;
          errors.push(
            `Schedule ${schedule.id}: ${insertError?.message || "invoice insert failed"}`,
          );
          continue;
        }

        const nextDate = computeNextInvoiceDate(
          schedule.frequency as ScheduleFrequency,
          schedule.day_of_month,
          today,
        );

        // If the next date would fall after end_date, deactivate after this run
        const scheduleUpdate: Record<string, unknown> = {
          last_invoice_date: today,
          next_invoice_date: nextDate,
        };
        if (schedule.end_date && nextDate > schedule.end_date) {
          scheduleUpdate.is_active = false;
          ended += 1;
        }

        const { error: scheduleUpdateError } = await supabaseAdmin
          .from("recurring_invoice_schedules")
          .update(scheduleUpdate)
          .eq("id", schedule.id);

        if (scheduleUpdateError) {
          errors.push(
            `Schedule ${schedule.id}: invoice created but schedule update failed: ${scheduleUpdateError.message}`,
          );
        }

        const to = (user.billing_email || user.email || "").trim();
        if (to) {
          const invoiceUrl = `https://theenclosure.co.uk/dashboard/payments`;
          const { subject, html } = renderInvoiceIssuedEmail({
            userName: user.full_name || undefined,
            invoiceNumber: invoice.invoice_number,
            amount: Number(invoice.amount),
            currency: invoice.currency || "GBP",
            issueDate: invoice.issue_date,
            dueDate: invoice.due_date,
            description: invoice.description || schedule.template_description,
            invoiceUrl,
          });

          const sendResult = await sendEmail({
            to,
            subject,
            html,
            from: "The Enclosure <noreply@theenclosure.co.uk>",
            replyTo: "hello@theenclosure.co.uk",
            idempotencyKey: `invoice-issued-${invoice.id}`,
          });

          await supabaseAdmin.from("email_events").insert({
            user_id: user.id,
            direction: "outbound",
            email_type: "invoice",
            subject,
            body: html,
            sent_by: callerId,
            sent_at: new Date().toISOString(),
            resend_message_id: sendResult.messageId || null,
            error_message: sendResult.success
              ? null
              : sendResult.error || "Send failed",
          });

          if (!sendResult.success) {
            errors.push(
              `Schedule ${schedule.id}: invoice ${invoice.invoice_number} created but email failed: ${sendResult.error}`,
            );
          }
        } else {
          errors.push(
            `Schedule ${schedule.id}: invoice ${invoice.invoice_number} created but client has no email`,
          );
        }

        generated += 1;
      } catch (err) {
        failed += 1;
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`Schedule ${schedule.id}: ${message}`);
        console.error(`generate-scheduled-invoices schedule ${schedule.id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        generated,
        failed,
        ended,
        ...(errors.length > 0 ? { errors } : {}),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("generate-scheduled-invoices:", error);
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
