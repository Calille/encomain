import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "../../../hooks/use-toast";
import { sendPaymentReceipt } from "../../../utils/emailHelpers";
import { ClientInvoice } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  clientEmail: string;
  clientName: string | null;
  invoices: ClientInvoice[];
  defaultInvoiceId?: string | null;
  onSaved: () => void;
};

export function RecordPaymentDialog({
  open,
  onOpenChange,
  userId,
  clientEmail,
  clientName,
  invoices,
  defaultInvoiceId,
  onSaved,
}: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceId, setInvoiceId] = useState("none");
  const [saving, setSaving] = useState(false);

  const unpaidInvoices = invoices.filter(
    (i) =>
      !i.voided_at &&
      i.status !== "voided" &&
      i.status !== "paid"
  );

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().slice(0, 10);
    setPaidAt(today);
    setPaymentMethod("bank_transfer");
    setPaymentReference("");
    setNotes("");
    const def = defaultInvoiceId || "none";
    setInvoiceId(def);
    if (def !== "none") {
      const inv = invoices.find((i) => i.id === def);
      setAmount(inv ? String(inv.amount) : "");
    } else {
      setAmount("");
    }
  }, [open, defaultInvoiceId, invoices]);

  const handleSave = async () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive payment amount.",
        variant: "destructive",
      });
      return;
    }
    if (!paidAt) {
      toast({
        title: "Missing date",
        description: "Choose the payment date.",
        variant: "destructive",
      });
      return;
    }
    const methods = ["bank_transfer", "stripe", "cash", "cheque", "other"];
    if (!methods.includes(paymentMethod)) {
      toast({
        title: "Invalid method",
        description: "Choose a valid payment method.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const linkedId = invoiceId === "none" ? null : invoiceId;
      const { error } = await supabase.from("payments").insert({
        user_id: userId,
        amount: amt,
        currency: "GBP",
        payment_method: paymentMethod,
        payment_reference: paymentReference.trim() || null,
        paid_at: new Date(paidAt + "T12:00:00").toISOString(),
        notes: notes.trim() || null,
        invoice_id: linkedId,
        created_by: user?.id || null,
      });
      if (error) throw error;

      if (linkedId) {
        const { error: invErr } = await supabase
          .from("invoices")
          .update({
            status: "paid",
            paid_date: paidAt,
            payment_method: paymentMethod,
            payment_reference: paymentReference.trim() || null,
          })
          .eq("id", linkedId);
        if (invErr) throw invErr;
      }

      if (clientEmail) {
        const inv = linkedId
          ? invoices.find((i) => i.id === linkedId)
          : null;
        const transactionId = `txn-${Date.now()}`;
        void sendPaymentReceipt(
          clientEmail,
          {
            transactionId,
            invoiceNumber: inv?.invoice_number,
            amount: amt,
            currency: "GBP",
            paymentMethod: paymentMethod.replace(/_/g, " "),
            paymentDate: new Date(paidAt).toISOString(),
            status: "completed",
          },
          {
            userName: clientName || clientEmail.split("@")[0],
            receiptUrl: `https://theenclosure.co.uk/receipts/${transactionId}`,
            invoiceUrl: inv
              ? `https://theenclosure.co.uk/invoices/${inv.invoice_number}`
              : undefined,
          }
        ).catch((e) => console.error("Failed to send receipt:", e));
      }

      toast({ title: "Payment recorded" });
      onOpenChange(false);
      onSaved();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to record payment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Log a payment against this client account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="pay_amount">Amount (£)</Label>
            <Input
              id="pay_amount"
              type="number"
              min={0.01}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Payment method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pay_ref">Reference</Label>
            <Input
              id="pay_ref"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pay_at">Paid at</Label>
            <Input
              id="pay_at"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Link invoice (optional)</Label>
            <Select
              value={invoiceId}
              onValueChange={(v) => {
                setInvoiceId(v);
                if (v !== "none") {
                  const inv = unpaidInvoices.find((i) => i.id === v);
                  if (inv) setAmount(String(inv.amount));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {unpaidInvoices.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.invoice_number} · £{Number(inv.amount).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pay_notes">Notes</Label>
            <Textarea
              id="pay_notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Record payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
