import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  className?: string;
}

export function EmptyState({ icon: Icon, message, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className
      )}
    >
      <Icon
        className="mb-3 h-6 w-6 text-foreground opacity-20"
        strokeWidth={1.5}
      />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
