import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { MetricCard } from "../../components/ui/metric-card";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { supabase } from "../../lib/supabase";
import { FileText } from "lucide-react";
import { format, isSameMonth, parseISO, startOfDay } from "date-fns";
import { toast } from "../../hooks/use-toast";
import {
  compareValues,
  SortIcon,
  useTableSort,
} from "../../hooks/useTableSort";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  pdf_url: string | null;
  user_id: string;
  users?: { full_name: string | null; email: string } | null;
}

type PaymentSortKey =
  | "invoice_number"
  | "client"
  | "amount"
  | "currency"
  | "issue_date"
  | "due_date"
  | "status"
  | "paid_date";

function clientLabel(row: InvoiceRow): string {
  return row.users?.full_name || row.users?.email || "Not set";
}

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [clientId, setClientId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { sort, cycleSort } = useTableSort<PaymentSortKey>();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*, users!invoices_user_id_fkey(full_name, email)")
      .order("issue_date", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setRows((data as InvoiceRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) {
      if (!map.has(r.user_id)) {
        map.set(r.user_id, clientLabel(r));
      }
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
  }, [rows]);

  const filtered = useMemo(() => {
    const fromBound = dateFrom ? startOfDay(parseISO(dateFrom)).getTime() : null;
    const toBound = dateTo ? startOfDay(parseISO(dateTo)).getTime() : null;

    let list = rows.filter((r) => {
      // Chase view: issued but unpaid (sent or overdue). Drafts excluded.
      if (unpaidOnly && !(r.status === "sent" || r.status === "overdue")) {
        return false;
      }
      if (status !== "all" && r.status !== status) return false;
      if (clientId !== "all" && r.user_id !== clientId) return false;

      try {
        const issueMs = startOfDay(parseISO(r.issue_date)).getTime();
        if (fromBound != null && issueMs < fromBound) return false;
        if (toBound != null && issueMs > toBound) return false;
      } catch {
        return false;
      }

      const q = query.toLowerCase();
      if (!q) return true;
      return (
        r.invoice_number.toLowerCase().includes(q) ||
        (r.users?.email || "").toLowerCase().includes(q) ||
        (r.users?.full_name || "").toLowerCase().includes(q)
      );
    });

    if (sort.key && sort.direction) {
      const dir = sort.direction;
      const key = sort.key;
      list = [...list].sort((a, b) => {
        switch (key) {
          case "invoice_number":
            return compareValues(a.invoice_number, b.invoice_number, dir);
          case "client":
            return compareValues(clientLabel(a), clientLabel(b), dir);
          case "amount":
            return compareValues(Number(a.amount), Number(b.amount), dir);
          case "currency":
            return compareValues(a.currency, b.currency, dir);
          case "issue_date":
            return compareValues(
              new Date(a.issue_date).getTime(),
              new Date(b.issue_date).getTime(),
              dir
            );
          case "due_date":
            return compareValues(
              new Date(a.due_date).getTime(),
              new Date(b.due_date).getTime(),
              dir
            );
          case "status":
            return compareValues(a.status, b.status, dir);
          case "paid_date":
            return compareValues(
              a.paid_date ? new Date(a.paid_date).getTime() : null,
              b.paid_date ? new Date(b.paid_date).getTime() : null,
              dir
            );
          default:
            return 0;
        }
      });
    }

    return list;
  }, [rows, status, query, unpaidOnly, clientId, dateFrom, dateTo, sort]);

  const now = new Date();
  const invoicedThisMonth = rows
    .filter((r) => {
      try {
        return isSameMonth(parseISO(r.issue_date), now);
      } catch {
        return false;
      }
    })
    .reduce((s, r) => s + Number(r.amount), 0);
  const totalPaid = rows
    .filter((r) => r.status === "paid")
    .reduce((s, r) => s + Number(r.amount), 0);
  // Outstanding = sum of issued unpaid invoices (sent or overdue). Drafts excluded.
  const outstanding = rows
    .filter((r) => r.status === "sent" || r.status === "overdue")
    .reduce((s, r) => s + Number(r.amount), 0);
  const overdue = rows
    .filter((r) => r.status === "overdue")
    .reduce((s, r) => s + Number(r.amount), 0);

  const markPaid = async (id: string) => {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "paid", paid_date: new Date().toISOString().slice(0, 10) })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Invoice updated", description: "Marked as paid." });
    load();
  };

  const headerButton = (key: PaymentSortKey, label: string) => (
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
    <AdminLayout title="Payments">
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Invoiced this month"
          value={invoicedThisMonth}
          decimals={2}
          prefix="£"
          icon={FileText}
        />
        <MetricCard
          label="Total paid"
          value={totalPaid}
          decimals={2}
          prefix="£"
          icon={FileText}
        />
        <MetricCard
          label="Outstanding"
          value={outstanding}
          decimals={2}
          prefix="£"
          icon={FileText}
        />
        <MetricCard
          label="Overdue"
          value={overdue}
          decimals={2}
          prefix="£"
          icon={FileText}
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
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          className="h-9 max-w-[200px] rounded-sm border border-border bg-surface px-2 text-sm"
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
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          From
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 w-auto"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          To
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 w-auto"
          />
        </label>
        <Button
          variant={unpaidOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setUnpaidOnly((v) => !v)}
        >
          Unpaid chase view
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={FileText} message="No invoices match your filters." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">
                    {headerButton("invoice_number", "Invoice")}
                  </th>
                  <th className="px-3 py-2">{headerButton("client", "Client")}</th>
                  <th className="px-3 py-2">{headerButton("amount", "Amount")}</th>
                  <th className="px-3 py-2">{headerButton("currency", "Currency")}</th>
                  <th className="px-3 py-2">{headerButton("issue_date", "Issued")}</th>
                  <th className="px-3 py-2">{headerButton("due_date", "Due")}</th>
                  <th className="px-3 py-2">{headerButton("status", "Status")}</th>
                  <th className="px-3 py-2">{headerButton("paid_date", "Paid")}</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2.5 font-mono-nums">{r.invoice_number}</td>
                    <td className="px-3 py-2.5">
                      <div>{r.users?.full_name || "Not set"}</div>
                      {unpaidOnly && (
                        <div className="text-xs text-muted-foreground">
                          {r.users?.email}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono-nums">
                      {Number(r.amount).toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 font-mono-nums text-muted-foreground">
                      {r.currency}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {format(new Date(r.issue_date), "PP")}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {format(new Date(r.due_date), "PP")}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant={
                          r.status === "paid"
                            ? "success"
                            : r.status === "overdue"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {r.paid_date
                        ? format(new Date(r.paid_date), "PP")
                        : "None"}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        {r.status !== "paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPaid(r.id)}
                          >
                            Mark paid
                          </Button>
                        )}
                        {r.pdf_url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={r.pdf_url} target="_blank" rel="noreferrer">
                              PDF
                            </a>
                          </Button>
                        )}
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
