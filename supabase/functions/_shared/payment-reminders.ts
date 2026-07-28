/**
 * Shared payment-reminder send logic used by send-payment-reminder
 * and scan-overdue-invoices (avoids nested HTTP between functions).
 */
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { sendEmail } from "./email-service.ts";
import { renderPaymentReminderEmail } from "./email-templates.ts";

export type ReminderLevel = 1 | 2 | 3 | 4;

export type SendPaymentReminderResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(dueDate: string, today: string): number {
  const a = Date.parse(`${dueDate}T00:00:00Z`);
  const b = Date.parse(`${today}T00:00:00Z`);
  return Math.floor((b - a) / (24 * 60 * 60 * 1000));
}

/**
 * Load invoice + client, render template, send email, record
 * payment_reminders and email_events.
 */
export async function sendPaymentReminderForInvoice(
  supabaseAdmin: SupabaseClient,
  invoiceId: string,
  reminderLevel: ReminderLevel,
  options?: { callerId?: string | null; paymentUrl?: string },
): Promise<SendPaymentReminderResult> {
  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from("invoices")
    .select(
      "id, user_id, invoice_number, amount, currency, due_date, status, voided_at",
    )
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError || !invoice) {
    return {
      success: false,
      error: invoiceError?.message || "Invoice not found",
    };
  }

  if (invoice.voided_at) {
    return { success: false, error: "Invoice is voided" };
  }

  if (!["sent", "overdue"].includes(invoice.status)) {
    return {
      success: false,
      error: `Invoice status '${invoice.status}' is not eligible for reminders`,
    };
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, email, billing_email, full_name, reminders_paused")
    .eq("id", invoice.user_id)
    .maybeSingle();

  if (userError || !user) {
    return {
      success: false,
      error: userError?.message || "Client user not found",
    };
  }

  if (user.reminders_paused) {
    return { success: false, error: "Reminders are paused for this client" };
  }

  const to = (user.billing_email || user.email || "").trim();
  if (!to) {
    return { success: false, error: "Client has no billing or account email" };
  }

  const today = todayIsoDate();
  const daysOverdue = Math.max(0, daysBetween(invoice.due_date, today));

  const paymentUrl =
    options?.paymentUrl ||
    `https://theenclosure.co.uk/dashboard/payments`;

  const { subject, html } = renderPaymentReminderEmail({
    userName: user.full_name || undefined,
    invoiceNumber: invoice.invoice_number,
    amount: Number(invoice.amount),
    currency: invoice.currency || "GBP",
    dueDate: invoice.due_date,
    daysOverdue,
    reminderLevel,
    paymentUrl,
  });

  const sendResult = await sendEmail({
    to,
    subject,
    html,
    from: "The Enclosure <noreply@theenclosure.co.uk>",
    replyTo: "hello@theenclosure.co.uk",
    idempotencyKey: `payment-reminder-${invoiceId}-L${reminderLevel}`,
  });

  const emailStatus = sendResult.success ? "sent" : "failed";

  await supabaseAdmin.from("payment_reminders").insert({
    invoice_id: invoice.id,
    user_id: user.id,
    reminder_level: reminderLevel,
    email_status: emailStatus,
    resend_message_id: sendResult.messageId || null,
  });

  await supabaseAdmin.from("email_events").insert({
    user_id: user.id,
    direction: "outbound",
    email_type: "payment_reminder",
    subject,
    body: html,
    sent_by: options?.callerId || null,
    sent_at: new Date().toISOString(),
    resend_message_id: sendResult.messageId || null,
    error_message: sendResult.success ? null : sendResult.error || "Send failed",
  });

  if (invoice.status === "sent") {
    await supabaseAdmin
      .from("invoices")
      .update({ status: "overdue" })
      .eq("id", invoice.id)
      .eq("status", "sent");
  }

  if (!sendResult.success) {
    return {
      success: false,
      error: sendResult.error || "Failed to send payment reminder",
    };
  }

  return { success: true, messageId: sendResult.messageId };
}

/**
 * Decide the next reminder level for an overdue invoice, or null to skip.
 */
export function nextReminderLevel(
  daysOverdue: number,
  maxLevel: number | null,
): ReminderLevel | null {
  if (daysOverdue >= 3 && (maxLevel === null || maxLevel === 0)) return 1;
  if (daysOverdue >= 7 && maxLevel === 1) return 2;
  if (daysOverdue >= 14 && maxLevel === 2) return 3;
  if (daysOverdue >= 30 && maxLevel === 3) return 4;
  return null;
}

export { todayIsoDate, daysBetween };
