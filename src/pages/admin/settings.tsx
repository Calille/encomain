import { AdminLayout } from "../../components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { EmptyState } from "../../components/ui/empty-state";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AdminLayout title="Settings">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin settings</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Settings}
            message="Workspace settings will land here in a later release."
          />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
