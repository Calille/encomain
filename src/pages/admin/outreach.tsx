import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { supabase } from "../../lib/supabase";
import { toast } from "../../hooks/use-toast";
import { ChevronDown, Mail, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import {
  compareValues,
  SortIcon,
  useTableSort,
} from "../../hooks/useTableSort";

interface LeadRow {
  id: string;
  business_name: string;
  domain: string;
  contact_email: string | null;
  contact_name: string | null;
  phone: string | null;
  address: string | null;
  source: string;
  status: string;
  audit_findings_summary: string | null;
  audit_data: Record<string, unknown> | null;
  personalised_email_draft: string | null;
  unsubscribed_at: string | null;
  assigned_to: string | null;
  last_audited_at: string | null;
}

interface EmailEvent {
  id: string;
  subject: string | null;
  direction: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
}

type LeadSortKey =
  | "business_name"
  | "domain"
  | "email"
  | "source"
  | "status"
  | "assigned_to";

export default function AdminOutreachPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [contacted, setContacted] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState("");
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [sending, setSending] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const { sort, cycleSort } = useTableSort<LeadSortKey>();

  const load = async () => {
    setLoading(true);
    const [leadsRes, adminsRes] = await Promise.all([
      supabase
        .from("leads")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(500),
      supabase
        .from("users")
        .select("id, full_name, email")
        .eq("role", "admin")
        .order("full_name", { ascending: true }),
    ]);
    if (leadsRes.error) {
      toast({
        title: "Error",
        description: leadsRes.error.message,
        variant: "destructive",
      });
    }
    setLeads((leadsRes.data as LeadRow[]) || []);
    setAdmins((adminsRes.data as AdminUser[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const adminNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of admins) {
      map.set(a.id, a.full_name || a.email);
    }
    return map;
  }, [admins]);

  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const l of leads) {
      if (l.source) set.add(l.source);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "en-GB"));
  }, [leads]);

  const assignedOptions = useMemo(() => {
    const ids = new Set<string>();
    for (const l of leads) {
      if (l.assigned_to) ids.add(l.assigned_to);
    }
    const fromLeads = [...ids].map((id) => ({
      id,
      name: adminNameById.get(id) || id,
    }));
    const fromAdmins = admins.map((a) => ({
      id: a.id,
      name: a.full_name || a.email,
    }));
    const merged = new Map<string, string>();
    for (const opt of [...fromAdmins, ...fromLeads]) {
      merged.set(opt.id, opt.name);
    }
    return [...merged.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
  }, [leads, admins, adminNameById]);

  const filtered = useMemo(() => {
    let list = leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (contacted === "contacted" && l.status === "new") return false;
      if (
        contacted === "not_contacted" &&
        l.status !== "new" &&
        l.status !== "queued"
      ) {
        return false;
      }
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (assignedFilter === "unassigned" && l.assigned_to != null) return false;
      if (
        assignedFilter !== "all" &&
        assignedFilter !== "unassigned" &&
        l.assigned_to !== assignedFilter
      ) {
        return false;
      }
      const q = query.toLowerCase();
      if (!q) return true;
      return (
        l.business_name.toLowerCase().includes(q) ||
        l.domain.toLowerCase().includes(q) ||
        (l.contact_email || "").toLowerCase().includes(q)
      );
    });

    if (sort.key && sort.direction) {
      const dir = sort.direction;
      const key = sort.key;
      list = [...list].sort((a, b) => {
        switch (key) {
          case "business_name":
            return compareValues(a.business_name, b.business_name, dir);
          case "domain":
            return compareValues(a.domain, b.domain, dir);
          case "email":
            return compareValues(a.contact_email, b.contact_email, dir);
          case "source":
            return compareValues(a.source, b.source, dir);
          case "status":
            return compareValues(a.status, b.status, dir);
          case "assigned_to":
            return compareValues(
              a.assigned_to
                ? adminNameById.get(a.assigned_to) || a.assigned_to
                : null,
              b.assigned_to
                ? adminNameById.get(b.assigned_to) || b.assigned_to
                : null,
              dir
            );
          default:
            return 0;
        }
      });
    }

    return list;
  }, [
    leads,
    status,
    contacted,
    sourceFilter,
    assignedFilter,
    query,
    sort,
    adminNameById,
  ]);

  const openLead = async (lead: LeadRow) => {
    setSelected(lead);
    setDraft(lead.personalised_email_draft || "");
    setSubject(`Quick note about ${lead.business_name}`);
    const { data } = await supabase
      .from("email_events")
      .select("id, subject, direction, sent_at, error_message, created_at")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });
    setEvents((data as EmailEvent[]) || []);
  };

  const saveDraft = async () => {
    if (!selected) return;
    setSavingDraft(true);
    const { error } = await supabase
      .from("leads")
      .update({ personalised_email_draft: draft })
      .eq("id", selected.id);
    setSavingDraft(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Draft saved" });
    load();
  };

  const sendEmail = async () => {
    if (!selected) return;
    if (!selected.contact_email) {
      toast({
        title: "No contact email",
        description: "This lead has no contact email.",
        variant: "destructive",
      });
      return;
    }
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-outreach-email", {
      body: {
        lead_id: selected.id,
        subject,
        body_html: draft.replace(/\n/g, "<br/>"),
      },
    });
    setSending(false);

    if (error) {
      toast({ title: "Send failed", description: error.message, variant: "destructive" });
      return;
    }

    if (data?.skipped) {
      toast({
        title: "Send skipped",
        description:
          data.reason === "suppressed" ? "Email is suppressed." : String(data.reason),
      });
      return;
    }

    toast({ title: "Email sent", description: "Recorded in email history." });
    openLead(selected);
    load();
  };

  const headerButton = (key: LeadSortKey, label: string) => (
    <button
      type="button"
      onClick={() => cycleSort(key)}
      className="inline-flex items-center font-medium text-muted-foreground transition-colors-fast hover:text-foreground"
    >
      {label}
      <SortIcon active={sort.key === key} direction={sort.direction} />
    </button>
  );

  return (
    <AdminLayout title="Outreach">
      <div className="mb-3 flex flex-wrap gap-2">
        <Input
          placeholder="Search business, domain, email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="queued">Queued</option>
          <option value="contacted">Contacted</option>
          <option value="responded">Responded</option>
          <option value="converted">Converted</option>
          <option value="dead">Dead</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={contacted}
          onChange={(e) => setContacted(e.target.value)}
        >
          <option value="all">Any contact state</option>
          <option value="not_contacted">Not contacted</option>
          <option value="contacted">Contacted</option>
        </select>
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="all">All sources</option>
          {sourceOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="h-9 max-w-[200px] rounded-sm border border-border bg-surface px-2 text-sm"
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
        >
          <option value="all">All assignees</option>
          <option value="unassigned">Unassigned</option>
          {assignedOptions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={MessageSquare} message="No leads match your filters." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">
                    {headerButton("business_name", "Business")}
                  </th>
                  <th className="px-3 py-2">{headerButton("domain", "Domain")}</th>
                  <th className="px-3 py-2">{headerButton("email", "Email")}</th>
                  <th className="px-3 py-2">{headerButton("source", "Source")}</th>
                  <th className="px-3 py-2">{headerButton("status", "Status")}</th>
                  <th className="px-3 py-2">
                    {headerButton("assigned_to", "Assigned")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="cursor-pointer transition-colors-fast hover:bg-muted/40"
                    onClick={() => openLead(lead)}
                  >
                    <td className="px-3 py-2.5 font-medium">{lead.business_name}</td>
                    <td className="px-3 py-2.5 font-mono-nums text-xs">{lead.domain}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {lead.contact_email || "None"}
                    </td>
                    <td className="px-3 py-2.5">{lead.source}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="secondary">{lead.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {lead.assigned_to
                        ? adminNameById.get(lead.assigned_to) || "Unknown"
                        : "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.business_name}</SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">{selected.domain}</p>
                  <p>{selected.contact_name || "No contact name"}</p>
                  <p>{selected.contact_email || "No email"}</p>
                  <p className="text-muted-foreground">{selected.phone || "No phone"}</p>
                  <p className="text-muted-foreground">
                    {selected.address || "No address"}
                  </p>
                  <p className="text-muted-foreground">
                    Assigned:{" "}
                    {selected.assigned_to
                      ? adminNameById.get(selected.assigned_to) || "Unknown"
                      : "Unassigned"}
                  </p>
                  {selected.unsubscribed_at && (
                    <Badge variant="destructive">Unsubscribed</Badge>
                  )}
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Audit findings</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {selected.audit_findings_summary || "No summary"}
                  </CardContent>
                </Card>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
                      Full audit data
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <pre className="max-h-64 overflow-auto rounded-sm border border-border bg-muted/40 p-3 text-xs text-foreground">
                      {JSON.stringify(selected.audit_data || {}, null, 2)}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                  <label className="text-sm font-medium">Personalised draft</label>
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={10}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveDraft}
                      disabled={savingDraft}
                    >
                      {savingDraft ? "Saving…" : "Save draft"}
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={sendEmail}
                      disabled={sending || !!selected.unsubscribed_at}
                    >
                      <Mail className="h-4 w-4" strokeWidth={1.5} />
                      {sending ? "Sending…" : "Send outreach"}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium">Email history</h3>
                  {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No emails yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {events.map((ev) => (
                        <li
                          key={ev.id}
                          className="rounded-sm border border-border px-3 py-2 text-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">
                              {ev.subject || "(no subject)"}
                            </span>
                            <Badge variant="outline">{ev.direction}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {ev.sent_at
                              ? format(new Date(ev.sent_at), "PPp")
                              : format(new Date(ev.created_at), "PPp")}
                            {ev.error_message ? ` · ${ev.error_message}` : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
