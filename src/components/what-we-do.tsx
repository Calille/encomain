import {
  BarChart3,
  MessageSquareQuote,
  Smartphone,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";
import { MarketingHeading } from "./marketing/marketing-heading";
import { MarketingCard, MarketingCardIcon } from "./marketing/marketing-card";
import { Section } from "./marketing/section";

export default function WhatWeDoSection() {
  return (
    <Section tone="mist">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <MarketingHeading level="h2" variant="section">
          You get a site that works as hard as you do.
        </MarketingHeading>
        <p className="mt-4 text-marketing-lg text-marketing-muted">
          We design around the outcome that matters: more of the right people finding you, trusting you, and getting in touch.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const Icon = project.icon;

          return (
            <a
              key={project.link}
              href={project.link}
              className="marketing-focus rounded-2xl"
            >
              <MarketingCard interactive accentEdge className="h-full">
                <MarketingCardIcon>
                  <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                </MarketingCardIcon>
                <h3 className="text-marketing-lg font-semibold tracking-tight text-marketing-ink">
                  {project.title}
                </h3>
                <p className="mt-3 text-marketing-base leading-relaxed text-marketing-muted">
                  {project.description}
                </p>
              </MarketingCard>
            </a>
          );
        })}
      </div>
    </Section>
  );
}

export const projects = [
  {
    title: "Built to win enquiries",
    description:
      "You get pages shaped around what you sell and how customers buy, so the next step is obvious.",
    link: "#web-design",
    icon: Target,
  },
  {
    title: "Look like the obvious choice",
    description:
      "Local customers should see a site that feels as trustworthy as the best competitor in your area, without looking like a template.",
    link: "#brand-identity",
    icon: Sparkles,
  },
  {
    title: "Easy to use on a phone",
    description:
      "Most people will find you on mobile. You get a site that loads cleanly and makes booking or contacting you simple.",
    link: "#ui-ux",
    icon: Smartphone,
  },
  {
    title: "Know what's working",
    description:
      "You can see where enquiries come from and what people look at, so you're not guessing.",
    link: "#ai-optimization",
    icon: BarChart3,
  },
  {
    title: "Words that ask for the sale",
    description:
      "Clear copy in your customers' language: what you do, why you're the right fit, and how to get in touch.",
    link: "#copywriting",
    icon: MessageSquareQuote,
  },
  {
    title: "We keep it ticking",
    description:
      "Updates, fixes, and small changes handled for you, so you're not fiddling with the site after hours.",
    link: "#maintenance",
    icon: Wrench,
  },
];
