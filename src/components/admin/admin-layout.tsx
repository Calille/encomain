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
  Wrench,
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

    // Tools then Suppressions: Coverage → Tools → Suppressions → Settings
    const coverageIndex = nav.findIndex((item) => item.href === "/admin/coverage");
    const toolsAt =
      coverageIndex >= 0
        ? coverageIndex + 1
        : nav.findIndex((item) => item.href === "/admin/settings");
    const toolsInsert = toolsAt === -1 ? nav.length : toolsAt;
    nav.splice(toolsInsert, 0, {
      name: "Tools",
      href: "/admin/tools",
      icon: Wrench,
    });
    const toolsIndex = nav.findIndex((item) => item.href === "/admin/tools");
    nav.splice(toolsIndex + 1, 0, {
      name: "Suppressions",
      href: "/admin/suppressions",
      icon: Ban,
    });

    return nav;
  }, [isOwner, isAdmin]);

  return (
    <DashboardLayout title={title} navigation={adminNav} showAdminToggle>
      {children}
    </DashboardLayout>
  );
}
