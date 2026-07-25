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
    description: "For small businesses that need a professional presence online.",
    features: [
      "Up to 5 pages",
      "Mobile-optimised responsive design",
      "Contact form with email delivery",
      "Basic on-page SEO setup",
      "Hosting included",
      "Basic database for form submissions and simple content",
      "2 rounds of revisions during build",
    ],
    featured: false,
  },
  {
    name: "Professional",
    oneOff: "£2,499.99",
    year1: "£50/month for year 1",
    year2: "£37.50/month from year 2",
    description: "For businesses that need more than a brochure site.",
    features: [
      "Up to 10 pages",
      "Everything in Essential",
      "Fully custom design, no templates",
      "Blog or news section with content management",
      "Lead capture forms with CRM integration",
      "Google Business Profile setup and optimisation",
      "Intermediate database for content, users, and custom data",
      "3 rounds of revisions during build",
    ],
    featured: true,
  },
  {
    name: "Signature",
    oneOff: "£3,999.99",
    year1: "£100/month for year 1",
    year2: "£75/month from year 2",
    description: "For businesses that want a full digital operation.",
    features: [
      "Unlimited pages",
      "Everything in Professional",
      "Custom web application features (booking, calculators, member areas)",
      "Third-party integrations (Stripe, Mailchimp, HubSpot, and similar)",
      "Custom automation and workflows",
      "Enterprise database for high-traffic and complex data",
      "Priority support in the monthly retainer",
      "4 rounds of revisions during build",
    ],
    featured: false,
  },
];

const bespokeOfferings = [
  {
    icon: Code2,
    title: "Custom web applications",
    description: "Purpose-built tools and experiences beyond a standard marketing site.",
  },
  {
    icon: Boxes,
    title: "SaaS products",
    description: "Product interfaces, dashboards, and platforms shaped around your users.",
  },
  {
    icon: Zap,
    title: "Integrations and automation",
    description: "Stripe, CRM, and third-party API wiring that removes manual work.",
  },
  {
    icon: Database,
    title: "Internal tools and CRM",
    description: "Admin panels, client portals, and systems tailored to how you work.",
  },
];

const faqs = [
  {
    question: "What does the monthly retainer cover?",
    answer:
      "The monthly covers ongoing maintenance, backend fixes, and support if anything goes wrong with your site. Hosting is included in the build fee. Third-party services like paid advertising or premium tools are billed at cost.",
  },
  {
    question: "What happens after year 2?",
    answer:
      "The monthly stays at the year 2 rate for as long as you want us to maintain the site. There is no long-term contract, you can end the retainer at any time with 30 days notice.",
  },
  {
    question: "Do I own the site?",
    answer:
      "Yes. Once the build is complete and paid for, the code and content are yours. If you ever want to move to a different provider, we will hand everything over cleanly.",
  },
  {
    question: "How long does a build take?",
    answer:
      "Essential and Professional builds typically take 3 to 4 weeks. Signature and bespoke projects vary based on scope. We will give you a firm timeline during the intro call.",
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
              Clear packages, or bespoke to fit.
            </MarketingHeading>
            <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted max-w-2xl mx-auto">
              Fixed packages for standard web design work, or a bespoke quote if your project needs something more custom. Every project starts with a free intro call.
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
              Everything you need to go live and stay live. One-off build fee plus a small monthly retainer that covers ongoing maintenance and support.
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
                    <CtaButton className="w-full">Book a free intro call</CtaButton>
                  </div>
                </article>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-marketing-sm text-marketing-muted leading-relaxed">
            Prefer to pay annually? Ten months upfront covers the year and saves you two. Third-party services like paid advertising, premium integrations, and specialist tools are billed at cost when relevant.
          </p>
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
              We also build custom software, SaaS applications, integrations, and internal tools for businesses that have outgrown a standard website. Every bespoke project is quoted individually based on scope.
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
            <CtaButton>Book a free intro call to discuss your project</CtaButton>
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
