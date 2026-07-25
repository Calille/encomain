import { HoverEffect } from "./ui/card-hover-effect";
import { MarketingHeading } from "./marketing/marketing-heading";

export default function WhatWeDoSection() {
  return (
    <section className="mx-auto max-w-6xl px-8 py-16">
      <div className="mb-12 text-center">
        <MarketingHeading level="h2" variant="section" className="text-marketing-forest">
          Building digital experiences that convert.
        </MarketingHeading>
        <p className="mx-auto mt-4 max-w-2xl text-marketing-lg text-marketing-muted">
          We design intelligent, high-performing websites that merge clean design, smart strategy, and seamless user experience.
        </p>
      </div>

      <HoverEffect items={projects} />
    </section>
  );
}

export const projects = [
  {
    title: "Strategic web design",
    description:
      "We craft conversion-focused websites designed around clear goals, modern aesthetics, and exceptional user experience.",
    link: "#web-design",
  },
  {
    title: "Brand identity",
    description:
      "From logos to typography, we create cohesive brand systems that communicate trust, clarity, and personality across every touchpoint.",
    link: "#brand-identity",
  },
  {
    title: "UI / UX design",
    description:
      "Beautiful interfaces meet effortless navigation. We design intuitive digital experiences that keep visitors engaged and exploring.",
    link: "#ui-ux",
  },
  {
    title: "AI-powered optimisation",
    description:
      "Leverage automation and analytics to refine performance, SEO, and user satisfaction, keeping your website smart and efficient.",
    link: "#ai-optimization",
  },
  {
    title: "Content and copywriting",
    description:
      "Persuasive, clear, and conversion-driven. We write copy that connects with your audience and drives measurable action.",
    link: "#copywriting",
  },
  {
    title: "Maintenance and growth",
    description:
      "Stay ahead with ongoing updates, performance tracking, and support designed to evolve your site as your business grows.",
    link: "#maintenance",
  },
];
