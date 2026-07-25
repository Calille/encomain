import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { MetricCard } from "../../components/ui/metric-card";
import { EmptyState } from "../../components/ui/empty-state";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Tables } from "../../types/supabase";
import {
  Globe,
  FileText,
  TrendingUp,
  Calendar,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "../../hooks/use-toast";

type Website = Tables<"websites">;
type Invoice = Tables<"invoices">;
type ProjectUpdate = Tables<"project_updates"> & {
  websites?: { name: string } | null;
};

function statusVariant(status: string): "default" | "secondary" | "destructive" | "success" | "warning" | "outline" {
  switch (status) {
    case "active":
    case "paid":
    case "completed":
      return "success";
    case "in_progress":
    case "sent":
    case "progress":
    case "milestone":
      return "default";
    case "pending":
    case "issue":
      return "warning";
    case "overdue":
      return "destructive";
    default:
      return "secondary";
  }
}

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWebsiteFilter, setSelectedWebsiteFilter] = useState<string>("all");

  const totalWebsites = websites.length;
  const activeWebsites = websites.filter(
    (w) => w.status === "active" || w.status === "in_progress"
  ).length;
  const pendingInvoices = invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue"
  ).length;
  const pendingAmount = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const totalSpent = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

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

        const { data: invoicesData, error: invoicesError } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id)
          .order("issue_date", { ascending: false });

        if (invoicesError) throw invoicesError;
        setInvoices(invoicesData || []);

        const { data: updatesData, error: updatesError } = await supabase
          .from("project_updates")
          .select("*, websites(name)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (updatesError) throw updatesError;
        setProjectUpdates((updatesData as ProjectUpdate[]) || []);
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

  const filteredUpdates =
    selectedWebsiteFilter === "all"
      ? projectUpdates
      : projectUpdates.filter((u) => u.website_id === selectedWebsiteFilter);

  const updateIcon = (type: string) => {
    switch (type) {
      case "milestone":
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={1.5} />;
      case "progress":
        return <TrendingUp className="h-4 w-4 text-accent" strokeWidth={1.5} />;
      case "issue":
        return <AlertCircle className="h-4 w-4 text-warning" strokeWidth={1.5} />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Welcome back, {profile?.full_name || "there"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Last login:{" "}
          {profile?.last_login
            ? format(new Date(profile.last_login), "PPpp")
            : "Never"}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total websites"
          value={totalWebsites}
          icon={Globe}
          formatValue={(n) => `${n} (${activeWebsites} active)`}
        />
        <MetricCard
          label="Pending invoices"
          value={pendingInvoices}
          icon={FileText}
          formatValue={(n) => `${n} · £${pendingAmount.toFixed(2)}`}
        />
        <MetricCard
          label="Total spent"
          value={totalSpent}
          decimals={2}
          prefix="£"
          icon={FileText}
        />
        <MetricCard
          label="Recent updates"
          value={projectUpdates.length}
          icon={TrendingUp}
        />
      </div>

      <section className="mb-8">
        <h3 className="mb-3 text-md font-semibold text-foreground">Your websites</h3>
        {websites.length === 0 ? (
          <Card>
            <EmptyState icon={Globe} message="No websites yet. Check back soon." />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {websites.map((website) => (
              <Card key={website.id}>
                <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base">{website.name}</CardTitle>
                    {website.url && (
                      <a
                        href={website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                      >
                        Visit site <Eye className="h-3 w-3" strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                  <Badge variant={statusVariant(website.status)}>
                    {website.status.replace("_", " ")}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-mono-nums">{website.progress_percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${website.progress_percentage}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Updated {format(new Date(website.updated_at), "PP")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-md font-semibold text-foreground">Project updates</h3>
          {websites.length > 1 && (
            <select
              value={selectedWebsiteFilter}
              onChange={(e) => setSelectedWebsiteFilter(e.target.value)}
              className="h-8 rounded-sm border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All websites</option>
              {websites.map((website) => (
                <option key={website.id} value={website.id}>
                  {website.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {filteredUpdates.length === 0 ? (
          <Card>
            <EmptyState icon={Clock} message="No updates yet." />
          </Card>
        ) : (
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {filteredUpdates.map((update) => (
                <div key={update.id} className="flex gap-3 px-4 py-3">
                  <div className="mt-0.5 text-muted-foreground">{updateIcon(update.update_type)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{update.title}</p>
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
            </CardContent>
          </Card>
        )}
      </section>
    </DashboardLayout>
  );
}
