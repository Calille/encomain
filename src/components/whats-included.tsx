import { Container } from "./ui/container";
import { Check } from "lucide-react";
import { MarketingHeading } from "./marketing/marketing-heading";

const includedFeatures = [
  {
    title: "Responsive design",
    description:
      "Your website will look and work well on desktops, tablets, and smartphones.",
  },
  {
    title: "Custom branding",
    description:
      "We'll incorporate your brand colours, logos, and style guidelines for a consistent visual identity.",
  },
  {
    title: "SEO optimisation",
    description:
      "Built-in SEO best practices to help improve rankings and drive more organic traffic.",
  },
  {
    title: "Performance tuning",
    description:
      "Optimised code and images for fast loading speeds and a better user experience.",
  },
  {
    title: "Content creation",
    description:
      "Professional copywriting that highlights your value proposition and converts visitors.",
  },
  {
    title: "Lead generation forms",
    description:
      "Strategic placement of contact forms and CTAs to capture leads and grow your business.",
  },
  {
    title: "Analytics integration",
    description:
      "Track visitor behaviour and conversion metrics to measure your website's performance.",
  },
  {
    title: "30-day support",
    description:
      "Post-launch technical support and adjustments to help everything run smoothly.",
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
            Everything you need for a solid launch
          </MarketingHeading>
          <p className="mx-auto mt-6 max-w-2xl text-marketing-lg leading-8 text-marketing-muted">
            Our website packages include the essentials needed to create a high-performing online presence.
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
