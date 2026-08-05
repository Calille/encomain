import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Container } from "../ui/container";
import { AnimatedBackground } from "../ui/animated-background";
import { MarketingHeading } from "./marketing-heading";

/**
 * Shared hero for the inner marketing pages. Previously each page rebuilt this
 * block, which is how they drifted apart: pricing lost its animated background
 * and the legal pages sat 2rem higher than everything else.
 */
interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Buttons or links rendered below the description. */
  actions?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  size = "md",
  className,
}: PageHeroProps) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-marketing-navy-950 pt-32",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <AnimatedBackground />
        <div className="animate-pulse-glow absolute left-1/2 top-1/2 h-[380px] w-[760px] max-w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-marketing-blue/15 blur-[130px]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-marketing-navy-950" />
      </div>

      <Container className="relative">
        <div
          className={clsx(
            "mx-auto max-w-3xl text-center",
            size === "sm" ? "pb-16 pt-8 sm:pb-20 sm:pt-12" : "pb-20 pt-10 sm:pb-28 sm:pt-16"
          )}
        >
          {eyebrow && (
            <MarketingHeading
              level="p"
              variant="eyebrow"
              tone="dark"
              className="animate-fade-in mb-4"
            >
              {eyebrow}
            </MarketingHeading>
          )}

          <MarketingHeading
            level="h1"
            variant="display"
            tone="dark"
            className="animate-fade-in"
          >
            {title}
          </MarketingHeading>

          {description && (
            <p className="animate-fade-in-delayed mx-auto mt-6 max-w-2xl text-marketing-lg leading-relaxed text-marketing-sky/90">
              {description}
            </p>
          )}

          {actions && (
            <div className="animate-fade-in-delayed-2 mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-5">
              {actions}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
