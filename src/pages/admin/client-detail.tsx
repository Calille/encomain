import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  MoreHorizontal,
  FileText,
  Globe,
  LifeBuoy,
  CreditCard,
  Trash2,
} from "lucide-react";
import { format, isSameYear, parseISO } from "date-fns";
import { AdminLayout } from "../../components/admin/admin-layout";
import { MetricCard } from "../../components/ui/metric-card";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { LoadError } from "../../components/ui/load-error";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { supabase } from "../../lib/supabase";
import { useCancellableLoad } from "../../hooks/useCancellableLoad";
import { formatPlanLabel } from "../../lib/plans";
import { toast } from "../../hooks/use-toast";
import {
  AdminOption,
  ClientCreditNote,
  ClientDetailData,
  ClientEmailEvent,
  ClientInvoice,
  ClientNote,
  ClientPayment,
  ClientProjectUpdate,
  ClientReminder,
  ClientSchedule,
  ClientTicket,
  ClientUser,
  ClientWebsite,
  clientInitials,
  isOutstandingInvoice,
} from "../../components/admin/client/types";
import { EditClientDialog } from "../../components/admin/client/edit-client-dialog";
import {
  HardDeleteClientDialog,
  SoftDeleteClientDialog,
} from "../../components/admin/client/delete-client-dialogs";
import { ClientOverviewTab } from "../../components/admin/client/client-overview-tab";
import { ClientBillingTab } from "../../components/admin/client/client-billing-tab";
import { ClientWebsitesTab } from "../../components/admin/client/client-websites-tab";
import { ClientSupportTab } from "../../components/admin/client/client-support-tab";
import { ClientNotesTab } from "../../components/admin/client/client-notes-tab";
import { ClientCommunicationsTab } from "../../components/admin/client/client-communications-tab";

const TAB_VALUES = [
  "overview",
  "billing",
  "websites",
  "support",
  "notes",
  "communications",
] as const;

type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string | null): v is TabValue {
  return TAB_VALUES.includes(v as TabValue);
}

export default function AdminClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : "overview";

  const [data, setData] = useState<ClientDetailData | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [softDeleteOpen, setSoftDeleteOpen] = useState(false);
  const [hardDeleteOpen, setHardDeleteOpen] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  const load = useCallback(
    async (ctl: { isCancelled: () => boolean }) => {
      if (!id) return;

      const [
        u,
        w,
        i,
        t,
        p,
        paymentsRes,
        creditsRes,
        schedulesRes,
        notesRes,
        emailsRes,
        remindersRes,
        adminsRes,
      ] = await Promise.all([
        supabase.from("users").select("*").eq("id", id).maybeSingle(),
        supabase.from("websites").select("*").eq("user_id", id),
        supabase
          .from("invoices")
          .select("*")
          .eq("user_id", id)
          .order("issue_date", { ascending: false }),
        supabase
          .from("support_tickets")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("project_updates")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("payments")
          .select("*")
          .eq("user_id", id)
          .order("paid_at", { ascending: false }),
        supabase
          .from("credit_notes")
          .select("*")
          .eq("user_id", id)
          .order("issued_at", { ascending: false }),
        supabase
          .from("recurring_invoice_schedules")
          .select("*")
          .eq("user_id", id)
          .order("next_invoice_date", { ascending: true }),
        supabase
          .from("client_notes")
          .select("*, author:users!client_notes_author_id_fkey(full_name, email)")
          .eq("user_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("email_events")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("payment_reminders").select("*").eq("user_id", id),
        supabase
          .from("users")
          .select("id, full_name, email")
          .eq("role", "admin")
          .order("full_name", { ascending: true }),
      ]);

      if (ctl.isCancelled()) return;

      const firstError =
        u.error ||
        w.error ||
        i.error ||
        t.error ||
        p.error ||
        paymentsRes.error ||
        creditsRes.error ||
        schedulesRes.error ||
        notesRes.error ||
        emailsRes.error ||
        remindersRes.error ||
        adminsRes.error;
      if (firstError) throw firstError;

      if (!u.data) {
        setData(null);
        return;
      }

      setData({
        user: u.data as ClientUser,
        websites: (w.data || []) as ClientWebsite[],
        invoices: (i.data || []) as ClientInvoice[],
        tickets: (t.data || []) as ClientTicket[],
        updates: (p.data || []) as ClientProjectUpdate[],
        payments: (paymentsRes.data || []) as ClientPayment[],
        creditNotes: (creditsRes.data || []) as ClientCreditNote[],
        schedules: (schedulesRes.data || []) as ClientSchedule[],
        notes: (notesRes.data || []) as ClientNote[],
        emailEvents: (emailsRes.data || []) as ClientEmailEvent[],
        reminders: (remindersRes.data || []) as ClientReminder[],
        admins: (adminsRes.data || []) as AdminOption[],
      });
    },
    [id]
  );

  const { loading, error, retry } = useCancellableLoad(load, [id], 20_000);

  const setTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "overview") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

  const stats = useMemo(() => {
    if (!data) {
      return {
        outstanding: 0,
        paidThisYear: 0,
        websites: 0,
        openTickets: 0,
      };
    }
    const year = new Date();
    const outstanding = data.invoices
      .filter(isOutstandingInvoice)
      .reduce((s, inv) => s + Number(inv.amount), 0);
    const paidThisYear = data.payments
      .filter((p) => {
        try {
          return isSameYear(parseISO(p.paid_at), year);
        } catch {
          return false;
        }
      })
      .reduce((s, p) => s + Number(p.amount), 0);
    const openTickets = data.tickets.filter(
      (t) => t.status === "open" || t.status === "pending"
    ).length;
    return {
      outstanding,
      paidThisYear,
      websites: data.websites.length,
      openTickets,
    };
  }, [data]);

  const toggleStatus = async () => {
    if (!data) return;
    const next = data.user.status === "active" ? "inactive" : "active";
    setStatusUpdating(true);
    try {
      const { error: updError } = await supabase
        .from("users")
        .update({ status: next })
        .eq("id", data.user.id);
      if (updError) throw updError;
      toast({
        title: next === "active" ? "Client activated" : "Client marked inactive",
      });
      retry();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update status.",
        variant: "destructive",
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleRecover = async () => {
    if (!data) return;
    setIsRecovering(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          deleted_at: null,
          deletion_scheduled_for: null,
          deleted_by: null,
          deletion_reason: null,
          recovery_token: null,
          status: "active",
        })
        .eq("id", data.user.id);
      if (error) throw error;
      toast({
        title: "Client recovered",
        description: "The account is active again.",
      });
      retry();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to recover client.",
        variant: "destructive",
      });
    } finally {
      setIsRecovering(false);
    }
  };

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

  if (!data) {
    return (
      <AdminLayout title="Client">
        <Card>
          <EmptyState icon={Globe} message="Client not found." />
        </Card>
      </AdminLayout>
    );
  }

  const { user } = data;
  const initials = clientInitials(user.full_name, user.email);
  const isAdminTarget = user.role === "admin";
  const isSoftDeleted = Boolean(user.deleted_at);
  const showDeleteActions = !isAdminTarget && !isSoftDeleted && !user.anonymised_at;
  const showRecover = !isAdminTarget && isSoftDeleted && !user.anonymised_at;

  return (
    <AdminLayout title={user.full_name || user.email}>
      <Link
        to="/admin/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Back to clients
      </Link>

      {isSoftDeleted && (
        <div className="mb-4 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">Account soft-deleted</p>
          <p className="mt-1 text-muted-foreground">
            This client was deactivated
            {user.deleted_at
              ? ` on ${format(new Date(user.deleted_at), "PP")}`
              : ""}
            . They can recover until{" "}
            {user.deletion_scheduled_for
              ? format(new Date(user.deletion_scheduled_for), "PP")
              : "the end of the recovery window"}
            .
          </p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {user.full_name || "Unnamed client"}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {formatPlanLabel(user.current_plan)}
              </Badge>
              <Badge
                variant={
                  isSoftDeleted
                    ? "warning"
                    : user.status === "active"
                      ? "success"
                      : "secondary"
                }
              >
                {isSoftDeleted ? "soft-deleted" : user.status}
              </Badge>
              {user.company_name && (
                <span className="text-xs text-muted-foreground">
                  {user.company_name}
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              Actions
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              Edit client
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={statusUpdating || isSoftDeleted}
              onClick={toggleStatus}
            >
              {user.status === "active" ? "Mark inactive" : "Mark active"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setTab("support");
                toast({
                  title: "Open Support tab",
                  description: "Use the Support tab to message this client.",
                });
              }}
            >
              Send message
            </DropdownMenuItem>

            {showRecover && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isRecovering}
                  onClick={handleRecover}
                >
                  {isRecovering ? "Recovering…" : "Recover client"}
                </DropdownMenuItem>
              </>
            )}

            {showDeleteActions && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setSoftDeleteOpen(true)}
                >
                  Delete client account
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setHardDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Permanently delete (hard delete)
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Outstanding"
          value={stats.outstanding}
          decimals={2}
          prefix="£"
          icon={FileText}
        />
        <MetricCard
          label="Paid this year"
          value={stats.paidThisYear}
          decimals={2}
          prefix="£"
          icon={CreditCard}
        />
        <MetricCard
          label="Websites"
          value={stats.websites}
          icon={Globe}
        />
        <MetricCard
          label="Open tickets"
          value={stats.openTickets}
          icon={LifeBuoy}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="websites">Websites</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ClientOverviewTab
            data={data}
            onEdit={() => setEditOpen(true)}
            onViewNotes={() => setTab("notes")}
            onRefresh={retry}
          />
        </TabsContent>
        <TabsContent value="billing">
          <ClientBillingTab data={data} onRefresh={retry} />
        </TabsContent>
        <TabsContent value="websites">
          <ClientWebsitesTab data={data} onRefresh={retry} />
        </TabsContent>
        <TabsContent value="support">
          <ClientSupportTab data={data} onRefresh={retry} />
        </TabsContent>
        <TabsContent value="notes">
          <ClientNotesTab data={data} onRefresh={retry} />
        </TabsContent>
        <TabsContent value="communications">
          <ClientCommunicationsTab data={data} />
        </TabsContent>
      </Tabs>

      <EditClientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        admins={data.admins}
        onSaved={retry}
      />

      <SoftDeleteClientDialog
        client={user}
        open={softDeleteOpen}
        onOpenChange={setSoftDeleteOpen}
        onDeleted={retry}
      />

      <HardDeleteClientDialog
        client={user}
        open={hardDeleteOpen}
        onOpenChange={setHardDeleteOpen}
        onDeleted={() => navigate("/admin/clients")}
      />
    </AdminLayout>
  );
}
