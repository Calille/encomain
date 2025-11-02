import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
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
import { Loader2, Plus, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Tables } from "../../types/supabase";

type SupportTicket = Tables<"support_tickets">;

const statusConfig = {
  open: { label: "Open", color: "bg-red-100 text-red-800", icon: XCircle },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Clock },
  awaiting_response: {
    label: "Awaiting Response",
    color: "bg-yellow-100 text-yellow-800",
    icon: MessageSquare,
  },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-800", icon: CheckCircle2 },
};

export default function SupportTickets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");

  // Fetch tickets
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

    // Real-time subscription
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (subject.length < 5 || subject.length > 200) {
      toast({
        title: "Invalid Subject",
        description: "Subject must be between 5 and 200 characters.",
        variant: "destructive",
      });
      return;
    }

    if (message.length < 10 || message.length > 5000) {
      toast({
        title: "Invalid Message",
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
        title: "Success!",
        description: "Your support request has been submitted. We'll respond within 24 hours.",
      });

      // Reset form
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
      <Card className="p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1A4D2E] border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600">Loading support tickets...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <CardTitle className="text-xl font-bold text-[#1A4D2E] mb-2">
            Support Requests
          </CardTitle>
          <CardDescription>Get help with your projects and account</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Support Request</DialogTitle>
              <DialogDescription>
                Describe your issue and we'll get back to you within 24 hours.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject *
                </Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  required
                />
                <p className="text-xs text-gray-500">{subject.length}/200 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Question</SelectItem>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
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
                <Label htmlFor="message">
                  Message *
                </Label>
                <Textarea
                  id="message"
                  placeholder="Provide details about your request..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  maxLength={5000}
                  required
                />
                <p className="text-xs text-gray-500">{message.length}/5000 characters</p>
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
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No support requests yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Click "New Request" to get help with your account or projects.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {tickets.map((ticket) => {
              const StatusIcon = statusConfig[ticket.status as keyof typeof statusConfig]?.icon || AlertCircle;
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1A4D2E] mb-1">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{ticket.message}</p>
                    </div>
                    <Badge
                      className={`${statusConfig[ticket.status as keyof typeof statusConfig]?.color || "bg-gray-100 text-gray-800"}`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[ticket.status as keyof typeof statusConfig]?.label || ticket.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Created {format(new Date(ticket.created_at), "MMM d, yyyy")}</span>
                    {ticket.category && (
                      <span>• {ticket.category.replace("_", " ")}</span>
                    )}
                    <span>• {ticket.priority} priority</span>
                  </div>
                  {ticket.response && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-800 mb-1">Admin Response:</p>
                      <p className="text-sm text-blue-700">{ticket.response}</p>
                      {ticket.responded_at && (
                        <p className="text-xs text-blue-600 mt-2">
                          Responded {format(new Date(ticket.responded_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
}

