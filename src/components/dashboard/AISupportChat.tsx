import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "../../hooks/use-toast";
import { Bot, Send, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AISupportChat() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `Hi${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}. I am your AI assistant from The Enclosure. I can help you with:\n\n• Project status updates\n• Billing and payment questions\n• General support enquiries\n• Understanding our services\n\nWhat can I help you with today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Gather context from dashboard
      const [websitesResult, invoicesResult] = await Promise.all([
        supabase.from("websites").select("*").eq("user_id", user?.id || ""),
        supabase.from("invoices").select("*").eq("user_id", user?.id || ""),
      ]);

      const context = {
        user_name: profile?.full_name || "there",
        websites: websitesResult.data || [],
        invoices: invoicesResult.data || [],
      };

      // Mock AI response (replace with actual AI API endpoint)
      const response = await mockAIResponse(currentInput, context);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Log to database
      try {
        await supabase.from("ai_chat_logs").insert({
          user_id: user?.id,
          message: currentInput,
          response: response,
          context: context,
        });
      } catch (logError) {
        console.error("Error logging chat:", logError);
        // Don't fail the chat if logging fails
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock AI response (replace with actual API call)
  const mockAIResponse = async (message: string, context: any): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("project") ||
      lowerMessage.includes("website") ||
      lowerMessage.includes("progress")
    ) {
      if (context.websites.length === 0) {
        return "I do not see any active projects in your account yet. Would you like to discuss starting a new website project?";
      }
      const website = context.websites[0];
      return `Your project "${website.name}" is currently ${website.progress_percentage}% complete with status: ${website.status}. Is there anything specific you would like to know about your project?`;
    }

    if (
      lowerMessage.includes("invoice") ||
      lowerMessage.includes("payment") ||
      lowerMessage.includes("bill")
    ) {
      if (context.invoices.length === 0) {
        return "You do not have any invoices at the moment. When we start working on your project, invoices will appear here.";
      }
      const unpaid = context.invoices.filter((inv: any) => inv.status !== "paid");
      if (unpaid.length > 0) {
        return `You have ${unpaid.length} outstanding invoice(s). You can view and pay them in the Payments section of your dashboard. Would you like me to explain the payment process?`;
      }
      return "All your invoices are paid up. You are all set.";
    }

    if (lowerMessage.includes("upgrade") || lowerMessage.includes("plan")) {
      return "We offer three pricing tiers:\n\n• Essential: £1,997 + £79/month\n• Growth: £2,997 + £129/month\n• Ultimate: £4,997 + £199/month\n\nWould you like to know more about what is included in each tier?";
    }

    if (lowerMessage.includes("support") || lowerMessage.includes("help")) {
      return "For complex issues, I recommend creating a support ticket in the Support Requests section. Our team typically responds within 24 hours. Is there a specific issue I can help with right now?";
    }

    return "I would be happy to help. Could you provide more details about your question? I can assist with project updates, billing enquiries, service information, and general support.";
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-12 w-12 rounded-md shadow-float"
              size="icon"
            >
              <Bot className="h-5 w-5" strokeWidth={1.5} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed bottom-4 right-4 z-50 flex h-[calc(100vh-8rem)] max-h-[600px] w-[calc(100vw-2rem)] max-w-[384px] flex-col rounded-md border border-border bg-surface shadow-float sm:bottom-6 sm:right-6 sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-accent" strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Enclosure AI</h3>
                  <p className="text-xs text-muted-foreground">Always here to help</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-sm p-3 ${
                        message.role === "user"
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {format(message.timestamp, "h:mm a")}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-sm bg-muted p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

