import { useState } from "react";
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
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "../../../hooks/use-toast";

export type DeletableClient = {
  id: string;
  email: string;
};

type SoftProps = {
  client: DeletableClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

type HardProps = {
  client: DeletableClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

/** Soft-delete confirmation (delete-account Edge Function). */
export function SoftDeleteClientDialog({
  client,
  open,
  onOpenChange,
  onDeleted,
}: SoftProps) {
  const { user: currentUser } = useAuth();
  const [emailConfirm, setEmailConfirm] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setEmailConfirm("");
    setReason("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const submit = async () => {
    if (!client || !currentUser?.id) return;
    if (emailConfirm.trim().toLowerCase() !== client.email.toLowerCase()) {
      toast({
        title: "Email does not match",
        description: "Type the client's email exactly to confirm.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", {
        body: {
          user_id: client.id,
          initiated_by: currentUser.id,
          reason: reason.trim() || undefined,
        },
      });
      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Soft delete failed");
      }
      toast({
        title: "Account deactivated",
        description: `${client.email} has been soft-deleted with a 30-day recovery window.`,
      });
      reset();
      onOpenChange(false);
      onDeleted();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Soft delete failed",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Delete client account</DialogTitle>
          <DialogDescription>
            This deactivates the account immediately with a 30-day recovery window. Type
            the client email to confirm.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="shared-soft-delete-email">Type email to confirm</Label>
            <Input
              id="shared-soft-delete-email"
              value={emailConfirm}
              onChange={(e) => setEmailConfirm(e.target.value)}
              placeholder={client?.email || ""}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shared-soft-delete-reason">Reason (optional)</Label>
            <Textarea
              id="shared-soft-delete-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={busy} onClick={submit}>
            {busy ? "Deleting…" : "Delete client account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Hard-delete confirmation (hard-delete-account Edge Function). */
export function HardDeleteClientDialog({
  client,
  open,
  onOpenChange,
  onDeleted,
}: HardProps) {
  const { user: currentUser } = useAuth();
  const [emailConfirm, setEmailConfirm] = useState("");
  const [wordConfirm, setWordConfirm] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setEmailConfirm("");
    setWordConfirm("");
    setReason("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const submit = async () => {
    if (!client || !currentUser?.id) return;
    if (emailConfirm.trim().toLowerCase() !== client.email.toLowerCase()) {
      toast({
        title: "Email does not match",
        description: "Type the client's email exactly to confirm.",
        variant: "destructive",
      });
      return;
    }
    if (wordConfirm.trim() !== "DELETE") {
      toast({
        title: "Confirmation incomplete",
        description: "Type DELETE in capitals to confirm permanent deletion.",
        variant: "destructive",
      });
      return;
    }
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Provide a reason for permanent deletion.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "hard-delete-account",
        {
          body: {
            user_id: client.id,
            admin_id: currentUser.id,
            reason: reason.trim(),
          },
        }
      );
      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Hard delete failed");
      }
      toast({
        title: "Account permanently deleted",
        description: `${client.email} has been anonymised.`,
      });
      reset();
      onOpenChange(false);
      onDeleted();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Hard delete failed",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Permanently delete this account?</DialogTitle>
          <DialogDescription>
            This cannot be undone. Personal data will be anonymised and the client
            will lose access immediately. Invoices, payments, and support tickets will be
            preserved for audit purposes but will no longer show identifying details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="shared-hard-delete-email">Type email to confirm</Label>
            <Input
              id="shared-hard-delete-email"
              value={emailConfirm}
              onChange={(e) => setEmailConfirm(e.target.value)}
              placeholder={client?.email || ""}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shared-hard-delete-word">Type DELETE to confirm</Label>
            <Input
              id="shared-hard-delete-word"
              value={wordConfirm}
              onChange={(e) => setWordConfirm(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shared-hard-delete-reason">Reason (required)</Label>
            <Textarea
              id="shared-hard-delete-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={busy} onClick={submit}>
            {busy ? "Deleting…" : "Permanently delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
