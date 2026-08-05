import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { MarketingHeading } from "./marketing/marketing-heading";
import { Section } from "./marketing/section";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      question: "How much do I need to pay upfront?",
      answer:
        "We usually take a deposit to start. The rest can be staged by package. Exact terms are confirmed on your intro call.",
    },
    {
      question: "How long does a website take?",
      answer:
        "It depends on the package and how ready your content is. Most standard sites take a few weeks once assets are approved. We'll set expectations before we start.",
    },
    {
      question: "Do you look after the site after launch?",
      answer:
        "Yes. Updates, checks, and small content changes so the site stays fast and secure without you managing it.",
    },
    {
      question: "Can I change things after launch?",
      answer:
        "Yes. You'll have access to your site, and packages can include monthly updates. Bigger edits or new pages can be added as ongoing care.",
    },
    {
      question: "What if I need more pages later?",
      answer:
        "Extra pages can be added after the first build. Each one is designed, phone-friendly, and fitted into your existing site.",
    },
    {
      question: "Do you provide domain or hosting?",
      answer:
        "Domain registration isn't included, but we'll guide you through buying the right one. Hosting setup and security certificates are part of getting you live.",
    },
    {
      question: "Can I cancel the retainer any time?",
      answer:
        "Yes. Month-to-month, no long-term lock-in. Cancel with 30 days' notice. The website remains yours.",
    },
    {
      question: "What if I don't have content ready yet?",
      answer:
        "We can help with branding and copy before the build so you don't launch with half-finished pages.",
    },
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section tone="ice">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <MarketingHeading level="p" variant="eyebrow">
          Frequently asked questions
        </MarketingHeading>
        <MarketingHeading level="h2" variant="section" className="mt-2">
          Common questions
        </MarketingHeading>
        <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted">
          Straight answers about timing, cost, and what happens after launch.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={faq.question}
              className={`overflow-hidden rounded-2xl border bg-white transition-colors ${
                isOpen
                  ? "border-marketing-blue/45 shadow-marketing-lift"
                  : "border-marketing-border shadow-marketing-card hover:border-marketing-blue/30"
              }`}
            >
              <button
                className="marketing-focus flex min-h-[44px] w-full items-center justify-between gap-4 px-6 py-4 text-left"
                onClick={() => toggleQuestion(index)}
                aria-expanded={isOpen}
              >
                <span className="text-marketing-base font-semibold text-marketing-ink">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-marketing-blue-deep transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 text-marketing-base leading-relaxed text-marketing-muted">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-marketing-base text-marketing-muted">
          Don't see your question?{" "}
          <Link
            to="/contact#book"
            className="marketing-focus rounded font-semibold text-marketing-blue-deep underline underline-offset-4 hover:text-marketing-blue"
          >
            Book a 20 min chat
          </Link>{" "}
          and we'll help.
        </p>
      </div>
    </Section>
  );
}
