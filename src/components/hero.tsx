import { Container } from "./ui/container";
import { Button } from "./ui/button";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Lazy load heavy WebGL animation
const Threads = lazy(() => import("./ui/threads"));

// Lightweight static background fallback
function StaticBackground() {
  return (
    <>
      <div className="absolute left-0 top-0 h-full w-full bg-[#F8FAF9] opacity-10" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[#1A4D2E]/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-1/2 bg-[#7FA99B]/10 blur-3xl" />
    </>
  );
}

export default function Hero() {
  const [shouldLoadAnimation, setShouldLoadAnimation] = useState(false);

  useEffect(() => {
    // Only load WebGL animation on desktop with good performance
    const isDesktop = window.innerWidth > 1024;
    const hasGoodPerformance = navigator.hardwareConcurrency >= 4;
    
    if (isDesktop && hasGoodPerformance) {
      // Delay loading to prioritize critical content
      setTimeout(() => setShouldLoadAnimation(true), 500);
    }
  }, []);

  return (
    <div className="relative bg-[#F8FAF9] pt-32 overflow-hidden">
      {/* Animated background - only on performant desktop devices */}
      <div className="absolute inset-0 overflow-hidden">
        {shouldLoadAnimation ? (
          <Suspense fallback={<StaticBackground />}>
            <Threads
              color={[0.18, 0.37, 0.25]}
              amplitude={1}
              distance={0}
              enableMouseInteraction={false} // Disabled for better performance
            />
          </Suspense>
        ) : (
          <StaticBackground />
        )}
      </div>

      <Container className="relative">
        <div className="mx-auto max-w-3xl pt-12 pb-32 sm:pt-24 sm:pb-48 md:pt-32 md:pb-64 lg:pb-80">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A] sm:text-6xl leading-tight animate-fade-in">
              Outdated Website?<br />
              We Fix That.
            </h1>
            <p className="mt-10 text-lg leading-8 text-gray-600 animate-fade-in-delayed">
              Modern design. Smart strategy. Proven to convert.<br />
              We build websites that turn clicks into clients.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 animate-fade-in-delayed-2">
              <Link to="/contact" className="w-full sm:w-auto">
                <Button className="bg-[#2D5F3F] hover:bg-[#2D5F3F]/90 text-white font-medium px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg shadow-lg transition-transform hover:scale-105 w-full sm:w-auto min-h-[44px]">
                  Let's Redesign Your Site
                </Button>
              </Link>
              <Link to="/services" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="border-[#1A4D2E] text-[#1A4D2E] hover:bg-[#1A4D2E]/10 w-full sm:w-auto min-h-[44px] px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg"
                >
                  See the Results
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
