import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/admin/admin-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { supabase } from "../../lib/supabase";
import { Tables } from "../../types/supabase";
import { DollarSign, FileText, Plus, Edit, Trash2, Search, Download } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { format } from "date-fns";
import { sendPaymentReceipt } from "../../utils/emailHelpers";

type Billing = Tables<"billing">;
type Invoice = Tables<"invoices">;
type User = Tables<"users">;

type StatusBadgeVariant = "success" | "warning" | "destructive" | "secondary";

function getStatusBadgeVariant(status: string): StatusBadgeVariant {
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

function formatCurrency(amount: number, currency: string) {
  if (currency === "GBP") {
    return `£${amount.toFixed(2)}`;
  }
  return `$${amount.toFixed(2)}`;
}

const selectClassName =
  "h-9 rounded-sm border border-border bg-surface px-2 text-sm text-foreground";

const inlineStatusSelectClassName =
  "h-8 rounded-sm border border-border bg-surface px-2 text-xs text-foreground";

export default function BillingManagement() {
  const [billing, setBilling] = useState<Billing[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [isBillingDialogOpen, setIsBillingDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isEditBillingDialogOpen, setIsEditBillingDialogOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);

  const [billingFormData, setBillingFormData] = useState({
    user_id: "",
    amount: "",
    currency: "GBP",
    status: "pending" as "paid" | "pending" | "overdue" | "cancelled",
    billing_period_start: "",
    billing_period_end: "",
  });

  const [invoiceFormData, setInvoiceFormData] = useState({
    user_id: "",
    amount: "",
    currency: "GBP",
    status: "sent" as "paid" | "sent" | "overdue" | "cancelled",
    issue_date: format(new Date(), "yyyy-MM-dd"),
    due_date: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billingResult, invoicesResult, usersResult] = await Promise.all([
        supabase
          .from("billing")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("invoices")
          .select("*")
          .order("issue_date", { ascending: false }),
        supabase
          .from("users")
          .select("*")
          .eq("status", "active")
          .order("full_name", { ascending: true }),
      ]);

      if (billingResult.error) throw billingResult.error;
      if (invoicesResult.error) throw invoicesResult.error;
      if (usersResult.error) throw usersResult.error;

      setBilling(billingResult.data || []);
      setInvoices(invoicesResult.data || []);
      setUsers(usersResult.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load billing data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBilling = billing.filter((item) => {
    const user = users.find((u) => u.id === item.user_id);
    const matchesSearch =
      user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesUser = userFilter === "all" || item.user_id === userFilter;

    return matchesSearch && matchesStatus && matchesUser;
  });

  const filteredInvoices = invoices.filter((invoice) => {
    const user = users.find((u) => u.id === invoice.user_id);
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesUser = userFilter === "all" || invoice.user_id === userFilter;

    return matchesSearch && matchesStatus && matchesUser;
  });

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.full_name || user?.email || "Unknown";
  };

  const handleCreateBilling = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("billing").insert({
        user_id: billingFormData.user_id,
        amount: parseFloat(billingFormData.amount),
        currency: billingFormData.currency,
        status: billingFormData.status,
        billing_period_start: billingFormData.billing_period_start,
        billing_period_end: billingFormData.billing_period_end,
      });

      if (error) throw error;

      toast({
        title: "Billing record created",
        description: "Billing record has been created successfully.",
      });

      setBillingFormData({
        user_id: "",
        amount: "",
        currency: "GBP",
        status: "pending",
        billing_period_start: "",
        billing_period_end: "",
      });
      setIsBillingDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error creating billing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create billing record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInvoice = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("invoices").insert({
        user_id: invoiceFormData.user_id,
        amount: parseFloat(invoiceFormData.amount),
        currency: invoiceFormData.currency,
        status: invoiceFormData.status,
        issue_date: invoiceFormData.issue_date,
        due_date: invoiceFormData.due_date,
        description: invoiceFormData.description,
      });

      if (error) throw error;

      toast({
        title: "Invoice created",
        description: "Invoice has been created successfully.",
      });

      setInvoiceFormData({
        user_id: "",
        amount: "",
        currency: "GBP",
        status: "sent",
        issue_date: format(new Date(), "yyyy-MM-dd"),
        due_date: "",
        description: "",
      });
      setIsInvoiceDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBilling = async () => {
    if (!selectedBilling) return;

    setIsSubmitting(true);

    try {
      const wasPaid = selectedBilling.status === "paid";
      const isNowPaid = billingFormData.status === "paid";
      const statusChangedToPaid = !wasPaid && isNowPaid;

      const { error } = await supabase
        .from("billing")
        .update({
          status: billingFormData.status,
          amount: parseFloat(billingFormData.amount),
          billing_period_start: billingFormData.billing_period_start,
          billing_period_end: billingFormData.billing_period_end,
          paid_at: billingFormData.status === "paid" ? new Date().toISOString() : null,
        })
        .eq("id", selectedBilling.id);

      if (error) throw error;

      toast({
        title: "Billing updated",
        description: "Billing record has been updated successfully.",
      });

      if (statusChangedToPaid) {
        try {
          const { data: userData } = await supabase
            .from("users")
            .select("email, full_name")
            .eq("id", selectedBilling.user_id)
            .single();

          if (userData?.email) {
            const transactionId = `txn-${selectedBilling.id}-${Date.now()}`;

            sendPaymentReceipt(
              userData.email,
              {
                transactionId: transactionId,
                amount: parseFloat(billingFormData.amount),
                currency: selectedBilling.currency || "GBP",
                paymentMethod: "Bank Transfer",
                paymentDate: new Date().toISOString(),
                status: "completed",
              },
              {
                userName: userData.full_name || userData.email.split("@")[0],
                receiptUrl: `https://theenclosure.co.uk/receipts/${transactionId}`,
              }
            ).catch((error) => {
              console.error("Failed to send payment receipt:", error);
            });
          }
        } catch (error) {
          console.error("Error sending payment receipt:", error);
        }
      }

      setIsEditBillingDialogOpen(false);
      setSelectedBilling(null);
      fetchData();
    } catch (error) {
      console.error("Error updating billing:", error);
      toast({
        title: "Error",
        description: "Failed to update billing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBilling = async (item: Billing) => {
    if (
      !confirm(
        "Are you sure you want to delete this billing record? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("billing").delete().eq("id", item.id);

      if (error) throw error;

      toast({
        title: "Billing deleted",
        description: "Billing record has been deleted.",
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting billing:", error);
      toast({
        title: "Error",
        description: "Failed to delete billing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateInvoiceStatus = async (invoice: Invoice, newStatus: string) => {
    try {
      const wasPaid = invoice.status === "paid";
      const isNowPaid = newStatus === "paid";
      const statusChangedToPaid = !wasPaid && isNowPaid;

      const { error } = await supabase
        .from("invoices")
        .update({
          status: newStatus,
          paid_date: newStatus === "paid" ? format(new Date(), "yyyy-MM-dd") : null,
        })
        .eq("id", invoice.id);

      if (error) throw error;

      toast({
        title: "Invoice updated",
        description: `Invoice status changed to ${newStatus}.`,
      });

      if (statusChangedToPaid) {
        try {
          const { data: userData } = await supabase
            .from("users")
            .select("email, full_name")
            .eq("id", invoice.user_id)
            .single();

          if (userData?.email) {
            const transactionId = `txn-inv-${invoice.id}-${Date.now()}`;

            sendPaymentReceipt(
              userData.email,
              {
                transactionId: transactionId,
                invoiceNumber: invoice.invoice_number || `INV-${invoice.id}`,
                amount: invoice.amount,
                currency: invoice.currency || "GBP",
                paymentMethod: "Bank Transfer",
                paymentDate: new Date().toISOString(),
                status: "completed",
              },
              {
                userName: userData.full_name || userData.email.split("@")[0],
                receiptUrl: `https://theenclosure.co.uk/receipts/${transactionId}`,
                invoiceUrl: `https://theenclosure.co.uk/invoices/${invoice.invoice_number || invoice.id}`,
              }
            ).catch((error) => {
              console.error("Failed to send payment receipt:", error);
            });
          }
        } catch (error) {
          console.error("Error sending payment receipt:", error);
        }
      }

      fetchData();
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditBillingDialog = (item: Billing) => {
    setSelectedBilling(item);
    setBillingFormData({
      user_id: item.user_id,
      amount: item.amount.toString(),
      currency: item.currency,
      status: item.status as "paid" | "pending" | "overdue" | "cancelled",
      billing_period_start: item.billing_period_start,
      billing_period_end: item.billing_period_end,
    });
    setIsEditBillingDialogOpen(true);
  };

  const billingFilters = (
    <div className="mb-6 flex flex-col gap-4 md:flex-row">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className={selectClassName}
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="overdue">Overdue</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select
        value={userFilter}
        onChange={(e) => setUserFilter(e.target.value)}
        className={selectClassName}
      >
        <option value="all">All Clients</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.full_name || user.email}
          </option>
        ))}
      </select>
    </div>
  );

  const invoiceFilters = (
    <div className="mb-6 flex flex-col gap-4 md:flex-row">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
        className={selectClassName}
      >
        <option value="all">All Status</option>
        <option value="sent">Sent</option>
        <option value="paid">Paid</option>
        <option value="overdue">Overdue</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select
        value={userFilter}
        onChange={(e) => setUserFilter(e.target.value)}
        className={selectClassName}
      >
        <option value="all">All Clients</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.full_name || user.email}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <AdminLayout title="Billing & Invoices">
      <div className="mb-4 rounded-sm border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
        Also see:{" "}
        <Link to="/admin/payments" className="text-accent hover:underline">
          Payments
        </Link>{" "}
        for the full CRM view.
      </div>

      <Tabs defaultValue="billing" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="billing" className="gap-1.5">
            <DollarSign className="h-4 w-4" strokeWidth={1.5} />
            Billing Records
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-1.5">
            <FileText className="h-4 w-4" strokeWidth={1.5} />
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="billing">
          <div className="mb-4 flex justify-end">
            <Dialog open={isBillingDialogOpen} onOpenChange={setIsBillingDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                  Add Billing Record
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Billing Record</DialogTitle>
                  <DialogDescription>
                    Create a new billing record for a client.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing_user">Client *</Label>
                    <Select
                      value={billingFormData.user_id}
                      onValueChange={(value) =>
                        setBillingFormData({ ...billingFormData, user_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing_amount">Amount *</Label>
                    <Input
                      id="billing_amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={billingFormData.amount}
                      onChange={(e) =>
                        setBillingFormData({ ...billingFormData, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing_status">Status *</Label>
                    <Select
                      value={billingFormData.status}
                      onValueChange={(value) =>
                        setBillingFormData({
                          ...billingFormData,
                          status: value as "paid" | "pending" | "overdue" | "cancelled",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="period_start">Period Start *</Label>
                      <Input
                        id="period_start"
                        type="date"
                        value={billingFormData.billing_period_start}
                        onChange={(e) =>
                          setBillingFormData({
                            ...billingFormData,
                            billing_period_start: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="period_end">Period End *</Label>
                      <Input
                        id="period_end"
                        type="date"
                        value={billingFormData.billing_period_end}
                        onChange={(e) =>
                          setBillingFormData({
                            ...billingFormData,
                            billing_period_end: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBillingDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateBilling}
                    disabled={isSubmitting || !billingFormData.user_id || !billingFormData.amount}
                  >
                    {isSubmitting ? "Creating..." : "Create Record"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6">
            {billingFilters}

            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : filteredBilling.length === 0 ? (
              <EmptyState icon={DollarSign} message="No billing records found." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Client</th>
                      <th className="px-3 py-2 font-medium">Amount</th>
                      <th className="px-3 py-2 font-medium">Period</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredBilling.map((item) => (
                      <tr
                        key={item.id}
                        className="transition-colors-fast hover:bg-muted/40"
                      >
                        <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">
                          {getUserName(item.user_id)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono-nums">
                          {formatCurrency(item.amount, item.currency)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                          {format(new Date(item.billing_period_start), "MMM d")} -{" "}
                          {format(new Date(item.billing_period_end), "MMM d, yyyy")}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <Badge variant={getStatusBadgeVariant(item.status)}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditBillingDialog(item)}
                              className="min-h-[44px] min-w-[44px]"
                              aria-label="Edit billing"
                            >
                              <Edit className="h-4 w-4" strokeWidth={1.5} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBilling(item)}
                              className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
                              aria-label="Delete billing"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
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
        </TabsContent>

        <TabsContent value="invoices">
          <div className="mb-4 flex justify-end">
            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>
                    Generate a new invoice for a client.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice_user">Client *</Label>
                    <Select
                      value={invoiceFormData.user_id}
                      onValueChange={(value) =>
                        setInvoiceFormData({ ...invoiceFormData, user_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice_amount">Amount *</Label>
                    <Input
                      id="invoice_amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={invoiceFormData.amount}
                      onChange={(e) =>
                        setInvoiceFormData({ ...invoiceFormData, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice_description">Description</Label>
                    <Input
                      id="invoice_description"
                      placeholder="Services rendered..."
                      value={invoiceFormData.description}
                      onChange={(e) =>
                        setInvoiceFormData({ ...invoiceFormData, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issue_date">Issue Date *</Label>
                      <Input
                        id="issue_date"
                        type="date"
                        value={invoiceFormData.issue_date}
                        onChange={(e) =>
                          setInvoiceFormData({ ...invoiceFormData, issue_date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date *</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={invoiceFormData.due_date}
                        onChange={(e) =>
                          setInvoiceFormData({ ...invoiceFormData, due_date: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateInvoice}
                    disabled={isSubmitting || !invoiceFormData.user_id || !invoiceFormData.amount}
                  >
                    {isSubmitting ? "Creating..." : "Create Invoice"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6">
            {invoiceFilters}

            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : filteredInvoices.length === 0 ? (
              <EmptyState icon={FileText} message="No invoices found." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Invoice #</th>
                      <th className="px-3 py-2 font-medium">Client</th>
                      <th className="px-3 py-2 font-medium">Amount</th>
                      <th className="px-3 py-2 font-medium">Issue Date</th>
                      <th className="px-3 py-2 font-medium">Due Date</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="transition-colors-fast hover:bg-muted/40"
                      >
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono-nums">
                          {invoice.invoice_number}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">
                          {getUserName(invoice.user_id)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono-nums">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                          {format(new Date(invoice.issue_date), "PP")}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                          {format(new Date(invoice.due_date), "PP")}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(invoice.status)}>
                              {invoice.status}
                            </Badge>
                            <select
                              value={invoice.status}
                              onChange={(e) =>
                                handleUpdateInvoiceStatus(invoice, e.target.value)
                              }
                              className={inlineStatusSelectClassName}
                              aria-label={`Change status for invoice ${invoice.invoice_number}`}
                            >
                              <option value="sent">Sent</option>
                              <option value="paid">Paid</option>
                              <option value="overdue">Overdue</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-[44px] min-w-[44px]"
                              title="Download PDF"
                              aria-label="Download PDF"
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
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditBillingDialogOpen} onOpenChange={setIsEditBillingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Billing Record</DialogTitle>
            <DialogDescription>Update billing information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Input
                value={getUserName(billingFormData.user_id)}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_amount">Amount</Label>
              <Input
                id="edit_amount"
                type="number"
                step="0.01"
                value={billingFormData.amount}
                onChange={(e) =>
                  setBillingFormData({ ...billingFormData, amount: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={billingFormData.status}
                onValueChange={(value) =>
                  setBillingFormData({
                    ...billingFormData,
                    status: value as "paid" | "pending" | "overdue" | "cancelled",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_period_start">Period Start</Label>
                <Input
                  id="edit_period_start"
                  type="date"
                  value={billingFormData.billing_period_start}
                  onChange={(e) =>
                    setBillingFormData({
                      ...billingFormData,
                      billing_period_start: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_period_end">Period End</Label>
                <Input
                  id="edit_period_end"
                  type="date"
                  value={billingFormData.billing_period_end}
                  onChange={(e) =>
                    setBillingFormData({
                      ...billingFormData,
                      billing_period_end: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditBillingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBilling} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
