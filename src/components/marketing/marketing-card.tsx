import { clsx } from "clsx";
import type { ReactNode } from "react";

/**
 * The single marketing card. Replaces the four different radius/border/padding
 * combinations the pages used to carry. `tone` follows the section it sits in.
 */
type CardTone = "light" | "dark";

interface MarketingCardProps {
  tone?: CardTone;
  /** Adds the blue lift on hover. Off for static content like FAQ answers. */
  interactive?: boolean;
  /** Draws a blue gradient edge along the top of the card. */
  accentEdge?: boolean;
  /** Emphasised treatment, e.g. the recommended pricing tier. */
  featured?: boolean;
  className?: string;
  children: ReactNode;
}

const toneClasses: Record<CardTone, string> = {
  light: "border-marketing-border bg-white shadow-marketing-card",
  dark: "border-marketing-navy-700 bg-marketing-navy-800",
};

const interactiveClasses: Record<CardTone, string> = {
  light: "hover:-translate-y-1 hover:border-marketing-blue/40 hover:shadow-marketing-lift",
  dark: "hover:-translate-y-1 hover:border-marketing-blue/50 hover:shadow-marketing-lift",
};

const featuredClasses: Record<CardTone, string> = {
  light: "border-marketing-blue/45 bg-marketing-mist marketing-glow-sm",
  dark: "border-marketing-blue/60 bg-marketing-navy-800 marketing-glow-lg",
};

export function MarketingCard({
  tone = "light",
  interactive = false,
  accentEdge = false,
  featured = false,
  className,
  children,
}: MarketingCardProps) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 sm:p-8",
        toneClasses[tone],
        featured && featuredClasses[tone],
        interactive && interactiveClasses[tone],
        className
      )}
    >
      {accentEdge && (
        <div
          className="marketing-hairline pointer-events-none absolute inset-x-0 top-0 h-px"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

/**
 * Rounded icon well used inside cards. Light cards get a tinted blue wash,
 * dark cards get a solid blue chip.
 */
export function MarketingCardIcon({
  tone = "light",
  className,
  children,
}: {
  tone?: CardTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl",
        tone === "light"
          ? "bg-marketing-blue/12 text-marketing-blue-deep"
          : "bg-marketing-blue/20 text-marketing-sky",
        className
      )}
    >
      {children}
    </div>
  );
}
