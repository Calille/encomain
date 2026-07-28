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
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "../../../hooks/use-toast";
import { ClientInvoice } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: ClientInvoice | null;
  onSaved: () => void;
};

export function VoidInvoiceDialog({
  open,
  onOpenChange,
  invoice,
  onSaved,
}: Props) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const handleVoid = async () => {
    if (!invoice) return;
    if (invoice.voided_at || invoice.status === "voided") {
      toast({
        title: "Already voided",
        description: "This invoice cannot be un-voided.",
        variant: "destructive",
      });
      return;
    }
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Provide a void reason before continuing.",
        variant: "destructive",
      });
      return;
    }
    if (!user?.id) {
      toast({
        title: "Not signed in",
        description: "You must be signed in to void an invoice.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("invoices")
        .update({
          status: "voided",
          voided_at: new Date().toISOString(),
          voided_by: user.id,
          void_reason: reason.trim(),
        })
        .eq("id", invoice.id);
      if (error) throw error;
      toast({
        title: "Invoice voided",
        description: `${invoice.invoice_number} has been voided.`,
      });
      onOpenChange(false);
      onSaved();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to void invoice.",
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
          <DialogTitle>Void invoice</DialogTitle>
          <DialogDescription>
            {invoice
              ? `Void ${invoice.invoice_number}. This cannot be undone.`
              : "Select an invoice first."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5 py-2">
          <Label htmlFor="void_reason">Void reason</Label>
          <Textarea
            id="void_reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this invoice is being voided"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleVoid}
            disabled={saving || !invoice}
          >
            {saving ? "Voiding…" : "Void invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
