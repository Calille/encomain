import { Container } from "./ui/container";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <div className="bg-[#1A4D2E]">
      <Container className="py-16 sm:py-24">
        <div className="relative isolate overflow-hidden bg-[#1A1A1A] px-6 py-12 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-20">
          <div
            className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl"
            aria-hidden="true"
          >
            <div
              className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[#7FA99B] to-[#1A4D2E] opacity-25"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>

          {/* Geometric patterns */}
          <div className="absolute top-4 left-4 w-12 h-12 border-4 border-[#7FA99B] rounded-full opacity-20" />
          <div className="absolute bottom-4 right-4 w-8 h-8 bg-[#1A4D2E] rounded-md opacity-20" />

          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Boost Your Online Presence
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Schedule a free consultation call and discover how we can transform your
              online presence.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/contact">
                <Button className="bg-[#2D5F3F] hover:bg-[#2D5F3F]/90 text-white font-medium px-8 py-6 text-lg transition-transform hover:scale-105 shadow-md">
                  Book Your Free Consultation Call
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 transition-transform hover:scale-105"
                >
                  Schedule a Call
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
