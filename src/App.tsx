import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import routes from "tempo-routes";
import ScrollToTop from "./components/ScrollToTop";
import { CookieConsent } from "./components/ui/cookie-consent";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { Skeleton } from "./components/ui/skeleton";

import Home from "./components/home";

const Services = lazy(() => import("./components/services"));
const PricingPage = lazy(() => import("./components/pricing-page"));
const About = lazy(() => import("./components/about"));
const ContactPage = lazy(() => import("./components/contact-page"));
const Careers = lazy(() => import("./pages/careers"));
const PrivacyPolicy = lazy(() => import("./pages/privacy-policy"));
const TermsOfService = lazy(() => import("./pages/terms-of-service"));

const LoginPage = lazy(() => import("./pages/login"));
const ForgotPassword = lazy(() => import("./pages/forgot-password"));
const ChangePassword = lazy(() => import("./pages/change-password"));
const RoleLanding = lazy(() => import("./pages/role-landing"));
const UnsubscribePage = lazy(() => import("./pages/unsubscribe"));
const RecoverAccountPage = lazy(() => import("./pages/recover-account"));
const AccountDeletedPage = lazy(() => import("./pages/account-deleted"));

const UserDashboard = lazy(() => import("./pages/dashboard/user-dashboard"));
const WebsiteProgress = lazy(() => import("./pages/dashboard/progress"));
const Payments = lazy(() => import("./pages/dashboard/payments"));
const Support = lazy(() => import("./pages/dashboard/Support"));
const Upgrade = lazy(() => import("./pages/dashboard/Upgrade"));
const Settings = lazy(() => import("./pages/dashboard/settings"));
const AccountSettings = lazy(() => import("./pages/account-settings"));

const AdminOverview = lazy(() => import("./pages/admin/dashboard"));
const AdminClients = lazy(() => import("./pages/admin/clients"));
const AdminClientDetail = lazy(() => import("./pages/admin/client-detail"));
const AdminPayments = lazy(() => import("./pages/admin/payments"));
const AdminOverdue = lazy(() => import("./pages/admin/overdue"));
const AdminAudits = lazy(() => import("./pages/admin/audits"));
const AdminOutreach = lazy(() => import("./pages/admin/outreach"));
const AdminSettings = lazy(() => import("./pages/admin/settings"));
const AdminSuppressions = lazy(() => import("./pages/admin/suppressions"));
const AdminSupportTickets = lazy(() => import("./pages/admin/support-tickets"));
const WebsitesManagement = lazy(() => import("./pages/admin/websites"));
const BillingManagement = lazy(() => import("./pages/admin/billing"));
const LegacyAdminIndex = lazy(() => import("./pages/admin/index"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-3 px-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
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
          {/* Public marketing */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/unsubscribe" element={<UnsubscribePage />} />
          <Route path="/recover-account" element={<RecoverAccountPage />} />
          <Route path="/account-deleted" element={<AccountDeletedPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <RoleLanding />
              </ProtectedRoute>
            }
          />

          {/* Client portal */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/progress"
            element={
              <ProtectedRoute>
                <WebsiteProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/support"
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/upgrade"
            element={
              <ProtectedRoute>
                <Upgrade />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            }
          />

          {/* Admin CRM */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute requireAdmin>
                <AdminClients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients/:id"
            element={
              <ProtectedRoute requireAdmin>
                <AdminClientDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/overdue"
            element={
              <ProtectedRoute requireAdmin>
                <AdminOverdue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audits"
            element={
              <ProtectedRoute requireAdmin>
                <AdminAudits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/outreach"
            element={
              <ProtectedRoute requireAdmin>
                <AdminOutreach />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/suppressions"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSuppressions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/support-tickets"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSupportTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <Navigate to="/admin/clients" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/websites"
            element={
              <ProtectedRoute requireAdmin>
                <WebsitesManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/billing"
            element={
              <ProtectedRoute requireAdmin>
                <BillingManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/legacy"
            element={
              <ProtectedRoute requireAdmin>
                <LegacyAdminIndex />
              </ProtectedRoute>
            }
          />

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
