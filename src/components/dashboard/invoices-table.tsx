import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tables } from "../../types/supabase";
import {
  Download,
  Search,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

type Invoice = Tables<"invoices">;

interface InvoicesTableProps {
  invoices: Invoice[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
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
          comparison = new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime();
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
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "sent":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, "_blank");
    } else {
      // Generate PDF or show message
      alert("Invoice PDF not available yet");
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[#1A4D2E] mb-4">Invoices</h2>
      
      <Card className="p-6 shadow-sm border border-gray-200">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]"
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="status-desc">Status (Z-A)</option>
          </select>
        </div>

        {/* Invoices Table */}
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "all"
                ? "No invoices match your filters"
                : "No invoices yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                <tbody>
                  {filteredInvoices.map((invoice, index) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.status)}
                          <span className="font-medium">{invoice.invoice_number}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {format(new Date(invoice.issue_date), "PP")}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {format(new Date(invoice.due_date), "PP")}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold">
                          £{Number(invoice.amount).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          {invoice.currency}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                            className="hover:bg-[#1A4D2E]/10"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredInvoices.map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invoice.status)}
                      <span className="font-semibold">{invoice.invoice_number}</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">
                        £{Number(invoice.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Issue Date:</span>
                      <span>{format(new Date(invoice.issue_date), "PP")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span>{format(new Date(invoice.due_date), "PP")}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(invoice)}
                    className="w-full mt-3"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Summary */}
        {filteredInvoices.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </span>
            <span className="font-semibold text-[#1A4D2E]">
              Total: £
              {filteredInvoices
                .reduce((sum, inv) => sum + Number(inv.amount), 0)
                .toFixed(2)}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}

