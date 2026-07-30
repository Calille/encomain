import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "../../components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { LoadError } from "../../components/ui/load-error";
import { Checkbox } from "../../components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "../../hooks/use-toast";
import { useCancellableLoad } from "../../hooks/useCancellableLoad";
import { uploadLeadAuditPdf } from "../../lib/outreach-pdf";
import { ChevronDown, Mail, MessageSquare, Upload } from "lucide-react";
import { format } from "date-fns";
import {
  compareValues,
  SortIcon,
  useTableSort,
} from "../../hooks/useTableSort";
import { cn } from "@/lib/utils";

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
  sent_at: string | null;
  opened_at: string | null;
  pdf_clicked_at: string | null;
  first_replied_at: string | null;
  reply_count: number;
  audit_pdf_storage_path: string | null;
  outreach_batch_id: string | null;
  created_at: string;
}

interface EmailEvent {
  id: string;
  subject: string | null;
  direction: string;
  email_type: string | null;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

interface OutreachReply {
  id: string;
  from_email: string;
  from_name: string | null;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  received_at: string;
  read_at: string | null;
}

interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
}

interface BatchRow {
  id: string;
  name: string;
  created_by: string;
  lead_count: number;
  delay_seconds: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  next_lead_index: number;
  error: string | null;
}

type LeadSortKey =
  | "business_name"
  | "domain"
  | "email"
  | "source"
  | "status"
  | "assigned_to";

function draftSubject(lead: LeadRow): string {
  const audit = lead.audit_data || {};
  if (typeof audit.outreach_draft_subject === "string" && audit.outreach_draft_subject.trim()) {
    return audit.outreach_draft_subject.trim();
  }
  return `A quick look at ${lead.business_name}`;
}

function firstLine(text: string | null): string {
  if (!text) return "(no draft)";
  const line = text.replace(/\r\n/g, "\n").split("\n").find((l) => l.trim());
  return line?.trim() || "(empty draft)";
}

export default function AdminOutreachPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "batches" ? "batches" : "leads");

  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [suppressedEmails, setSuppressedEmails] = useState<Set<string>>(new Set());

  const [status, setStatus] = useState("all");
  const [contacted, setContacted] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState("");
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [replies, setReplies] = useState<OutreachReply[]>([]);
  const [expandedReply, setExpandedReply] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const { sort, cycleSort } = useTableSort<LeadSortKey>();

  // Batch UI
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [batchDelay, setBatchDelay] = useState(30);
  const [batchSelectedIds, setBatchSelectedIds] = useState<Set<string>>(new Set());
  const [batchLeadQuery, setBatchLeadQuery] = useState("");
  const [batchSourceFilter, setBatchSourceFilter] = useState("all");
  const [creatingBatch, setCreatingBatch] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchLeads, setBatchLeads] = useState<LeadRow[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  const load = useCallback(async (ctl: { isCancelled: () => boolean }) => {
    const [leadsRes, adminsRes, batchesRes, suppressedRes] = await Promise.all([
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
      supabase
        .from("outreach_batches")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("email_suppression").select("email"),
    ]);
    if (ctl.isCancelled()) return;
    if (leadsRes.error) throw leadsRes.error;
    if (adminsRes.error) throw adminsRes.error;
    if (batchesRes.error) throw batchesRes.error;
    if (suppressedRes.error) throw suppressedRes.error;
    setLeads((leadsRes.data as LeadRow[]) || []);
    setAdmins((adminsRes.data as AdminUser[]) || []);
    setBatches((batchesRes.data as BatchRow[]) || []);
    setSuppressedEmails(
      new Set((suppressedRes.data || []).map((s) => String(s.email).toLowerCase())),
    );
  }, []);

  const { loading, error, retry } = useCancellableLoad(load);

  // Deep-link ?lead=
  useEffect(() => {
    const leadId = searchParams.get("lead");
    if (!leadId || leads.length === 0) return;
    const found = leads.find((l) => l.id === leadId);
    if (found) {
      void openLead(found);
      setTab("leads");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once when leads load
  }, [leads, searchParams]);

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
              dir,
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

  const eligibleBatchLeads = useMemo(() => {
    return leads.filter((l) => {
      if (!l.contact_email) return false;
      if (l.unsubscribed_at) return false;
      if (l.sent_at) return false;
      if (suppressedEmails.has(l.contact_email.toLowerCase())) return false;
      if (batchSourceFilter !== "all" && l.source !== batchSourceFilter) return false;
      const q = batchLeadQuery.toLowerCase();
      if (!q) return true;
      return (
        l.business_name.toLowerCase().includes(q) ||
        l.domain.toLowerCase().includes(q) ||
        l.contact_email.toLowerCase().includes(q)
      );
    });
  }, [leads, suppressedEmails, batchSourceFilter, batchLeadQuery]);

  const openLead = async (lead: LeadRow) => {
    setSelected(lead);
    setDraft(lead.personalised_email_draft || "");
    setSubject(draftSubject(lead));
    setExpandedReply(null);

    const [eventsRes, repliesRes] = await Promise.all([
      supabase
        .from("email_events")
        .select("id, subject, direction, email_type, sent_at, error_message, created_at")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("outreach_replies")
        .select(
          "id, from_email, from_name, subject, body_text, body_html, received_at, read_at",
        )
        .eq("lead_id", lead.id)
        .order("received_at", { ascending: false }),
    ]);
    setEvents((eventsRes.data as EmailEvent[]) || []);
    setReplies((repliesRes.data as OutreachReply[]) || []);
  };

  const saveDraft = async () => {
    if (!selected) return;
    setSavingDraft(true);
    const audit = { ...(selected.audit_data || {}) };
    audit.outreach_draft_subject = subject;
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        personalised_email_draft: draft,
        audit_data: audit,
      })
      .eq("id", selected.id);
    setSavingDraft(false);
    if (updateError) {
      toast({
        title: "Error",
        description: updateError.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Draft saved" });
    retry();
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

    // Persist draft/subject before send so the Edge Function reads current copy
    const audit = { ...(selected.audit_data || {}) };
    audit.outreach_draft_subject = subject;
    await supabase
      .from("leads")
      .update({
        personalised_email_draft: draft,
        audit_data: audit,
      })
      .eq("id", selected.id);

    setSending(true);
    const { data, error: invokeError } = await supabase.functions.invoke(
      "send-outreach-email",
      { body: { lead_id: selected.id } },
    );
    setSending(false);

    if (invokeError) {
      toast({
        title: "Send failed",
        description: invokeError.message,
        variant: "destructive",
      });
      return;
    }

    if (data?.skipped) {
      const reasons: Record<string, string> = {
        suppressed: "Email is suppressed.",
        unsubscribed: "Lead has unsubscribed.",
        already_sent: "Already sent (use a batch to resend).",
      };
      toast({
        title: "Send skipped",
        description: reasons[String(data.reason)] || String(data.reason),
      });
      return;
    }

    if (data?.error) {
      toast({
        title: "Send failed",
        description: String(data.error),
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Email sent", description: "Recorded in email history." });
    openLead(selected);
    retry();
  };

  const handlePdfUpload = async (file: File | null) => {
    if (!selected || !file) return;
    setUploadingPdf(true);
    const result = await uploadLeadAuditPdf({
      leadId: selected.id,
      filename: file.name,
      bytes: file,
    });
    setUploadingPdf(false);
    if ("error" in result) {
      toast({
        title: "Upload failed",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Audit PDF uploaded" });
    setSelected({ ...selected, audit_pdf_storage_path: result.path });
    retry();
  };

  const markReplyRead = async (reply: OutreachReply) => {
    if (reply.read_at) return;
    const now = new Date().toISOString();
    await supabase
      .from("outreach_replies")
      .update({ read_at: now })
      .eq("id", reply.id);
    setReplies((prev) =>
      prev.map((r) => (r.id === reply.id ? { ...r, read_at: now } : r)),
    );
  };

  const createBatch = async () => {
    if (!user || !batchName.trim() || batchSelectedIds.size === 0) return;
    setCreatingBatch(true);
    try {
      const ids = [...batchSelectedIds];
      const { data: batch, error: batchError } = await supabase
        .from("outreach_batches")
        .insert({
          created_by: user.id,
          name: batchName.trim(),
          lead_count: ids.length,
          delay_seconds: batchDelay,
          status: "draft",
          next_lead_index: 0,
        })
        .select("id")
        .single();
      if (batchError) throw batchError;

      const { error: assignError } = await supabase
        .from("leads")
        .update({ outreach_batch_id: batch.id, status: "queued" })
        .in("id", ids);
      if (assignError) throw assignError;

      toast({
        title: "Batch created",
        description: `${ids.length} leads queued as draft.`,
      });
      setBatchDialogOpen(false);
      setBatchName("");
      setBatchSelectedIds(new Set());
      setTab("batches");
      setSearchParams({ tab: "batches" });
      setActiveBatchId(batch.id);
      retry();
    } catch (err) {
      toast({
        title: "Could not create batch",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setCreatingBatch(false);
    }
  };

  const loadBatchDetail = async (batchId: string) => {
    setActiveBatchId(batchId);
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("outreach_batch_id", batchId)
      .order("created_at", { ascending: true });
    setBatchLeads((data as LeadRow[]) || []);
  };

  useEffect(() => {
    if (activeBatchId) {
      void loadBatchDetail(activeBatchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBatchId, batches]);

  const startBatch = async (batch: BatchRow) => {
    setBatchActionLoading(true);
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("outreach_batches")
      .update({
        status: "sending",
        started_at: batch.started_at || now,
        next_send_at: now,
        completed_at: null,
      })
      .eq("id", batch.id)
      .in("status", ["draft", "cancelled"]);
    setBatchActionLoading(false);
    if (updateError) {
      toast({
        title: "Could not start batch",
        description: updateError.message,
        variant: "destructive",
      });
      return;
    }
    // Kick first tick immediately (cron continues thereafter)
    await supabase.functions.invoke("run-outreach-batch", {
      body: { batch_id: batch.id },
    });
    toast({ title: "Batch started", description: "Sends will continue via cron." });
    retry();
  };

  const cancelBatch = async (batch: BatchRow) => {
    setBatchActionLoading(true);
    const { error: updateError } = await supabase
      .from("outreach_batches")
      .update({ status: "cancelled", next_send_at: null })
      .eq("id", batch.id)
      .in("status", ["draft", "sending"]);
    setBatchActionLoading(false);
    if (updateError) {
      toast({
        title: "Could not cancel",
        description: updateError.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Batch cancelled" });
    retry();
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

  const activeBatch = batches.find((b) => b.id === activeBatchId) || null;
  const sentInBatch = batchLeads.filter((l) => l.sent_at).length;

  return (
    <AdminLayout title="Outreach">
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          setSearchParams(v === "batches" ? { tab: "batches" } : {});
        }}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
          </TabsList>
          {tab === "batches" && (
            <Button size="sm" onClick={() => setBatchDialogOpen(true)}>
              New batch
            </Button>
          )}
        </div>

        <TabsContent value="leads" className="space-y-3">
          <div className="flex flex-wrap gap-2">
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
          ) : error ? (
            <LoadError message={error} onRetry={retry} />
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
                          {(lead.reply_count || 0) > 0 && (
                            <Badge variant="outline" className="ml-1">
                              {lead.reply_count} replies
                            </Badge>
                          )}
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
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : batches.length === 0 ? (
            <Card>
              <EmptyState
                icon={Mail}
                message="No outreach batches yet. Create one to queue a wave of sends."
              />
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Created by</th>
                      <th className="px-3 py-2">Leads</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Progress</th>
                      <th className="px-3 py-2">Started</th>
                      <th className="px-3 py-2">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {batches.map((b) => (
                      <tr
                        key={b.id}
                        className={cn(
                          "cursor-pointer transition-colors-fast hover:bg-muted/40",
                          activeBatchId === b.id && "bg-muted/30",
                        )}
                        onClick={() => loadBatchDetail(b.id)}
                      >
                        <td className="px-3 py-2.5 font-medium">{b.name}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {adminNameById.get(b.created_by) || "Unknown"}
                        </td>
                        <td className="px-3 py-2.5">{b.lead_count}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant="secondary">{b.status}</Badge>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {Math.min(b.next_lead_index, b.lead_count)} of {b.lead_count}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                          {b.started_at
                            ? format(new Date(b.started_at), "PPp")
                            : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                          {b.completed_at
                            ? format(new Date(b.completed_at), "PPp")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeBatch && (
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="text-base">{activeBatch.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sentInBatch} of {batchLeads.length} sent · delay{" "}
                    {activeBatch.delay_seconds}s · status {activeBatch.status}
                  </p>
                  {activeBatch.error && (
                    <p className="mt-1 whitespace-pre-wrap text-xs text-destructive">
                      {activeBatch.error}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {(activeBatch.status === "draft" ||
                    activeBatch.status === "cancelled") && (
                    <Button
                      size="sm"
                      disabled={batchActionLoading}
                      onClick={() => startBatch(activeBatch)}
                    >
                      Start batch
                    </Button>
                  )}
                  {(activeBatch.status === "draft" ||
                    activeBatch.status === "sending") && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={batchActionLoading}
                      onClick={() => cancelBatch(activeBatch)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-left text-sm">
                  <thead className="border-y border-border bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Business</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Sent</th>
                      <th className="px-3 py-2">Opened</th>
                      <th className="px-3 py-2">PDF click</th>
                      <th className="px-3 py-2">Replies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {batchLeads.map((l) => (
                      <tr
                        key={l.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => {
                          setTab("leads");
                          openLead(l);
                        }}
                      >
                        <td className="px-3 py-2.5 font-medium">{l.business_name}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {l.contact_email || "None"}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {l.sent_at ? format(new Date(l.sent_at), "PPp") : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {l.opened_at ? format(new Date(l.opened_at), "PPp") : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {l.pdf_clicked_at
                            ? format(new Date(l.pdf_clicked_at), "PPp")
                            : "-"}
                        </td>
                        <td className="px-3 py-2.5">{l.reply_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* New batch dialog */}
      <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New outreach batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder='e.g. Norwich cafes wave 2'
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Filter leads"
                value={batchLeadQuery}
                onChange={(e) => setBatchLeadQuery(e.target.value)}
                className="max-w-xs"
              />
              <select
                className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
                value={batchSourceFilter}
                onChange={(e) => setBatchSourceFilter(e.target.value)}
              >
                <option value="all">All sources</option>
                {sourceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
                value={batchDelay}
                onChange={(e) => setBatchDelay(Number(e.target.value))}
              >
                <option value={15}>15s delay</option>
                <option value={30}>30s delay</option>
                <option value={60}>60s delay</option>
                <option value={120}>120s delay</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setBatchSelectedIds(new Set(eligibleBatchLeads.map((l) => l.id)))
                }
              >
                Select all ({eligibleBatchLeads.length})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBatchSelectedIds(new Set())}
              >
                Clear
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto rounded-sm border border-border">
              {eligibleBatchLeads.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">
                  No unsent, non-suppressed leads match.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {eligibleBatchLeads.map((l) => {
                    const checked = batchSelectedIds.has(l.id);
                    return (
                      <li key={l.id} className="flex items-start gap-2 px-3 py-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            setBatchSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (v) next.add(l.id);
                              else next.delete(l.id);
                              return next;
                            });
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{l.business_name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {draftSubject(l)} · {firstLine(l.personalised_email_draft)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {batchSelectedIds.size > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-sm border border-border bg-muted/30 p-3 text-xs">
                <p className="mb-2 font-medium text-foreground">
                  Preview ({batchSelectedIds.size} selected)
                </p>
                <ul className="space-y-2">
                  {leads
                    .filter((l) => batchSelectedIds.has(l.id))
                    .map((l) => (
                      <li key={l.id}>
                        <span className="font-medium">{l.business_name}</span>
                        <br />
                        <span className="text-muted-foreground">
                          {draftSubject(l)} · {firstLine(l.personalised_email_draft)}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBatchDialogOpen(false)}
              disabled={creatingBatch}
            >
              Cancel
            </Button>
            <Button
              onClick={createBatch}
              disabled={
                creatingBatch || !batchName.trim() || batchSelectedIds.size === 0
              }
            >
              {creatingBatch ? "Creating…" : "Create batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead detail sheet */}
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
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selected.unsubscribed_at && (
                      <Badge variant="destructive">Unsubscribed</Badge>
                    )}
                    {selected.sent_at && (
                      <Badge variant="outline">
                        Sent {format(new Date(selected.sent_at), "PP")}
                      </Badge>
                    )}
                    {selected.pdf_clicked_at && (
                      <Badge variant="outline">PDF clicked</Badge>
                    )}
                    {(selected.reply_count || 0) > 0 && (
                      <Badge variant="outline">{selected.reply_count} replies</Badge>
                    )}
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Audit findings</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {selected.audit_findings_summary || "No summary"}
                  </CardContent>
                </Card>

                <div className="space-y-2 rounded-sm border border-border p-3">
                  <p className="text-sm font-medium">Audit PDF</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.audit_pdf_storage_path
                      ? selected.audit_pdf_storage_path
                      : "No PDF uploaded yet."}
                  </p>
                  <Button asChild variant="outline" size="sm" className="gap-1.5">
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4" strokeWidth={1.5} />
                      {uploadingPdf ? "Uploading…" : "Upload audit PDF"}
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        disabled={uploadingPdf}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          void handlePdfUpload(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </Button>
                </div>

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
                  <h3 className="mb-2 text-sm font-medium">Replies</h3>
                  {replies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No replies yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {replies.map((reply) => {
                        const open = expandedReply === reply.id;
                        return (
                          <li
                            key={reply.id}
                            className={cn(
                              "rounded-sm border border-border px-3 py-2 text-sm",
                              reply.read_at && "opacity-60",
                            )}
                          >
                            <button
                              type="button"
                              className="w-full text-left"
                              onClick={() => {
                                setExpandedReply(open ? null : reply.id);
                                void markReplyRead(reply);
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium">
                                  {reply.from_name || reply.from_email}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(reply.received_at), "PPp")}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {reply.subject || "(no subject)"}
                              </p>
                            </button>
                            {open && (
                              <div className="mt-2 border-t border-border pt-2 text-sm text-foreground">
                                {reply.body_text ? (
                                  <pre className="whitespace-pre-wrap font-sans text-sm">
                                    {reply.body_text}
                                  </pre>
                                ) : reply.body_html ? (
                                  <div
                                    className="prose prose-sm max-w-none dark:prose-invert"
                                    // Admin-only CRM; inbound HTML from Resend. Prefer text when present.
                                    dangerouslySetInnerHTML={{ __html: reply.body_html }}
                                  />
                                ) : (
                                  <p className="text-muted-foreground">(empty body)</p>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
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
                            <Badge variant="outline">
                              {ev.email_type || ev.direction}
                            </Badge>
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
