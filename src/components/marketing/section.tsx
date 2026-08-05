import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Container } from "../ui/container";

/**
 * Background band for a marketing section. Light tones alternate with navy ones
 * to give the page rhythm; `tone` also decides whether the top hairline is drawn.
 */
export type SectionTone = "white" | "mist" | "ice" | "navy" | "navy-deep";

type SectionSize = "sm" | "md" | "lg";

interface SectionProps {
  tone?: SectionTone;
  /** Vertical rhythm. One scale for the whole site so gaps stay even. */
  size?: SectionSize;
  /** Draws a blue gradient hairline along the top edge. */
  hairline?: boolean;
  /** Set false to lay out the children yourself instead of using Container. */
  contained?: boolean;
  id?: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}

const toneClasses: Record<SectionTone, string> = {
  white: "bg-white",
  mist: "bg-marketing-mist",
  ice: "bg-marketing-ice",
  navy: "bg-marketing-navy-900",
  "navy-deep": "bg-marketing-navy-950",
};

const sizeClasses: Record<SectionSize, string> = {
  sm: "py-14 sm:py-20",
  md: "py-20 sm:py-28",
  lg: "py-24 sm:py-32",
};

export function isDarkTone(tone: SectionTone): boolean {
  return tone === "navy" || tone === "navy-deep";
}

export function Section({
  tone = "white",
  size = "md",
  hairline = false,
  contained = true,
  id,
  className,
  innerClassName,
  children,
}: SectionProps) {
  const body = contained ? (
    <Container className={innerClassName}>{children}</Container>
  ) : (
    <div className={innerClassName}>{children}</div>
  );

  return (
    <section
      id={id}
      className={clsx("relative", toneClasses[tone], className)}
    >
      {hairline && (
        <div
          className="marketing-hairline pointer-events-none absolute inset-x-0 top-0 h-px"
          aria-hidden="true"
        />
      )}
      <div className={sizeClasses[size]}>{body}</div>
    </section>
  );
}
