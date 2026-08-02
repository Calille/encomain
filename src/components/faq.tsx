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
    <section className="bg-marketing-mint py-24">
      <Container>
        <div className="mb-16 text-center">
          <MarketingHeading level="p" variant="eyebrow">
            Frequently asked questions
          </MarketingHeading>
          <MarketingHeading level="h2" variant="section" className="mt-2">
            Common questions
          </MarketingHeading>
          <p className="mx-auto mt-6 max-w-2xl text-marketing-lg leading-8 text-marketing-muted">
            Straight answers about timing, cost, and what happens after launch.
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
              Book a 20 min chat
            </Link>{" "}
            and we'll help.
          </p>
        </div>
      </Container>
    </section>
  );
}
