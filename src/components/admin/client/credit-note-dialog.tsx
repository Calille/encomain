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
import { Checkbox } from "../../ui/checkbox";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "../../../hooks/use-toast";
import { ClientInvoice } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  invoice: ClientInvoice | null;
  onSaved: () => void;
};

export function CreditNoteDialog({
  open,
  onOpenChange,
  userId,
  invoice,
  onSaved,
}: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [emailClient, setEmailClient] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !invoice) return;
    setAmount(String(invoice.amount));
    setReason("");
    setEmailClient(false);
  }, [open, invoice]);

  const handleSave = async () => {
    if (!invoice) return;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive credit amount.",
        variant: "destructive",
      });
      return;
    }
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Explain why this credit note is being issued.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: creditNumber, error: rpcError } = await supabase.rpc(
        "generate_credit_number"
      );
      if (rpcError) throw rpcError;
      if (!creditNumber) throw new Error("Failed to generate credit number.");

      const { error } = await supabase.from("credit_notes").insert({
        user_id: userId,
        invoice_id: invoice.id,
        credit_number: creditNumber,
        amount: amt,
        currency: invoice.currency || "GBP",
        reason: reason.trim(),
        created_by: user?.id || null,
      });
      if (error) throw error;

      toast({
        title: "Credit note issued",
        description: emailClient
          ? "Credit note saved. Client email is not yet wired."
          : `Credit note ${creditNumber} created.`,
      });
      onOpenChange(false);
      onSaved();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to issue credit note.",
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
          <DialogTitle>Issue credit note</DialogTitle>
          <DialogDescription>
            {invoice
              ? `Against invoice ${invoice.invoice_number}`
              : "Select an invoice first."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="cn_amount">Amount (£)</Label>
            <Input
              id="cn_amount"
              type="number"
              min={0.01}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cn_reason">Reason</Label>
            <Textarea
              id="cn_reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={emailClient}
              onCheckedChange={(v) => setEmailClient(v === true)}
            />
            Email client
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !invoice}>
            {saving ? "Saving…" : "Issue credit note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
