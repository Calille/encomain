import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { supabase } from "../../../lib/supabase";
import { toast } from "../../../hooks/use-toast";
import { sendPaymentReminder } from "../../../utils/emailHelpers";
import {
  ClientInvoice,
  ClientPayment,
  formatGbp,
  invoiceStatusVariant,
} from "./types";
import { VoidInvoiceDialog } from "./void-invoice-dialog";
import { CreditNoteDialog } from "./credit-note-dialog";
import { RecordPaymentDialog } from "./record-payment-dialog";

type Mode = "view" | "edit" | "create";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  userId: string;
  clientEmail: string;
  clientName: string | null;
  paymentTermsDays: number;
  invoice: ClientInvoice | null;
  payments: ClientPayment[];
  onSaved: () => void;
};

export function InvoiceDetailDialog({
  open,
  onOpenChange,
  mode: initialMode,
  userId,
  clientEmail,
  clientName,
  paymentTermsDays,
  invoice,
  payments,
  onSaved,
}: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("draft");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    if (invoice && initialMode !== "create") {
      setDescription(invoice.description || "");
      setAmount(String(invoice.amount));
      setIssueDate(invoice.issue_date);
      setDueDate(invoice.due_date);
      setStatus(invoice.status);
      setNotes(invoice.notes || "");
    } else {
      const today = new Date();
      const issue = format(today, "yyyy-MM-dd");
      const due = format(
        addDays(today, Math.max(paymentTermsDays || 14, 1)),
        "yyyy-MM-dd"
      );
      setDescription("");
      setAmount("");
      setIssueDate(issue);
      setDueDate(due);
      setStatus("draft");
      setNotes("");
    }
  }, [open, invoice, initialMode, paymentTermsDays]);

  const invoicePayments = invoice
    ? payments.filter((p) => p.invoice_id === invoice.id)
    : [];
  const isVoided = Boolean(invoice?.voided_at || invoice?.status === "voided");
  const canEdit = mode === "edit" || mode === "create";

  const validate = () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive invoice amount.",
        variant: "destructive",
      });
      return null;
    }
    if (!issueDate || !dueDate) {
      toast({
        title: "Missing dates",
        description: "Issue and due dates are required.",
        variant: "destructive",
      });
      return null;
    }
    if (dueDate < issueDate) {
      toast({
        title: "Invalid due date",
        description: "Due date must be on or after the issue date.",
        variant: "destructive",
      });
      return null;
    }
    if (!["draft", "sent", "paid", "overdue", "voided"].includes(status) && mode === "edit") {
      toast({
        title: "Invalid status",
        description: "Choose a valid invoice status.",
        variant: "destructive",
      });
      return null;
    }
    return amt;
  };

  const handleSave = async () => {
    const amt = validate();
    if (amt == null) return;

    setSaving(true);
    try {
      if (mode === "create") {
        const createStatus = status === "sent" ? "sent" : "draft";
        const { data: invoiceNumber, error: rpcError } = await supabase.rpc(
          "generate_invoice_number"
        );
        if (rpcError) throw rpcError;
        if (!invoiceNumber) throw new Error("Failed to generate invoice number.");

        const { error } = await supabase.from("invoices").insert({
          user_id: userId,
          invoice_number: invoiceNumber,
          description: description.trim() || null,
          amount: amt,
          currency: "GBP",
          issue_date: issueDate,
          due_date: dueDate,
          status: createStatus,
          notes: notes.trim() || null,
          sent_at: createStatus === "sent" ? new Date().toISOString() : null,
        });
        if (error) throw error;
        toast({ title: "Invoice created", description: invoiceNumber });
      } else if (invoice) {
        if (isVoided) {
          toast({
            title: "Cannot edit",
            description: "Voided invoices cannot be changed.",
            variant: "destructive",
          });
          return;
        }
        const { error } = await supabase
          .from("invoices")
          .update({
            description: description.trim() || null,
            amount: amt,
            issue_date: issueDate,
            due_date: dueDate,
            status,
            notes: notes.trim() || null,
          })
          .eq("id", invoice.id);
        if (error) throw error;
        toast({ title: "Invoice updated" });
        setMode("view");
      }
      onSaved();
      if (mode === "create") onOpenChange(false);
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save invoice.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async () => {
    if (!invoice || isVoided) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_date: format(new Date(), "yyyy-MM-dd"),
        })
        .eq("id", invoice.id);
      if (error) throw error;
      toast({ title: "Invoice marked paid" });
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to mark paid.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const sendReminder = async () => {
    if (!invoice || isVoided) return;
    setSaving(true);
    try {
      const { data: rem } = await supabase
        .from("payment_reminders")
        .select("reminder_level")
        .eq("invoice_id", invoice.id)
        .order("reminder_level", { ascending: false })
        .limit(1);
      const current = rem?.[0]?.reminder_level || 0;
      const nextLevel = Math.min(current + 1, 4);
      const result = await sendPaymentReminder(invoice.id, nextLevel);
      if (!result.success) {
        throw new Error(result.error || "Reminder failed.");
      }
      toast({
        title: "Reminder sent",
        description: `Level ${nextLevel} reminder queued.`,
      });
      onSaved();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to send reminder.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === "create"
                ? "Create invoice"
                : invoice?.invoice_number || "Invoice"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Draft or send a new invoice for this client."
                : "View and manage invoice details."}
            </DialogDescription>
          </DialogHeader>

          {invoice && mode === "view" && (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge
                variant={invoiceStatusVariant(invoice.status)}
                className={isVoided ? "line-through" : undefined}
              >
                {invoice.status}
              </Badge>
              {isVoided && (
                <Badge variant="secondary">VOIDED</Badge>
              )}
            </div>
          )}

          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="inv_desc">Description</Label>
              <Input
                id="inv_desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit || isVoided}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="inv_amount">Amount (£)</Label>
              <Input
                id="inv_amount"
                type="number"
                min={0.01}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!canEdit || isVoided}
                className="font-mono-nums"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="inv_issue">Issue date</Label>
                <Input
                  id="inv_issue"
                  type="date"
                  value={issueDate}
                  onChange={(e) => {
                    setIssueDate(e.target.value);
                    if (mode === "create") {
                      setDueDate(
                        format(
                          addDays(
                            new Date(e.target.value + "T00:00:00"),
                            Math.max(paymentTermsDays || 14, 1)
                          ),
                          "yyyy-MM-dd"
                        )
                      );
                    }
                  }}
                  disabled={!canEdit || isVoided}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="inv_due">Due date</Label>
                <Input
                  id="inv_due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={!canEdit || isVoided}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={mode === "create" ? (status === "sent" ? "sent" : "draft") : status}
                onValueChange={setStatus}
                disabled={!canEdit || isVoided}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mode === "create" ? (
                    <>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="voided" disabled>
                        Voided
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="inv_notes">Notes</Label>
              <Textarea
                id="inv_notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!canEdit || isVoided}
              />
            </div>

            {invoice && mode !== "create" && (
              <div>
                <p className="mb-2 text-sm font-medium">Payment history</p>
                {invoicePayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payments yet.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {invoicePayments.map((p) => (
                      <li
                        key={p.id}
                        className="flex justify-between border-b border-border py-1"
                      >
                        <span className="text-muted-foreground">
                          {format(new Date(p.paid_at), "PP")} ·{" "}
                          {p.payment_method.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono-nums">{formatGbp(p.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {invoice?.void_reason && (
              <p className="rounded-sm border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Void reason: {invoice.void_reason}
              </p>
            )}
          </div>

          <DialogFooter className="flex-wrap gap-2">
            {mode === "view" && invoice && !isVoided && (
              <>
                <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
                  Edit
                </Button>
                {invoice.status !== "paid" && (
                  <>
                    <Button variant="outline" size="sm" onClick={markPaid} disabled={saving}>
                      Mark paid
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPayOpen(true)}
                    >
                      Record payment
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={sendReminder}
                      disabled={saving}
                    >
                      Send reminder
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreditOpen(true)}
                >
                  Credit note
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setVoidOpen(true)}
                >
                  Void
                </Button>
              </>
            )}
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    mode === "edit" ? setMode("view") : onOpenChange(false)
                  }
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : mode === "create" ? "Create" : "Save"}
                </Button>
              </>
            )}
            {mode === "view" && (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VoidInvoiceDialog
        open={voidOpen}
        onOpenChange={setVoidOpen}
        invoice={invoice}
        onSaved={() => {
          onSaved();
          onOpenChange(false);
        }}
      />
      <CreditNoteDialog
        open={creditOpen}
        onOpenChange={setCreditOpen}
        userId={userId}
        invoice={invoice}
        onSaved={onSaved}
      />
      <RecordPaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        userId={userId}
        clientEmail={clientEmail}
        clientName={clientName}
        invoices={invoice ? [invoice] : []}
        defaultInvoiceId={invoice?.id}
        onSaved={() => {
          onSaved();
          onOpenChange(false);
        }}
      />
    </>
  );
}
