import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";
import { AlertTriangle, FileText } from "lucide-react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { MetricCard } from "../../components/ui/metric-card";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { LoadError } from "../../components/ui/load-error";
import { supabase } from "../../lib/supabase";
import { toast } from "../../hooks/use-toast";
import { useCancellableLoad } from "../../hooks/useCancellableLoad";
import {
  compareValues,
  SortIcon,
  useTableSort,
} from "../../hooks/useTableSort";
import { sendPaymentReminder } from "../../utils/emailHelpers";
import {
  formatGbp,
  isOverdueInvoice,
  nextReminderLabel,
} from "../../components/admin/client/types";
import { Tables } from "../../types/supabase";

type Invoice = Tables<"invoices">;
type Reminder = Tables<"payment_reminders">;

interface OverdueRow extends Invoice {
  users?: { full_name: string | null; email: string } | null;
}

type SortKey =
  | "client"
  | "invoice_number"
  | "amount"
  | "due_date"
  | "days_overdue"
  | "last_reminder";

function clientLabel(row: OverdueRow): string {
  return row.users?.full_name || row.users?.email || "Unknown";
}

export default function AdminOverduePage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<OverdueRow[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [query, setQuery] = useState("");
  const [clientId, setClientId] = useState("all");
  const { sort, cycleSort } = useTableSort<SortKey>();
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async (ctl: { isCancelled: () => boolean }) => {
    const [invRes, remRes] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, users!invoices_user_id_fkey(full_name, email)")
        .order("due_date", { ascending: true }),
      supabase.from("payment_reminders").select("*"),
    ]);
    if (ctl.isCancelled()) return;
    if (invRes.error) throw invRes.error;
    if (remRes.error) throw remRes.error;
    setRows((invRes.data as OverdueRow[]) || []);
    setReminders((remRes.data as Reminder[]) || []);
  }, []);

  const { loading, error, retry } = useCancellableLoad(load);

  const today = useMemo(() => startOfDay(new Date()), []);

  const overdueRows = useMemo(() => {
    return rows.filter((r) => isOverdueInvoice(r, today));
  }, [rows, today]);

  const reminderMeta = useMemo(() => {
    const map = new Map<
      string,
      { level: number; sentAt: string | null }
    >();
    for (const r of reminders) {
      const prev = map.get(r.invoice_id);
      if (!prev || r.reminder_level > prev.level) {
        map.set(r.invoice_id, { level: r.reminder_level, sentAt: r.sent_at });
      } else if (
        r.reminder_level === prev.level &&
        r.sent_at &&
        (!prev.sentAt || r.sent_at > prev.sentAt)
      ) {
        map.set(r.invoice_id, { level: r.reminder_level, sentAt: r.sent_at });
      }
    }
    return map;
  }, [reminders]);

  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of overdueRows) {
      if (!map.has(r.user_id)) map.set(r.user_id, clientLabel(r));
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
  }, [overdueRows]);

  const enriched = useMemo(() => {
    let list = overdueRows.map((r) => {
      const due = startOfDay(parseISO(r.due_date));
      const days = Math.max(differenceInCalendarDays(today, due), 0);
      const rem = reminderMeta.get(r.id);
      const level = rem?.level || 0;
      return {
        ...r,
        daysOverdue: days,
        lastLevel: level,
        lastReminderAt: rem?.sentAt || null,
        nextReminder: nextReminderLabel(level, days),
      };
    });

    list = list.filter((r) => {
      if (clientId !== "all" && r.user_id !== clientId) return false;
      const q = query.toLowerCase().trim();
      if (!q) return true;
      return (
        r.invoice_number.toLowerCase().includes(q) ||
        clientLabel(r).toLowerCase().includes(q) ||
        (r.users?.email || "").toLowerCase().includes(q)
      );
    });

    if (sort.key && sort.direction) {
      const dir = sort.direction;
      list = [...list].sort((a, b) => {
        switch (sort.key) {
          case "client":
            return compareValues(clientLabel(a), clientLabel(b), dir);
          case "invoice_number":
            return compareValues(a.invoice_number, b.invoice_number, dir);
          case "amount":
            return compareValues(Number(a.amount), Number(b.amount), dir);
          case "due_date":
            return compareValues(
              new Date(a.due_date).getTime(),
              new Date(b.due_date).getTime(),
              dir
            );
          case "days_overdue":
            return compareValues(a.daysOverdue, b.daysOverdue, dir);
          case "last_reminder":
            return compareValues(a.lastLevel, b.lastLevel, dir);
          default:
            return 0;
        }
      });
    }

    return list;
  }, [overdueRows, reminderMeta, today, query, clientId, sort]);

  const totalOverdue = enriched.reduce((s, r) => s + Number(r.amount), 0);
  const clientCount = new Set(enriched.map((r) => r.user_id)).size;

  const markPaid = async (id: string) => {
    setActingId(id);
    try {
      const { error: updError } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_date: format(new Date(), "yyyy-MM-dd"),
        })
        .eq("id", id);
      if (updError) throw updError;
      toast({ title: "Invoice marked paid" });
      retry();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to mark paid.",
        variant: "destructive",
      });
    } finally {
      setActingId(null);
    }
  };

  const sendReminder = async (invoiceId: string, currentLevel: number) => {
    setActingId(invoiceId);
    try {
      const nextLevel = Math.min(currentLevel + 1, 4);
      const result = await sendPaymentReminder(invoiceId, nextLevel);
      if (!result.success) {
        throw new Error(result.error || "Reminder failed.");
      }
      toast({
        title: "Reminder sent",
        description: `Level ${nextLevel} reminder queued.`,
      });
      retry();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to send reminder.",
        variant: "destructive",
      });
    } finally {
      setActingId(null);
    }
  };

  const headerButton = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => cycleSort(key)}
      className="inline-flex items-center font-medium text-muted-foreground transition-colors-fast hover:text-foreground"
    >
      {label}
      <SortIcon active={sort.key === key} direction={sort.direction} />
    </button>
  );

  return (
    <AdminLayout title="Overdue">
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard
          label="Total overdue"
          value={totalOverdue}
          decimals={2}
          prefix="£"
          icon={AlertTriangle}
        />
        <MetricCard
          label="Overdue invoices"
          value={enriched.length}
          icon={FileText}
        />
        <MetricCard
          label="Clients with overdue"
          value={clientCount}
          icon={AlertTriangle}
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search invoice or client"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="h-9 max-w-[220px] rounded-sm border border-border bg-surface px-2 text-sm"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="all">All clients</option>
          {clientOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <LoadError message={error} onRetry={retry} />
      ) : enriched.length === 0 ? (
        <Card>
          <EmptyState
            icon={AlertTriangle}
            message="No overdue invoices right now."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">{headerButton("client", "Client")}</th>
                  <th className="px-3 py-2">
                    {headerButton("invoice_number", "Invoice")}
                  </th>
                  <th className="px-3 py-2">{headerButton("amount", "Amount")}</th>
                  <th className="px-3 py-2">{headerButton("due_date", "Due")}</th>
                  <th className="px-3 py-2">
                    {headerButton("days_overdue", "Days overdue")}
                  </th>
                  <th className="px-3 py-2">
                    {headerButton("last_reminder", "Last reminder")}
                  </th>
                  <th className="px-3 py-2">Next reminder</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enriched.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2.5">
                      <div>{clientLabel(r)}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.users?.email}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono-nums">
                      {r.invoice_number}
                    </td>
                    <td className="px-3 py-2.5 font-mono-nums">
                      {formatGbp(r.amount)}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {format(parseISO(r.due_date), "PP")}
                    </td>
                    <td className="px-3 py-2.5 font-mono-nums">
                      {r.daysOverdue}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {r.lastLevel > 0 ? (
                        <>
                          <Badge variant="outline">L{r.lastLevel}</Badge>
                          {r.lastReminderAt && (
                            <span className="ml-1 text-xs">
                              {format(new Date(r.lastReminderAt), "PP")}
                            </span>
                          )}
                        </>
                      ) : (
                        "None"
                      )}
                    </td>
                    <td className="px-3 py-2.5">{r.nextReminder}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/admin/clients/${r.user_id}?tab=billing`
                            )
                          }
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actingId === r.id || r.lastLevel >= 4}
                          onClick={() => sendReminder(r.id, r.lastLevel)}
                        >
                          Remind
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actingId === r.id}
                          onClick={() => markPaid(r.id)}
                        >
                          Mark paid
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/admin/clients/${r.user_id}?tab=notes`}>
                            Contact
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AdminLayout>
  );
}
