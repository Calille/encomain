import { Container } from "./ui/container";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { MarketingHeading } from "./marketing/marketing-heading";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      question: "How much do I need to pay upfront to get started?",
      answer:
        "We typically require a deposit to begin your project. The remaining balance can be paid through flexible instalments based on your package. Exact terms are confirmed on your intro call.",
    },
    {
      question: "How long does it take to complete a website?",
      answer:
        "Timelines vary by package and content readiness. Most standard sites take a few weeks once assets are approved. We'll set clear expectations before work begins.",
    },
    {
      question: "Do you offer ongoing maintenance after launch?",
      answer:
        "Yes. We can handle security updates, performance checks, and content changes so your site stays fast, secure, and up to date.",
    },
    {
      question: "Can I make changes to my website after it's launched?",
      answer:
        "Yes. You'll have full access to your site, and packages can include monthly content updates. Larger edits or new pages can be added as ongoing care.",
    },
    {
      question: "What happens if I need more than the included pages?",
      answer:
        "Additional pages can be added after the initial build. Each new page is designed, made mobile-friendly, and integrated into your existing site.",
    },
    {
      question: "Do you provide domain registration or hosting?",
      answer:
        "Domain registration isn't included, but we'll guide you through purchasing the right one. We assist with hosting setup and SSL so your site is secure and live-ready.",
    },
    {
      question: "Can I cancel my maintenance plan at any time?",
      answer:
        "Ongoing plans are month-to-month with no long-term contracts. You can cancel with 30 days' notice, and your website remains fully yours.",
    },
    {
      question: "What if I don't have content or branding ready yet?",
      answer:
        "We can help you develop brand identity, content strategy, and copywriting before the build begins so your site launches with strong visuals and messaging.",
    },
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-marketing-mint py-24">
      <Container>
        <div className="mb-16 text-center">
          <MarketingHeading level="p" variant="eyebrow">
            Frequently asked questions
          </MarketingHeading>
          <MarketingHeading level="h2" variant="section" className="mt-2">
            Common questions answered
          </MarketingHeading>
          <p className="mx-auto mt-6 max-w-2xl text-marketing-lg leading-8 text-marketing-muted">
            Answers to the questions we hear most about our process and packages.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="mb-4 overflow-hidden rounded-lg border border-marketing-border bg-white"
            >
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left min-h-[44px]"
                onClick={() => toggleQuestion(index)}
                aria-expanded={openIndex === index}
              >
                <span className="pr-4 font-semibold text-marketing-ink text-marketing-base">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-marketing-forest" strokeWidth={1.5} />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-marketing-forest" strokeWidth={1.5} />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-marketing-base text-marketing-muted leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-marketing-muted text-marketing-base">
            Don't see your question?{" "}
            <Link
              to="/contact#book"
              className="font-semibold text-marketing-forest hover:underline"
            >
              Book a free intro call
            </Link>{" "}
            and we'll help.
          </p>
        </div>
      </Container>
    </section>
  );
}
