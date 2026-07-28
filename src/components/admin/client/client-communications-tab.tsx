import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Mail } from "lucide-react";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { EmptyState } from "../../ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { ClientDetailData, ClientEmailEvent } from "./types";

type Props = {
  data: ClientDetailData;
};

export function ClientCommunicationsTab({ data }: Props) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<ClientEmailEvent | null>(null);

  const filtered = useMemo(() => {
    let list = [...data.emailEvents];
    if (typeFilter !== "all") {
      list = list.filter((e) => e.email_type === typeFilter);
    }
    return list.sort(
      (a, b) =>
        new Date(b.sent_at || b.created_at).getTime() -
        new Date(a.sent_at || a.created_at).getTime()
    );
  }, [data.emailEvents, typeFilter]);

  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of data.emailEvents) {
      if (e.email_type) set.add(e.email_type);
    }
    return [...set].sort();
  }, [data.emailEvents]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All types</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Mail} message="No email events for this client." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Direction</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e) => (
                  <tr
                    key={e.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => setSelected(e)}
                  >
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {format(new Date(e.sent_at || e.created_at), "PPp")}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline">{e.email_type || "Not set"}</Badge>
                    </td>
                    <td className="px-3 py-2.5">{e.subject || "Not set"}</td>
                    <td className="px-3 py-2.5 capitalize">{e.direction}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {e.bounced_at
                        ? "Bounced"
                        : e.opened_at
                          ? "Opened"
                          : e.sent_at
                            ? "Sent"
                            : "Not set"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject || "Email"}</DialogTitle>
            <DialogDescription>
              {selected?.email_type || "Communication"} ·{" "}
              {selected
                ? format(
                    new Date(selected.sent_at || selected.created_at),
                    "PPp"
                  )
                : ""}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{selected.direction}</Badge>
                {selected.email_type && (
                  <Badge variant="secondary">{selected.email_type}</Badge>
                )}
              </div>
              <div className="rounded-sm border border-border bg-muted/30 px-3 py-3">
                {selected.body ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {selected.body}
                  </pre>
                ) : (
                  <p className="text-muted-foreground">No body stored.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
