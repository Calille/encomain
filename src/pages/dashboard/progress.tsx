import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Tables } from "../../types/supabase";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Globe,
  TrendingUp,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

type Website = Tables<"websites">;
type ProjectUpdate = Tables<"project_updates">;

export default function WebsiteProgress() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);

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

        // Fetch project updates
        const { data: updatesData, error: updatesError } = await supabase
          .from("project_updates")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (updatesError) throw updatesError;
        setProjectUpdates(updatesData || []);

        // Auto-select first website if available
        if (websitesData && websitesData.length > 0 && !selectedWebsite) {
          setSelectedWebsite(websitesData[0].id);
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
        toast({
          title: "Error",
          description: "Failed to load website progress. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const websitesChannel = supabase
      .channel("websites-progress")
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
      .channel("updates-progress")
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
  }, [user, selectedWebsite]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "on_hold":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
        return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  const selectedWebsiteData = websites.find((w) => w.id === selectedWebsite);
  const websiteUpdates = selectedWebsiteData
    ? projectUpdates.filter((u) => u.website_id === selectedWebsiteData.id)
    : [];

  if (loading) {
    return (
      <DashboardLayout title="Website Progress">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#1A4D2E] border-r-transparent"></div>
            <p className="mt-4 text-[#1A4D2E] font-medium">Loading progress...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (websites.length === 0) {
    return (
      <DashboardLayout title="Website Progress">
        <Card className="p-12 text-center">
          <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Websites Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Your websites will appear here once they've been created.
          </p>
          <Link to="/dashboard">
            <Button className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90">
              Go to Dashboard
            </Button>
          </Link>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Website Progress">
      <div className="space-y-6">
        {/* Website Selector */}
        {websites.length > 1 && (
          <Card className="p-4 shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Website
            </label>
            <select
              value={selectedWebsite || ""}
              onChange={(e) => setSelectedWebsite(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]"
            >
              {websites.map((website) => (
                <option key={website.id} value={website.id}>
                  {website.name}
                </option>
              ))}
            </select>
          </Card>
        )}

        {selectedWebsiteData && (
          <>
            {/* Overall Progress Card */}
            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#1A4D2E] mb-2">
                    {selectedWebsiteData.name}
                  </h2>
                  {selectedWebsiteData.url && (
                    <a
                      href={selectedWebsiteData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Visit website
                    </a>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedWebsiteData.status
                  )}`}
                >
                  {getStatusIcon(selectedWebsiteData.status)}
                  {selectedWebsiteData.status.replace("_", " ")}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Overall Progress
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedWebsiteData.progress_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <motion.div
                    className="bg-[#1A4D2E] h-4 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedWebsiteData.progress_percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Status
                  </div>
                  <div className="text-lg font-semibold capitalize">
                    {selectedWebsiteData.status.replace("_", " ")}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Last Updated
                  </div>
                  <div className="text-lg font-semibold">
                    {format(new Date(selectedWebsiteData.updated_at), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Project Updates
                  </div>
                  <div className="text-lg font-semibold">
                    {websiteUpdates.length}
                  </div>
                </div>
              </div>
            </Card>

            {/* Project Updates Timeline */}
            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#1A4D2E]">
                  Project Timeline
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {websiteUpdates.length} update{websiteUpdates.length !== 1 ? "s" : ""}
                </div>
              </div>

              {websiteUpdates.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No updates yet for this website.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Updates will appear here as your project progresses.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {websiteUpdates.map((update, index) => (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getUpdateIcon(update.update_type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-[#1A4D2E]">
                              {update.title}
                            </h3>
                            {update.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {update.description}
                              </p>
                            )}
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
              )}
            </Card>
          </>
        )}

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              toast({
                title: "Schedule Call",
                description: "A calendar link will be sent to your email shortly.",
              });
            }}
          >
            <Calendar className="h-4 w-4" />
            Schedule Progress Call
          </Button>
          <Link to="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
