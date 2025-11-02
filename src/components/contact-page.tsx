import { Container } from "./ui/container";
import { Button } from "./ui/button";
import { AnimatedBackground } from "./ui/animated-background";
import { Calendar } from "lucide-react";
import Header from "./header";
import Footer from "./footer";
import { Chatbot } from "./ui/chatbot";
import StickyCTA from "./sticky-cta";
import { t } from "../utils/i18n";
import { Calendly } from "./ui/calendly";
import FAQ from "./faq";

export default function ContactPage() {
  return (
    <div className="bg-white">
      <Header />
      <main>
        {/* Hero section */}
        <div className="relative bg-[#F8FAF9] pt-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatedBackground />
            <div className="absolute left-0 top-0 h-full w-full bg-[#F8FAF9] opacity-90" />
          </div>

          <Container className="relative pt-16 pb-20 sm:pt-24 sm:pb-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A] sm:text-5xl">
                Let's Build Something Great Together
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
                We'd love to hear about your project. Whether you're ready to start or just exploring ideas, our team will guide you through every step — from concept to launch.
              </p>
            </div>
          </Container>
        </div>

        {/* Contact section */}
        <div className="py-24 sm:py-32 bg-white">
          <Container>
            {/* Get in Touch Section */}
            <div className="max-w-4xl mx-auto mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
                  Get in Touch
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                  We're always happy to chat — whether it's about a new project, partnership, or a simple question.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-lg">
                  <a 
                    href="tel:07877700777" 
                    className="flex items-center gap-2 text-[#1A4D2E] font-semibold hover:text-[#2D5F3F] transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    07877 700 777
                  </a>
                  <span className="hidden sm:block text-gray-300">|</span>
                  <a 
                    href="mailto:hello@theenclosure.co.uk" 
                    className="flex items-center gap-2 text-[#1A4D2E] font-semibold hover:text-[#2D5F3F] transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    hello@theenclosure.co.uk
                  </a>
                </div>
              </div>
            </div>

            {/* Calendly Integration */}
            <div className="max-w-4xl mx-auto" id="calendly-section">
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#1A4D2E]/10 mx-auto rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-[#1A4D2E]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1A4D2E]">
                    Book a Free Consultation
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Pick a time that suits you best — we'll discuss your goals, challenges, and how we can help bring your vision to life.
                  </p>
                </div>
                <Calendly 
                  url="https://calendly.com/management-theenclosure/30min" 
                  className="rounded-xl overflow-hidden border border-gray-100"
                />
              </div>
            </div>

            {/* Final CTA Section */}
            <div className="mt-24 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-[#1A4D2E] to-[#2D5F3F] rounded-2xl p-12 text-center text-white shadow-xl">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
                  Schedule your free consultation or drop us a message — we'll get back within 24 hours.
                </p>
                <button
                  onClick={() => {
                    const calendlySection = document.getElementById('calendly-section');
                    if (calendlySection) {
                      calendlySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="bg-white text-[#1A4D2E] px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1A4D2E] min-h-[44px]"
                >
                  Book Your Call
                </button>
              </div>
            </div>
          </Container>
        </div>

        {/* FAQ section */}
        <FAQ />
      </main>
      <Footer />
      <Chatbot />
      <StickyCTA />
    </div>
  );
}
