import { Container } from "./ui/container";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      question: "How much do I need to pay upfront to get started?",
      answer: "We only require a 20% deposit to begin your project. The remaining balance can be paid through flexible monthly installments based on your package. This makes it easier to spread out costs while we bring your website to life."
    },
    {
      question: "How long does it take to complete a website?",
      answer: "Timelines vary by package: Essential takes 3–4 weeks, Professional takes 5–7 weeks, and Signature takes 8–12 weeks. These estimates begin once your content and assets are approved."
    },
    {
      question: "Do you offer ongoing maintenance after launch?",
      answer: "Yes — all our packages include ongoing maintenance. We handle security updates, performance checks, and content changes so your site stays fast, secure, and up to date year-round."
    },
    {
      question: "Can I make changes to my website after it's launched?",
      answer: "Absolutely. You'll have full access to your site, and we also include monthly content updates in every plan. Larger edits or new pages can be added anytime as part of our ongoing care."
    },
    {
      question: "What happens if I need more than the included pages?",
      answer: "No problem! Additional pages can be added for £199 per page after the initial build. Each new page is fully designed, mobile-optimized, and integrated into your existing site seamlessly."
    },
    {
      question: "Do you provide domain registration or hosting?",
      answer: "While domain registration isn't included, we'll guide you through purchasing the right one. We assist with hosting setup and SSL certification to ensure your website is secure and live-ready."
    },
    {
      question: "Can I cancel my maintenance plan at any time?",
      answer: "Yes — all ongoing plans are month-to-month with no long-term contracts. You can cancel anytime with 30 days' notice, and your website remains fully yours."
    },
    {
      question: "What if I don't have content or branding ready yet?",
      answer: "No worries. We can help you develop brand identity, content strategy, and copywriting before the build begins. This ensures your site launches with strong visuals and messaging that convert visitors into clients."
    }
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-[#F8FAF9]">
      <Container>
        <div className="text-center mb-16">
          <motion.h2 
            className="text-base font-semibold leading-7 text-[#7FA99B]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p 
            className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Common Questions Answered
          </motion.p>
          <motion.p 
            className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Get answers to the most common questions about our website redesign process.
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              className="mb-4 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                className="flex justify-between items-center w-full px-6 py-4 text-left"
                onClick={() => toggleQuestion(index)}
              >
                <span className="font-semibold text-[#1A1A1A]">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-[#1A4D2E]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#1A4D2E]" />
                )}
              </button>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: openIndex === index ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-gray-600">
            Don't see your question? <a href="/contact" className="text-[#1A4D2E] font-semibold hover:underline">Contact us</a> and we'll be happy to help.
          </p>
        </motion.div>
      </Container>
    </section>
  );
} 