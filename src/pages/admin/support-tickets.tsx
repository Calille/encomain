import { useCallback, useMemo, useState } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { LoadError } from "../../components/ui/load-error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { useCancellableLoad } from "../../hooks/useCancellableLoad";
import {
  compareValues,
  SortIcon,
  useTableSort,
} from "../../hooks/useTableSort";
import { toast } from "../../hooks/use-toast";
import { sendTicketNotification } from "../../utils/emailHelpers";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Tables } from "../../types/supabase";

type SupportTicket = Tables<"support_tickets">;
type TicketMessage = Tables<"support_ticket_messages">;

interface TicketRow extends SupportTicket {
  users?: { full_name: string | null; email: string } | null;
}

type TicketSortKey =
  | "created_at"
  | "client"
  | "subject"
  | "status"
  | "priority"
  | "category";

const statusLabels: Record<string, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

const categoryLabels: Record<string, string> = {
  general: "General",
  technical: "Technical",
  billing: "Billing",
  upgrade: "Upgrade",
  bespoke: "Bespoke",
  feature_request: "Feature request",
};

function statusVariant(
  status: string
): "destructive" | "warning" | "success" | "secondary" | "default" {
  if (status === "open") return "destructive";
  if (status === "pending") return "warning";
  if (status === "resolved") return "success";
  return "secondary";
}

function clientLabel(row: TicketRow): string {
  return row.users?.full_name || row.users?.email || "Unknown client";
}

export default function AdminSupportTicketsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<TicketRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [query, setQuery] = useState("");
  const { sort, cycleSort } = useTableSort<TicketSortKey>();

  const [selected, setSelected] = useState<TicketRow | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [replyStatus, setReplyStatus] = useState("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async (ctl: { isCancelled: () => boolean }) => {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*, users!support_tickets_user_id_fkey(full_name, email)")
      .order("created_at", { ascending: false });
    if (ctl.isCancelled()) return;
    if (error) throw error;
    setRows((data as TicketRow[]) || []);
  }, []);

  const { loading, error, retry } = useCancellableLoad(load);

  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) {
      if (!map.has(r.user_id)) {
        map.set(r.user_id, clientLabel(r));
      }
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (clientFilter !== "all" && r.user_id !== clientFilter) return false;
      const q = query.toLowerCase().trim();
      if (!q) return true;
      return (
        r.subject.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q) ||
        clientLabel(r).toLowerCase().includes(q)
      );
    });

    if (sort.key && sort.direction) {
      const dir = sort.direction;
      list = [...list].sort((a, b) => {
        switch (sort.key) {
          case "client":
            return compareValues(clientLabel(a), clientLabel(b), dir);
          case "subject":
            return compareValues(a.subject, b.subject, dir);
          case "status":
            return compareValues(a.status, b.status, dir);
          case "priority":
            return compareValues(a.priority, b.priority, dir);
          case "category":
            return compareValues(a.category || "", b.category || "", dir);
          case "created_at":
          default:
            return compareValues(
              new Date(a.created_at).getTime(),
              new Date(b.created_at).getTime(),
              dir
            );
        }
      });
    }

    return list;
  }, [
    rows,
    statusFilter,
    priorityFilter,
    categoryFilter,
    clientFilter,
    query,
    sort,
  ]);

  const openTicket = async (ticket: TicketRow) => {
    setSelected(ticket);
    setReply("");
    setReplyStatus(ticket.status === "open" ? "pending" : ticket.status);
    setMessagesLoading(true);
    try {
      const { data, error: msgError } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: true });
      if (msgError) throw msgError;
      setMessages(data || []);
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

      if (replyStatus !== "pending") {
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
        clientEmail: selected.users?.email || "",
        clientName: selected.users?.full_name || undefined,
        responsePreview: reply.trim().slice(0, 280),
      });

      toast({
        title: "Response sent",
        description: "The client has been notified.",
      });

      setSelected(null);
      setReply("");
      retry();
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
      const { error: statusError } = await supabase
        .from("support_tickets")
        .update({ status })
        .eq("id", selected.id);
      if (statusError) throw statusError;
      toast({
        title: "Status updated",
        description: `Ticket marked as ${statusLabels[status] || status}.`,
      });
      setSelected(null);
      retry();
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

  const headerButton = (key: TicketSortKey, label: string) => (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
      onClick={() => cycleSort(key)}
    >
      {label}
      <SortIcon active={sort.key === key} direction={sort.direction} />
    </button>
  );

  return (
    <AdminLayout title="Support tickets">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search subject, message, or client"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          <option value="general">General</option>
          <option value="technical">Technical</option>
          <option value="billing">Billing</option>
          <option value="upgrade">Upgrade</option>
          <option value="bespoke">Bespoke</option>
        </select>
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
        >
          <option value="all">All clients</option>
          {clientOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <LoadError message={error} onRetry={retry} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={MessageSquare}
            message="No support tickets match your filters."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">{headerButton("created_at", "Created")}</th>
                  <th className="px-3 py-2">{headerButton("client", "Client")}</th>
                  <th className="px-3 py-2">{headerButton("subject", "Subject")}</th>
                  <th className="px-3 py-2">{headerButton("category", "Category")}</th>
                  <th className="px-3 py-2">{headerButton("priority", "Priority")}</th>
                  <th className="px-3 py-2">{headerButton("status", "Status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer transition-colors-fast hover:bg-muted/40"
                    onClick={() => openTicket(row)}
                  >
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                      {format(new Date(row.created_at), "d MMM yyyy")}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-foreground">
                      {clientLabel(row)}
                    </td>
                    <td className="px-3 py-2.5 text-foreground max-w-xs truncate">
                      {row.subject}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground capitalize">
                      {row.category
                        ? categoryLabels[row.category] || row.category
                        : "-"}
                    </td>
                    <td className="px-3 py-2.5 capitalize text-muted-foreground">
                      {row.priority}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={statusVariant(row.status)}>
                        {statusLabels[row.status] || row.status}
                      </Badge>
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
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject}</DialogTitle>
                <DialogDescription>
                  {clientLabel(selected)} ·{" "}
                  {format(new Date(selected.created_at), "d MMM yyyy 'at' HH:mm")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                {messagesLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : messages.length === 0 ? (
                  <div className="rounded-sm border border-border bg-muted/30 p-3">
                    <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-sm border p-3 ${
                        msg.author_role === "admin"
                          ? "border-accent/20 bg-accent/5"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <div className="mb-1 flex justify-between gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {msg.author_role === "admin" ? "Admin" : "Client"}
                        </span>
                        <span>
                          {format(new Date(msg.created_at), "d MMM yyyy 'at' HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))
                )}

                <div className="space-y-1.5 border-t border-border pt-3">
                  <Label htmlFor="ticket-status">Status after reply</Label>
                  <Select value={replyStatus} onValueChange={setReplyStatus}>
                    <SelectTrigger id="ticket-status">
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

                <div className="space-y-1.5">
                  <Label htmlFor="admin-reply">Your response</Label>
                  <Textarea
                    id="admin-reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={5}
                    maxLength={5000}
                    placeholder="Write a response to the client..."
                  />
                </div>
              </div>

              <DialogFooter className="flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleStatusOnly("closed")}
                >
                  Close ticket
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleStatusOnly("resolved")}
                >
                  Mark resolved
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting || !reply.trim()}
                  onClick={handleRespond}
                >
                  {isSubmitting ? "Sending…" : "Send response"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
