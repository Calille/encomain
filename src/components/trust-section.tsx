import { Container } from "./ui/container";
import { MarketingHeading } from "./marketing/marketing-heading";

export default function TrustSection() {
  return (
    <section className="bg-marketing-mint py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-16 text-center">
            <MarketingHeading level="p" variant="eyebrow">
              Leadership
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
                Dev (UI/UX)
              </p>
              <p className="mx-auto max-w-[420px] text-marketing-base leading-relaxed text-marketing-muted">
                Designs and builds intuitive digital experiences. Focused on creating accessible, high-performing websites.
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
                Auto Marketing
              </p>
              <p className="mx-auto max-w-[420px] text-marketing-base leading-relaxed text-marketing-muted">
                Drives growth through intelligent automation. Specialises in AI-powered marketing solutions.
              </p>
            </div>
          </div>

          <div className="mx-auto mb-20 h-px w-[60px] bg-marketing-border" />

          <p className="mx-auto mb-16 max-w-[780px] text-center text-marketing-base leading-relaxed text-marketing-muted">
            Founded in 2020 to help small businesses compete online through quality website redesigns.
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
                Satisfaction
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-marketing-display text-marketing-4xl font-semibold text-marketing-sage">
                85%
              </span>
              <span className="mt-2 text-marketing-sm text-marketing-muted">
                Conversion increase
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
