import { useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { microlinkScreenshotUrl } from "../../lib/website-url";

type Size = "sm" | "md";

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-[60px] w-[96px]",
  md: "h-[100px] w-[160px]",
};

type Props = {
  url: string | null | undefined;
  size?: Size;
  className?: string;
};

function Placeholder({ size, className }: { size: Size; className?: string }) {
  return (
    <div
      className={cn(
        "flex aspect-[16/10] items-center justify-center rounded-[8px] border border-border bg-muted/40",
        SIZE_CLASS[size],
        className
      )}
      aria-hidden
    >
      <Globe className="h-4 w-4 text-muted-foreground opacity-50" strokeWidth={1.5} />
    </div>
  );
}

/**
 * Lazy Microlink screenshot thumbnail for a client website URL.
 * Falls back to a neutral placeholder when url is missing or the image fails.
 */
export function WebsiteThumbnail({ url, size = "sm", className }: Props) {
  const [failed, setFailed] = useState(false);
  const trimmed = url?.trim() || "";

  if (!trimmed || failed) {
    return <Placeholder size={size} className={className} />;
  }

  return (
    <img
      src={microlinkScreenshotUrl(trimmed)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        "aspect-[16/10] object-cover object-top rounded-[8px] border border-border bg-muted/20",
        SIZE_CLASS[size],
        className
      )}
    />
  );
}
