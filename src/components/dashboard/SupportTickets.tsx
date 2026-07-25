import { useState, useEffect } from "react";
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
import { Plus, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Tables } from "../../types/supabase";

type SupportTicket = Tables<"support_tickets">;

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline";
    icon: typeof XCircle;
  }
> = {
  open: { label: "Open", variant: "destructive", icon: XCircle },
  in_progress: { label: "In progress", variant: "default", icon: Clock },
  awaiting_response: {
    label: "Awaiting response",
    variant: "warning",
    icon: MessageSquare,
  },
  resolved: { label: "Resolved", variant: "success", icon: CheckCircle2 },
  closed: { label: "Closed", variant: "secondary", icon: CheckCircle2 },
};

export default function SupportTickets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user?.id,
        subject,
        message,
        category,
        priority,
      });

      if (error) throw error;

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                Describe your issue and we'll get back to you within 24 hours.
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
                    <SelectItem value="general">General question</SelectItem>
                    <SelectItem value="technical">Technical issue</SelectItem>
                    <SelectItem value="billing">Billing question</SelectItem>
                    <SelectItem value="feature_request">Feature request</SelectItem>
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
                    <SelectItem value="urgent">Urgent</SelectItem>
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
                  {isSubmitting ? "Submitting..." : "Submit request"}
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
              const config =
                statusConfig[ticket.status as keyof typeof statusConfig] || {
                  label: ticket.status,
                  variant: "secondary" as const,
                  icon: AlertCircle,
                };
              const StatusIcon = config.icon;
              return (
                <div key={ticket.id} className="px-4 py-4">
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
                      Created {format(new Date(ticket.created_at), "MMM d, yyyy")}
                    </span>
                    {ticket.category && (
                      <span>{ticket.category.replace("_", " ")}</span>
                    )}
                    <span>{ticket.priority} priority</span>
                  </div>
                  {ticket.response && (
                    <div className="mt-3 rounded-sm border border-accent/20 bg-accent/5 p-3">
                      <p className="text-xs font-medium text-foreground mb-1">
                        Admin response
                      </p>
                      <p className="text-sm text-muted-foreground">{ticket.response}</p>
                      {ticket.responded_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Responded{" "}
                          {format(
                            new Date(ticket.responded_at),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
