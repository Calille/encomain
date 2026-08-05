import { clsx } from "clsx";
import type { ReactNode } from "react";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
type HeadingVariant = "hero" | "display" | "section" | "eyebrow";
type HeadingTone = "light" | "dark" | "auto";

interface MarketingHeadingProps {
  level: HeadingLevel;
  variant?: HeadingVariant;
  /** Background context. Auto/light → navy ink (blue for eyebrows). Dark → white (sky for eyebrows). */
  tone?: HeadingTone;
  children: ReactNode;
  className?: string;
}

/**
 * Typography only (no colour). Colour is applied separately so
 * tailwind-merge cannot strip text-marketing-ink when it conflicts
 * with text-marketing-* font-size utilities.
 */
const typographyClasses: Record<HeadingVariant, string> = {
  hero:
    "font-marketing-display font-semibold tracking-tight text-marketing-4xl leading-[1.08] sm:text-marketing-6xl lg:text-marketing-7xl",
  display:
    "font-marketing-display font-semibold tracking-tight text-marketing-4xl sm:text-marketing-5xl",
  section:
    "font-marketing-display font-medium tracking-tight text-marketing-3xl sm:text-marketing-4xl",
  eyebrow:
    "font-sans text-marketing-sm font-semibold uppercase tracking-[0.2em]",
};

function toneClass(variant: HeadingVariant, tone: HeadingTone): string {
  const dark = tone === "dark";

  if (variant === "eyebrow") {
    return dark ? "text-marketing-sky" : "text-marketing-blue-deep";
  }

  // hero + display + section
  return dark ? "text-white" : "text-marketing-ink";
}

export function MarketingHeading({
  level,
  variant = "section",
  tone = "auto",
  children,
  className,
}: MarketingHeadingProps) {
  const Tag = level;

  // clsx (not twMerge) so font-size and colour text-* classes both survive
  return (
    <Tag
      className={clsx(
        typographyClasses[variant],
        toneClass(variant, tone),
        className
      )}
    >
      {children}
    </Tag>
  );
}
