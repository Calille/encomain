import { memo, useRef, useState, useEffect } from "react";
import { MarketingHeading } from "./marketing/marketing-heading";
import { MarketingCard } from "./marketing/marketing-card";
import { CtaButton } from "./marketing/cta-button";
import { Section } from "./marketing/section";

const storySteps = [
  {
    id: 1,
    title: "We learn what should change",
    description:
      "You tell us who you serve, what isn't working, and what a good week of enquiries looks like. We turn that into a simple plan.",
  },
  {
    id: 2,
    title: "You see the direction early",
    description:
      "You get layouts that show how the site will look and where people enquire, before we build the real thing.",
  },
  {
    id: 3,
    title: "Written so locals can find you",
    description:
      "Copy and page setup aimed at people nearby searching for what you offer, not jargon for search engines.",
  },
  {
    id: 4,
    title: "Built to stay fast and solid",
    description:
      "You get a site that works on phones, loads quickly, and is set up properly so you're not fighting with it later.",
  },
  {
    id: 5,
    title: "Checked before it goes live",
    description:
      "Forms, links, and key journeys get a proper once-over so your first visitors aren't the ones finding problems.",
  },
  {
    id: 6,
    title: "Support after launch",
    description:
      "When something needs changing or fixing, you message us. We handle the technical side so you can get back to the day job.",
  },
];

const TimelineStep = memo(
  ({
    step,
    index,
    isLast,
  }: {
    step: (typeof storySteps)[0];
    index: number;
    isLast: boolean;
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const stepRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.2, rootMargin: "100px" }
      );

      if (stepRef.current) {
        observer.observe(stepRef.current);
      }

      return () => observer.disconnect();
    }, []);

    const isEven = index % 2 === 0;

    return (
      <div ref={stepRef} className="relative">
        {!isLast && (
          <div className="absolute left-1/2 top-20 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-marketing-blue/60 to-marketing-blue/10 md:block" />
        )}

        <div
          className={`mb-16 flex flex-col items-center gap-8 md:flex-row ${
            isEven ? "md:flex-row-reverse" : ""
          }`}
        >
          <div
            className={`flex-1 transition-all duration-700 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : `opacity-0 ${isEven ? "translate-x-8" : "-translate-x-8"}`
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <MarketingCard tone="dark" interactive accentEdge className="p-6 sm:p-6">
              <h3 className="mb-3 font-marketing-display text-marketing-2xl font-medium text-white">
                {step.title}
              </h3>
              <p className="leading-relaxed text-marketing-sky/80 text-marketing-base">
                {step.description}
              </p>
            </MarketingCard>
          </div>

          <div
            className={`marketing-glow-lg z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-marketing-blue text-marketing-xl font-semibold text-white transition-all duration-700 ${
              isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 100 + 200}ms` }}
            aria-hidden="true"
          >
            {step.id}
          </div>

          <div className="hidden flex-1 md:block" />
        </div>
      </div>
    );
  }
);

TimelineStep.displayName = "TimelineStep";

export default function WebsiteStory() {
  return (
    <Section tone="navy" size="lg" hairline className="overflow-hidden">
      {/* Ambient blue wash so the navy band does not read as a flat block */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] max-w-[120vw] -translate-x-1/2 rounded-full bg-marketing-blue/10 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mx-auto mb-16 max-w-2xl lg:text-center">
          <MarketingHeading level="p" variant="eyebrow" tone="dark">
            How you get from stuck to live
          </MarketingHeading>
          <MarketingHeading
            level="h2"
            variant="section"
            tone="dark"
            className="mt-2"
          >
            A clear path from first chat to a site that can earn enquiries.
          </MarketingHeading>
          <p className="mt-6 text-marketing-lg leading-8 text-marketing-sky/80">
            Six steps, plain English, no mystery about what happens next.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          {storySteps.map((step, index) => (
            <TimelineStep
              key={step.id}
              step={step}
              index={index}
              isLast={index === storySteps.length - 1}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="mb-6 font-marketing-display text-marketing-3xl font-medium text-white">
            Want to see what we'd change?
          </h3>
          <p className="mx-auto mb-10 max-w-2xl text-marketing-xl text-marketing-sky/80">
            Book a short intro call and we'll walk through your current site with fresh eyes.
          </p>
          <div className="flex justify-center">
            <CtaButton to="/contact#book" variant="on-dark" size="lg">
              Book a 20 min chat
            </CtaButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
