import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import routes from "tempo-routes";
import ScrollToTop from "./components/ScrollToTop";
import { CookieConsent } from "./components/ui/cookie-consent";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";

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

// Auth pages
const LoginPage = lazy(() => import("./pages/login"));
const ForgotPassword = lazy(() => import("./pages/forgot-password"));
const ChangePassword = lazy(() => import("./pages/change-password"));

// Dashboard pages
const UserDashboard = lazy(() => import("./pages/dashboard/user-dashboard"));
const WebsiteProgress = lazy(() => import("./pages/dashboard/progress"));
const Payments = lazy(() => import("./pages/dashboard/payments"));
const Support = lazy(() => import("./pages/dashboard/Support"));
const Upgrade = lazy(() => import("./pages/dashboard/Upgrade"));
const Settings = lazy(() => import("./pages/dashboard/settings"));
const AccountSettings = lazy(() => import("./pages/account-settings"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/index"));
const UsersManagement = lazy(() => import("./pages/admin/users"));
const WebsitesManagement = lazy(() => import("./pages/admin/websites"));
const BillingManagement = lazy(() => import("./pages/admin/billing"));

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
    <AuthProvider>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />

          {/* User dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/progress" element={
            <ProtectedRoute>
              <WebsiteProgress />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/payments" element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/support" element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/upgrade" element={
            <ProtectedRoute>
              <Upgrade />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requireAdmin>
              <UsersManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/websites" element={
            <ProtectedRoute requireAdmin>
              <WebsitesManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/billing" element={
            <ProtectedRoute requireAdmin>
              <BillingManagement />
            </ProtectedRoute>
          } />

          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
      </Suspense>
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      <CookieConsent />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
