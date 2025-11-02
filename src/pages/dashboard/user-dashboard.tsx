import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Tables } from "../../types/supabase";
import {
  Globe,
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "../../hooks/use-toast";

type Website = Tables<"websites">;
type Invoice = Tables<"invoices">;
type ProjectUpdate = Tables<"project_updates">;

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWebsiteFilter, setSelectedWebsiteFilter] = useState<string>("all");

  // Calculate stats
  const totalWebsites = websites.length;
  const activeWebsites = websites.filter(w => w.status === 'active' || w.status === 'in_progress').length;
  const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length;
  const pendingAmount = invoices
    .filter(i => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const totalSpent = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch websites
        const { data: websitesData, error: websitesError } = await supabase
          .from("websites")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (websitesError) throw websitesError;
        setWebsites(websitesData || []);

        // Fetch invoices
        const { data: invoicesData, error: invoicesError } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id)
          .order("issue_date", { ascending: false });

        if (invoicesError) throw invoicesError;
        setInvoices(invoicesData || []);

        // Fetch project updates
        const { data: updatesData, error: updatesError } = await supabase
          .from("project_updates")
          .select("*, websites(name)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (updatesError) throw updatesError;
        setProjectUpdates(updatesData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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

    // Subscribe to realtime updates
    const websitesChannel = supabase
      .channel("websites-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "websites",
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchData()
      )
      .subscribe();

    const updatesChannel = supabase
      .channel("updates-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_updates",
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      websitesChannel.unsubscribe();
      updatesChannel.unsubscribe();
    };
  }, [user]);

  // Filter project updates by website
  const filteredUpdates = selectedWebsiteFilter === "all"
    ? projectUpdates
    : projectUpdates.filter(u => u.website_id === selectedWebsiteFilter);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "on_hold":
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "progress":
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case "issue":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
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
    <DashboardLayout title="Dashboard">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A4D2E]">
          Welcome back, {profile?.full_name || "User"}!
        </h1>
        <p className="text-gray-600 mt-1">
          Last login: {profile?.last_login ? format(new Date(profile.last_login), "PPpp") : "Never"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Websites</p>
                <h3 className="text-3xl font-bold text-[#1A4D2E] mt-2">{totalWebsites}</h3>
                <p className="text-xs text-gray-500 mt-1">{activeWebsites} active</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                <h3 className="text-3xl font-bold text-[#1A4D2E] mt-2">{pendingInvoices}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  £{pendingAmount.toFixed(2)} due
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-600" />
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
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <h3 className="text-3xl font-bold text-[#1A4D2E] mt-2">
                  £{totalSpent.toFixed(2)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Lifetime</p>
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
                <p className="text-sm font-medium text-gray-600">Recent Updates</p>
                <h3 className="text-3xl font-bold text-[#1A4D2E] mt-2">
                  {projectUpdates.length}
                </h3>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Website Progress Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1A4D2E] mb-4">Your Websites</h2>
        {websites.length === 0 ? (
          <Card className="p-8 text-center">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No websites yet. Check back soon!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <motion.div
                key={website.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 shadow-sm border border-gray-200 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#1A4D2E]">{website.name}</h3>
                      {website.url && (
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          Visit site <Eye className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        website.status
                      )}`}
                    >
                      {website.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-gray-700">
                        {website.progress_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="bg-[#1A4D2E] h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${website.progress_percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Last updated: {format(new Date(website.updated_at), "PP")}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Project Updates Timeline - Continue in next part due to length */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#1A4D2E]">Project Updates</h2>
          {websites.length > 1 && (
            <select
              value={selectedWebsiteFilter}
              onChange={(e) => setSelectedWebsiteFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]"
            >
              <option value="all">All Websites</option>
              {websites.map((website) => (
                <option key={website.id} value={website.id}>
                  {website.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {filteredUpdates.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No updates yet.</p>
          </Card>
        ) : (
          <Card className="p-6 shadow-sm border border-gray-200">
            <div className="space-y-6">
              {filteredUpdates.map((update, index) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getUpdateIcon(update.update_type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[#1A4D2E]">{update.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          update.update_type
                        )}`}
                      >
                        {update.update_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(update.created_at), "PPp")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>

    </DashboardLayout>
  );
}

