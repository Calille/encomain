import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { MessageCircle, X, Send, Zap } from "lucide-react";
import { Link } from "react-router-dom";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: 1,
    text: "👋 Hi there! I'm your AI assistant. How can I help you with your website redesign today?",
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

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = generateResponse(inputValue);
      const newBotMessage: Message = {
        id: messages.length + 2,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    handleSendMessage();
  };

  const handleSubmitEmail = () => {
    if (email.trim() === "") return;

    // Add user email message
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: `My email is: ${email}`,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const newBotMessage: Message = {
        id: messages.length + 2,
        text: "Thanks for providing your email! One of our experts will reach out to you shortly to schedule your free consultation. In the meantime, feel free to ask me any other questions you might have.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newBotMessage]);
      setIsTyping(false);
      setShowEmailCapture(false);
    }, 1000);
  };

  const generateResponse = (
    message: string,
  ): { text: string; showEmailCapture: boolean } => {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("price") ||
      lowerMessage.includes("cost") ||
      lowerMessage.includes("pricing")
    ) {
      return {
        text: "Our website redesign packages are: Essential (£1,997) for startups and small businesses, Professional (£2,997) for growing brands - our most popular option, and Signature (£5,499) for premium digital experiences. We only require a 20% deposit to get started, with the remaining balance paid through flexible monthly installments. Would you like to schedule a free consultation to discuss which plan would be best for your business?",
        showEmailCapture: true,
      };
    } else if (
      lowerMessage.includes("payment") ||
      lowerMessage.includes("deposit") ||
      lowerMessage.includes("pay") ||
      lowerMessage.includes("installment")
    ) {
      return {
        text: "We make our pricing flexible and accessible! You only need to pay a 20% deposit upfront to start your project. The remaining balance can be paid through flexible monthly installments that work with your budget. This way, you can get a premium website without a huge upfront cost.",
        showEmailCapture: true,
      };
    } else if (
      lowerMessage.includes("time") ||
      lowerMessage.includes("long") ||
      lowerMessage.includes("delivery") ||
      lowerMessage.includes("timeline")
    ) {
      return {
        text: "Our typical website redesign takes 6-8 weeks from start to launch, depending on the complexity and your responsiveness with content. We follow a streamlined process: Discovery (1 week) → Design (2 weeks) → Development (3-4 weeks) → Launch. Our AI-powered workflow allows us to deliver quality results efficiently without rushing.",
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
        text: "I'd be happy to set up a free consultation with one of our website experts! We'll discuss your business goals, current website challenges, and how we can help. Could you please provide your email address so we can schedule a time that works for you?",
        showEmailCapture: true,
      };
    } else if (
      lowerMessage.includes("information") ||
      lowerMessage.includes("need from me") ||
      lowerMessage.includes("start") ||
      lowerMessage.includes("begin")
    ) {
      return {
        text: "To get started, we'll need: your current website URL (if applicable), brand assets (logo, colors, fonts), content for your pages, information about your target audience and competitors, and your main business goals. Don't worry if you don't have everything ready - we can help you with content creation too! Would you like to schedule a discovery call?",
        showEmailCapture: true,
      };
    } else if (
      lowerMessage.includes("maintenance") ||
      lowerMessage.includes("support") ||
      lowerMessage.includes("after") ||
      lowerMessage.includes("ongoing")
    ) {
      return {
        text: "Yes! We offer comprehensive ongoing maintenance packages to keep your website secure, fast, and up-to-date. Our Standard plan includes 1 month of post-launch support, and our Premium plan includes 3 months. We also offer monthly maintenance retainers for regular updates, security monitoring, and technical support.",
        showEmailCapture: false,
      };
    } else if (
      lowerMessage.includes("seo") ||
      lowerMessage.includes("google") ||
      lowerMessage.includes("ranking") ||
      lowerMessage.includes("search")
    ) {
      return {
        text: "SEO is a core part of every website we build! All our sites include on-page SEO optimization, fast loading speeds, mobile responsiveness, and clean code that search engines love. We also offer advanced SEO packages for businesses that want comprehensive keyword research, content optimization, and ongoing SEO strategy.",
        showEmailCapture: true,
      };
    } else if (
      lowerMessage.includes("portfolio") ||
      lowerMessage.includes("examples") ||
      lowerMessage.includes("past work") ||
      lowerMessage.includes("previous")
    ) {
      return {
        text: "We've successfully launched 50+ websites across various industries, with a 100% client satisfaction rate. Our clients typically see an 85% increase in conversions after their redesign. I'd love to show you relevant examples during a free consultation call - would you like to schedule one?",
        showEmailCapture: true,
      };
    } else if (
      lowerMessage.includes("cancel") ||
      lowerMessage.includes("refund") ||
      lowerMessage.includes("guarantee")
    ) {
      return {
        text: "We offer a 30-day satisfaction guarantee. If you're not happy with our work within the first 30 days, we'll either revise it until you're satisfied or provide a full refund. We also have a flexible cancellation policy - you can cancel anytime with 30 days' notice. Your satisfaction is our priority!",
        showEmailCapture: false,
      };
    } else if (
      lowerMessage.includes("ai") ||
      lowerMessage.includes("technology") ||
      lowerMessage.includes("modern") ||
      lowerMessage.includes("stack")
    ) {
      return {
        text: "We build websites using cutting-edge technology including React, Next.js, TypeScript, and Tailwind CSS. Our AI-powered design process helps us create modern, fast, and conversion-optimized websites. All our sites are fully responsive, accessible (WCAG 2.1 AA compliant), and built with best practices for performance and security.",
        showEmailCapture: false,
      };
    } else if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("email") ||
      lowerMessage.includes("phone") ||
      lowerMessage.includes("reach")
    ) {
      return {
        text: "You can reach us at josh@theenclosure.co.uk or call us at 07877 700 777. We're also available through our contact page where you can book a free consultation call directly into our calendar. What's the best way for us to get in touch with you?",
        showEmailCapture: true,
      };
    } else {
      return {
        text: "Thanks for your message! That's a great question. To provide you with the most accurate and personalized information, it would be best to speak with one of our website experts directly. Would you like to schedule a free 30-minute consultation call?",
        showEmailCapture: true,
      };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A4D2E] text-white shadow-lg hover:bg-[#1A4D2E]/90 transition-all duration-300 hover:scale-105 min-h-[44px] min-w-[44px]"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <MessageCircle size={20} className="sm:w-6 sm:h-6" />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 sm:bottom-20 w-[calc(100vw-2rem)] max-w-[320px] sm:max-w-[384px] h-[calc(100vh-8rem)] max-h-[500px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-[#1A4D2E] text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center min-w-0">
              <Zap className="mr-2 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" size={16} />
              <h3 className="font-semibold text-sm sm:text-base truncate">The Enclosure AI Assistant</h3>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 flex-shrink-0 ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close chat"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.sender === "user" ? "flex justify-end" : "flex justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${message.sender === "user" ? "bg-[#1A4D2E] text-white" : "bg-white text-gray-800 border border-gray-200"}`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white text-gray-800 rounded-lg p-3 border border-gray-200">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Email capture */}
          {showEmailCapture && (
            <div className="p-4 bg-[#1A4D2E]/5 border-t border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                Enter your email to schedule a free consultation:
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
                  className="bg-[#2D5F3F] hover:bg-[#2D5F3F]/90 text-white min-h-[44px] px-4"
                >
                  Submit
                </Button>
              </div>
            </div>
          )}

          {/* Quick questions */}
          <div className="p-2 bg-gray-50 border-t border-gray-200 overflow-x-auto whitespace-nowrap">
            <div className="flex gap-2">
              {commonQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-700 whitespace-nowrap"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
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
                className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Send message"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
