import { cn } from "@/lib/utils";
import logoImage from "@/assets/images/logo.png";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={logoImage}
        alt="The Enclosure"
        className="h-14 w-auto"
      />
    </div>
  );
}
