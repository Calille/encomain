import { HoverEffect } from "./ui/card-hover-effect";

export default function WhatWeDoSection() {
  return (
    <section className="max-w-6xl mx-auto px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A4D2E]">
          Building Digital Experiences That Convert.
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          We design intelligent, high-performing websites that merge clean design, smart strategy, and seamless user experience.
        </p>
      </div>

      <HoverEffect items={projects} />
    </section>
  );
}

export const projects = [
  {
    title: "Strategic Web Design",
    description:
      "We craft stunning, conversion-focused websites designed around clear goals, modern aesthetics, and exceptional user experience.",
    link: "#web-design",
  },
  {
    title: "Brand Identity",
    description:
      "From logos to typography, we create cohesive brand systems that communicate trust, clarity, and personality across every touchpoint.",
    link: "#brand-identity",
  },
  {
    title: "UI / UX Design",
    description:
      "Beautiful interfaces meet effortless navigation. We design intuitive digital experiences that keep visitors engaged and exploring.",
    link: "#ui-ux",
  },
  {
    title: "AI-Powered Optimization",
    description:
      "Leverage automation and analytics to refine performance, SEO, and user satisfaction — keeping your website smart and efficient.",
    link: "#ai-optimization",
  },
  {
    title: "Content & Copywriting",
    description:
      "Persuasive, clear, and conversion-driven. We write copy that connects with your audience and drives measurable action.",
    link: "#copywriting",
  },
  {
    title: "Maintenance & Growth",
    description:
      "Stay ahead with ongoing updates, performance tracking, and support designed to evolve your site as your business grows.",
    link: "#maintenance",
  },
];
