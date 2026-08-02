import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-marketing-border bg-white p-4 shadow-lg md:hidden">
      <Link
        to="/contact#book"
        className="flex w-full items-center justify-center rounded-lg bg-marketing-forest px-4 py-3 text-marketing-sm font-semibold text-white transition-colors hover:bg-marketing-forest-dark min-h-[44px]"
      >
        Book a 20 min chat
      </Link>
    </div>
  );
}
