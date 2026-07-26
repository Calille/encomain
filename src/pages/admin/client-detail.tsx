import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminLayout } from "../../components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { LoadError } from "../../components/ui/load-error";
import { supabase } from "../../lib/supabase";
import { Tables } from "../../types/supabase";
import { useCancellableLoad } from "../../hooks/useCancellableLoad";
import { ArrowLeft, Globe, FileText, MessageSquare, Activity } from "lucide-react";
import { format } from "date-fns";

export default function AdminClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<Tables<"users"> | null>(null);
  const [websites, setWebsites] = useState<Tables<"websites">[]>([]);
  const [invoices, setInvoices] = useState<Tables<"invoices">[]>([]);
  const [tickets, setTickets] = useState<Tables<"support_tickets">[]>([]);
  const [updates, setUpdates] = useState<Tables<"project_updates">[]>([]);

  const load = useCallback(
    async (ctl: { isCancelled: () => boolean }) => {
      if (!id) return;
      const [u, w, i, t, p] = await Promise.all([
        supabase.from("users").select("*").eq("id", id).maybeSingle(),
        supabase.from("websites").select("*").eq("user_id", id),
        supabase.from("invoices").select("*").eq("user_id", id).order("issue_date", { ascending: false }),
        supabase.from("support_tickets").select("*").eq("user_id", id),
        supabase
          .from("project_updates")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      if (ctl.isCancelled()) return;
      const firstError = u.error || w.error || i.error || t.error || p.error;
      if (firstError) throw firstError;
      setUser(u.data);
      setWebsites(w.data || []);
      setInvoices(i.data || []);
      setTickets(t.data || []);
      setUpdates(p.data || []);
    },
    [id]
  );

  const { loading, error, retry } = useCancellableLoad(load, [id]);

  if (loading) {
    return (
      <AdminLayout title="Client">
        <Skeleton className="h-64 w-full" />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Client">
        <LoadError message={error} onRetry={retry} />
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="Client">
        <Card>
          <EmptyState icon={Globe} message="Client not found." />
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={user.full_name || user.email}>
      <Link
        to="/admin/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Back to clients
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant={user.status === "active" ? "success" : "secondary"}>{user.status}</Badge>
        <Badge variant="outline" className="capitalize">
          {user.current_plan || "no plan"}
        </Badge>
        <span className="text-sm text-muted-foreground">{user.email}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              Websites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {websites.length === 0 ? (
              <p className="text-sm text-muted-foreground">No websites</p>
            ) : (
              websites.map((w) => (
                <div key={w.id} className="flex items-center justify-between text-sm">
                  <span>{w.name}</span>
                  <span className="font-mono-nums text-muted-foreground">
                    {w.progress_percentage}% · {w.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices</p>
            ) : (
              invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between text-sm">
                  <span>{inv.invoice_number}</span>
                  <span className="font-mono-nums">
                    £{Number(inv.amount).toFixed(2)} · {inv.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              Support tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets</p>
            ) : (
              tickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span className="truncate pr-2">{t.subject}</span>
                  <Badge variant="secondary">{t.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {updates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No updates</p>
            ) : (
              updates.map((u) => (
                <div key={u.id} className="text-sm">
                  <p className="font-medium">{u.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(u.created_at), "PPp")}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
