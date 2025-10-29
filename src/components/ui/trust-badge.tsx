import { cn } from "@/lib/utils";
import { Shield, Star, Zap } from "lucide-react";

interface TrustBadgeProps {
  type: "ssl" | "reviews" | "ai";
  className?: string;
}

export function TrustBadge({ type, className }: TrustBadgeProps) {
  const badges = {
    ssl: {
      icon: Shield,
      text: "SSL Secure",
    },
    reviews: {
      icon: Star,
      text: "5-Star Reviews",
    },
    ai: {
      icon: Zap,
      text: "AI-Powered",
    },
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{badge.text}</span>
    </div>
  );
}
