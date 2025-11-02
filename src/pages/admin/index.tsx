import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card } from "../../components/ui/card";
import { supabase } from "../../lib/supabase";
import { Tables } from "../../types/supabase";
import {
  Users,
  Globe,
  DollarSign,
  FileText,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "../../hooks/use-toast";

type User = Tables<"users">;
type Website = Tables<"websites">;
type Invoice = Tables<"invoices">;
type Billing = Tables<"billing">;

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalWebsites = websites.length;
  const activeWebsites = websites.filter(w => w.status === 'active' || w.status === 'in_progress').length;
  const totalRevenue = billing.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
  const pendingRevenue = billing.filter(b => b.status === 'pending' || b.status === 'overdue').reduce((sum, b) => sum + Number(b.amount), 0);
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          { data: usersData, error: usersError },
          { data: websitesData, error: websitesError },
          { data: invoicesData, error: invoicesError },
          { data: billingData, error: billingError },
        ] = await Promise.all([
          supabase.from("users").select("*").order("created_at", { ascending: false }),
          supabase.from("websites").select("*").order("created_at", { ascending: false }),
          supabase.from("invoices").select("*").order("issue_date", { ascending: false }),
          supabase.from("billing").select("*").order("created_at", { ascending: false }),
        ]);

        if (usersError) throw usersError;
        if (websitesError) throw websitesError;
        if (invoicesError) throw invoicesError;
        if (billingError) throw billingError;

        setUsers(usersData || []);
        setWebsites(websitesData || []);
        setInvoices(invoicesData || []);
        setBilling(billingData || []);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#1A4D2E] border-r-transparent"></div>
            <p className="mt-4 text-[#1A4D2E] font-medium">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A4D2E]">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of system activity and metrics</p>
      </div>

      {/* Alerts */}
      {overdueInvoices > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Attention Required</h3>
            <p className="text-sm text-red-700 mt-1">
              You have {overdueInvoices} overdue invoice{overdueInvoices > 1 ? "s" : ""} that need attention.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <h3 className="text-3xl font-bold text-[#1A4D2E] mt-2">{totalUsers}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {activeUsers} active
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Websites</p>
                <h3 className="text-3xl font-bold text-[#1A4D2E] mt-2">{totalWebsites}</h3>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {activeWebsites} active
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <h3 className="text-3xl font-bold text-[#1A4D2E] mt-2">
                  £{totalRevenue.toFixed(0)}
                </h3>
                <p className="text-xs text-gray-600 mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Revenue</p>
                <h3 className="text-3xl font-bold text-[#1A4D2E] mt-2">
                  £{pendingRevenue.toFixed(0)}
                </h3>
                <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Outstanding
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Users */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1A4D2E] mb-4">Recent Users</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A4D2E] flex items-center justify-center text-white font-medium">
                    {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.full_name || "No name"}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Websites */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1A4D2E] mb-4">Recent Websites</h3>
          <div className="space-y-3">
            {websites.slice(0, 5).map((website) => (
              <div
                key={website.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{website.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-[#1A4D2E] h-1.5 rounded-full"
                        style={{ width: `${website.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{website.progress_percentage}%</span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    website.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : website.status === "in_progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {website.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-[#1A4D2E] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/users"
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
          >
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Manage Users</p>
          </a>
          <a
            href="/admin/websites"
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
          >
            <Globe className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Manage Websites</p>
          </a>
          <a
            href="/admin/billing"
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
          >
            <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Manage Billing</p>
          </a>
          <a
            href="/admin/analytics"
            className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
          >
            <TrendingUp className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm font-medium">View Analytics</p>
          </a>
        </div>
      </Card>
    </DashboardLayout>
  );
}

