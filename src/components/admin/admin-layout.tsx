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
import { DashboardLayout } from "../dashboard/dashboard-layout";

const adminNav = [
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
  return (
    <DashboardLayout title={title} navigation={adminNav} showAdminToggle>
      {children}
    </DashboardLayout>
  );
}
