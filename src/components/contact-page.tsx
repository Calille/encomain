import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { Calendar, Mail, MessageCircle } from "lucide-react";
import Header from "./header";
import Footer from "./footer";
import { Chatbot } from "./ui/chatbot";
import StickyCTA from "./sticky-cta";
import FAQ from "./faq";
import { MarketingHeading } from "./marketing/marketing-heading";
import { MarketingCard } from "./marketing/marketing-card";
import { CtaButton } from "./marketing/cta-button";
import { PageHero } from "./marketing/page-hero";
import { Section } from "./marketing/section";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { MARKETING_CONFIG, whatsappLink } from "../config/marketing";

const CAL_UI = {
  hideEventTypeDetails: false,
  layout: "month_view" as const,
  theme: "light" as const,
  styles: {
    branding: {
      // Logo blue, matching --marketing-blue
      brandColor: "#468EFD",
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
        <PageHero
          title="Tell us what's not working"
          description="Whether you're ready to start or still weighing it up, we'll walk through your site and what a sensible next step looks like."
          actions={
            <CtaButton href="#book" variant="on-dark" size="lg">
              Book a 20 min chat
            </CtaButton>
          }
        />

        {/* Write-first contact methods */}
        <Section tone="mist">
          <div className="mx-auto mb-16 max-w-4xl">
            <div className="mb-12 text-center">
              <MarketingHeading level="h2" variant="section" className="mb-4">
                Prefer to write first?
              </MarketingHeading>
              <p className="mx-auto mb-10 max-w-2xl text-marketing-lg text-marketing-muted">
                Message us on WhatsApp or email. We'll reply within 24 hours.
              </p>

              <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2">
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="marketing-focus rounded-2xl"
                >
                  <MarketingCard interactive accentEdge className="h-full">
                    <MessageCircle
                      className="mb-4 h-7 w-7 text-marketing-blue-deep"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <p className="text-marketing-lg font-semibold text-marketing-ink">
                      Message us on WhatsApp
                    </p>
                    <p className="mt-2 text-marketing-sm text-marketing-muted">
                      Quick questions, or a short chat before you book a call.
                    </p>
                  </MarketingCard>
                </a>

                <a
                  href="mailto:hello@theenclosure.co.uk"
                  className="marketing-focus rounded-2xl"
                >
                  <MarketingCard interactive accentEdge className="h-full">
                    <Mail
                      className="mb-4 h-7 w-7 text-marketing-blue-deep"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <p className="text-marketing-lg font-semibold text-marketing-ink">
                      Email us
                    </p>
                    <p className="mt-2 text-marketing-sm text-marketing-muted">
                      hello@theenclosure.co.uk
                    </p>
                  </MarketingCard>
                </a>
              </div>

              <p className="mt-8 text-marketing-sm text-marketing-muted">
                <a
                  href="#book"
                  className="marketing-focus rounded underline underline-offset-4 transition-colors hover:text-marketing-blue-deep"
                >
                  Or scroll down to pick a time
                </a>
              </p>
            </div>
          </div>

          {/* Cal.com booking: id="book" for /contact#book anchors */}
          <div className="mx-auto max-w-4xl" id="book">
            <MarketingCard accentEdge className="marketing-glow-sm">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-marketing-blue to-marketing-blue-deep">
                  <Calendar className="h-8 w-8 text-white" strokeWidth={1.5} />
                </div>
                <MarketingHeading level="h2" variant="section">
                  Book a 20 min chat
                </MarketingHeading>
                <p className="mx-auto mt-4 max-w-xl text-marketing-base leading-relaxed text-marketing-muted">
                  A short intro call. No hard sell. Just a look at your current site and what we'd change.
                </p>
              </div>
              {/* Explicit pixel height so Cal's height:inherit resolves correctly */}
              <div className="h-[900px] w-full overflow-hidden rounded-xl border border-marketing-border bg-white md:h-[700px]">
                <Cal
                  namespace={MARKETING_CONFIG.cal.namespace}
                  calLink={MARKETING_CONFIG.cal.calLink}
                  style={{ width: "100%", height: "100%" }}
                  config={CAL_CONFIG}
                />
              </div>
            </MarketingCard>
          </div>
        </Section>

        <FAQ />
      </main>
      <Footer />
      <Chatbot />
      <StickyCTA />
    </div>
  );
}
