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
      "Transform an outdated site into a modern, mobile-first platform built to drive real business results.",
  },
  {
    icon: Search,
    title: "SEO optimisation",
    description:
      "Improve search rankings and attract organic traffic with strategies grounded in measurable growth.",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce solutions",
    description:
      "Shopping experiences with secure checkout, inventory management, and payment integration.",
  },
  {
    icon: Smartphone,
    title: "Mobile and performance",
    description:
      "Fast-loading, responsive sites that work cleanly on every device your customers use.",
  },
  {
    icon: Wrench,
    title: "Website maintenance",
    description:
      "Keep your site secure and performing well with regular updates, monitoring, and support.",
  },
  {
    icon: Code,
    title: "Custom development",
    description:
      "Tailored web applications, API integrations, custom features, and database design.",
  },
  {
    icon: Globe,
    title: "International SEO",
    description:
      "Multilingual and geo-targeted strategies for businesses expanding beyond a single market.",
  },
  {
    icon: FileText,
    title: "Content strategy",
    description:
      "SEO-optimised copywriting and content planning that engages your audience and drives conversions.",
  },
];

const processSteps = [
  {
    number: 1,
    icon: Search,
    title: "Discovery",
    duration: "1 week",
    description: "We analyse your business and goals",
  },
  {
    number: 2,
    icon: Palette,
    title: "Design",
    duration: "2 weeks",
    description: "Create conversion-focused mockups",
  },
  {
    number: 3,
    icon: Code,
    title: "Development",
    duration: "3-4 weeks",
    description: "Build with modern technologies",
  },
  {
    number: 4,
    icon: CheckCircle2,
    title: "Delivery",
    duration: "Launch",
    description: "Go live with full training",
  },
];

const technologies = [
  { name: "React", icon: Code },
  { name: "Next.js", icon: Zap },
  { name: "Tailwind", icon: Palette },
  { name: "TypeScript", icon: FileText },
  { name: "WordPress", icon: Globe },
  { name: "Shopify", icon: ShoppingCart },
];

export default function Services() {
  useDocumentTitle("Services");

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
                  Smart, modern websites designed to convert
                </MarketingHeading>
              </motion.div>
              <motion.p
                variants={fadeInUp}
                className="mt-6 text-marketing-lg leading-8 text-marketing-muted max-w-2xl mx-auto"
              >
                Clear design, solid engineering, and measurable results. We build websites that work as hard as you do.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  to="/contact#book"
                  className="inline-flex items-center justify-center rounded-lg bg-marketing-ink px-6 py-3 text-marketing-base font-semibold text-white transition-colors hover:bg-marketing-forest min-h-[44px]"
                >
                  Book a free intro call
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
                Comprehensive web solutions
              </MarketingHeading>
              <p className="text-marketing-lg text-marketing-muted max-w-2xl mx-auto">
                From complete redesigns to ongoing maintenance, we cover the full stack of work most businesses need online.
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
                Our process
              </MarketingHeading>
              <p className="text-marketing-lg text-marketing-muted max-w-2xl mx-auto">
                A clear path from discovery to launch.
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

        {/* Tech stack */}
        <section className="py-16 md:py-24 bg-marketing-cream">
          <Container>
            <div className="text-center mb-14">
              <MarketingHeading level="h2" variant="section" className="mb-4">
                Built with modern technologies
              </MarketingHeading>
              <p className="text-marketing-lg text-marketing-muted max-w-2xl mx-auto">
                We use proven tools so your website stays fast, secure, and scalable.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {technologies.map((tech) => {
                const Icon = tech.icon;
                return (
                  <div
                    key={tech.name}
                    className="flex flex-col items-center gap-4 rounded-xl border border-marketing-border bg-white p-6"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-marketing-forest text-white">
                      <Icon className="h-8 w-8" strokeWidth={1.5} />
                    </div>
                    <span className="text-marketing-sm font-semibold text-marketing-ink">
                      {tech.name}
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
