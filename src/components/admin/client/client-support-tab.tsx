import { useState } from "react";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { EmptyState } from "../../ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
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
import { sendTicketNotification } from "../../../utils/emailHelpers";
import { Tables } from "../../../types/supabase";
import { ClientDetailData, ClientTicket } from "./types";

type TicketMessage = Tables<"support_ticket_messages">;

const statusLabels: Record<string, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

function statusVariant(
  status: string
): "destructive" | "warning" | "success" | "secondary" {
  if (status === "open") return "destructive";
  if (status === "pending") return "warning";
  if (status === "resolved") return "success";
  return "secondary";
}

type Props = {
  data: ClientDetailData;
  onRefresh: () => void;
};

export function ClientSupportTab({ data, onRefresh }: Props) {
  const { user } = useAuth();
  const { tickets } = data;
  const [selected, setSelected] = useState<ClientTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [replyStatus, setReplyStatus] = useState("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openTicket = async (ticket: ClientTicket) => {
    setSelected(ticket);
    setReply("");
    setReplyStatus(ticket.status === "open" ? "pending" : ticket.status);
    setMessagesLoading(true);
    try {
      const { data: msgs, error } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(msgs || []);
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to load ticket thread.",
        variant: "destructive",
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!user || !selected) return;
    if (!reply.trim()) {
      toast({
        title: "Empty reply",
        description: "Write a response before sending.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error: msgError } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: selected.id,
          author_id: user.id,
          author_role: "admin",
          message: reply.trim(),
        });
      if (msgError) throw msgError;

      if (replyStatus !== selected.status) {
        const { error: statusError } = await supabase
          .from("support_tickets")
          .update({ status: replyStatus })
          .eq("id", selected.id);
        if (statusError) throw statusError;
      }

      void sendTicketNotification({
        type: "admin_response",
        ticketId: selected.id,
        subject: selected.subject,
        category: selected.category || undefined,
        clientEmail: data.user.email,
        clientName: data.user.full_name || undefined,
        responsePreview: reply.trim().slice(0, 280),
      });

      toast({
        title: "Response sent",
        description: "The client has been notified.",
      });
      setSelected(null);
      setReply("");
      onRefresh();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to send response.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusOnly = async (status: string) => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status })
        .eq("id", selected.id);
      if (error) throw error;
      toast({
        title: "Status updated",
        description: `Ticket marked as ${statusLabels[status] || status}.`,
      });
      setSelected(null);
      onRefresh();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update status.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {tickets.length === 0 ? (
        <Card>
          <EmptyState icon={MessageSquare} message="No support tickets." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => openTicket(t)}
                  >
                    <td className="px-3 py-2.5">{t.subject}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={statusVariant(t.status)}>
                        {statusLabels[t.status] || t.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 capitalize">{t.priority}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {format(new Date(t.created_at), "PP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
            <DialogDescription>
              {selected
                ? `Opened ${format(new Date(selected.created_at), "PPp")}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="rounded-sm border border-border bg-muted/30 px-3 py-2 text-sm">
                <p className="mb-1 text-xs text-muted-foreground">
                  Original message
                </p>
                <p className="whitespace-pre-wrap">{selected.message}</p>
              </div>
              {messagesLoading ? (
                <p className="text-sm text-muted-foreground">Loading thread…</p>
              ) : (
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-sm border border-border px-3 py-2 text-sm ${
                        m.author_role === "admin"
                          ? "bg-muted/40"
                          : "bg-surface"
                      }`}
                    >
                      <p className="mb-1 text-xs text-muted-foreground">
                        {m.author_role} ·{" "}
                        {format(new Date(m.created_at), "PPp")}
                      </p>
                      <p className="whitespace-pre-wrap">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-1.5">
                <Label htmlFor="ticket_reply">Reply</Label>
                <Textarea
                  id="ticket_reply"
                  rows={4}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Set status</Label>
                <Select value={replyStatus} onValueChange={setReplyStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => handleStatusOnly("resolved")}
            >
              Mark resolved
            </Button>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button onClick={handleRespond} disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
