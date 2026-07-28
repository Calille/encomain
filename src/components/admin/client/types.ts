import { Tables } from "../../../types/supabase";

export type ClientUser = Tables<"users">;
export type ClientInvoice = Tables<"invoices">;
export type ClientPayment = Tables<"payments">;
export type ClientCreditNote = Tables<"credit_notes">;
export type ClientSchedule = Tables<"recurring_invoice_schedules">;
export type ClientReminder = Tables<"payment_reminders">;
export type ClientWebsite = Tables<"websites">;
export type ClientTicket = Tables<"support_tickets">;
export type ClientProjectUpdate = Tables<"project_updates">;
export type ClientEmailEvent = Tables<"email_events">;

export type ClientNote = Tables<"client_notes"> & {
  author?: { full_name: string | null; email: string } | null;
};

export type AdminOption = {
  id: string;
  full_name: string | null;
  email: string;
};

export type ClientDetailData = {
  user: ClientUser;
  websites: ClientWebsite[];
  invoices: ClientInvoice[];
  tickets: ClientTicket[];
  updates: ClientProjectUpdate[];
  payments: ClientPayment[];
  creditNotes: ClientCreditNote[];
  schedules: ClientSchedule[];
  notes: ClientNote[];
  emailEvents: ClientEmailEvent[];
  reminders: ClientReminder[];
  admins: AdminOption[];
};

export function isOutstandingInvoice(inv: ClientInvoice): boolean {
  if (inv.voided_at || inv.status === "voided") return false;
  return inv.status === "sent" || inv.status === "overdue";
}

export function isOverdueInvoice(inv: ClientInvoice, today = new Date()): boolean {
  if (inv.voided_at || inv.status === "voided") return false;
  if (inv.status === "overdue") return true;
  if (inv.status !== "sent") return false;
  const due = new Date(inv.due_date);
  due.setHours(0, 0, 0, 0);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  return due < t;
}

export function formatGbp(amount: number): string {
  return `£${Number(amount).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function clientInitials(
  fullName: string | null | undefined,
  email: string
): string {
  const source = (fullName || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Compute next invoice date from start_date and day_of_month (1-28). */
export function computeNextInvoiceDate(
  startDate: string,
  dayOfMonth: number
): string {
  const start = new Date(startDate + "T00:00:00");
  const y = start.getFullYear();
  const m = start.getMonth();
  let candidate = new Date(y, m, dayOfMonth);
  candidate.setHours(0, 0, 0, 0);
  if (candidate < start) {
    candidate = new Date(y, m + 1, dayOfMonth);
  }
  const yy = candidate.getFullYear();
  const mm = String(candidate.getMonth() + 1).padStart(2, "0");
  const dd = String(candidate.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Next reminder label from current max level (0 if none) and days overdue.
 * Thresholds: L1 at 3d, L2 at 7d, L3 at 14d, L4 at 30d.
 */
export function nextReminderLabel(
  currentLevel: number,
  daysOverdue: number
): string {
  const thresholds = [
    { level: 1, days: 3 },
    { level: 2, days: 7 },
    { level: 3, days: 14 },
    { level: 4, days: 30 },
  ];
  if (currentLevel >= 4) return "Complete";
  for (const t of thresholds) {
    if (currentLevel < t.level && daysOverdue >= t.days) {
      return `L${t.level} due`;
    }
  }
  const next = thresholds.find((t) => t.level === currentLevel + 1);
  if (!next) return "Complete";
  const remaining = next.days - daysOverdue;
  return `L${next.level} in ${Math.max(remaining, 0)}d`;
}

export function invoiceStatusVariant(
  status: string
): "success" | "destructive" | "warning" | "secondary" | "default" {
  if (status === "paid") return "success";
  if (status === "overdue") return "destructive";
  if (status === "voided") return "secondary";
  if (status === "sent") return "warning";
  return "secondary";
}
