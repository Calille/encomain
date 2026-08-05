import {
  Palette,
  Search,
  ShoppingCart,
  Smartphone,
  Wrench,
  Code,
  Globe,
  FileText,
  Zap,
  CheckCircle2,
  Shield,
  Gauge,
} from "lucide-react";
import Header from "./header";
import Footer from "./footer";
import CTA from "./cta";
import { Chatbot } from "./ui/chatbot";
import StickyCTA from "./sticky-cta";
import { MarketingHeading } from "./marketing/marketing-heading";
import { MarketingCard, MarketingCardIcon } from "./marketing/marketing-card";
import { CtaButton } from "./marketing/cta-button";
import { PageHero } from "./marketing/page-hero";
import { Section } from "./marketing/section";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const services = [
  {
    icon: Palette,
    title: "Website redesign",
    description:
      "Replace a tired brochure with a site that wins enquiries and looks the part next to local competitors.",
  },
  {
    icon: Search,
    title: "Get found locally",
    description:
      "Show up when nearby people search for what you offer, with clear pages and sensible search setup.",
  },
  {
    icon: ShoppingCart,
    title: "Sell without the faff",
    description:
      "A shop that takes payment cleanly, shows stock sensibly, and doesn't confuse customers on their phone.",
  },
  {
    icon: Smartphone,
    title: "Fast on every phone",
    description:
      "Pages that load quickly and stay usable wherever your customers are browsing.",
  },
  {
    icon: Wrench,
    title: "We look after it",
    description:
      "Updates, monitoring, and support handled for you so the site stays safe without your evenings.",
  },
  {
    icon: Code,
    title: "Built for how you work",
    description:
      "Extra features and connections shaped around your process, not a generic template.",
  },
  {
    icon: Globe,
    title: "Reach beyond one area",
    description:
      "Clear structure and language setup when you need customers outside a single local market.",
  },
  {
    icon: FileText,
    title: "Content that earns trust",
    description:
      "Copy and page plans that explain what you do and make the next step feel obvious.",
  },
];

const processSteps = [
  {
    number: 1,
    icon: Search,
    title: "Discovery",
    duration: "1 week",
    description: "We learn what should change for your customers",
  },
  {
    number: 2,
    icon: Palette,
    title: "Design",
    duration: "2 weeks",
    description: "You see layouts built to win the enquiry",
  },
  {
    number: 3,
    icon: Code,
    title: "Build",
    duration: "3-4 weeks",
    description: "We build a fast, phone-friendly site",
  },
  {
    number: 4,
    icon: CheckCircle2,
    title: "Launch",
    duration: "Go live",
    description: "You go live with clear handover",
  },
];

const outcomeLabels = [
  { name: "Fast pages", icon: Gauge },
  { name: "Works on phones", icon: Smartphone },
  { name: "Easy to update", icon: Wrench },
  { name: "Secure by default", icon: Shield },
  { name: "Shows up on Google", icon: Search },
  { name: "Ready to take payments", icon: Zap },
];

export default function Services() {
  useDocumentTitle(
    "Services",
    "Redesign, local search setup, site care, and custom features for UK businesses that want their website to earn enquiries."
  );

  return (
    <div className="bg-white">
      <Header />
      <main>
        <PageHero
          title="The site local customers find when they search for what you sell"
          description="Clear design built to win enquiries, show up in local search, and look more trustworthy than the competition."
          actions={
            <>
              <CtaButton to="/contact#book" variant="on-dark" size="lg">
                Book a 20 min chat
              </CtaButton>
              <CtaButton to="/pricing" variant="ghost-dark" size="lg">
                See our packages
              </CtaButton>
            </>
          }
        />

        {/* Services grid */}
        <Section tone="mist">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <MarketingHeading level="h2" variant="section" className="mb-4">
              What you can get from us
            </MarketingHeading>
            <p className="text-marketing-lg text-marketing-muted">
              From a full redesign to quiet ongoing care, the work most UK businesses actually need online.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <MarketingCard key={service.title} interactive accentEdge>
                  <MarketingCardIcon>
                    <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                  </MarketingCardIcon>
                  <h3 className="mb-3 font-marketing-display text-marketing-xl font-medium text-marketing-ink">
                    {service.title}
                  </h3>
                  <p className="text-marketing-base leading-relaxed text-marketing-muted">
                    {service.description}
                  </p>
                </MarketingCard>
              );
            })}
          </div>
        </Section>

        {/* Process */}
        <Section tone="navy" hairline className="overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] w-[860px] max-w-[120vw] rounded-full bg-marketing-blue/10 blur-[150px]"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <MarketingHeading level="h2" variant="section" tone="dark" className="mb-4">
                How the work unfolds
              </MarketingHeading>
              <p className="text-marketing-lg text-marketing-sky/80">
                A clear path from first chat to a live site that can take enquiries.
              </p>
            </div>

            <div className="hidden md:block">
              <div className="relative">
                <div className="marketing-hairline absolute left-0 right-0 top-12 h-px" />
                <div className="relative grid grid-cols-4 gap-8">
                  {processSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.number} className="text-center">
                        <div className="marketing-glow-lg relative mx-auto mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-marketing-blue text-marketing-2xl font-semibold text-white">
                          <span>{step.number}</span>
                          <div className="absolute -bottom-2 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-marketing-navy-800 ring-1 ring-marketing-blue/40">
                            <Icon className="h-5 w-5 text-marketing-sky" strokeWidth={1.5} />
                          </div>
                        </div>
                        <h3 className="mb-2 font-marketing-display text-marketing-xl font-medium text-white">
                          {step.title}
                        </h3>
                        <p className="mb-2 text-marketing-sm font-semibold uppercase tracking-[0.12em] text-marketing-blue-bright">
                          {step.duration}
                        </p>
                        <p className="text-marketing-sm text-marketing-sky/80">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-8 md:hidden">
              {processSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="flex gap-6">
                    <div className="marketing-glow-lg relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-marketing-blue text-marketing-xl font-semibold text-white">
                      {step.number}
                      <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-marketing-navy-800 ring-1 ring-marketing-blue/40">
                        <Icon className="h-4 w-4 text-marketing-sky" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-1 font-marketing-display text-marketing-xl font-medium text-white">
                        {step.title}
                      </h3>
                      <p className="mb-2 text-marketing-sm font-semibold uppercase tracking-[0.12em] text-marketing-blue-bright">
                        {step.duration}
                      </p>
                      <p className="text-marketing-base text-marketing-sky/80">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Outcome labels (replaces tech stack names) */}
        <Section tone="ice">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <MarketingHeading level="h2" variant="section" className="mb-4">
              Built to stay fast and secure
            </MarketingHeading>
            <p className="text-marketing-lg text-marketing-muted">
              You get a site that loads quickly, works on phones, and is set up properly for the long run.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {outcomeLabels.map((item) => {
              const Icon = item.icon;
              return (
                <MarketingCard
                  key={item.name}
                  interactive
                  className="flex flex-col items-center gap-4 p-5 text-center sm:p-5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-marketing-blue to-marketing-blue-deep text-white">
                    <Icon className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <span className="text-marketing-sm font-semibold text-marketing-ink">
                    {item.name}
                  </span>
                </MarketingCard>
              );
            })}
          </div>
        </Section>

        <CTA />
      </main>
      <Footer />
      <Chatbot />
      <StickyCTA />
    </div>
  );
}
