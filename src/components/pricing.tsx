import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Code2, Boxes, Plug, Wrench } from "lucide-react";
import { Container } from "./ui/container";
import { MarketingHeading } from "./marketing/marketing-heading";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// TODO: confirm current pricing with Josh
const packages = [
  {
    name: "Essential",
    // TODO: confirm current pricing with Josh
    price: "TBD",
    description: "A clear, professional site for businesses getting online properly for the first time.",
    features: [
      "Up to 5 responsive pages",
      "Mobile-first design",
      "Contact form with email notifications",
      "Core SEO setup",
      "Hosting and SSL guidance",
      "One round of revisions",
    ],
    featured: false,
  },
  {
    name: "Professional",
    // TODO: confirm current pricing with Josh
    price: "TBD",
    description: "For growing brands that need more pages, integrations, and conversion focus.",
    features: [
      "Up to 10 responsive pages",
      "Advanced on-page SEO",
      "Booking or CRM integration",
      "Analytics and tracking setup",
      "Subtle motion and micro-interactions",
      "Two rounds of revisions",
    ],
    featured: true,
  },
  {
    name: "Signature",
    // TODO: confirm current pricing with Josh
    price: "TBD",
    description: "A premium build for brands that need custom design, copy, and deeper integrations.",
    features: [
      "Up to 18 custom pages or e-commerce structure",
      "Bespoke UI/UX design",
      "Full copywriting for core pages",
      "Custom integrations and APIs",
      "Dedicated project contact",
      "Three rounds of revisions",
    ],
    featured: false,
  },
];

const bespokeOfferings = [
  {
    icon: Code2,
    title: "Custom web applications",
    description: "Purpose-built tools and experiences that go beyond a standard marketing site.",
  },
  {
    icon: Boxes,
    title: "SaaS products",
    description: "Product interfaces, dashboards, and multi-tenant platforms shaped around your users.",
  },
  {
    icon: Plug,
    title: "Integrations and automation",
    description: "Stripe, CRM, and third-party API wiring that removes manual work from your day.",
  },
  {
    icon: Wrench,
    title: "Internal tools and CRM builds",
    description: "Admin panels, client portals, and internal systems tailored to how you actually work.",
  },
];

const faqs = [
  {
    question: "How do payments work?",
    answer:
      "Projects typically start with a deposit, with the balance billed in agreed stages. Exact terms are confirmed on your intro call and in your proposal.",
  },
  {
    question: "How long does a standard website take?",
    answer:
      "Most package sites ship in a few weeks once content is ready. Larger or bespoke work takes longer, and we will set expectations clearly before we start.",
  },
  {
    question: "Who owns the code and design?",
    answer:
      "Once the project is paid in full, you own the final deliverables. We can also show completed work in our portfolio unless you ask us not to.",
  },
  {
    question: "How many revisions are included?",
    answer:
      "Each package includes a set number of revision rounds. Extra rounds or scope changes are quoted before we proceed.",
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
  useDocumentTitle("Pricing");

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-marketing-mint pt-32 overflow-hidden">
        <Container className="relative pt-16 pb-20 sm:pt-24 sm:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <MarketingHeading level="p" variant="eyebrow" className="mb-4">
              Pricing
            </MarketingHeading>
            <MarketingHeading level="h1" variant="display">
              Straightforward pricing. No fluff.
            </MarketingHeading>
            <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted max-w-2xl mx-auto">
              Fixed packages for standard web design work, or a bespoke quote if your project is more ambitious. Every project starts with a free intro call.
            </p>
            <div className="mt-10">
              <CtaButton>Book a free intro call</CtaButton>
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
              For most business websites, these packages cover everything you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {packages.map((pkg) => (
              <div key={pkg.name} className="relative flex flex-col">
                {pkg.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-marketing-forest px-3 py-1 text-marketing-xs font-semibold text-white whitespace-nowrap">
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
                  <p className="mt-3 font-marketing-display text-marketing-4xl font-semibold text-marketing-forest">
                    {pkg.price === "TBD" ? "Price on request" : pkg.price}
                  </p>
                  <p className="mt-3 text-marketing-base text-marketing-muted">
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
                    <CtaButton className="w-full">Book a free intro call</CtaButton>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Bespoke lane */}
      <section className="py-20 sm:py-28 bg-marketing-cream">
        <Container>
          <div className="mx-auto max-w-2xl text-center mb-14">
            <MarketingHeading level="h2" variant="section">
              Something more ambitious?
            </MarketingHeading>
            <p className="mt-4 text-marketing-lg text-marketing-muted">
              We also build custom software, SaaS applications, integrations, and internal tools. Every bespoke project is quoted individually based on scope.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {bespokeOfferings.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-marketing-border bg-white p-8"
                >
                  <Icon
                    className="h-7 w-7 text-marketing-forest mb-4"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <h3 className="font-marketing-display text-marketing-xl font-medium text-marketing-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-marketing-base text-marketing-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <CtaButton>Book a free intro call to discuss your project</CtaButton>
          </div>
        </Container>
      </section>

      {/* Draft-first offer */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <MarketingHeading level="h2" variant="section">
              Not sure yet? Start with a draft.
            </MarketingHeading>
            <p className="mt-4 text-marketing-lg text-marketing-muted leading-relaxed">
              For a small fee, we will design and prototype a draft of your site before you commit to the full project. If you go ahead, the cost of the draft comes off your final invoice.
            </p>
            <div className="mt-10">
              <CtaButton>Book a free intro call to discuss a draft</CtaButton>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 bg-marketing-mint">
        <Container>
          <div className="mx-auto max-w-2xl text-center mb-12">
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
                <p className="mt-2 text-marketing-base text-marketing-muted leading-relaxed">
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
