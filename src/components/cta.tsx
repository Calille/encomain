import { Container } from "./ui/container";
import { Link } from "react-router-dom";
import { MarketingHeading } from "./marketing/marketing-heading";

export default function CTA() {
  return (
    <div className="bg-marketing-forest">
      <Container className="py-16 sm:py-24">
        <div className="relative isolate overflow-hidden bg-marketing-ink px-6 py-12 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-20">
          <div
            className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl"
            aria-hidden="true"
          >
            <div
              className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-marketing-sage to-marketing-forest opacity-25"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-2xl text-center">
            <MarketingHeading level="h2" variant="section" tone="dark">
              Want a straight view of what's holding the site back?
            </MarketingHeading>
            <p className="mx-auto mt-6 max-w-xl text-marketing-lg leading-8 text-white/75">
              Book a short intro call and we'll talk through what we'd change.
            </p>
            <div className="mt-10 flex items-center justify-center">
              <Link
                to="/contact#book"
                className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-marketing-base font-semibold text-marketing-forest transition-colors hover:bg-marketing-mint min-h-[44px]"
              >
                Book a 20 min chat
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
