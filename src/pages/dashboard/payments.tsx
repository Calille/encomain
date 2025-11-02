import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
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
  DollarSign,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { BillingOverview } from "../../components/dashboard/billing-overview";
import { InvoicesTable } from "../../components/dashboard/invoices-table";

type Billing = Tables<"billing">;
type Invoice = Tables<"invoices">;

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

        // Fetch billing records
        const { data: billingData, error: billingError } = await supabase
          .from("billing")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (billingError) throw billingError;
        setBilling(billingData || []);

        // Fetch invoices
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

    // Subscribe to real-time updates
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

  // Calculate payment summary
  const totalAmount = billing.reduce((sum, b) => sum + Number(b.amount), 0);
  const amountPaid = billing
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + Number(b.amount), 0);
  const remainingBalance = billing
    .filter((b) => b.status === "pending" || b.status === "overdue")
    .reduce((sum, b) => sum + Number(b.amount), 0);

  // Get pending invoices
  const pendingInvoices = invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue"
  );
  const overdueInvoices = invoices.filter((i) => i.status === "overdue");
  const nextDueInvoice = pendingInvoices
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    [0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
      case "sent":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />;
      case "pending":
      case "sent":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = "GBP") => {
    const symbol = currency === "GBP" ? "£" : "$";
    return `${symbol}${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <DashboardLayout title="Payments">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#1A4D2E] border-r-transparent"></div>
            <p className="mt-4 text-[#1A4D2E] font-medium">Loading payments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payments">
      <div className="space-y-6">
        {/* Payment Summary Card */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A4D2E]">
              Payment Overview
            </h2>
            <DollarSign className="h-6 w-6 text-gray-400" />
          </div>

          {/* Progress Bar */}
          {totalAmount > 0 && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Payment Progress
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {formatCurrency(amountPaid)} of {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <motion.div
                  className="bg-[#1A4D2E] h-4 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${totalAmount > 0 ? (amountPaid / totalAmount) * 100 : 0}%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 p-4 rounded-lg"
            >
              <div className="text-sm font-medium text-gray-500 mb-1">
                Total Amount
              </div>
              <div className="text-2xl font-semibold text-[#1A4D2E]">
                {formatCurrency(totalAmount)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-50 p-4 rounded-lg"
            >
              <div className="text-sm font-medium text-gray-500 mb-1">
                Amount Paid
              </div>
              <div className="text-2xl font-semibold text-green-600">
                {formatCurrency(amountPaid)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-yellow-50 p-4 rounded-lg"
            >
              <div className="text-sm font-medium text-gray-500 mb-1">
                Remaining Balance
              </div>
              <div className="text-2xl font-semibold text-[#1A4D2E]">
                {formatCurrency(remainingBalance)}
              </div>
            </motion.div>
          </div>

          {/* Alerts */}
          {overdueInvoices.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg flex items-start mb-4">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Overdue Payments
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  You have {overdueInvoices.length} overdue invoice
                  {overdueInvoices.length > 1 ? "s" : ""}. Please contact us to
                  resolve.
                </p>
              </div>
            </div>
          )}

          {nextDueInvoice && !overdueInvoices.length && (
            <div className="bg-yellow-50 p-4 rounded-lg flex items-start mb-4">
              <Clock className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Next Payment Due
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your next payment of {formatCurrency(Number(nextDueInvoice.amount), nextDueInvoice.currency)}{" "}
                  is due on {format(new Date(nextDueInvoice.due_date), "PP")}.
                </p>
              </div>
            </div>
          )}

          <Button className="w-full bg-[#1A4D2E] hover:bg-[#1A4D2E]/90">
            <CreditCard className="mr-2 h-4 w-4" />
            Make a Payment
          </Button>
        </Card>

        {/* Billing Records */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A4D2E]">
              Billing History
            </h2>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>

          {billing.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No billing records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Billing Period
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Paid Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {billing.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(record.billing_period_start), "MMM d")} -{" "}
                          {format(new Date(record.billing_period_end), "MMM d, yyyy")}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        {formatCurrency(Number(record.amount), record.currency)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
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
        </Card>

        {/* Invoices Section */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A4D2E]">Invoices</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              {invoices.length} total
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No invoices yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Invoice #
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Issue Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Due Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 font-mono text-sm font-medium">
                        {invoice.invoice_number}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {format(new Date(invoice.issue_date), "PP")}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {format(new Date(invoice.due_date), "PP")}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        {formatCurrency(Number(invoice.amount), invoice.currency)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#1A4D2E] hover:text-[#1A4D2E]/80"
                            onClick={() => {
                              toast({
                                title: "Download Invoice",
                                description: `Invoice ${invoice.invoice_number} will be downloaded.`,
                              });
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
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
        </Card>

        {/* Billing Overview - Moved from Dashboard */}
        <BillingOverview billing={billing} />

        {/* Invoices Table - Moved from Dashboard */}
        <InvoicesTable invoices={invoices} />

        {/* Payment Methods */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A4D2E]">
              Payment Methods
            </h2>
            <Button variant="outline" size="sm">
              <CreditCard className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-[#1A4D2E]/10 rounded-md flex items-center justify-center mr-4">
                <CreditCard className="h-6 w-6 text-[#1A4D2E]" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  No payment methods saved
                </p>
                <p className="text-sm text-gray-500">
                  Add a payment method to enable quick payments
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
