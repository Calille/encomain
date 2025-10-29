import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import routes from "tempo-routes";
import ScrollToTop from "./components/ScrollToTop";
import { CookieConsent } from "./components/ui/cookie-consent";

// Eager load homepage for fast FCP (First Contentful Paint)
import Home from "./components/home";

// Lazy load all other routes to reduce initial bundle size
const Services = lazy(() => import("./components/services"));
const PricingPage = lazy(() => import("./components/pricing-page"));
const About = lazy(() => import("./components/about"));
const ContactPage = lazy(() => import("./components/contact-page"));
const Careers = lazy(() => import("./pages/careers"));
const PrivacyPolicy = lazy(() => import("./pages/privacy-policy"));
const TermsOfService = lazy(() => import("./pages/terms-of-service"));

// Optimized loading component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#1A4D2E] border-r-transparent"></div>
        <p className="mt-4 text-[#1A4D2E] font-medium">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
      </Suspense>
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      <CookieConsent />
    </>
  );
}

export default App;
