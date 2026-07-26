import { Navigate } from "react-router-dom";

/**
 * Legacy admin landing at /admin/legacy.
 * Superseded by /admin/dashboard; keep route for deep-link compatibility.
 */
export default function LegacyAdminIndex() {
  return <Navigate to="/admin/dashboard" replace />;
}
