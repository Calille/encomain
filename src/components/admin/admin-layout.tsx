import {
  LayoutDashboard,
  Users,
  CreditCard,
  TrendingUp,
  MessageSquare,
  Settings,
  Ban,
  LifeBuoy,
  AlertTriangle,
} from "lucide-react";
import { useMemo } from "react";
import { DashboardLayout } from "../dashboard/dashboard-layout";
import { useAuth } from "../../contexts/AuthContext";

const baseAdminNav = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Overdue", href: "/admin/overdue", icon: AlertTriangle },
  { name: "Support tickets", href: "/admin/support-tickets", icon: LifeBuoy },
  { name: "Audits and Leads", href: "/admin/audits", icon: TrendingUp },
  { name: "Outreach", href: "/admin/outreach", icon: MessageSquare },
  { name: "Suppressions", href: "/admin/suppressions", icon: Ban },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { isOwner } = useAuth();

  const adminNav = useMemo(() => {
    if (!isOwner) return baseAdminNav;
    const settingsIndex = baseAdminNav.findIndex((item) => item.href === "/admin/settings");
    const withSentry = [...baseAdminNav];
    withSentry.splice(settingsIndex === -1 ? withSentry.length : settingsIndex, 0, {
      name: "Sentry team",
      href: "/admin/sentry-team",
      icon: Users,
    });
    return withSentry;
  }, [isOwner]);

  return (
    <DashboardLayout title={title} navigation={adminNav} showAdminToggle>
      {children}
    </DashboardLayout>
  );
}
