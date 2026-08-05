import Header from "./header";
import Hero from "./hero";
import Contact from "./contact";
import Footer from "./footer";
import { Chatbot } from "./ui/chatbot";
import StickyCTA from "./sticky-cta";
import WebsiteStory from "./website-story";
import WhatWeDoSection from "./what-we-do";
import WhatsIncluded from "./whats-included";
import TrustSection from "./trust-section";
import { MarketingHeading } from "./marketing/marketing-heading";
import { CtaButton } from "./marketing/cta-button";
import { Section } from "./marketing/section";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function PricingTeaser() {
  return (
    <Section tone="mist" size="sm">
      <div className="mx-auto max-w-2xl text-center">
        <MarketingHeading level="p" variant="eyebrow" className="mb-3">
          Pricing
        </MarketingHeading>
        <MarketingHeading level="h2" variant="section">
          Clear packages, no mystery maths
        </MarketingHeading>
        <p className="mt-4 text-marketing-lg text-marketing-muted">
          Fixed packages for most business sites, plus a bespoke quote when you need something bigger.
        </p>
        <div className="mt-8 flex justify-center">
          <CtaButton to="/pricing" variant="primary">
            See our packages
          </CtaButton>
        </div>
      </div>
    </Section>
  );
}

function Home() {
  useDocumentTitle();

  return (
    <div className="bg-white">
      <Header />
      <main>
        <Hero />
        <WhatWeDoSection />
        <WebsiteStory />
        <WhatsIncluded />
        <TrustSection />
        <PricingTeaser />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
      <StickyCTA />
    </div>
  );
}

export default Home;
