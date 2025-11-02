import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import UpgradeOptions from "../../components/dashboard/UpgradeOptions";

export default function Upgrade() {
  return (
    <DashboardLayout title="Upgrade Your Plan">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A4D2E] mb-2">
            Upgrade Your Plan
          </h1>
          <p className="text-gray-600">
            Unlock more features and take your website to the next level
          </p>
        </div>

        {/* Upgrade Options */}
        <UpgradeOptions />
      </div>
    </DashboardLayout>
  );
}

