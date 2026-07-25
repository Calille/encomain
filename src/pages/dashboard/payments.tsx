import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { MetricCard } from "../../components/ui/metric-card";
import { EmptyState } from "../../components/ui/empty-state";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Tables } from "../../types/supabase";
import {
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  TrendingUp,
} from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { format } from "date-fns";
import { BillingOverview } from "../../components/dashboard/billing-overview";
import { InvoicesTable } from "../../components/dashboard/invoices-table";

type Billing = Tables<"billing">;
type Invoice = Tables<"invoices">;

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" | "outline" {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
    case "sent":
      return "warning";
    case "overdue":
      return "destructive";
    case "cancelled":
      return "secondary";
    default:
      return "secondary";
  }
}

export default function Payments() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<Billing[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const { data: billingData, error: billingError } = await supabase
          .from("billing")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (billingError) throw billingError;
        setBilling(billingData || []);

        const { data: invoicesData, error: invoicesError } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id)
          .order("issue_date", { ascending: false });

        if (invoicesError) throw invoicesError;
        setInvoices(invoicesData || []);
      } catch (error) {
        console.error("Error fetching payment data:", error);
        toast({
          title: "Error",
          description: "Failed to load payment information. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const billingChannel = supabase
      .channel("billing-payments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "billing",
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchData()
      )
      .subscribe();

    const invoicesChannel = supabase
      .channel("invoices-payments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invoices",
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      billingChannel.unsubscribe();
      invoicesChannel.unsubscribe();
    };
  }, [user]);

  const totalAmount = billing.reduce((sum, b) => sum + Number(b.amount), 0);
  const amountPaid = billing
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + Number(b.amount), 0);
  const remainingBalance = billing
    .filter((b) => b.status === "pending" || b.status === "overdue")
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const pendingInvoices = invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue"
  );
  const overdueInvoices = invoices.filter((i) => i.status === "overdue");
  const nextDueInvoice = pendingInvoices.sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )[0];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />;
      case "pending":
      case "sent":
        return <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />;
      case "overdue":
        return <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />;
      default:
        return <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />;
    }
  };

  const formatCurrency = (amount: number, currency: string = "GBP") => {
    const symbol = currency === "GBP" ? "£" : "$";
    return `${symbol}${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <DashboardLayout title="Payments">
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="mb-4 h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payments">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MetricCard label="Total amount" value={totalAmount} decimals={2} prefix="£" icon={FileText} />
          <MetricCard label="Amount paid" value={amountPaid} decimals={2} prefix="£" icon={CheckCircle2} />
          <MetricCard
            label="Remaining balance"
            value={remainingBalance}
            decimals={2}
            prefix="£"
            icon={TrendingUp}
          />
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Payment overview</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </CardHeader>
          <CardContent className="space-y-4">
            {totalAmount > 0 && (
              <div>
                <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                  <span>Payment progress</span>
                  <span className="font-mono-nums text-foreground">
                    {formatCurrency(amountPaid)} of {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{
                      width: `${totalAmount > 0 ? (amountPaid / totalAmount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {overdueInvoices.length > 0 && (
              <div className="flex items-start gap-2 rounded-sm border border-destructive/30 bg-destructive/10 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-destructive">Overdue payments</p>
                  <p className="mt-0.5 text-sm text-destructive/90">
                    You have {overdueInvoices.length} overdue invoice
                    {overdueInvoices.length > 1 ? "s" : ""}. Please contact us to resolve.
                  </p>
                </div>
              </div>
            )}

            {nextDueInvoice && !overdueInvoices.length && (
              <div className="flex items-start gap-2 rounded-sm border border-warning/30 bg-warning/10 p-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-warning">Next payment due</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Your next payment of{" "}
                    {formatCurrency(Number(nextDueInvoice.amount), nextDueInvoice.currency)}{" "}
                    is due on {format(new Date(nextDueInvoice.due_date), "PP")}.
                  </p>
                </div>
              </div>
            )}

            <Button className="w-full gap-2">
              <CreditCard className="h-4 w-4" strokeWidth={1.5} />
              Make a payment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Billing history</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </CardHeader>
          <CardContent className="p-0">
            {billing.length === 0 ? (
              <EmptyState icon={FileText} message="No billing records yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Billing period
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Paid date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {billing.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/40">
                        <td className="px-4 py-3 text-sm text-foreground">
                          {format(new Date(record.billing_period_start), "MMM d")} -{" "}
                          {format(new Date(record.billing_period_end), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium font-mono-nums text-foreground">
                          {formatCurrency(Number(record.amount), record.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(record.status)} className="gap-1">
                            {getStatusIcon(record.status)}
                            {record.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {record.paid_at
                            ? format(new Date(record.paid_at), "PP")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Invoices</CardTitle>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
              {invoices.length} total
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <EmptyState icon={FileText} message="No invoices yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Invoice #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Issue date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Due date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-muted/40">
                        <td className="px-4 py-3 font-mono text-sm font-medium text-foreground">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {format(new Date(invoice.issue_date), "PP")}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {format(new Date(invoice.due_date), "PP")}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium font-mono-nums text-foreground">
                          {formatCurrency(Number(invoice.amount), invoice.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(invoice.status)} className="gap-1">
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => {
                                toast({
                                  title: "Download invoice",
                                  description: `Invoice ${invoice.invoice_number} will be downloaded.`,
                                });
                              }}
                            >
                              <Download className="h-4 w-4" strokeWidth={1.5} />
                              PDF
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <BillingOverview billing={billing} />
        <InvoicesTable invoices={invoices} />

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Payment methods</CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5">
              <CreditCard className="h-4 w-4" strokeWidth={1.5} />
              Add payment method
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-sm border border-border bg-muted/40 p-4">
              <CreditCard className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  No payment methods saved
                </p>
                <p className="text-sm text-muted-foreground">
                  Add a payment method to enable quick payments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
