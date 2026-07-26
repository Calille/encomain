import { Button } from "./button";

interface LoadErrorProps {
  message?: string;
  onRetry: () => void;
}

export function LoadError({
  message = "Failed to load, try refreshing",
  onRetry,
}: LoadErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-surface px-6 py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
