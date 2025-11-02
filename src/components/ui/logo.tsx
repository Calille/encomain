import { cn } from "@/lib/utils";
import logoImage from "@/assets/images/logo.png";

interface LogoProps {
  className?: string;
  color?: string;
}

export function Logo({ className, color = "#1A4D2E" }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {/* Logo image */}
      <img 
        src={logoImage} 
        alt="The Enclosure Logo" 
        className="h-14 w-auto" 
      />
    </div>
  );
}

// Original SVG logo version kept for reference
/*
export function Logo({ className, color = "#1A4D2E" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-8 w-8 rounded-md flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 8.25V15.75C3 16.9926 3.79035 18 4.76471 18H19.2353C20.2096 18 21 16.9926 21 15.75V8.25C21 7.00736 20.2096 6 19.2353 6H4.76471C3.79035 6 3 7.00736 3 8.25Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.75 6.5L12 12L20.25 6.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-2xl font-bold text-[#1A4D2E]">
        The Enclosure
      </span>
    </div>
  );
}
*/
