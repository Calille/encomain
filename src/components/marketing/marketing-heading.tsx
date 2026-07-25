import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
type HeadingVariant = "display" | "section" | "eyebrow";

interface MarketingHeadingProps {
  level: HeadingLevel;
  variant?: HeadingVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<HeadingVariant, string> = {
  display:
    "font-marketing-display font-semibold tracking-tight text-marketing-ink text-marketing-4xl sm:text-marketing-5xl",
  section:
    "font-marketing-display font-medium tracking-tight text-marketing-ink text-marketing-3xl sm:text-marketing-4xl",
  eyebrow:
    "font-sans text-marketing-sm font-semibold uppercase tracking-[0.2em] text-marketing-sage",
};

export function MarketingHeading({
  level,
  variant = "section",
  children,
  className,
}: MarketingHeadingProps) {
  const Tag = level;

  return (
    <Tag className={cn(variantClasses[variant], className)}>
      {children}
    </Tag>
  );
}
