import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CreditCard, Download, CheckCircle2, AlertCircle } from "lucide-react";

export default function Payments() {
  // Mock data for payments
  const paymentSummary = {
    totalAmount: 1999,
    amountPaid: 999,
    remainingBalance: 1000,
    nextPaymentDue: "2023-12-01",
    nextPaymentAmount: 1000,
  };

  const paymentHistory = [
    {
      id: 1,
      date: "2023-11-10",
      amount: 399,
      status: "paid",
      method: "Credit Card",
      description: "Initial payment - 20% deposit",
      invoiceNumber: "INV-2023-001",
    },
  ];

  const upcomingPayments = [
    {
      id: 1,
      dueDate: "2023-12-01",
      amount: 400,
      description: "Monthly installment",
    },
  ];

  return (
    <DashboardLayout title="Payments">
      <div className="space-y-6">
        {/* Payment Summary Card */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Payment Summary
          </h2>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Payment Progress
              </span>
              <span className="text-sm font-medium text-gray-700">
                £{paymentSummary.amountPaid} of £{paymentSummary.totalAmount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-[#2D5F3F] h-4 rounded-full"
                style={{
                  width: `${(paymentSummary.amountPaid / paymentSummary.totalAmount) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">
                Total Amount
              </div>
              <div className="mt-1 text-2xl font-semibold">
                £{paymentSummary.totalAmount}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">
                Amount Paid
              </div>
              <div className="mt-1 text-2xl font-semibold text-green-600">
                £{paymentSummary.amountPaid}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">
                Remaining Balance
              </div>
              <div className="mt-1 text-2xl font-semibold text-[#2D5F3F]">
                £{paymentSummary.remainingBalance}
              </div>
            </div>
          </div>

          {paymentSummary.remainingBalance > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg flex items-start mb-6">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Next Payment Due
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your next payment of £{paymentSummary.nextPaymentAmount} is
                  due on{" "}
                  {new Date(paymentSummary.nextPaymentDue).toLocaleDateString()}
                  .
                </p>
              </div>
            </div>
          )}

          <Button className="w-full bg-[#2D5F3F] hover:bg-[#2D5F3F]/90 text-[#1A1A1A]">
            <CreditCard className="mr-2 h-4 w-4" />
            Make a Payment
          </Button>
        </Card>

        {/* Payment History */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Payment History
          </h2>

          {paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        £{payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.status === "paid" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Paid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#1A4D2E]"
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Invoice
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No payment history available.
            </p>
          )}
        </Card>

        {/* Upcoming Payments */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Upcoming Payments
          </h2>

          {upcomingPayments.length > 0 ? (
            <div className="space-y-4">
              {upcomingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-[#2D5F3F] mr-4">
                      £{payment.amount}
                    </span>
                    <Button
                      size="sm"
                      className="bg-[#2D5F3F] hover:bg-[#2D5F3F]/90 text-[#1A1A1A]"
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No upcoming payments.
            </p>
          )}
        </Card>

        {/* Payment Methods */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Payment Methods
            </h2>
            <Button variant="outline" size="sm">
              Add Payment Method
            </Button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-[#1A4D2E]/10 rounded-md flex items-center justify-center mr-4">
                <CreditCard className="h-6 w-6 text-[#1A4D2E]" />
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-gray-500">Expires 12/2025</p>
              </div>
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Default
              </span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
