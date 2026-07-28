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
import {
  ClientSchedule,
  computeNextInvoiceDate,
} from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  schedule: ClientSchedule | null;
  onSaved: () => void;
};

export function RecurringScheduleDialog({
  open,
  onOpenChange,
  userId,
  schedule,
  onSaved,
}: Props) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (schedule) {
      setDescription(schedule.template_description);
      setAmount(String(schedule.amount));
      setFrequency(schedule.frequency);
      setDayOfMonth(String(schedule.day_of_month));
      setStartDate(schedule.start_date);
      setEndDate(schedule.end_date || "");
      setNotes(schedule.notes || "");
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setDescription("");
      setAmount("");
      setFrequency("monthly");
      setDayOfMonth("1");
      setStartDate(today);
      setEndDate("");
      setNotes("");
    }
  }, [open, schedule]);

  const handleSave = async () => {
    const amt = Number(amount);
    const day = Number(dayOfMonth);
    if (!description.trim()) {
      toast({
        title: "Missing description",
        description: "Enter a template description.",
        variant: "destructive",
      });
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive amount.",
        variant: "destructive",
      });
      return;
    }
    if (!Number.isInteger(day) || day < 1 || day > 28) {
      toast({
        title: "Invalid day",
        description: "Day of month must be between 1 and 28.",
        variant: "destructive",
      });
      return;
    }
    if (!startDate) {
      toast({
        title: "Missing start date",
        description: "Choose a start date.",
        variant: "destructive",
      });
      return;
    }
    if (endDate && endDate < startDate) {
      toast({
        title: "Invalid end date",
        description: "End date must be on or after the start date.",
        variant: "destructive",
      });
      return;
    }
    if (!["monthly", "quarterly", "annual"].includes(frequency)) {
      toast({
        title: "Invalid frequency",
        description: "Choose monthly, quarterly, or annual.",
        variant: "destructive",
      });
      return;
    }

    const nextInvoiceDate = computeNextInvoiceDate(startDate, day);
    setSaving(true);
    try {
      if (schedule) {
        const { error } = await supabase
          .from("recurring_invoice_schedules")
          .update({
            template_description: description.trim(),
            amount: amt,
            currency: "GBP",
            frequency,
            day_of_month: day,
            start_date: startDate,
            end_date: endDate || null,
            next_invoice_date: nextInvoiceDate,
            notes: notes.trim() || null,
          })
          .eq("id", schedule.id);
        if (error) throw error;
        toast({ title: "Schedule updated" });
      } else {
        const { error } = await supabase
          .from("recurring_invoice_schedules")
          .insert({
            user_id: userId,
            template_description: description.trim(),
            amount: amt,
            currency: "GBP",
            frequency,
            day_of_month: day,
            start_date: startDate,
            end_date: endDate || null,
            next_invoice_date: nextInvoiceDate,
            notes: notes.trim() || null,
            created_by: user?.id || null,
            is_active: true,
          });
        if (error) throw error;
        toast({ title: "Schedule created" });
      }
      onOpenChange(false);
      onSaved();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save schedule.",
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
          <DialogTitle>
            {schedule ? "Edit schedule" : "Add recurring schedule"}
          </DialogTitle>
          <DialogDescription>
            Automatically generate invoices on a fixed cadence.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="sched_desc">Description</Label>
            <Input
              id="sched_desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sched_amount">Amount (£)</Label>
            <Input
              id="sched_amount"
              type="number"
              min={0.01}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sched_dom">Day of month (1–28)</Label>
            <Input
              id="sched_dom"
              type="number"
              min={1}
              max={28}
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sched_start">Start date</Label>
            <Input
              id="sched_start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sched_end">End date (optional)</Label>
            <Input
              id="sched_end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sched_notes">Notes</Label>
            <Textarea
              id="sched_notes"
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
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
