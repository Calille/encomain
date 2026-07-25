import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "../../hooks/use-toast";
import { Ban } from "lucide-react";
import { format } from "date-fns";

interface SuppressionRow {
  id: string;
  email: string;
  suppressed_at: string;
  reason: string | null;
}

export default function AdminSuppressionsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<SuppressionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<SuppressionRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_suppression")
      .select("id, email, suppressed_at, reason")
      .order("suppressed_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setRows((data as SuppressionRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const removeSuppression = async () => {
    if (!pending || !user) return;

    const { error: auditError } = await supabase.from("suppression_removals").insert({
      email: pending.email,
      removed_by: user.id,
      previous_reason: pending.reason,
      notes: "Removed via admin suppressions UI",
    });

    if (auditError) {
      toast({ title: "Error", description: auditError.message, variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("email_suppression").delete().eq("id", pending.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Suppression removed", description: pending.email });
    setPending(null);
    load();
  };

  return (
    <AdminLayout title="Suppressions">
      <p className="mb-4 text-sm text-muted-foreground">
        Emails listed here are never contacted again, regardless of lead source.
      </p>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={Ban} message="No suppressed emails." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Suppressed</th>
                  <th className="px-3 py-2 font-medium">Reason</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2.5 font-medium">{row.email}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {format(new Date(row.suppressed_at), "PPp")}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{row.reason || "None"}</td>
                    <td className="px-3 py-2.5">
                      <Button size="sm" variant="outline" onClick={() => setPending(row)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove suppression</AlertDialogTitle>
            <AlertDialogDescription>
              This will allow outreach to {pending?.email} again. The removal will be logged
              for audit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={removeSuppression}>Remove suppression</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
