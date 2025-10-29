import Header from "./header";
import Hero from "./hero";
import PricingSimple from "./pricing-simple";
import Contact from "./contact";
import Footer from "./footer";
import { Chatbot } from "./ui/chatbot";
import StickyCTA from "./sticky-cta";
import WebsiteStory from "./website-story";
import WhatWeDoSection from "./what-we-do";
import WhatsIncluded from "./whats-included";
import TrustSection from "./trust-section";

function Home() {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <Hero />
        <WhatWeDoSection />
        <WebsiteStory />
        <WhatsIncluded />
        <TrustSection />
        <PricingSimple />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
      <StickyCTA />
    </div>
  );
}

export default Home;
