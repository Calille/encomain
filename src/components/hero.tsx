import { Container } from "./ui/container";
import { lazy, Suspense, useEffect, useState } from "react";
import { MarketingHeading } from "./marketing/marketing-heading";
import { CtaButton } from "./marketing/cta-button";

// Lazy load heavy WebGL animation
const Threads = lazy(() => import("./ui/threads"));

// Logo blue #468EFD as normalised RGB, for the WebGL shader uniform
const BRAND_BLUE_RGB: [number, number, number] = [0.27, 0.56, 0.99];

const proofPoints = [
  { figure: "50+", label: "Websites launched" },
  { figure: "100%", label: "Client satisfaction" },
  { figure: "85%", label: "Average lift in enquiries" },
];

// Lightweight static background fallback
function StaticBackground() {
  return (
    <>
      <div className="absolute inset-y-0 right-0 w-2/3 bg-marketing-blue/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-1/2 w-1/2 bg-marketing-blue-bright/10 blur-3xl" />
    </>
  );
}

export default function Hero() {
  const [shouldLoadAnimation, setShouldLoadAnimation] = useState(false);

  useEffect(() => {
    // Only load WebGL animation on desktop with good performance
    const isDesktop = window.innerWidth > 1024;
    const hasGoodPerformance = navigator.hardwareConcurrency >= 4;

    if (isDesktop && hasGoodPerformance) {
      // Delay loading to prioritize critical content
      setTimeout(() => setShouldLoadAnimation(true), 500);
    }
  }, []);

  return (
    <div className="relative overflow-hidden bg-marketing-navy-950 pt-32">
      {/*
        The animation is masked away from the centre of the hero so the lines
        stay decorative at the edges and never cross the headline or subheading.
      */}
      <div
        className="marketing-canvas-mask absolute inset-0 overflow-hidden opacity-70"
        aria-hidden="true"
      >
        {shouldLoadAnimation ? (
          <Suspense fallback={<StaticBackground />}>
            <Threads
              color={BRAND_BLUE_RGB}
              amplitude={1}
              distance={0}
              enableMouseInteraction={false} // Disabled for better performance
            />
          </Suspense>
        ) : (
          <StaticBackground />
        )}
      </div>

      {/* Blue bloom behind the copy, and a floor gradient into the next section */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="animate-pulse-glow absolute left-1/2 top-1/3 h-[420px] w-[820px] max-w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-marketing-blue/20 blur-[130px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-marketing-navy-950" />
      </div>

      <Container className="relative">
        <div className="mx-auto max-w-3xl pt-10 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
          <div className="text-center">
            <MarketingHeading
              level="h1"
              variant="hero"
              tone="dark"
              className="animate-fade-in"
            >
              A website that brings in{" "}
              <span className="marketing-gradient-text">enquiries</span>, not
              just looks busy.
            </MarketingHeading>
            <p className="animate-fade-in-delayed mx-auto mt-6 max-w-2xl text-marketing-lg leading-relaxed text-marketing-sky/90">
              For UK businesses whose site has stopped earning its keep. Clear,
              local-first design that turns visitors into calls and bookings.
            </p>
            <div className="animate-fade-in-delayed-2 mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-5">
              <CtaButton to="/contact#book" variant="on-dark" size="lg">
                Book a 20 min chat
              </CtaButton>
              <CtaButton to="/pricing" variant="ghost-dark" size="lg">
                See our packages
              </CtaButton>
            </div>
          </div>
        </div>
      </Container>

      {/* Proof strip anchors the fold, replacing the empty space that used to sit here */}
      <div className="relative border-t border-marketing-navy-700/60 bg-marketing-navy-950/60 backdrop-blur">
        <Container>
          <dl className="animate-fade-in-delayed-3 grid grid-cols-1 divide-y divide-marketing-navy-700/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {proofPoints.map(({ figure, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 px-4 py-6 text-center"
              >
                <dt className="marketing-glow-text font-marketing-display text-marketing-3xl font-semibold text-marketing-blue-bright">
                  {figure}
                </dt>
                <dd className="text-marketing-sm text-marketing-sky/70">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>
    </div>
  );
}
