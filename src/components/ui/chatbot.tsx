import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { MessageCircle, X, Send, Zap } from "lucide-react";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi there. I'm the Enclosure assistant. How can I help with your website or project today?",
    sender: "bot",
    timestamp: new Date(),
  },
];

const commonQuestions = [
  "How much does a website redesign cost?",
  "How long does the redesign process take?",
  "What information do you need from me?",
  "Do you offer ongoing maintenance?",
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (text: string) => {
    if (text.trim() === "") return;

    const newUserMessage: Message = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateResponse(text);
      const newBotMessage: Message = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newBotMessage]);
      setIsTyping(false);

      if (botResponse.showEmailCapture) {
        setShowEmailCapture(true);
      }
    }, 1000);
  };

  const handleSendMessage = () => {
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleSubmitEmail = () => {
    if (email.trim() === "") return;

    const newUserMessage: Message = {
      id: Date.now(),
      text: `My email is: ${email}`,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const newBotMessage: Message = {
        id: Date.now() + 1,
        text: "Thanks for providing your email. One of our team will reach out shortly to schedule your free intro call. In the meantime, feel free to ask any other questions.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newBotMessage]);
      setIsTyping(false);
      setShowEmailCapture(false);
    }, 1000);
  };

  const generateResponse = (
    message: string
  ): { text: string; showEmailCapture: boolean } => {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("price") ||
      lowerMessage.includes("cost") ||
      lowerMessage.includes("pricing")
    ) {
      return {
        text: "We offer fixed packages for standard web work, plus bespoke quotes for custom builds. You can see the full breakdown on our pricing page, or book a free intro call and we'll help you choose the right fit.",
        showEmailCapture: true,
      };
    } else if (
      lowerMessage.includes("payment") ||
      lowerMessage.includes("deposit") ||
      lowerMessage.includes("pay") ||
      lowerMessage.includes("installment") ||
      lowerMessage.includes("instalment")
    ) {
      return {
        text: "Projects typically start with a deposit, with the balance billed in agreed stages. Exact terms are confirmed on your intro call and in your proposal.",
        showEmailCapture: true,
      };
    } else if (
      lowerMessage.includes("time") ||
      lowerMessage.includes("long") ||
      lowerMessage.includes("delivery") ||
      lowerMessage.includes("timeline")
    ) {
      return {
        text: "Most package sites take a few weeks once content is ready. Larger or bespoke work takes longer, and we'll set expectations clearly before we start.",
        showEmailCapture: false,
      };
    } else if (
      lowerMessage.includes("consultation") ||
      lowerMessage.includes("call") ||
      lowerMessage.includes("talk") ||
      lowerMessage.includes("speak") ||
      lowerMessage.includes("meeting")
    ) {
      return {
        text: "You can book a free intro call on our contact page. No pitch, no strings, just a conversation about what you're trying to build. Would you like to leave your email so we can follow up?",
        showEmailCapture: true,
      };
    } else if (
      lowerMessage.includes("information") ||
      lowerMessage.includes("need from me") ||
      lowerMessage.includes("start") ||
      lowerMessage.includes("begin")
    ) {
      return {
        text: "To get started we'll need your current website URL if you have one, brand assets, content for your pages, and a sense of your audience and goals. If you don't have everything ready, we can help. Would you like to book a free intro call?",
        showEmailCapture: true,
      };
    } else if (
      lowerMessage.includes("maintenance") ||
      lowerMessage.includes("support") ||
      lowerMessage.includes("after") ||
      lowerMessage.includes("ongoing")
    ) {
      return {
        text: "Yes. We offer ongoing maintenance to keep your website secure, fast, and up to date, including updates, monitoring, and technical support.",
        showEmailCapture: false,
      };
    } else if (
      lowerMessage.includes("seo") ||
      lowerMessage.includes("google") ||
      lowerMessage.includes("ranking") ||
      lowerMessage.includes("search")
    ) {
      return {
        text: "SEO is part of every site we build, including on-page setup, fast loading speeds, and mobile responsiveness. We can also discuss deeper SEO strategy on an intro call.",
        showEmailCapture: true,
      };
    } else if (
      lowerMessage.includes("portfolio") ||
      lowerMessage.includes("examples") ||
      lowerMessage.includes("past work") ||
      lowerMessage.includes("previous")
    ) {
      return {
        text: "We're happy to walk through relevant examples on a free intro call and talk about what would suit your industry and goals.",
        showEmailCapture: true,
      };
    } else if (
      lowerMessage.includes("cancel") ||
      lowerMessage.includes("refund") ||
      lowerMessage.includes("guarantee")
    ) {
      return {
        text: "Ongoing plans are month-to-month with notice periods set out in your agreement. Project terms, including deposits and revisions, are confirmed before work begins.",
        showEmailCapture: false,
      };
    } else if (
      lowerMessage.includes("ai") ||
      lowerMessage.includes("technology") ||
      lowerMessage.includes("modern") ||
      lowerMessage.includes("stack")
    ) {
      return {
        text: "We build with modern tools including React, Next.js, TypeScript, and Tailwind CSS. Sites are responsive, accessible, and built with performance and security in mind.",
        showEmailCapture: false,
      };
    } else if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("email") ||
      lowerMessage.includes("phone") ||
      lowerMessage.includes("reach")
    ) {
      return {
        text: "You can reach us at josh@theenclosure.co.uk, message us on WhatsApp from the contact page, or book a free intro call there.",
        showEmailCapture: true,
      };
    } else {
      return {
        text: "Thanks for your message. For the most accurate answer, it's often best to speak with us directly. Would you like to book a free intro call?",
        showEmailCapture: true,
      };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <button
        onClick={toggleChat}
        className="flex h-14 w-14 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-marketing-forest text-white shadow-lg transition-all duration-300 hover:bg-marketing-forest-dark hover:scale-105 sm:h-16 sm:w-16"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X size={20} className="sm:h-6 sm:w-6" strokeWidth={1.5} />
        ) : (
          <MessageCircle size={20} className="sm:h-6 sm:w-6" strokeWidth={1.5} />
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 flex h-[calc(100vh-8rem)] max-h-[500px] w-[calc(100vw-2rem)] max-w-[320px] flex-col overflow-hidden rounded-lg border border-marketing-border bg-white shadow-xl sm:bottom-20 sm:max-w-[384px]">
          <div className="flex flex-shrink-0 items-center justify-between bg-marketing-forest p-3 text-white sm:p-4">
            <div className="flex min-w-0 items-center">
              <Zap className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" size={16} strokeWidth={1.5} />
              <h3 className="truncate text-marketing-sm font-semibold sm:text-marketing-base">
                The Enclosure assistant
              </h3>
            </div>
            <button
              onClick={toggleChat}
              className="ml-2 flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center text-white hover:text-white/80"
              aria-label="Close chat"
            >
              <X size={18} className="sm:h-5 sm:w-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-marketing-mint p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.sender === "user" ? "flex justify-end" : "flex justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-marketing-forest text-white"
                      : "border border-marketing-border bg-white text-marketing-ink"
                  }`}
                >
                  <p className="text-marketing-sm">{message.text}</p>
                  <p className="mt-1 text-marketing-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="mb-4 flex justify-start">
                <div className="rounded-lg border border-marketing-border bg-white p-3 text-marketing-ink">
                  <div className="flex space-x-1">
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-marketing-muted"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-marketing-muted"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-marketing-muted"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showEmailCapture && (
            <div className="border-t border-marketing-border bg-marketing-forest/5 p-4">
              <p className="mb-2 text-marketing-sm text-marketing-muted">
                Enter your email to schedule a free intro call:
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleSubmitEmail}
                  className="min-h-[44px] bg-marketing-forest px-4 text-white hover:bg-marketing-forest-dark"
                >
                  Submit
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto whitespace-nowrap border-t border-marketing-border bg-marketing-mint p-2">
            <div className="flex gap-2">
              {commonQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickQuestion(question)}
                  className="whitespace-nowrap rounded-full border border-marketing-border bg-white px-3 py-1 text-marketing-xs text-marketing-ink hover:bg-white/80"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-marketing-border bg-white p-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center bg-marketing-forest hover:bg-marketing-forest-dark"
                aria-label="Send message"
              >
                <Send size={18} strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
