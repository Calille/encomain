import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import UpgradeOptions from "../../components/dashboard/UpgradeOptions";

export default function Upgrade() {
  return (
    <DashboardLayout title="Upgrade Your Plan">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Upgrade your plan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Unlock more features and take your website to the next level
          </p>
        </div>

        <UpgradeOptions />
      </div>
    </DashboardLayout>
  );
}
