import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import SupportTickets from "../../components/dashboard/SupportTickets";
import ReferralProgram from "../../components/dashboard/ReferralProgram";

export default function Support() {
  return (
    <DashboardLayout title="Support & Referrals">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Support & referrals
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Get help with your projects and earn rewards by referring friends
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SupportTickets />
          <ReferralProgram />
        </div>
      </div>
    </DashboardLayout>
  );
}
