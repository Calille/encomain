import { Container } from "./ui/container";
import { AnimatedBackground } from "./ui/animated-background";
import { Calendar, Mail, Phone } from "lucide-react";
import Header from "./header";
import Footer from "./footer";
import { Chatbot } from "./ui/chatbot";
import StickyCTA from "./sticky-cta";
import { Calendly } from "./ui/calendly";
import FAQ from "./faq";
import { MarketingHeading } from "./marketing/marketing-heading";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function ContactPage() {
  useDocumentTitle("Contact");

  return (
    <div className="bg-white">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative bg-marketing-mint pt-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatedBackground />
            <div className="absolute left-0 top-0 h-full w-full bg-marketing-mint opacity-90" />
          </div>

          <Container className="relative pt-16 pb-20 sm:pt-24 sm:pb-24">
            <div className="mx-auto max-w-3xl text-center">
              <MarketingHeading level="h1" variant="display">
                Let's talk about what you're building
              </MarketingHeading>
              <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted max-w-2xl mx-auto">
                Whether you're ready to start or still exploring ideas, we're happy to walk through your goals and what a good next step looks like.
              </p>
            </div>
          </Container>
        </section>

        {/* Contact details + booking */}
        <section className="py-20 sm:py-28 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto mb-16">
              <div className="text-center mb-12">
                <MarketingHeading level="h2" variant="section" className="mb-4">
                  Get in touch
                </MarketingHeading>
                <p className="text-marketing-lg text-marketing-muted max-w-2xl mx-auto mb-8">
                  Prefer email or a quick call? Reach us directly, or book a slot below.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-marketing-lg">
                  <a
                    href="tel:07877700777"
                    className="flex items-center gap-2 text-marketing-forest font-semibold hover:text-marketing-forest-dark transition-colors"
                  >
                    <Phone className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    07877 700 777
                  </a>
                  <span className="hidden sm:block text-marketing-border">|</span>
                  <a
                    href="mailto:hello@theenclosure.co.uk"
                    className="flex items-center gap-2 text-marketing-forest font-semibold hover:text-marketing-forest-dark transition-colors"
                  >
                    <Mail className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    hello@theenclosure.co.uk
                  </a>
                </div>
              </div>
            </div>

            {/* Calendly: id="book" for /contact#book anchors */}
            <div className="max-w-4xl mx-auto" id="book">
              <div className="rounded-2xl border border-marketing-border bg-white p-8">
                <div className="text-center mb-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-marketing-forest/10">
                    <Calendar className="h-8 w-8 text-marketing-forest" strokeWidth={1.5} />
                  </div>
                  <MarketingHeading
                    level="h2"
                    variant="section"
                    className="text-marketing-2xl sm:text-marketing-3xl text-marketing-forest"
                  >
                    Book a free intro call
                  </MarketingHeading>
                  <p className="mt-4 text-marketing-base text-marketing-muted max-w-xl mx-auto leading-relaxed">
                    Free 30-minute intro call. No pitch, no strings, just a conversation about what you're trying to build.
                  </p>
                </div>
                <Calendly
                  url="https://calendly.com/management-theenclosure/30min"
                  className="rounded-xl overflow-hidden border border-marketing-border"
                />
              </div>
            </div>
          </Container>
        </section>

        <FAQ />
      </main>
      <Footer />
      <Chatbot />
      <StickyCTA />
    </div>
  );
}
