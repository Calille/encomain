import { Container } from "./ui/container";
import { Check } from "lucide-react";
import { MarketingHeading } from "./marketing/marketing-heading";

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
    <section className="bg-marketing-mint py-24">
      <Container>
        <div className="mb-16 text-center">
          <MarketingHeading level="p" variant="eyebrow">
            What's included
          </MarketingHeading>
          <MarketingHeading level="h2" variant="section" className="mt-2">
            The basics that help a site earn its keep
          </MarketingHeading>
          <p className="mx-auto mt-6 max-w-2xl text-marketing-lg leading-8 text-marketing-muted">
            Every package is set up so visitors can find you, trust you, and get in touch without friction.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {includedFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-marketing-border bg-white p-6"
            >
              <div className="mb-4 flex items-center">
                <div className="mr-3 rounded-full bg-marketing-forest/10 p-2">
                  <Check
                    className="h-5 w-5 text-marketing-forest"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-marketing-lg font-semibold text-marketing-forest">
                  {feature.title}
                </h3>
              </div>
              <p className="text-marketing-base text-marketing-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
