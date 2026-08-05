import { Check } from "lucide-react";
import { MarketingHeading } from "./marketing/marketing-heading";
import { MarketingCard } from "./marketing/marketing-card";
import { Section } from "./marketing/section";

const includedFeatures = [
  {
    title: "Works on phones",
    description:
      "Customers can browse and contact you cleanly from any device.",
  },
  {
    title: "Looks like your business",
    description:
      "Your colours, logo, and tone carried through so the site feels like you, not a template.",
  },
  {
    title: "Set up to be found",
    description:
      "Page titles, structure, and basics in place so local search has something solid to work with.",
  },
  {
    title: "Loads quickly",
    description:
      "Fast pages so people don't bounce before they read who you are.",
  },
  {
    title: "Copy that earns replies",
    description:
      "Clear wording that explains what you do and nudges people to enquire.",
  },
  {
    title: "Easy ways to enquire",
    description:
      "Forms and contact points placed where people are ready to act.",
  },
  {
    title: "See where interest comes from",
    description:
      "Simple tracking so you know which pages and sources lead to contact.",
  },
  {
    title: "Support after go-live",
    description:
      "A short window of hands-on help so launch week isn't left to you alone.",
  },
];

export default function WhatsIncluded() {
  return (
    <Section tone="ice">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <MarketingHeading level="p" variant="eyebrow">
          What's included
        </MarketingHeading>
        <MarketingHeading level="h2" variant="section" className="mt-2">
          The basics that help a site earn its keep
        </MarketingHeading>
        <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted">
          Every package is set up so visitors can find you, trust you, and get in touch without friction.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {includedFeatures.map((feature) => (
          <MarketingCard
            key={feature.title}
            interactive
            className="p-6 sm:p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-marketing-blue/12">
                <Check
                  className="h-5 w-5 text-marketing-blue-deep"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </span>
              <h3 className="text-marketing-base font-semibold tracking-tight text-marketing-ink">
                {feature.title}
              </h3>
            </div>
            <p className="text-marketing-base leading-relaxed text-marketing-muted">
              {feature.description}
            </p>
          </MarketingCard>
        ))}
      </div>
    </Section>
  );
}
