import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * The single marketing button. Replaces the six ad-hoc button treatments the
 * pages used to carry, so hover, radius and focus behaviour match everywhere.
 *
 * - `primary`   solid brand blue, for the main action on a light background
 * - `secondary` outlined, for the companion action on a light background
 * - `on-dark`   solid white, for the main action on a navy background
 * - `ghost-dark` outlined in blue, for the companion action on a navy background
 */
type CtaVariant = "primary" | "secondary" | "on-dark" | "ghost-dark";
type CtaSize = "md" | "lg";

interface CtaButtonProps {
  variant?: CtaVariant;
  size?: CtaSize;
  /** Internal route. Renders a react-router Link. */
  to?: string;
  /** External or hash target. Renders an anchor. */
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-200 marketing-focus disabled:pointer-events-none disabled:opacity-60 min-h-[44px]";

const variantClasses: Record<CtaVariant, string> = {
  primary:
    "bg-marketing-blue-deep text-white shadow-marketing-lift hover:-translate-y-0.5 hover:bg-marketing-blue",
  secondary:
    "border border-marketing-blue-deep/35 bg-white/70 text-marketing-blue-deep backdrop-blur hover:-translate-y-0.5 hover:border-marketing-blue-deep hover:bg-white",
  "on-dark":
    "bg-white text-marketing-navy-900 shadow-marketing-lift hover:-translate-y-0.5 hover:bg-marketing-ice",
  "ghost-dark":
    "border border-marketing-blue/45 bg-marketing-blue/10 text-white backdrop-blur hover:-translate-y-0.5 hover:border-marketing-blue hover:bg-marketing-blue/20",
};

const sizeClasses: Record<CtaSize, string> = {
  md: "px-6 py-3 text-marketing-base",
  lg: "px-8 py-4 text-marketing-base sm:text-marketing-lg",
};

export function CtaButton({
  variant = "primary",
  size = "md",
  to,
  href,
  type = "button",
  disabled,
  onClick,
  fullWidth,
  className,
  children,
}: CtaButtonProps) {
  const classes = clsx(
    base,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "w-full sm:w-auto",
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
