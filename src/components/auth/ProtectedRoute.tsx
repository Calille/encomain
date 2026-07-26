import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Skeleton } from "../ui/skeleton";

const VIEW_AS_CLIENT_KEY = "enclosure-view-as-client";

export function isViewingAsClient(): boolean {
  try {
    return localStorage.getItem(VIEW_AS_CLIENT_KEY) === "1";
  } catch {
    return false;
  }
}

export function setViewAsClient(enabled: boolean) {
  try {
    if (enabled) {
      localStorage.setItem(VIEW_AS_CLIENT_KEY, "1");
    } else {
      localStorage.removeItem(VIEW_AS_CLIENT_KEY);
    }
  } catch {
    // Ignore storage failures
  }
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading, profileLoading } = useAuth();
  const location = useLocation();

  // Wait for session AND profile when signed in — role checks need public.users.
  if (loading || (user && profileLoading && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-3 px-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile && profile.status !== "active") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-md border border-border bg-surface p-6 text-center">
          <h2 className="text-lg font-semibold text-foreground">Account inactive</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is currently {profile.status}. Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  const mustChangePassword = profile?.requires_password_change || false;
  if (mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (!mustChangePassword && location.pathname === "/change-password") {
    return <Navigate to="/app" replace />;
  }

  if (requireAdmin && profile?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Admins landing on client routes go to the CRM unless "view as client" is active
  const onClientRoute =
    location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/");
  if (
    !requireAdmin &&
    profile?.role === "admin" &&
    onClientRoute &&
    !isViewingAsClient()
  ) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
