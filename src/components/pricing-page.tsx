import Header from "./header";
import Footer from "./footer";
import { Chatbot } from "./ui/chatbot";
import StickyCTA from "./sticky-cta";
import PricingSection from "./pricing";

export default function PricingPage() {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <PricingSection />
      </main>
      <Footer />
      <Chatbot />
      <StickyCTA />
    </div>
  );
}
