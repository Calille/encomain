import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { EmptyState } from "../ui/empty-state";
import { Tables } from "../../types/supabase";
import {
  Download,
  Search,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

type Invoice = Tables<"invoices">;

interface InvoicesTableProps {
  invoices: Invoice[];
}

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" | "outline" {
  switch (status) {
    case "paid":
      return "success";
    case "sent":
      return "default";
    case "overdue":
      return "destructive";
    case "cancelled":
      return "secondary";
    case "draft":
      return "warning";
    default:
      return "secondary";
  }
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredInvoices = invoices
    .filter((invoice) => {
      const matchesSearch =
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.amount.toString().includes(searchQuery);

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime();
          break;
        case "amount":
          comparison = Number(a.amount) - Number(b.amount);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />;
      case "sent":
        return <Clock className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />;
      case "overdue":
        return <AlertCircle className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />;
      case "cancelled":
        return <XCircle className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />;
      default:
        return <FileText className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />;
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, "_blank");
    } else {
      alert("Invoice PDF not available yet");
    }
  };

  const selectClass =
    "h-9 rounded-sm border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold text-foreground">Invoices</h3>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="sr-only">Invoice filters</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">All status</option>
              <option value="paid">Paid</option>
              <option value="sent">Sent</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split("-");
                setSortBy(newSortBy as "date" | "amount" | "status");
                setSortOrder(newSortOrder as "asc" | "desc");
              }}
              className={selectClass}
            >
              <option value="date-desc">Date (newest)</option>
              <option value="date-asc">Date (oldest)</option>
              <option value="amount-desc">Amount (high to low)</option>
              <option value="amount-asc">Amount (low to high)</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              message={
                searchQuery || statusFilter !== "all"
                  ? "No invoices match your filters."
                  : "No invoices yet."
              }
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
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
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-muted/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(invoice.status)}
                            <span className="font-mono text-sm font-medium text-foreground">
                              {invoice.invoice_number}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {format(new Date(invoice.issue_date), "PP")}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {format(new Date(invoice.due_date), "PP")}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium font-mono-nums text-foreground">
                            £{Number(invoice.amount).toFixed(2)}
                          </span>
                          <span className="ml-1 text-xs text-muted-foreground">
                            {invoice.currency}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice)}
                            >
                              <Download className="h-4 w-4" strokeWidth={1.5} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="rounded-sm border border-border p-3"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <span className="font-mono text-sm font-medium text-foreground">
                          {invoice.invoice_number}
                        </span>
                      </div>
                      <Badge variant={statusVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium font-mono-nums text-foreground">
                          £{Number(invoice.amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issue date</span>
                        <span className="text-foreground">
                          {format(new Date(invoice.issue_date), "PP")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due date</span>
                        <span className="text-foreground">
                          {format(new Date(invoice.due_date), "PP")}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice)}
                      className="mt-3 w-full gap-1.5"
                    >
                      <Download className="h-4 w-4" strokeWidth={1.5} />
                      Download PDF
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}

          {filteredInvoices.length > 0 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
              <span className="text-muted-foreground">
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </span>
              <span className="font-medium font-mono-nums text-foreground">
                Total: £
                {filteredInvoices
                  .reduce((sum, inv) => sum + Number(inv.amount), 0)
                  .toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
