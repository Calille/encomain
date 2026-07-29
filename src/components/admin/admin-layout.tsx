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
  Map,
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
  const { isOwner, isAdmin } = useAuth();

  const adminNav = useMemo(() => {
    const nav = [...baseAdminNav];
    const settingsIndex = nav.findIndex((item) => item.href === "/admin/settings");
    const insertAt = settingsIndex === -1 ? nav.length : settingsIndex;

    if (isOwner) {
      nav.splice(insertAt, 0, {
        name: "Sentry team",
        href: "/admin/sentry-team",
        icon: Users,
      });
    }

    if (isAdmin) {
      const sentryIndex = nav.findIndex((item) => item.href === "/admin/sentry-team");
      const coverageAt =
        sentryIndex >= 0
          ? sentryIndex + 1
          : nav.findIndex((item) => item.href === "/admin/settings");
      nav.splice(coverageAt === -1 ? nav.length : coverageAt, 0, {
        name: "Coverage",
        href: "/admin/coverage",
        icon: Map,
      });
    }

    return nav;
  }, [isOwner, isAdmin]);

  return (
    <DashboardLayout title={title} navigation={adminNav} showAdminToggle>
      {children}
    </DashboardLayout>
  );
}
