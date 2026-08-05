import { useState, useEffect } from "react";
import { CtaButton } from "./marketing/cta-button";

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
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-marketing-navy-700 bg-marketing-navy-950/90 p-3 backdrop-blur md:hidden">
      <CtaButton to="/contact#book" variant="primary" fullWidth>
        Book a 20 min chat
      </CtaButton>
    </div>
  );
}
