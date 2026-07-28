import { useMemo, useState } from "react";
import { format, isSameMonth, parseISO } from "date-fns";
import { FileText, CreditCard, Calendar } from "lucide-react";
import { MetricCard } from "../../ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Switch } from "../../ui/switch";
import { Input } from "../../ui/input";
import { EmptyState } from "../../ui/empty-state";
import { supabase } from "../../../lib/supabase";
import { toast } from "../../../hooks/use-toast";
import {
  compareValues,
  SortIcon,
  useTableSort,
} from "../../../hooks/useTableSort";
import {
  ClientDetailData,
  ClientInvoice,
  ClientSchedule,
  formatGbp,
  invoiceStatusVariant,
  isOutstandingInvoice,
} from "./types";
import { InvoiceDetailDialog } from "./invoice-detail-dialog";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { RecurringScheduleDialog } from "./recurring-schedule-dialog";
import { VoidInvoiceDialog } from "./void-invoice-dialog";

type InvoiceSortKey =
  | "invoice_number"
  | "description"
  | "amount"
  | "issue_date"
  | "due_date"
  | "status";

type Props = {
  data: ClientDetailData;
  onRefresh: () => void;
};

export function ClientBillingTab({ data, onRefresh }: Props) {
  const {
    user,
    invoices,
    payments,
    creditNotes,
    schedules,
  } = data;

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { sort, cycleSort } = useTableSort<InvoiceSortKey>();

  const [invoiceDialog, setInvoiceDialog] = useState<{
    mode: "view" | "edit" | "create";
    invoice: ClientInvoice | null;
  } | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState<{
    schedule: ClientSchedule | null;
  } | null>(null);
  const [voidInvoice, setVoidInvoice] = useState<ClientInvoice | null>(null);
  const [togglingReminders, setTogglingReminders] = useState(false);

  const now = new Date();
  const outstanding = invoices
    .filter(isOutstandingInvoice)
    .reduce((s, i) => s + Number(i.amount), 0);
  const nextScheduleDate = schedules
    .filter((s) => s.is_active)
    .map((s) => s.next_invoice_date)
    .sort()[0];
  // Prefer sum of payments for LTV if we have payment rows; else paid invoices
  const ltv =
    payments.length > 0
      ? payments.reduce((s, p) => s + Number(p.amount), 0)
      : invoices
          .filter((i) => i.status === "paid" && !i.voided_at)
          .reduce((s, i) => s + Number(i.amount), 0);

  const monthSpend = payments
    .filter((p) => {
      try {
        return isSameMonth(parseISO(p.paid_at), now);
      } catch {
        return false;
      }
    })
    .reduce((s, p) => s + Number(p.amount), 0);

  const filteredInvoices = useMemo(() => {
    let list = invoices.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      try {
        const issueMs = parseISO(r.issue_date).getTime();
        if (dateFrom && issueMs < parseISO(dateFrom).getTime()) return false;
        if (dateTo && issueMs > parseISO(dateTo).getTime()) return false;
      } catch {
        return false;
      }
      return true;
    });
    if (sort.key && sort.direction) {
      const dir = sort.direction;
      const key = sort.key;
      list = [...list].sort((a, b) => {
        switch (key) {
          case "invoice_number":
            return compareValues(a.invoice_number, b.invoice_number, dir);
          case "description":
            return compareValues(a.description || "", b.description || "", dir);
          case "amount":
            return compareValues(Number(a.amount), Number(b.amount), dir);
          case "issue_date":
            return compareValues(
              new Date(a.issue_date).getTime(),
              new Date(b.issue_date).getTime(),
              dir
            );
          case "due_date":
            return compareValues(
              new Date(a.due_date).getTime(),
              new Date(b.due_date).getTime(),
              dir
            );
          case "status":
            return compareValues(a.status, b.status, dir);
          default:
            return 0;
        }
      });
    }
    return list;
  }, [invoices, statusFilter, dateFrom, dateTo, sort]);

  const toggleReminders = async (paused: boolean) => {
    setTogglingReminders(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ reminders_paused: paused })
        .eq("id", user.id);
      if (error) throw error;
      toast({
        title: paused ? "Reminders paused" : "Reminders resumed",
      });
      onRefresh();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update reminders.",
        variant: "destructive",
      });
    } finally {
      setTogglingReminders(false);
    }
  };

  const pauseSchedule = async (schedule: ClientSchedule) => {
    const { error } = await supabase
      .from("recurring_invoice_schedules")
      .update({ is_active: !schedule.is_active })
      .eq("id", schedule.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: schedule.is_active ? "Schedule paused" : "Schedule resumed",
    });
    onRefresh();
  };

  const deleteSchedule = async (schedule: ClientSchedule) => {
    const linked = invoices.some((i) => i.schedule_id === schedule.id);
    if (linked) {
      const { error } = await supabase
        .from("recurring_invoice_schedules")
        .update({ is_active: false })
        .eq("id", schedule.id);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Schedule paused",
        description:
          "This schedule has linked invoices, so it was paused instead of deleted.",
      });
      onRefresh();
      return;
    }
    const { error } = await supabase
      .from("recurring_invoice_schedules")
      .delete()
      .eq("id", schedule.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Schedule deleted" });
    onRefresh();
  };

  const markPaid = async (inv: ClientInvoice) => {
    if (inv.voided_at || inv.status === "voided") return;
    const { error } = await supabase
      .from("invoices")
      .update({
        status: "paid",
        paid_date: format(new Date(), "yyyy-MM-dd"),
      })
      .eq("id", inv.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Invoice marked paid" });
    onRefresh();
  };

  const headerButton = (key: InvoiceSortKey, label: string) => (
    <button
      type="button"
      onClick={() => cycleSort(key)}
      className="inline-flex items-center font-medium text-muted-foreground transition-colors-fast hover:text-foreground"
    >
      {label}
      <SortIcon active={sort.key === key} direction={sort.direction} />
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Outstanding"
          value={outstanding}
          decimals={2}
          prefix="£"
          icon={FileText}
        />
        <MetricCard
          label="Next scheduled"
          value={0}
          icon={Calendar}
          formatValue={() =>
            nextScheduleDate
              ? format(parseISO(nextScheduleDate), "dd MMM yyyy")
              : "None"
          }
        />
        <MetricCard
          label="Lifetime value"
          value={ltv}
          decimals={2}
          prefix="£"
          icon={CreditCard}
        />
        <MetricCard
          label="This month"
          value={monthSpend}
          decimals={2}
          prefix="£"
          icon={CreditCard}
        />
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm font-medium">Payment reminders</p>
            <p className="text-xs text-muted-foreground">
              Pause automatic chase emails for this client.
            </p>
          </div>
          <Switch
            checked={user.reminders_paused}
            disabled={togglingReminders}
            onCheckedChange={toggleReminders}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Recurring schedules</CardTitle>
          <Button
            size="sm"
            onClick={() => setScheduleDialog({ schedule: null })}
          >
            Add schedule
          </Button>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <EmptyState icon={Calendar} message="No recurring schedules." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Frequency</th>
                    <th className="px-3 py-2">Next</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {schedules.map((s) => (
                    <tr key={s.id}>
                      <td className="px-3 py-2.5">{s.template_description}</td>
                      <td className="px-3 py-2.5 font-mono-nums">
                        {formatGbp(s.amount)}
                      </td>
                      <td className="px-3 py-2.5 capitalize">{s.frequency}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {format(parseISO(s.next_invoice_date), "PP")}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={s.is_active ? "success" : "secondary"}>
                          {s.is_active ? "Active" : "Paused"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setScheduleDialog({ schedule: s })}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => pauseSchedule(s)}
                          >
                            {s.is_active ? "Pause" : "Resume"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSchedule(s)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => setInvoiceDialog({ mode: "create", invoice: null })}
        >
          Create invoice
        </Button>
        <Button size="sm" variant="outline" onClick={() => setPayOpen(true)}>
          Record payment
        </Button>
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="voided">Voided</option>
        </select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-9 w-auto"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-9 w-auto"
        />
      </div>

      {filteredInvoices.length === 0 ? (
        <Card>
          <EmptyState icon={FileText} message="No invoices match your filters." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">
                    {headerButton("invoice_number", "Number")}
                  </th>
                  <th className="px-3 py-2">
                    {headerButton("description", "Description")}
                  </th>
                  <th className="px-3 py-2">{headerButton("amount", "Amount")}</th>
                  <th className="px-3 py-2">
                    {headerButton("issue_date", "Issue")}
                  </th>
                  <th className="px-3 py-2">{headerButton("due_date", "Due")}</th>
                  <th className="px-3 py-2">{headerButton("status", "Status")}</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((inv) => {
                  const voided = Boolean(inv.voided_at || inv.status === "voided");
                  return (
                    <tr key={inv.id} className={voided ? "opacity-70" : undefined}>
                      <td
                        className={`px-3 py-2.5 font-mono-nums ${voided ? "line-through" : ""}`}
                      >
                        {inv.invoice_number}
                      </td>
                      <td className="px-3 py-2.5">
                        {inv.description || "Not set"}
                      </td>
                      <td className="px-3 py-2.5 font-mono-nums">
                        {formatGbp(inv.amount)}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {format(parseISO(inv.issue_date), "PP")}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {format(parseISO(inv.due_date), "PP")}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={invoiceStatusVariant(inv.status)}>
                            {inv.status}
                          </Badge>
                          {voided && (
                            <Badge variant="secondary">VOIDED</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setInvoiceDialog({ mode: "view", invoice: inv })
                            }
                          >
                            View
                          </Button>
                          {!voided && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setInvoiceDialog({
                                    mode: "edit",
                                    invoice: inv,
                                  })
                                }
                              >
                                Edit
                              </Button>
                              {inv.status !== "paid" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markPaid(inv)}
                                >
                                  Mark paid
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setVoidInvoice(inv)}
                              >
                                Void
                              </Button>
                            </>
                          )}
                          {inv.pdf_url && (
                            <Button size="sm" variant="ghost" asChild>
                              <a
                                href={inv.pdf_url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                PDF
                              </a>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Payments log</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState icon={CreditCard} message="No payments recorded." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2">Reference</th>
                    <th className="px-3 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {format(new Date(p.paid_at), "PP")}
                      </td>
                      <td className="px-3 py-2.5 font-mono-nums">
                        {formatGbp(p.amount)}
                      </td>
                      <td className="px-3 py-2.5 capitalize">
                        {p.payment_method.replace(/_/g, " ")}
                      </td>
                      <td className="px-3 py-2.5 font-mono-nums text-muted-foreground">
                        {p.payment_reference || "Not set"}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {p.notes || "Not set"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Credit notes</CardTitle>
        </CardHeader>
        <CardContent>
          {creditNotes.length === 0 ? (
            <EmptyState icon={FileText} message="No credit notes." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Number</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Issued</th>
                    <th className="px-3 py-2">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {creditNotes.map((c) => (
                    <tr key={c.id}>
                      <td className="px-3 py-2.5 font-mono-nums">
                        {c.credit_number}
                      </td>
                      <td className="px-3 py-2.5 font-mono-nums">
                        {formatGbp(c.amount)}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {format(new Date(c.issued_at), "PP")}
                      </td>
                      <td className="px-3 py-2.5">{c.reason || "Not set"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {invoiceDialog && (
        <InvoiceDetailDialog
          open
          onOpenChange={(o) => {
            if (!o) setInvoiceDialog(null);
          }}
          mode={invoiceDialog.mode}
          userId={user.id}
          clientEmail={user.billing_email || user.email}
          clientName={user.full_name}
          paymentTermsDays={user.payment_terms_days || 14}
          invoice={invoiceDialog.invoice}
          payments={payments}
          onSaved={onRefresh}
        />
      )}

      <RecordPaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        userId={user.id}
        clientEmail={user.billing_email || user.email}
        clientName={user.full_name}
        invoices={invoices}
        onSaved={onRefresh}
      />

      {scheduleDialog && (
        <RecurringScheduleDialog
          open
          onOpenChange={(o) => {
            if (!o) setScheduleDialog(null);
          }}
          userId={user.id}
          schedule={scheduleDialog.schedule}
          onSaved={onRefresh}
        />
      )}

      <VoidInvoiceDialog
        open={Boolean(voidInvoice)}
        onOpenChange={(o) => {
          if (!o) setVoidInvoice(null);
        }}
        invoice={voidInvoice}
        onSaved={onRefresh}
      />
    </div>
  );
}
