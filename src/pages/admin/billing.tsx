import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { supabase } from "../../lib/supabase";
import { Tables } from "../../types/supabase";
import { DollarSign, FileText, Plus, Edit, Trash2, Search, Download } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { format } from "date-fns";
import { sendPaymentReceipt } from "../../utils/emailHelpers";

type Billing = Tables<"billing">;
type Invoice = Tables<"invoices">;
type User = Tables<"users">;

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

  // Form state for billing
  const [billingFormData, setBillingFormData] = useState({
    user_id: "",
    amount: "",
    currency: "GBP",
    status: "pending" as "paid" | "pending" | "overdue" | "cancelled",
    billing_period_start: "",
    billing_period_end: "",
  });

  // Form state for invoice
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

  const filteredBilling = billing.filter(item => {
    const user = users.find(u => u.id === item.user_id);
    const matchesSearch = 
      user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesUser = userFilter === "all" || item.user_id === userFilter;

    return matchesSearch && matchesStatus && matchesUser;
  });

  const filteredInvoices = invoices.filter(invoice => {
    const user = users.find(u => u.id === invoice.user_id);
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesUser = userFilter === "all" || invoice.user_id === userFilter;

    return matchesSearch && matchesStatus && matchesUser;
  });

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || user?.email || "Unknown";
  };

  const handleCreateBilling = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("billing")
        .insert({
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

      // Reset form
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
      const { error } = await supabase
        .from("invoices")
        .insert({
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

      // Reset form
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

      // Send payment receipt email if status changed to paid
      if (statusChangedToPaid) {
        try {
          // Fetch user email
          const { data: userData } = await supabase
            .from("users")
            .select("email, name")
            .eq("id", selectedBilling.user_id)
            .single();

          if (userData?.email) {
            const transactionId = `txn-${selectedBilling.id}-${Date.now()}`;
            
            // Fire and forget - don't block on email
            sendPaymentReceipt(userData.email, {
              transactionId: transactionId,
              amount: parseFloat(billingFormData.amount),
              currency: selectedBilling.currency || "GBP",
              paymentMethod: "Bank Transfer", // Default, adjust as needed
              paymentDate: new Date().toISOString(),
              status: "completed",
            }, {
              userName: userData.name || userData.email.split("@")[0],
              receiptUrl: `https://theenclosure.co.uk/receipts/${transactionId}`,
            }).catch((error) => {
              console.error("Failed to send payment receipt:", error);
            });
          }
        } catch (error) {
          console.error("Error sending payment receipt:", error);
          // Don't show error to admin - email failure shouldn't block the update
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
    if (!confirm("Are you sure you want to delete this billing record? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("billing")
        .delete()
        .eq("id", item.id);

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

      // Send payment receipt email if status changed to paid
      if (statusChangedToPaid) {
        try {
          // Fetch user email
          const { data: userData } = await supabase
            .from("users")
            .select("email, name")
            .eq("id", invoice.user_id)
            .single();

          if (userData?.email) {
            const transactionId = `txn-inv-${invoice.id}-${Date.now()}`;
            
            // Fire and forget - don't block on email
            sendPaymentReceipt(userData.email, {
              transactionId: transactionId,
              invoiceNumber: invoice.invoice_number || `INV-${invoice.id}`,
              amount: invoice.amount,
              currency: invoice.currency || "GBP",
              paymentMethod: "Bank Transfer", // Default, adjust as needed
              paymentDate: new Date().toISOString(),
              status: "completed",
            }, {
              userName: userData.name || userData.email.split("@")[0],
              receiptUrl: `https://theenclosure.co.uk/receipts/${transactionId}`,
              invoiceUrl: `https://theenclosure.co.uk/invoices/${invoice.invoice_number || invoice.id}`,
            }).catch((error) => {
              console.error("Failed to send payment receipt:", error);
            });
          }
        } catch (error) {
          console.error("Error sending payment receipt:", error);
          // Don't show error to admin - email failure shouldn't block the update
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
      status: item.status as any,
      billing_period_start: item.billing_period_start,
      billing_period_end: item.billing_period_end,
    });
    setIsEditBillingDialogOpen(true);
  };

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

  if (loading) {
    return (
      <DashboardLayout title="Billing Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#1A4D2E] border-r-transparent"></div>
            <p className="mt-4 text-[#1A4D2E] font-medium">Loading billing data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Billing Management">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A4D2E]">Billing & Invoices</h1>
          <p className="text-gray-600 mt-1">Manage billing records and invoices</p>
        </div>
      </div>

      <Tabs defaultValue="billing" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="billing">
            <DollarSign className="h-4 w-4 mr-2" />
            Billing Records
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
        </TabsList>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="mb-4 flex justify-end">
            <Dialog open={isBillingDialogOpen} onOpenChange={setIsBillingDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90">
                  <Plus className="h-4 w-4 mr-2" />
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
                      onValueChange={(value) => setBillingFormData({ ...billingFormData, user_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
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
                      onChange={(e) => setBillingFormData({ ...billingFormData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing_status">Status *</Label>
                    <Select
                      value={billingFormData.status}
                      onValueChange={(value) => setBillingFormData({ ...billingFormData, status: value as any })}
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
                        onChange={(e) => setBillingFormData({ ...billingFormData, billing_period_start: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="period_end">Period End *</Label>
                      <Input
                        id="period_end"
                        type="date"
                        value={billingFormData.billing_period_end}
                        onChange={(e) => setBillingFormData({ ...billingFormData, billing_period_end: e.target.value })}
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
                    className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
                  >
                    {isSubmitting ? "Creating..." : "Create Record"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6 shadow-sm border border-gray-200">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]"
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
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]"
              >
                <option value="all">All Clients</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Billing Table */}
            {filteredBilling.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No billing records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Period</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBilling.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{getUserName(item.user_id)}</td>
                        <td className="py-4 px-4 text-sm">
                          {item.currency === "GBP" ? "£" : "$"}{item.amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {format(new Date(item.billing_period_start), "MMM d")} - {format(new Date(item.billing_period_end), "MMM d, yyyy")}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditBillingDialog(item)}
                              className="hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBilling(item)}
                              className="hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
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

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <div className="mb-4 flex justify-end">
            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90">
                  <Plus className="h-4 w-4 mr-2" />
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
                      onValueChange={(value) => setInvoiceFormData({ ...invoiceFormData, user_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
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
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice_description">Description</Label>
                    <Input
                      id="invoice_description"
                      placeholder="Services rendered..."
                      value={invoiceFormData.description}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issue_date">Issue Date *</Label>
                      <Input
                        id="issue_date"
                        type="date"
                        value={invoiceFormData.issue_date}
                        onChange={(e) => setInvoiceFormData({ ...invoiceFormData, issue_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date *</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={invoiceFormData.due_date}
                        onChange={(e) => setInvoiceFormData({ ...invoiceFormData, due_date: e.target.value })}
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
                    className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
                  >
                    {isSubmitting ? "Creating..." : "Create Invoice"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6 shadow-sm border border-gray-200">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]"
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
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]"
              >
                <option value="all">All Clients</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoices Table */}
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No invoices found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Invoice #</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Issue Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Due Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-mono text-sm">{invoice.invoice_number}</td>
                        <td className="py-4 px-4 font-medium">{getUserName(invoice.user_id)}</td>
                        <td className="py-4 px-4 text-sm">
                          {invoice.currency === "GBP" ? "£" : "$"}{invoice.amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {format(new Date(invoice.issue_date), "PP")}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {format(new Date(invoice.due_date), "PP")}
                        </td>
                        <td className="py-4 px-4">
                          <Select
                            value={invoice.status}
                            onValueChange={(value) => handleUpdateInvoiceStatus(invoice, value)}
                          >
                            <SelectTrigger className={`w-32 ${getStatusColor(invoice.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sent">Sent</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-50"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
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

      {/* Edit Billing Dialog */}
      <Dialog open={isEditBillingDialogOpen} onOpenChange={setIsEditBillingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Billing Record</DialogTitle>
            <DialogDescription>
              Update billing information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Input value={getUserName(billingFormData.user_id)} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_amount">Amount</Label>
              <Input
                id="edit_amount"
                type="number"
                step="0.01"
                value={billingFormData.amount}
                onChange={(e) => setBillingFormData({ ...billingFormData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={billingFormData.status}
                onValueChange={(value) => setBillingFormData({ ...billingFormData, status: value as any })}
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
                  onChange={(e) => setBillingFormData({ ...billingFormData, billing_period_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_period_end">Period End</Label>
                <Input
                  id="edit_period_end"
                  type="date"
                  value={billingFormData.billing_period_end}
                  onChange={(e) => setBillingFormData({ ...billingFormData, billing_period_end: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditBillingDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBilling}
              disabled={isSubmitting}
              className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
            >
              {isSubmitting ? "Updating..." : "Update Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

