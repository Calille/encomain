import { Container } from "./ui/container";
import { MarketingHeading } from "./marketing/marketing-heading";

export default function TrustSection() {
  return (
    <section className="bg-marketing-mint py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-16 text-center">
            <MarketingHeading level="p" variant="eyebrow">
              Who you'll work with
            </MarketingHeading>
          </div>

          <div className="mb-20 grid grid-cols-1 gap-20 md:grid-cols-2">
            <div className="text-center">
              <div className="mx-auto mb-8 flex h-[140px] w-[140px] items-center justify-center rounded-full bg-marketing-forest">
                <svg
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-full w-full fill-white/90"
                  aria-hidden="true"
                >
                  <circle cx="50" cy="35" r="15" />
                  <path d="M 30 50 Q 30 45 35 45 L 65 45 Q 70 45 70 50 L 75 80 Q 75 85 70 85 L 30 85 Q 25 85 25 80 Z" />
                </svg>
              </div>
              <h3 className="mb-1.5 font-marketing-display text-marketing-2xl font-medium tracking-tight text-marketing-ink">
                Josh Wicks
              </h3>
              <p className="mb-5 text-marketing-sm tracking-wide text-marketing-muted">
                Design and build
              </p>
              <p className="mx-auto max-w-[420px] text-marketing-base leading-relaxed text-marketing-muted">
                Designs and builds the site you'll actually use. Focused on clear journeys, phone-friendly layouts, and pages that ask for the enquiry.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-8 flex h-[140px] w-[140px] items-center justify-center rounded-full bg-marketing-forest">
                <svg
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-full w-full fill-white/90"
                  aria-hidden="true"
                >
                  <circle cx="50" cy="35" r="15" />
                  <path d="M 30 50 Q 30 45 35 45 L 65 45 Q 70 45 70 50 L 75 80 Q 75 85 70 85 L 30 85 Q 25 85 25 80 Z" />
                </svg>
              </div>
              <h3 className="mb-1.5 font-marketing-display text-marketing-2xl font-medium tracking-tight text-marketing-ink">
                Will Mitchell
              </h3>
              <p className="mb-5 text-marketing-sm tracking-wide text-marketing-muted">
                Growth and automation
              </p>
              <p className="mx-auto max-w-[420px] text-marketing-base leading-relaxed text-marketing-muted">
                Helps the site keep working after launch: the follow-ups, tracking, and quiet systems that save you time.
              </p>
            </div>
          </div>

          <div className="mx-auto mb-20 h-px w-[60px] bg-marketing-border" />

          <p className="mx-auto mb-16 max-w-[780px] text-center text-marketing-base leading-relaxed text-marketing-muted">
            Founded in 2020 to help small UK businesses compete online with sites that look the part and bring in work.
          </p>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <span className="font-marketing-display text-marketing-4xl font-semibold text-marketing-sage">
                50+
              </span>
              <span className="mt-2 text-marketing-sm text-marketing-muted">
                Websites launched
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-marketing-display text-marketing-4xl font-semibold text-marketing-sage">
                100%
              </span>
              <span className="mt-2 text-marketing-sm text-marketing-muted">
                Client satisfaction
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-marketing-display text-marketing-4xl font-semibold text-marketing-sage">
                85%
              </span>
              <span className="mt-2 text-marketing-sm text-marketing-muted">
                Average lift in enquiries
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
