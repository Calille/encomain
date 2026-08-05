import { Check, Code2, Boxes, Zap, Database } from "lucide-react";
import { MarketingHeading } from "./marketing/marketing-heading";
import { MarketingCard, MarketingCardIcon } from "./marketing/marketing-card";
import { CtaButton } from "./marketing/cta-button";
import { PageHero } from "./marketing/page-hero";
import { Section } from "./marketing/section";
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

export default function PricingSection() {
  useDocumentTitle(
    "Pricing",
    "Clear Essential, Professional, and Signature packages for UK business websites, plus a short intro call to choose the right fit."
  );

  return (
    <div className="bg-white">
      <PageHero
        title="Pick a package that matches what you need."
        description="Fixed packages for most business websites, or a bespoke quote when the work is bigger. Every project starts with a short intro call."
        actions={
          <CtaButton to="/contact#book" variant="on-dark" size="lg">
            Book a 20 min chat
          </CtaButton>
        }
      />

      {/* Standard packages */}
      <Section tone="mist">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <MarketingHeading level="h2" variant="section">
            Standard packages
          </MarketingHeading>
          <p className="mt-4 text-marketing-lg text-marketing-muted">
            Everything you need to go live, then peace of mind after. One-off build fee plus a small monthly retainer so you're not left maintaining it alone.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
          {packages.map((pkg) => (
            <div key={pkg.name} className="relative flex flex-col">
              {pkg.featured && (
                <span className="marketing-glow-sm absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-marketing-blue-deep px-3.5 py-1 text-marketing-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <MarketingCard
                interactive
                accentEdge
                featured={pkg.featured}
                className="flex h-full flex-col"
              >
                <h3 className="font-marketing-display text-marketing-2xl font-medium text-marketing-ink">
                  {pkg.name}
                </h3>
                <div className="mt-4">
                  <p className="font-marketing-display text-marketing-4xl font-semibold text-marketing-blue-deep">
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
                        className="mt-0.5 h-4 w-4 shrink-0 text-marketing-blue-deep"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <CtaButton
                    to="/contact#book"
                    variant={pkg.featured ? "primary" : "secondary"}
                    fullWidth
                  >
                    Book a 20 min chat
                  </CtaButton>
                </div>
              </MarketingCard>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-marketing-sm leading-relaxed text-marketing-muted">
          Prefer to pay annually? Ten months upfront covers the year and saves you two. Paid ads, premium tools, and specialist add-ons are billed at cost when you need them.
        </p>
      </Section>

      {/* Bespoke lane */}
      <Section tone="navy" hairline className="overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] w-[860px] max-w-[120vw] rounded-full bg-marketing-blue/10 blur-[150px]"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <MarketingHeading level="h2" variant="section" tone="dark">
              Need something beyond a standard site?
            </MarketingHeading>
            <p className="mt-4 text-marketing-lg text-marketing-sky/85">
              We also build custom tools, customer portals, and the quiet systems that save a team hours each week. Every bespoke project is quoted on scope.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
            {bespokeOfferings.map((item) => {
              const Icon = item.icon;
              return (
                <MarketingCard key={item.title} tone="dark" interactive accentEdge>
                  <MarketingCardIcon tone="dark">
                    <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                  </MarketingCardIcon>
                  <h3 className="font-marketing-display text-marketing-xl font-medium text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-marketing-base leading-relaxed text-marketing-sky/80">
                    {item.description}
                  </p>
                </MarketingCard>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <CtaButton to="/contact#book" variant="on-dark">
              Book a 20 min chat about your project
            </CtaButton>
          </div>
        </div>
      </Section>

      {/* Draft-first */}
      <Section tone="white">
        <div className="mx-auto max-w-2xl text-center">
          <MarketingHeading level="h2" variant="section">
            Not sure yet? Start with a draft.
          </MarketingHeading>
          <p className="mt-4 text-marketing-lg leading-relaxed text-marketing-muted">
            For a small fee, we'll design a draft of your site before you commit to the full build. If you go ahead, that fee comes off your final invoice.
          </p>
          <div className="mt-9 flex justify-center">
            <CtaButton to="/contact#book" variant="primary">
              Book a 20 min chat about a draft
            </CtaButton>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="ice">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <MarketingHeading level="h2" variant="section">
            Common questions
          </MarketingHeading>
        </div>
        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq) => (
            <MarketingCard key={faq.question} className="p-6 sm:p-6">
              <h3 className="font-marketing-display text-marketing-lg font-medium text-marketing-ink">
                {faq.question}
              </h3>
              <p className="mt-2 text-marketing-base leading-relaxed text-marketing-muted">
                {faq.answer}
              </p>
            </MarketingCard>
          ))}
        </div>
      </Section>
    </div>
  );
}
