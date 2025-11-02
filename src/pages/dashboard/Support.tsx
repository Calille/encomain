import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import SupportTickets from "../../components/dashboard/SupportTickets";
import ReferralProgram from "../../components/dashboard/ReferralProgram";

export default function Support() {
  return (
    <DashboardLayout title="Support & Referrals">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A4D2E] mb-2">
            Support & Referrals
          </h1>
          <p className="text-gray-600">
            Get help with your projects and earn rewards by referring friends
          </p>
        </div>

        {/* Grid layout for desktop, stacked for mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Support Tickets */}
          <div>
            <SupportTickets />
          </div>

          {/* Referral Program */}
          <div>
            <ReferralProgram />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

