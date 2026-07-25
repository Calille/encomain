import { Link } from "react-router-dom";
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
import { Container } from "./ui/container";
import { MarketingHeading } from "./marketing/marketing-heading";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function PricingTeaser() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <MarketingHeading level="p" variant="eyebrow" className="mb-3">
            Pricing
          </MarketingHeading>
          <MarketingHeading level="h2" variant="section">
            Clear packages for standard web work
          </MarketingHeading>
          <p className="mt-4 text-marketing-lg text-marketing-muted">
            Fixed packages for most business websites, plus bespoke quotes when you need something more ambitious.
          </p>
          <div className="mt-8">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-marketing-ink px-6 py-3 text-marketing-base font-semibold text-white transition-colors hover:bg-marketing-forest min-h-[44px]"
            >
              See our packages
            </Link>
          </div>
        </div>
      </Container>
    </section>
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
