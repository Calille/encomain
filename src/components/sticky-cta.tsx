import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show the sticky CTA after scrolling down 500px
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40 md:hidden">
      <Link to="/contact">
        <Button
          className="bg-[#2D5F3F] hover:bg-[#2D5F3F]/90 text-white w-full"
          size="sm"
        >
          Book Your Free Consultation Call
        </Button>
      </Link>
    </div>
  );
}
