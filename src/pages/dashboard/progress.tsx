import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { EmptyState } from "../../components/ui/empty-state";
import { Skeleton } from "../../components/ui/skeleton";
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
import { Link } from "react-router-dom";

type Website = Tables<"websites">;
type ProjectUpdate = Tables<"project_updates">;

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" | "outline" {
  switch (status) {
    case "active":
    case "completed":
    case "milestone":
      return "success";
    case "in_progress":
    case "progress":
      return "default";
    case "on_hold":
    case "issue":
      return "warning";
    default:
      return "secondary";
  }
}

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

        const { data: websitesData, error: websitesError } = await supabase
          .from("websites")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (websitesError) throw websitesError;
        setWebsites(websitesData || []);

        const { data: updatesData, error: updatesError } = await supabase
          .from("project_updates")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (updatesError) throw updatesError;
        setProjectUpdates(updatesData || []);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />;
      case "in_progress":
        return <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />;
      case "on_hold":
        return <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />;
      default:
        return <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />;
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "milestone":
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={1.5} />;
      case "progress":
        return <TrendingUp className="h-4 w-4 text-accent" strokeWidth={1.5} />;
      case "issue":
        return <AlertCircle className="h-4 w-4 text-warning" strokeWidth={1.5} />;
      default:
        return <MessageSquare className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />;
    }
  };

  const selectedWebsiteData = websites.find((w) => w.id === selectedWebsite);
  const websiteUpdates = selectedWebsiteData
    ? projectUpdates.filter((u) => u.website_id === selectedWebsiteData.id)
    : [];

  if (loading) {
    return (
      <DashboardLayout title="Website Progress">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="mb-4 h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </DashboardLayout>
    );
  }

  if (websites.length === 0) {
    return (
      <DashboardLayout title="Website Progress">
        <Card>
          <EmptyState
            icon={Globe}
            message="No websites yet. They will appear here once created."
          />
          <div className="flex justify-center pb-8">
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Website Progress">
      <div className="space-y-6">
        {websites.length > 1 && (
          <Card>
            <CardContent className="p-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Select website
              </label>
              <select
                value={selectedWebsite || ""}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                className="h-9 w-full rounded-sm border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {websites.map((website) => (
                  <option key={website.id} value={website.id}>
                    {website.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

        {selectedWebsiteData && (
          <>
            <Card>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl">{selectedWebsiteData.name}</CardTitle>
                  {selectedWebsiteData.url && (
                    <a
                      href={selectedWebsiteData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-accent hover:underline"
                    >
                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                      Visit website
                    </a>
                  )}
                </div>
                <Badge
                  variant={statusVariant(selectedWebsiteData.status)}
                  className="gap-1"
                >
                  {getStatusIcon(selectedWebsiteData.status)}
                  {selectedWebsiteData.status.replace("_", " ")}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                    <span>Overall progress</span>
                    <span className="font-mono-nums text-foreground">
                      {selectedWebsiteData.progress_percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{
                        width: `${selectedWebsiteData.progress_percentage}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-sm border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="mt-1 text-sm font-medium capitalize text-foreground">
                      {selectedWebsiteData.status.replace("_", " ")}
                    </p>
                  </div>
                  <div className="rounded-sm border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Last updated</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {format(new Date(selectedWebsiteData.updated_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="rounded-sm border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Project updates</p>
                    <p className="mt-1 text-sm font-medium text-foreground font-mono-nums">
                      {websiteUpdates.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Project timeline</CardTitle>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" strokeWidth={1.5} />
                  {websiteUpdates.length} update
                  {websiteUpdates.length !== 1 ? "s" : ""}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {websiteUpdates.length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    message="No updates yet for this website."
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {websiteUpdates.map((update) => (
                      <div key={update.id} className="flex gap-3 px-4 py-4">
                        <div className="mt-0.5">{getUpdateIcon(update.update_type)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {update.title}
                              </p>
                              {update.description && (
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                  {update.description}
                                </p>
                              )}
                            </div>
                            <Badge variant={statusVariant(update.update_type)}>
                              {update.update_type}
                            </Badge>
                          </div>
                          <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" strokeWidth={1.5} />
                            {format(new Date(update.created_at), "PPp")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast({
                title: "Schedule call",
                description: "A calendar link will be sent to your email shortly.",
              });
            }}
          >
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            Schedule progress call
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
