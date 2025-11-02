import { Card } from "../ui/card";
import { Tables } from "../../types/supabase";
import { DollarSign, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { format, addMonths } from "date-fns";
import { motion } from "framer-motion";

type Billing = Tables<"billing">;

interface BillingOverviewProps {
  billing: Billing[];
}

export function BillingOverview({ billing }: BillingOverviewProps) {
  // Get current billing period
  const currentBilling = billing.find(
    b => new Date(b.billing_period_start) <= new Date() && 
         new Date(b.billing_period_end) >= new Date()
  );

  // Calculate next billing date
  const nextBillingDate = currentBilling 
    ? new Date(currentBilling.billing_period_end)
    : addMonths(new Date(), 1);

  // Calculate total by month for last 12 months
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthBilling = billing.filter(b => {
      const billingDate = new Date(b.billing_period_start);
      return billingDate >= monthStart && billingDate <= monthEnd && b.status === 'paid';
    });

    const total = monthBilling.reduce((sum, b) => sum + Number(b.amount), 0);

    return {
      month: format(monthStart, "MMM"),
      total,
    };
  }).reverse();

  const maxAmount = Math.max(...monthlyData.map(d => d.total));

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[#1A4D2E] mb-4">Billing Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Billing Info */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg text-[#1A4D2E] mb-4">Current Billing Period</h3>
          
          {currentBilling ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount Due</p>
                    <p className="text-2xl font-bold text-[#1A4D2E]">
                      £{Number(currentBilling.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    currentBilling.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : currentBilling.status === "overdue"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {currentBilling.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Period Start</p>
                  <p className="font-semibold">
                    {format(new Date(currentBilling.billing_period_start), "PP")}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Period End</p>
                  <p className="font-semibold">
                    {format(new Date(currentBilling.billing_period_end), "PP")}
                  </p>
                </div>
              </div>

              {currentBilling.status === "overdue" && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    This invoice is overdue. Please make payment as soon as possible.
                  </div>
                </div>
              )}

              {currentBilling.paid_at && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Paid on</p>
                  <p className="font-semibold text-green-700">
                    {format(new Date(currentBilling.paid_at), "PP")}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No current billing period</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Next billing date
              </div>
              <span className="font-semibold">{format(nextBillingDate, "PP")}</span>
            </div>
          </div>
        </Card>

        {/* Billing History Chart */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg text-[#1A4D2E] mb-4">
            Billing History (Last 12 Months)
          </h3>
          
          <div className="space-y-3">
            {monthlyData.map((item, index) => (
              <motion.div
                key={item.month}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="text-sm font-medium text-gray-600 w-12">
                  {item.month}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden relative">
                  <motion.div
                    className="bg-gradient-to-r from-[#1A4D2E] to-[#2D5F3F] h-full rounded-full flex items-center justify-end pr-3"
                    initial={{ width: 0 }}
                    animate={{ width: `${maxAmount > 0 ? (item.total / maxAmount) * 100 : 0}%` }}
                    transition={{ duration: 0.8, delay: index * 0.05 }}
                  >
                    {item.total > 0 && (
                      <span className="text-xs font-medium text-white">
                        £{item.total.toFixed(0)}
                      </span>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4" />
                Total (12 months)
              </div>
              <span className="text-2xl font-bold text-[#1A4D2E]">
                £{monthlyData.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

