import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";
import { useCountUp } from "../../hooks/useCountUp";

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: LucideIcon;
  className?: string;
  formatValue?: (n: number) => string;
}

export function MetricCard({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  icon: Icon,
  className,
  formatValue,
}: MetricCardProps) {
  const animated = useCountUp(value, { decimals });
  const display = formatValue
    ? formatValue(animated)
    : `${prefix}${animated.toLocaleString("en-GB", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

  return (
    <Card className={cn("border-border bg-surface shadow-none", className)}>
      <CardContent className="relative p-4">
        {Icon && (
          <Icon
            className="absolute right-4 top-4 h-4 w-4 text-muted-foreground"
            strokeWidth={1.5}
          />
        )}
        <p className="pr-6 text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-foreground font-mono-nums">
          {display}
        </p>
      </CardContent>
    </Card>
  );
}
