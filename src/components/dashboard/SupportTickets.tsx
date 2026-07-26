import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { EmptyState } from "../ui/empty-state";
import { Skeleton } from "../ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import {
  Plus,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { Tables } from "../../types/supabase";
import { sendTicketNotification } from "../../utils/emailHelpers";

type SupportTicket = Tables<"support_tickets">;
type TicketMessage = Tables<"support_ticket_messages">;

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline";
    icon: typeof XCircle;
  }
> = {
  open: { label: "Open", variant: "destructive", icon: XCircle },
  pending: { label: "Pending", variant: "warning", icon: Clock },
  resolved: { label: "Resolved", variant: "success", icon: CheckCircle2 },
  closed: { label: "Closed", variant: "secondary", icon: CheckCircle2 },
};

const categoryLabels: Record<string, string> = {
  general: "General",
  technical: "Technical",
  billing: "Billing",
  upgrade: "Upgrade",
  bespoke: "Bespoke",
  feature_request: "Feature request",
};

export default function SupportTickets() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [isFollowUpSubmitting, setIsFollowUpSubmitting] = useState(false);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");

  const fetchTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: unknown) {
      const description =
        error instanceof Error ? error.message : "Failed to load support requests.";
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    setMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: unknown) {
      const description =
        error instanceof Error ? error.message : "Failed to load ticket thread.";
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel("support_tickets_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_tickets",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    } else {
      setMessages([]);
      setFollowUp("");
    }
  }, [selectedTicket?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (subject.length < 5 || subject.length > 200) {
      toast({
        title: "Invalid subject",
        description: "Subject must be between 5 and 200 characters.",
        variant: "destructive",
      });
      return;
    }

    if (message.length < 10 || message.length > 5000) {
      toast({
        title: "Invalid message",
        description: "Message must be between 10 and 5000 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user?.id,
          subject,
          message,
          category,
          priority,
        })
        .select("id")
        .single();

      if (error) throw error;

      if (data?.id) {
        void sendTicketNotification({
          type: "new_ticket",
          ticketId: data.id,
          subject,
          category,
          clientEmail: user?.email || profile?.email || "",
          clientName: profile?.full_name || undefined,
        });
      }

      toast({
        title: "Request submitted",
        description: "Your support request has been submitted. We'll respond within 24 hours.",
      });

      setSubject("");
      setMessage("");
      setCategory("general");
      setPriority("normal");
      setIsDialogOpen(false);
      fetchTickets();
    } catch (error: unknown) {
      const description =
        error instanceof Error ? error.message : "Failed to submit request.";
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTicket) return;

    if (followUp.trim().length < 1) {
      toast({
        title: "Empty message",
        description: "Please write a follow-up before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsFollowUpSubmitting(true);
    try {
      const { error } = await supabase.from("support_ticket_messages").insert({
        ticket_id: selectedTicket.id,
        author_id: user.id,
        author_role: "client",
        message: followUp.trim(),
      });

      if (error) throw error;

      setFollowUp("");
      await fetchMessages(selectedTicket.id);
      await fetchTickets();
      const refreshed = (
        await supabase
          .from("support_tickets")
          .select("*")
          .eq("id", selectedTicket.id)
          .single()
      ).data;
      if (refreshed) setSelectedTicket(refreshed);

      toast({
        title: "Follow-up sent",
        description: "Your message has been added to the ticket.",
      });
    } catch (error: unknown) {
      const description =
        error instanceof Error ? error.message : "Failed to send follow-up.";
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setIsFollowUpSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (selectedTicket) {
    const config = statusConfig[selectedTicket.status] || {
      label: selectedTicket.status,
      variant: "secondary" as const,
      icon: AlertCircle,
    };
    const StatusIcon = config.icon;
    const canFollowUp =
      selectedTicket.status === "open" || selectedTicket.status === "pending";

    return (
      <Card>
        <CardHeader className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit gap-1.5 px-0"
            onClick={() => setSelectedTicket(null)}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Back to requests
          </Button>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{selectedTicket.subject}</CardTitle>
              <CardDescription className="mt-1">
                Created{" "}
                {format(new Date(selectedTicket.created_at), "d MMM yyyy 'at' HH:mm")}
                {selectedTicket.category
                  ? ` · ${categoryLabels[selectedTicket.category] || selectedTicket.category}`
                  : ""}
                {` · ${selectedTicket.priority} priority`}
              </CardDescription>
            </div>
            <Badge variant={config.variant} className="gap-1 shrink-0">
              <StatusIcon className="h-3 w-3" strokeWidth={1.5} />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {messagesLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : messages.length === 0 ? (
            <div className="rounded-sm border border-border bg-muted/30 p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {selectedTicket.message}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-sm border p-3 ${
                    msg.author_role === "admin"
                      ? "border-accent/20 bg-accent/5"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {msg.author_role === "admin" ? "Enclosure team" : "You"}
                    </span>
                    <span>
                      {format(new Date(msg.created_at), "d MMM yyyy 'at' HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>
          )}

          {canFollowUp ? (
            <form onSubmit={handleFollowUp} className="space-y-3 border-t border-border pt-4">
              <Label htmlFor="follow-up">Add a follow-up</Label>
              <Textarea
                id="follow-up"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                rows={4}
                maxLength={5000}
                placeholder="Add more detail or ask a follow-up question..."
              />
              <Button type="submit" disabled={isFollowUpSubmitting || !followUp.trim()}>
                {isFollowUpSubmitting ? "Sending…" : "Send follow-up"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground border-t border-border pt-4">
              This ticket is {config.label.toLowerCase()}. Open a new request if you need
              further help.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 gap-3">
        <div>
          <CardTitle>Support requests</CardTitle>
          <CardDescription className="mt-1">
            Get help with your projects and account
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              New request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create support request</DialogTitle>
              <DialogDescription>
                Describe your issue and we&apos;ll get back to you within 24 hours.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {subject.length}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="upgrade">Upgrade</SelectItem>
                    <SelectItem value="bespoke">Bespoke</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Provide details about your request..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  maxLength={5000}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {message.length}/5000 characters
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit request"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-0">
        {tickets.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            message='No support requests yet. Click "New request" to get help.'
          />
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((ticket) => {
              const config = statusConfig[ticket.status] || {
                label: ticket.status,
                variant: "secondary" as const,
                icon: AlertCircle,
              };
              const StatusIcon = config.icon;
              return (
                <button
                  key={ticket.id}
                  type="button"
                  className="w-full px-4 py-4 text-left transition-colors-fast hover:bg-muted/40"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-foreground">
                        {ticket.subject}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {ticket.message}
                      </p>
                    </div>
                    <Badge variant={config.variant} className="gap-1 shrink-0">
                      <StatusIcon className="h-3 w-3" strokeWidth={1.5} />
                      {config.label}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Created {format(new Date(ticket.created_at), "d MMM yyyy")}
                    </span>
                    {ticket.category && (
                      <span>
                        {categoryLabels[ticket.category] ||
                          ticket.category.replace("_", " ")}
                      </span>
                    )}
                    <span className="capitalize">{ticket.priority} priority</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
