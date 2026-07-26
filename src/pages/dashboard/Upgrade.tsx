import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import UpgradeOptions from "../../components/dashboard/UpgradeOptions";

export default function Upgrade() {
  return (
    <DashboardLayout title="Upgrade your plan">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Upgrade your plan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Change your package or explore something more custom. Talk to us before making
            any changes so we can walk through what&apos;s included.
          </p>
        </div>

        <UpgradeOptions />
      </div>
    </DashboardLayout>
  );
}
