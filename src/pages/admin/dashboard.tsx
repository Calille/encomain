import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/admin/admin-layout";
import { MetricCard } from "../../components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { supabase } from "../../lib/supabase";
import { Users, Globe, FileText, AlertTriangle, MessageSquare, Activity } from "lucide-react";
import { format } from "date-fns";

interface ActivityRow {
  id: string;
  title: string;
  created_at: string;
  users?: { full_name: string | null; email: string } | null;
}

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clients: 0,
    activeClients: 0,
    suspendedClients: 0,
    websitesInProgress: 0,
    websitesComplete: 0,
    outstanding: 0,
    overdueCount: 0,
    openTickets: 0,
  });
  const [activity, setActivity] = useState<ActivityRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [
          usersRes,
          websitesRes,
          invoicesRes,
          ticketsRes,
          updatesRes,
        ] = await Promise.all([
          supabase.from("users").select("id, role, status"),
          supabase.from("websites").select("id, status"),
          supabase.from("invoices").select("id, amount, status, due_date"),
          supabase.from("support_tickets").select("id, status"),
          supabase
            .from("project_updates")
            .select("id, title, created_at, users!project_updates_user_id_fkey(full_name, email)")
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        const users = (usersRes.data || []).filter((u) => u.role === "user");
        const websites = websitesRes.data || [];
        const invoices = invoicesRes.data || [];
        const tickets = ticketsRes.data || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Outstanding = sum of issued unpaid invoices (sent or overdue). Drafts excluded.
        const outstanding = invoices
          .filter((i) => i.status === "sent" || i.status === "overdue")
          .reduce((s, i) => s + Number(i.amount), 0);

        // Overdue = status overdue, or sent with due_date before today.
        const overdueCount = invoices.filter((i) => {
          if (i.status === "overdue") return true;
          if (i.status !== "sent" || !i.due_date) return false;
          const due = new Date(i.due_date);
          due.setHours(0, 0, 0, 0);
          return due < today;
        }).length;

        setStats({
          clients: users.length,
          activeClients: users.filter((u) => u.status === "active").length,
          suspendedClients: users.filter((u) => u.status === "suspended").length,
          websitesInProgress: websites.filter((w) => w.status === "in_progress").length,
          websitesComplete: websites.filter(
            (w) => w.status === "completed" || w.status === "active"
          ).length,
          outstanding,
          overdueCount,
          openTickets: tickets.filter((t) => t.status === "open" || t.status === "pending").length,
        });
        const rawUpdates = updatesRes.data || [];
        setActivity(
          rawUpdates.map((row) => {
            const usersField = row.users as
              | { full_name: string | null; email: string }
              | { full_name: string | null; email: string }[]
              | null;
            const users = Array.isArray(usersField) ? usersField[0] || null : usersField;
            return {
              id: row.id,
              title: row.title,
              created_at: row.created_at,
              users,
            };
          })
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout title="Overview">
      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <MetricCard
              label="Clients"
              value={stats.clients}
              icon={Users}
              formatValue={(n) =>
                `${n} (${stats.activeClients} active, ${stats.suspendedClients} suspended)`
              }
            />
            <MetricCard
              label="Websites"
              value={stats.websitesInProgress + stats.websitesComplete}
              icon={Globe}
              formatValue={() =>
                `${stats.websitesInProgress} in progress, ${stats.websitesComplete} complete`
              }
            />
            <MetricCard
              label="Outstanding invoiced"
              value={stats.outstanding}
              decimals={2}
              prefix="£"
              icon={FileText}
            />
            <MetricCard label="Overdue invoices" value={stats.overdueCount} icon={AlertTriangle} />
            <MetricCard label="Open support tickets" value={stats.openTickets} icon={MessageSquare} />
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Recent activity</CardTitle>
              <Link to="/admin/clients" className="text-xs text-accent hover:underline">
                View clients
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {activity.length === 0 ? (
                <EmptyState icon={Activity} message="No recent project updates." />
              ) : (
                <ul className="divide-y divide-border">
                  {activity.map((row) => (
                    <li key={row.id} className="flex items-start justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{row.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.users?.full_name || row.users?.email || "Client"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {format(new Date(row.created_at), "PP")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}
