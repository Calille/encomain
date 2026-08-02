import { HoverEffect } from "./ui/card-hover-effect";
import { MarketingHeading } from "./marketing/marketing-heading";

export default function WhatWeDoSection() {
  return (
    <section className="mx-auto max-w-6xl px-8 py-16">
      <div className="mb-12 text-center">
        <MarketingHeading level="h2" variant="section">
          You get a site that works as hard as you do.
        </MarketingHeading>
        <p className="mx-auto mt-4 max-w-2xl text-marketing-lg text-marketing-muted">
          We design around the outcome that matters: more of the right people finding you, trusting you, and getting in touch.
        </p>
      </div>

      <HoverEffect items={projects} />
    </section>
  );
}

export const projects = [
  {
    title: "Built to win enquiries",
    description:
      "You get pages shaped around what you sell and how customers buy, so the next step is obvious.",
    link: "#web-design",
  },
  {
    title: "Look like the obvious choice",
    description:
      "Local customers should see a site that feels as trustworthy as the best competitor in your area, without looking like a template.",
    link: "#brand-identity",
  },
  {
    title: "Easy to use on a phone",
    description:
      "Most people will find you on mobile. You get a site that loads cleanly and makes booking or contacting you simple.",
    link: "#ui-ux",
  },
  {
    title: "Know what's working",
    description:
      "You can see where enquiries come from and what people look at, so you're not guessing.",
    link: "#ai-optimization",
  },
  {
    title: "Words that ask for the sale",
    description:
      "Clear copy in your customers' language: what you do, why you're the right fit, and how to get in touch.",
    link: "#copywriting",
  },
  {
    title: "We keep it ticking",
    description:
      "Updates, fixes, and small changes handled for you, so you're not fiddling with the site after hours.",
    link: "#maintenance",
  },
];
