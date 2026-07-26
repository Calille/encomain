import { memo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container } from "./ui/container";
import { MarketingHeading } from "./marketing/marketing-heading";

const storySteps = [
  {
    id: 1,
    title: "Discovery and planning",
    description:
      "We start by understanding your business goals, target audience, and brand identity. Through a focused consultation, we identify your requirements and create a roadmap tailored to your objectives.",
  },
  {
    id: 2,
    title: "Design and prototyping",
    description:
      "We craft modern, user-centric wireframes and high-fidelity prototypes that align with your brand. Every design decision is made to improve experience and drive conversions.",
  },
  {
    id: 3,
    title: "Content and SEO",
    description:
      "We create compelling, SEO-optimised content that speaks to your audience and ranks well on search engines. From copywriting to meta tags, every element is built for visibility.",
  },
  {
    id: 4,
    title: "Development",
    description:
      "We turn designs into a fast, responsive, and secure website. Using modern technologies, we build a site that performs cleanly across devices and browsers.",
  },
  {
    id: 5,
    title: "Testing and launch",
    description:
      "Before launch, we rigorously test features, links, and interactions. Our QA process helps ensure your website is accessible, reliable, and ready for real users.",
  },
  {
    id: 6,
    title: "Ongoing support",
    description:
      "We handle the technical launch and can provide ongoing support to keep your website performing well. From updates to troubleshooting, we're here when you need us.",
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
          <div className="absolute left-1/2 top-20 hidden h-full w-0.5 -translate-x-1/2 bg-marketing-sage/30 md:block" />
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
            <div className="rounded-xl border border-marketing-border bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-marketing-display text-marketing-2xl font-medium text-marketing-forest">
                {step.title}
              </h3>
              <p className="leading-relaxed text-marketing-muted text-marketing-base">
                {step.description}
              </p>
            </div>
          </div>

          <div
            className={`z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-marketing-forest text-marketing-xl font-semibold text-white shadow-sm transition-all duration-700 ${
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
    <section className="relative overflow-hidden bg-marketing-mint py-24 sm:py-32">
      <Container>
        <div className="mx-auto mb-16 max-w-2xl lg:text-center">
          <MarketingHeading level="p" variant="eyebrow">
            Your website journey
          </MarketingHeading>
          <MarketingHeading level="h2" variant="section" className="mt-2">
            From concept to reality
          </MarketingHeading>
          <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted">
            Follow along as we transform your ideas into a high-performing website through our proven six-step process.
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

        <div className="mt-24 text-center">
          <h3 className="mb-6 font-marketing-display text-marketing-3xl font-medium text-marketing-forest">
            Ready to start your journey?
          </h3>
          <p className="mx-auto mb-10 max-w-2xl text-marketing-xl text-marketing-muted">
            Book a free intro call and we'll talk through what you're trying to build.
          </p>
          <Link
            to="/contact#book"
            className="inline-flex items-center justify-center rounded-lg bg-marketing-ink px-8 py-4 text-marketing-lg font-semibold text-white transition-colors hover:bg-marketing-forest min-h-[44px]"
          >
            Book a free intro call
          </Link>
        </div>
      </Container>
    </section>
  );
}
