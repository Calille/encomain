import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { EmptyState } from "../../ui/empty-state";
import { StickyNote } from "lucide-react";
import { RecentNotesCard } from "../RecentNotesCard";
import {
  AdminOption,
  ClientDetailData,
  formatGbp,
} from "./types";

type ActivityItem = {
  id: string;
  date: string;
  label: string;
  detail: string;
};

type Props = {
  data: ClientDetailData;
  onEdit: () => void;
  onViewNotes: () => void;
  onRefresh: () => void;
};

function managerLabel(
  admins: AdminOption[],
  accountManagerId: string | null
): string {
  if (!accountManagerId) return "Not assigned";
  const a = admins.find((x) => x.id === accountManagerId);
  return a?.full_name || a?.email || "Not assigned";
}

export function ClientOverviewTab({
  data,
  onEdit,
  onViewNotes,
  onRefresh,
}: Props) {
  const { user, invoices, payments, tickets, notes, updates, admins } = data;

  const activity: ActivityItem[] = [
    ...invoices.map((i) => ({
      id: `inv-${i.id}`,
      date: i.created_at,
      label: "Invoice",
      detail: `${i.invoice_number} · ${formatGbp(i.amount)} · ${i.status}`,
    })),
    ...payments.map((p) => ({
      id: `pay-${p.id}`,
      date: p.created_at || p.paid_at,
      label: "Payment",
      detail: `${formatGbp(p.amount)} · ${p.payment_method.replace(/_/g, " ")}`,
    })),
    ...tickets.map((t) => ({
      id: `tkt-${t.id}`,
      date: t.created_at,
      label: "Ticket",
      detail: `${t.subject} · ${t.status}`,
    })),
    ...notes.map((n) => ({
      id: `note-${n.id}`,
      date: n.created_at,
      label: "Note",
      detail: n.note.slice(0, 120),
    })),
    ...updates.map((u) => ({
      id: `upd-${u.id}`,
      date: u.created_at,
      label: "Update",
      detail: u.title,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Company info</CardTitle>
            <Button size="sm" variant="outline" onClick={onEdit}>
              Edit
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Company</p>
              <p>{user.company_name || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Industry</p>
              <p>{user.industry || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Billing email</p>
              <p>{user.billing_email || user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">VAT number</p>
              <p>{user.vat_number || "Not set"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Billing address</p>
              <p className="whitespace-pre-wrap">
                {user.billing_address || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payment terms</p>
              <p className="font-mono-nums">{user.payment_terms_days} days</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Account manager</p>
              <p>{managerLabel(admins, user.account_manager_id)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reminders</p>
              <Badge variant={user.reminders_paused ? "warning" : "success"}>
                {user.reminders_paused ? "Paused" : "Active"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <RecentNotesCard
          userId={user.id}
          onViewAll={onViewNotes}
          onChanged={onRefresh}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <EmptyState icon={StickyNote} message="No recent activity." />
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-2 py-2.5 text-sm"
                >
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {item.label}
                    </Badge>
                    <p>{item.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.date), "PP")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
