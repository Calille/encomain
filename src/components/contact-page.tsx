import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { Calendar, Mail, MessageCircle } from "lucide-react";
import { Container } from "./ui/container";
import { AnimatedBackground } from "./ui/animated-background";
import Header from "./header";
import Footer from "./footer";
import { Chatbot } from "./ui/chatbot";
import StickyCTA from "./sticky-cta";
import FAQ from "./faq";
import { MarketingHeading } from "./marketing/marketing-heading";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { MARKETING_CONFIG, whatsappLink } from "../config/marketing";

const CAL_UI = {
  hideEventTypeDetails: false,
  layout: "month_view" as const,
  theme: "light" as const,
  styles: {
    branding: {
      brandColor: "#1A4D2E",
    },
  },
};

const CAL_CONFIG = {
  layout: "month_view" as const,
  theme: "light" as const,
  useSlotsViewOnSmallScreen: "true",
};

export default function ContactPage() {
  useDocumentTitle(
    "Contact",
    "Tell us what's not working on your site. Book a short intro call, message on WhatsApp, or email The Enclosure."
  );

  // Configure Cal UI once on mount; Cal component mounts separately below
  useEffect(() => {
    let cancelled = false;
    (async function () {
      const cal = await getCalApi({ namespace: MARKETING_CONFIG.cal.namespace });
      if (!cancelled) {
        cal("ui", CAL_UI);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white">
      <Header />
      <main>
        {/* Hero: one primary CTA */}
        <section className="relative bg-marketing-mint pt-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatedBackground />
            <div className="absolute left-0 top-0 h-full w-full bg-marketing-mint opacity-90" />
          </div>

          <Container className="relative pt-20 pb-20 sm:pt-28 sm:pb-24">
            <div className="mx-auto max-w-3xl text-center">
              <MarketingHeading level="h1" variant="display">
                Tell us what's not working
              </MarketingHeading>
              <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted max-w-2xl mx-auto">
                Whether you're ready to start or still weighing it up, we'll walk through your site and what a sensible next step looks like.
              </p>
              <div className="mt-10">
                <a
                  href="#book"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-marketing-ink px-6 py-3 text-marketing-base font-semibold text-white transition-colors hover:bg-marketing-forest"
                >
                  Book a 20 min chat
                </a>
              </div>
            </div>
          </Container>
        </section>

        {/* Write-first contact methods */}
        <section className="py-20 sm:py-28 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto mb-16">
              <div className="text-center mb-12">
                <MarketingHeading level="h2" variant="section" className="mb-4">
                  Prefer to write first?
                </MarketingHeading>
                <p className="text-marketing-lg text-marketing-muted max-w-2xl mx-auto mb-10">
                  Message us on WhatsApp or email. We'll reply within 24 hours.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-marketing-border bg-marketing-cream p-6 transition-colors hover:border-marketing-forest/40"
                  >
                    <MessageCircle
                      className="mb-4 h-7 w-7 text-marketing-forest"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <p className="font-semibold text-marketing-ink text-marketing-lg">
                      Message us on WhatsApp
                    </p>
                    <p className="mt-2 text-marketing-sm text-marketing-muted">
                      Quick questions, or a short chat before you book a call.
                    </p>
                  </a>

                  <a
                    href="mailto:hello@theenclosure.co.uk"
                    className="rounded-2xl border border-marketing-border bg-marketing-cream p-6 transition-colors hover:border-marketing-forest/40"
                  >
                    <Mail
                      className="mb-4 h-7 w-7 text-marketing-forest"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <p className="font-semibold text-marketing-ink text-marketing-lg">
                      Email us
                    </p>
                    <p className="mt-2 text-marketing-sm text-marketing-muted">
                      hello@theenclosure.co.uk
                    </p>
                  </a>
                </div>

                <p className="mt-8 text-marketing-sm text-marketing-muted">
                  <a
                    href="#book"
                    className="underline underline-offset-2 transition-colors hover:text-marketing-forest"
                  >
                    Or scroll down to pick a time
                  </a>
                </p>
              </div>
            </div>

            {/* Cal.com booking: id="book" for /contact#book anchors */}
            <div className="max-w-4xl mx-auto" id="book">
              <div className="rounded-2xl border border-marketing-border bg-marketing-cream p-6 sm:p-8">
                <div className="text-center mb-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-marketing-forest/10">
                    <Calendar className="h-8 w-8 text-marketing-forest" strokeWidth={1.5} />
                  </div>
                  <MarketingHeading level="h2" variant="section">
                    Book a 20 min chat
                  </MarketingHeading>
                  <p className="mt-4 text-marketing-base text-marketing-muted max-w-xl mx-auto leading-relaxed">
                    A short intro call. No hard sell. Just a look at your current site and what we'd change.
                  </p>
                </div>
                {/* Explicit pixel height so Cal's height:inherit resolves correctly */}
                <div className="h-[900px] w-full rounded-xl border border-marketing-border bg-white md:h-[700px]">
                  <Cal
                    namespace={MARKETING_CONFIG.cal.namespace}
                    calLink={MARKETING_CONFIG.cal.calLink}
                    style={{ width: "100%", height: "100%" }}
                    config={CAL_CONFIG}
                  />
                </div>
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
