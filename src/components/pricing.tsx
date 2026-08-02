import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Code2, Boxes, Zap, Database } from "lucide-react";
import { Container } from "./ui/container";
import { MarketingHeading } from "./marketing/marketing-heading";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const packages = [
  {
    name: "Essential",
    oneOff: "£1,749.99",
    year1: "£50/month for year 1",
    year2: "£37.50/month from year 2",
    description: "For businesses that need a proper site fast without paying for things they won't use.",
    features: [
      "A five-page site that captures enquiries and works cleanly on phones",
      "Contact form that lands in your inbox",
      "Set up so local search has a fair shot at finding you",
      "Hosting included so you're not hunting for a host",
      "Two revision rounds during the build",
    ],
    featured: false,
  },
  {
    name: "Professional",
    oneOff: "£2,499.99",
    year1: "£50/month for year 1",
    year2: "£37.50/month from year 2",
    description: "For businesses that want the site to keep working after launch: more pages, clearer leads, and a stronger local presence.",
    features: [
      "Up to ten pages, everything in Essential, plus room to grow",
      "Designed for your business, not pulled from a template",
      "Forms that capture leads and feed into the tools you already use",
      "Google Business Profile set up so locals can find and trust you",
      "Three revision rounds during the build",
    ],
    featured: true,
  },
  {
    name: "Signature",
    oneOff: "£3,999.99",
    year1: "£100/month for year 1",
    year2: "£75/month from year 2",
    description: "For businesses that need the site to do more than explain: bookings, members areas, payments, and the workflows behind them.",
    features: [
      "Everything in Professional, with room for custom features",
      "Bookings, calculators, or member areas built around how you sell",
      "Payments and mailing tools connected so you're not copying data by hand",
      "Priority support in the monthly retainer",
      "Four revision rounds during the build",
    ],
    featured: false,
  },
];

const bespokeOfferings = [
  {
    icon: Code2,
    title: "Tools built around your process",
    description: "Software shaped to how you actually work, not a bolted-on form.",
  },
  {
    icon: Boxes,
    title: "Products your customers can use",
    description: "Clear interfaces and dashboards for the people who pay you.",
  },
  {
    icon: Zap,
    title: "Less copying between apps",
    description: "Payments, mail, and your other tools talking to each other so you don't.",
  },
  {
    icon: Database,
    title: "Systems your team can live in",
    description: "Client portals and admin tools that match your real workflow.",
  },
];

const faqs = [
  {
    question: "What does the monthly retainer cover?",
    answer:
      "Peace of mind after launch: fixes, updates, and support when something goes wrong. Hosting is included in the build fee. Paid ads and premium tools are billed at cost.",
  },
  {
    question: "What happens after year 2?",
    answer:
      "The monthly stays at the year 2 rate for as long as you want us looking after the site. No long-term lock-in; you can end the retainer with 30 days' notice.",
  },
  {
    question: "Do I own the site?",
    answer:
      "Yes. Once the build is complete and paid for, the site is yours. If you ever move elsewhere, we'll hand everything over cleanly.",
  },
  {
    question: "How long does a build take?",
    answer:
      "Essential and Professional builds typically take 3 to 4 weeks. Signature and bespoke work varies with scope. We'll give you a firm timeline on the intro call.",
  },
];

function CtaButton({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to="/contact#book"
      className={`inline-flex items-center justify-center rounded-lg bg-marketing-ink px-6 py-3 text-marketing-base font-semibold text-white transition-colors hover:bg-marketing-forest min-h-[44px] ${className}`}
    >
      {children}
    </Link>
  );
}

export default function PricingSection() {
  useDocumentTitle(
    "Pricing",
    "Clear Essential, Professional, and Signature packages for UK business websites, plus a short intro call to choose the right fit."
  );

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-marketing-mint pt-32 overflow-hidden">
        <Container className="relative pt-20 pb-20 sm:pt-28 sm:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <MarketingHeading level="h1" variant="display">
              Pick a package that matches what you need.
            </MarketingHeading>
            <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted max-w-2xl mx-auto">
              Fixed packages for most business websites, or a bespoke quote when the work is bigger. Every project starts with a short intro call.
            </p>
            <div className="mt-10">
              <CtaButton>Book a 20 min chat</CtaButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Standard packages */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="mx-auto max-w-2xl text-center mb-14">
            <MarketingHeading level="h2" variant="section">
              Standard packages
            </MarketingHeading>
            <p className="mt-4 text-marketing-lg text-marketing-muted">
              Everything you need to go live, then peace of mind after. One-off build fee plus a small monthly retainer so you're not left maintaining it alone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {packages.map((pkg) => (
              <div key={pkg.name} className="relative flex flex-col">
                {pkg.featured && (
                  <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-marketing-forest px-3 py-1 text-marketing-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <article
                  className={`flex h-full flex-col rounded-2xl border p-8 ${
                    pkg.featured
                      ? "border-marketing-forest/30 bg-marketing-mint"
                      : "border-marketing-border bg-white"
                  }`}
                >
                  <h3 className="font-marketing-display text-marketing-2xl font-medium text-marketing-ink">
                    {pkg.name}
                  </h3>
                  <div className="mt-4">
                    <p className="font-marketing-display text-marketing-4xl font-semibold text-marketing-forest">
                      {pkg.oneOff}
                    </p>
                    <p className="mt-1 text-marketing-sm text-marketing-ink">
                      one-off
                    </p>
                    <p className="mt-3 text-marketing-sm text-marketing-ink">
                      {pkg.year1}
                    </p>
                    <p className="mt-1 text-marketing-xs text-marketing-muted">
                      {pkg.year2}
                    </p>
                  </div>
                  <p className="mt-4 text-marketing-base text-marketing-muted">
                    {pkg.description}
                  </p>
                  <ul className="mt-8 flex-1 space-y-3">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-marketing-sm text-marketing-ink"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-marketing-forest"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <CtaButton className="w-full">Book a 20 min chat</CtaButton>
                  </div>
                </article>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-marketing-sm text-marketing-muted leading-relaxed">
            Prefer to pay annually? Ten months upfront covers the year and saves you two. Paid ads, premium tools, and specialist add-ons are billed at cost when you need them.
          </p>
        </Container>
      </section>

      {/* Bespoke lane */}
      <section className="py-20 sm:py-28 bg-marketing-cream">
        <Container>
          <div className="mx-auto max-w-2xl text-center mb-14">
            <MarketingHeading level="h2" variant="section">
              Need something beyond a standard site?
            </MarketingHeading>
            <p className="mt-4 text-marketing-lg text-marketing-muted">
              We also build custom tools, customer portals, and the quiet systems that save a team hours each week. Every bespoke project is quoted on scope.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
            {bespokeOfferings.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-marketing-border bg-white p-8"
                >
                  <Icon
                    className="mb-4 h-7 w-7 text-marketing-forest"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <h3 className="font-marketing-display text-marketing-xl font-medium text-marketing-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-marketing-base leading-relaxed text-marketing-muted">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <CtaButton>Book a 20 min chat about your project</CtaButton>
          </div>
        </Container>
      </section>

      {/* Draft-first */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <MarketingHeading level="h2" variant="section">
              Not sure yet? Start with a draft.
            </MarketingHeading>
            <p className="mt-4 text-marketing-lg leading-relaxed text-marketing-muted">
              For a small fee, we'll design a draft of your site before you commit to the full build. If you go ahead, that fee comes off your final invoice.
            </p>
            <div className="mt-10">
              <CtaButton>Book a 20 min chat about a draft</CtaButton>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 bg-marketing-mint">
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <MarketingHeading level="h2" variant="section">
              Common questions
            </MarketingHeading>
          </div>
          <div className="mx-auto max-w-3xl space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-marketing-border bg-white p-6"
              >
                <h3 className="font-marketing-display text-marketing-lg font-medium text-marketing-ink">
                  {faq.question}
                </h3>
                <p className="mt-2 text-marketing-base leading-relaxed text-marketing-muted">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
