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
import { Switch } from "../../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { supabase } from "../../../lib/supabase";
import { toast } from "../../../hooks/use-toast";
import { AdminOption, ClientUser, isValidEmail } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ClientUser;
  admins: AdminOption[];
  onSaved: () => void;
};

export function EditClientDialog({
  open,
  onOpenChange,
  user,
  admins,
  onSaved,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("14");
  const [accountManagerId, setAccountManagerId] = useState<string>("none");
  const [remindersPaused, setRemindersPaused] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFullName(user.full_name || "");
    setCompanyName(user.company_name || "");
    setIndustry(user.industry || "");
    setBillingEmail(user.billing_email || "");
    setBillingAddress(user.billing_address || "");
    setVatNumber(user.vat_number || "");
    setPaymentTerms(String(user.payment_terms_days || 14));
    setAccountManagerId(user.account_manager_id || "none");
    setRemindersPaused(Boolean(user.reminders_paused));
  }, [open, user]);

  const handleSave = async () => {
    const terms = Number(paymentTerms);
    if (!Number.isFinite(terms) || terms < 1) {
      toast({
        title: "Invalid terms",
        description: "Payment terms must be at least 1 day.",
        variant: "destructive",
      });
      return;
    }
    if (billingEmail.trim() && !isValidEmail(billingEmail)) {
      toast({
        title: "Invalid email",
        description: "Enter a valid billing email or leave it blank.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName.trim() || null,
          company_name: companyName.trim() || null,
          industry: industry.trim() || null,
          billing_email: billingEmail.trim() || null,
          billing_address: billingAddress.trim() || null,
          vat_number: vatNumber.trim() || null,
          payment_terms_days: Math.floor(terms),
          account_manager_id:
            accountManagerId === "none" ? null : accountManagerId,
          reminders_paused: remindersPaused,
        })
        .eq("id", user.id);
      if (error) throw error;
      toast({ title: "Client updated", description: "Company details saved." });
      onOpenChange(false);
      onSaved();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update client.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit client</DialogTitle>
          <DialogDescription>
            Update company and billing details for this client.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="company_name">Company name</Label>
            <Input
              id="company_name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="billing_email">Billing email</Label>
            <Input
              id="billing_email"
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="billing_address">Billing address</Label>
            <Textarea
              id="billing_address"
              rows={3}
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="vat_number">VAT number</Label>
            <Input
              id="vat_number"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="payment_terms">Payment terms (days)</Label>
            <Input
              id="payment_terms"
              type="number"
              min={1}
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Account manager</Label>
            <Select value={accountManagerId} onValueChange={setAccountManagerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select admin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {admins.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.full_name || a.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Pause reminders</p>
              <p className="text-xs text-muted-foreground">
                Stop automatic payment chase emails for this client.
              </p>
            </div>
            <Switch
              checked={remindersPaused}
              onCheckedChange={setRemindersPaused}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
