import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component scrolls the window to the top on route change
 * It should be placed inside the Router component but outside of Routes
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Immediately scroll to top without animation first to ensure content is properly positioned
    window.scrollTo(0, 0);
    
    // Then apply smooth scrolling with a small delay to ensure the DOM has updated
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null; // This component doesn't render anything
} 