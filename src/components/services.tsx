import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
import { Container } from "./ui/container";
import { AnimatedBackground } from "./ui/animated-background";
import { MarketingHeading } from "./marketing/marketing-heading";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const SERVICES_JSON_LD_ID = "services-json-ld";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

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

  useEffect(() => {
    const existing = document.getElementById(SERVICES_JSON_LD_ID);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = SERVICES_JSON_LD_ID;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: service.title,
          description: service.description,
          provider: {
            "@type": "Organization",
            name: "The Enclosure",
            url: "https://theenclosure.co.uk",
          },
          areaServed: {
            "@type": "Country",
            name: "GB",
          },
        },
      })),
    });
    document.head.appendChild(script);

    return () => {
      document.getElementById(SERVICES_JSON_LD_ID)?.remove();
    };
  }, []);

  return (
    <div className="bg-white">
      <Header />
      <main>
        {/* Soft mint hero (matches About / Contact / Careers) */}
        <section className="relative bg-marketing-mint pt-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatedBackground />
            <div className="absolute left-0 top-0 h-full w-full bg-marketing-mint opacity-90" />
          </div>

          <Container className="relative pt-16 pb-20 sm:pt-24 sm:pb-24">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mx-auto max-w-3xl text-center"
            >
              <motion.div variants={fadeInUp}>
                <MarketingHeading level="h1" variant="display">
                  The site local customers find when they search for what you sell
                </MarketingHeading>
              </motion.div>
              <motion.p
                variants={fadeInUp}
                className="mt-6 text-marketing-lg leading-8 text-marketing-muted max-w-2xl mx-auto"
              >
                Clear design built to win enquiries, show up in local search, and look more trustworthy than the competition.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  to="/contact#book"
                  className="inline-flex items-center justify-center rounded-lg bg-marketing-ink px-6 py-3 text-marketing-base font-semibold text-white transition-colors hover:bg-marketing-forest min-h-[44px]"
                >
                  Book a 20 min chat
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center rounded-lg border border-marketing-forest px-6 py-3 text-marketing-base font-semibold text-marketing-forest transition-colors hover:bg-marketing-forest/10 min-h-[44px]"
                >
                  See our packages
                </Link>
              </motion.div>
            </motion.div>
          </Container>
        </section>

        {/* Services grid */}
        <section className="py-16 md:py-24 bg-marketing-mint">
          <Container>
            <div className="text-center mb-14">
              <MarketingHeading level="h2" variant="section" className="mb-4">
                What you can get from us
              </MarketingHeading>
              <p className="text-marketing-lg text-marketing-muted max-w-2xl mx-auto">
                From a full redesign to quiet ongoing care, the work most UK businesses actually need online.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <article
                    key={service.title}
                    className="rounded-2xl border border-marketing-border bg-white p-8"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-marketing-forest">
                      <Icon className="h-7 w-7 text-white" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <h3 className="font-marketing-display text-marketing-xl font-medium text-marketing-ink mb-3">
                      {service.title}
                    </h3>
                    <p className="text-marketing-base text-marketing-muted leading-relaxed">
                      {service.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Process */}
        <section className="py-16 md:py-24 bg-white">
          <Container>
            <div className="text-center mb-14">
              <MarketingHeading level="h2" variant="section" className="mb-4">
                How the work unfolds
              </MarketingHeading>
              <p className="text-marketing-lg text-marketing-muted max-w-2xl mx-auto">
                A clear path from first chat to a live site that can take enquiries.
              </p>
            </div>

            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute top-12 left-0 right-0 h-px bg-marketing-border" />
                <div className="grid grid-cols-4 gap-8 relative">
                  {processSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.number} className="text-center">
                        <div className="relative mx-auto mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-marketing-forest text-white font-semibold text-marketing-2xl shadow-sm">
                          <span>{step.number}</span>
                          <div className="absolute -bottom-2 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-marketing-forest-dark">
                            <Icon className="h-5 w-5 text-white" strokeWidth={1.5} />
                          </div>
                        </div>
                        <h3 className="font-marketing-display text-marketing-xl font-medium text-marketing-ink mb-2">
                          {step.title}
                        </h3>
                        <p className="text-marketing-sm font-semibold text-marketing-forest mb-2">
                          {step.duration}
                        </p>
                        <p className="text-marketing-sm text-marketing-muted">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="md:hidden space-y-8">
              {processSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="flex gap-6">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-marketing-forest text-white font-semibold text-marketing-xl">
                      {step.number}
                      <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-marketing-forest-dark">
                        <Icon className="h-4 w-4 text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-marketing-display text-marketing-xl font-medium text-marketing-ink mb-1">
                        {step.title}
                      </h3>
                      <p className="text-marketing-sm font-semibold text-marketing-forest mb-2">
                        {step.duration}
                      </p>
                      <p className="text-marketing-base text-marketing-muted">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Outcome labels (replaces tech stack names) */}
        <section className="py-16 md:py-24 bg-marketing-cream">
          <Container>
            <div className="text-center mb-14">
              <MarketingHeading level="h2" variant="section" className="mb-4">
                Built to stay fast and secure
              </MarketingHeading>
              <p className="text-marketing-lg text-marketing-muted max-w-2xl mx-auto">
                You get a site that loads quickly, works on phones, and is set up properly for the long run.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {outcomeLabels.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex flex-col items-center gap-4 rounded-xl border border-marketing-border bg-white p-6"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-marketing-forest text-white">
                      <Icon className="h-8 w-8" strokeWidth={1.5} />
                    </div>
                    <span className="text-marketing-sm font-semibold text-marketing-ink text-center">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        <CTA />
      </main>
      <Footer />
      <Chatbot />
      <StickyCTA />
    </div>
  );
}
