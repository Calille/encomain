import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { EmptyState } from "../ui/empty-state";
import { Tables } from "../../types/supabase";
import { Calendar, AlertCircle, FileText, TrendingUp } from "lucide-react";
import { format, addMonths } from "date-fns";

type Billing = Tables<"billing">;

interface BillingOverviewProps {
  billing: Billing[];
}

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" | "outline" {
  switch (status) {
    case "paid":
      return "success";
    case "overdue":
      return "destructive";
    case "pending":
      return "warning";
    default:
      return "secondary";
  }
}

export function BillingOverview({ billing }: BillingOverviewProps) {
  const currentBilling = billing.find(
    (b) =>
      new Date(b.billing_period_start) <= new Date() &&
      new Date(b.billing_period_end) >= new Date()
  );

  const nextBillingDate = currentBilling
    ? new Date(currentBilling.billing_period_end)
    : addMonths(new Date(), 1);

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthBilling = billing.filter((b) => {
      const billingDate = new Date(b.billing_period_start);
      return (
        billingDate >= monthStart && billingDate <= monthEnd && b.status === "paid"
      );
    });

    const total = monthBilling.reduce((sum, b) => sum + Number(b.amount), 0);

    return {
      month: format(monthStart, "MMM"),
      total,
    };
  }).reverse();

  const maxAmount = Math.max(...monthlyData.map((d) => d.total), 0);
  const twelveMonthTotal = monthlyData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold text-foreground">Billing overview</h3>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current billing period</CardTitle>
          </CardHeader>
          <CardContent>
            {currentBilling ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-sm border border-border bg-muted/40 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Amount due</p>
                    <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-foreground font-mono-nums">
                      £{Number(currentBilling.amount).toFixed(2)}
                    </p>
                  </div>
                  <Badge variant={statusVariant(currentBilling.status)}>
                    {currentBilling.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-sm border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Period start</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {format(new Date(currentBilling.billing_period_start), "PP")}
                    </p>
                  </div>
                  <div className="rounded-sm border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Period end</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {format(new Date(currentBilling.billing_period_end), "PP")}
                    </p>
                  </div>
                </div>

                {currentBilling.status === "overdue" && (
                  <div className="flex items-start gap-2 rounded-sm border border-destructive/30 bg-destructive/10 p-3">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                      strokeWidth={1.5}
                    />
                    <p className="text-sm text-destructive">
                      This invoice is overdue. Please make payment as soon as possible.
                    </p>
                  </div>
                )}

                {currentBilling.paid_at && (
                  <div className="rounded-sm border border-success/30 bg-success/10 p-3">
                    <p className="text-xs text-muted-foreground">Paid on</p>
                    <p className="mt-1 text-sm font-medium text-success">
                      {format(new Date(currentBilling.paid_at), "PP")}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                message="No current billing period."
                className="py-8"
              />
            )}

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" strokeWidth={1.5} />
                Next billing date
              </div>
              <span className="text-sm font-medium text-foreground">
                {format(nextBillingDate, "PP")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing history (last 12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monthlyData.map((item) => (
                <div key={item.month} className="flex items-center gap-3">
                  <span className="w-10 text-xs font-medium text-muted-foreground">
                    {item.month}
                  </span>
                  <div className="relative h-7 flex-1 overflow-hidden rounded-sm bg-muted">
                    <div
                      className="flex h-full items-center justify-end rounded-sm bg-accent pr-2 transition-all duration-500"
                      style={{
                        width: `${maxAmount > 0 ? Math.max((item.total / maxAmount) * 100, item.total > 0 ? 8 : 0) : 0}%`,
                      }}
                    >
                      {item.total > 0 && (
                        <span className="text-xs font-medium text-accent-foreground font-mono-nums">
                          £{item.total.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
                Total (12 months)
              </div>
              <span className="font-mono text-lg font-semibold text-foreground font-mono-nums">
                £{twelveMonthTotal.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
