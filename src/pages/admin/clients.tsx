import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/admin/admin-layout";
import { WebsiteThumbnail } from "../../components/admin/WebsiteThumbnail";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { LoadError } from "../../components/ui/load-error";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { supabase } from "../../lib/supabase";
import { Tables } from "../../types/supabase";
import { Users, Plus } from "lucide-react";
import { format } from "date-fns";
import {
  compareValues,
  SortIcon,
  useTableSort,
} from "../../hooks/useTableSort";
import { useCancellableLoad } from "../../hooks/useCancellableLoad";
import { formatPlanLabel, PLAN_OPTIONS } from "../../lib/plans";

type UserRow = Tables<"users">;

type ClientSortKey =
  | "name"
  | "email"
  | "plan"
  | "websites"
  | "outstanding"
  | "last_login"
  | "status";

interface SiteSummary {
  count: number;
  inProgress: number;
  complete: number;
  onHold: number;
  label: string;
}

interface WebsiteRow {
  id: string;
  user_id: string;
  status: string;
  url: string | null;
  created_at: string;
}

interface NotePreview {
  user_id: string;
  note: string;
  pinned: boolean;
  created_at: string;
}

function summariseSites(sites: { status: string }[]): SiteSummary {
  const inProgress = sites.filter((w) => w.status === "in_progress").length;
  const complete = sites.filter(
    (w) => w.status === "completed" || w.status === "active"
  ).length;
  const onHold = sites.filter((w) => w.status === "on_hold").length;
  const parts: string[] = [];
  if (inProgress > 0) parts.push(`${inProgress} in progress`);
  if (complete > 0) parts.push(`${complete} complete`);
  if (onHold > 0) parts.push(`${onHold} on hold`);
  const count = sites.length;
  const label =
    count === 0
      ? "0"
      : parts.length > 0
        ? `${count} (${parts.join(", ")})`
        : String(count);
  return { count, inProgress, complete, onHold, label };
}

function pickPrimaryWebsiteUrl(sites: WebsiteRow[]): string | null {
  if (sites.length === 0) return null;
  const sorted = [...sites].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  return sorted[0]?.url?.trim() || null;
}

/** Prefer latest pinned note; otherwise most recent note. */
function pickLatestNotePreview(notes: NotePreview[]): string | null {
  if (notes.length === 0) return null;
  const pinned = notes
    .filter((n) => n.pinned)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  if (pinned[0]) return pinned[0].note;
  const chronological = [...notes].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return chronological[0]?.note || null;
}

function truncateNote(text: string, max = 40): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

export default function AdminClientsPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [websites, setWebsites] = useState<WebsiteRow[]>([]);
  const [invoices, setInvoices] = useState<
    { user_id: string; amount: number; status: string }[]
  >([]);
  const [notes, setNotes] = useState<NotePreview[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const { sort, cycleSort } = useTableSort<ClientSortKey>();

  const load = useCallback(async (ctl: { isCancelled: () => boolean }) => {
    const [u, w, i, n] = await Promise.all([
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase
        .from("websites")
        .select("id, user_id, status, url, created_at")
        .order("created_at", { ascending: true }),
      supabase.from("invoices").select("user_id, amount, status"),
      supabase
        .from("client_notes")
        .select("user_id, note, pinned, created_at")
        .order("created_at", { ascending: false }),
    ]);
    if (ctl.isCancelled()) return;
    const firstError = u.error || w.error || i.error || n.error;
    if (firstError) throw firstError;
    setUsers(u.data || []);
    setWebsites((w.data as WebsiteRow[]) || []);
    setInvoices(i.data || []);
    setNotes((n.data as NotePreview[]) || []);
  }, []);

  const { loading, error, retry } = useCancellableLoad(load);

  const notesByUser = useMemo(() => {
    const map = new Map<string, NotePreview[]>();
    for (const note of notes) {
      const list = map.get(note.user_id) || [];
      list.push(note);
      map.set(note.user_id, list);
    }
    return map;
  }, [notes]);

  const rows = useMemo(() => {
    // Outstanding = sum of issued unpaid invoices (sent or overdue). Drafts are excluded.
    const mapped = users
      .filter((u) => u.role === "user" || u.role === "admin")
      .filter((u) => statusFilter === "all" || u.status === statusFilter)
      .filter((u) => planFilter === "all" || (u.current_plan || "none") === planFilter)
      .filter((u) => {
        const q = query.toLowerCase();
        return (
          !q ||
          u.email.toLowerCase().includes(q) ||
          (u.full_name || "").toLowerCase().includes(q)
        );
      })
      .map((u) => {
        const userSites = websites.filter((w) => w.user_id === u.id);
        const sites = summariseSites(userSites);
        const primaryWebsiteUrl = pickPrimaryWebsiteUrl(userSites);
        const latestNote = pickLatestNotePreview(notesByUser.get(u.id) || []);
        const outstanding = invoices
          .filter(
            (inv) =>
              inv.user_id === u.id &&
              (inv.status === "sent" || inv.status === "overdue")
          )
          .reduce((s, inv) => s + Number(inv.amount), 0);
        return { user: u, sites, outstanding, primaryWebsiteUrl, latestNote };
      });

    if (!sort.key || !sort.direction) return mapped;

    const dir = sort.direction;
    const key = sort.key;
    return [...mapped].sort((a, b) => {
      switch (key) {
        case "name":
          return compareValues(a.user.full_name, b.user.full_name, dir);
        case "email":
          return compareValues(a.user.email, b.user.email, dir);
        case "plan":
          return compareValues(
            a.user.current_plan || "none",
            b.user.current_plan || "none",
            dir
          );
        case "websites":
          return compareValues(a.sites.count, b.sites.count, dir);
        case "outstanding":
          return compareValues(a.outstanding, b.outstanding, dir);
        case "last_login":
          return compareValues(
            a.user.last_login ? new Date(a.user.last_login).getTime() : null,
            b.user.last_login ? new Date(b.user.last_login).getTime() : null,
            dir
          );
        case "status":
          return compareValues(a.user.status, b.user.status, dir);
        default:
          return 0;
      }
    });
  }, [users, websites, invoices, notesByUser, query, statusFilter, planFilter, sort]);

  const headerButton = (key: ClientSortKey, label: string) => (
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
    <AdminLayout title="Clients">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="all">All plans</option>
          {PLAN_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value || "none"}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button asChild size="sm" className="ml-auto gap-1.5">
          <Link to="/admin/users">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Create user
          </Link>
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <LoadError message={error} onRetry={retry} />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={Users} message="No clients match your filters." />
        </Card>
      ) : (
        <TooltipProvider delayDuration={200}>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">{headerButton("name", "Name")}</th>
                    <th className="px-3 py-2">Website</th>
                    <th className="px-3 py-2">Latest note</th>
                    <th className="px-3 py-2">{headerButton("email", "Email")}</th>
                    <th className="px-3 py-2">{headerButton("plan", "Plan")}</th>
                    <th className="px-3 py-2">{headerButton("websites", "Websites")}</th>
                    <th className="px-3 py-2">
                      {headerButton("outstanding", "Outstanding")}
                    </th>
                    <th className="px-3 py-2">
                      {headerButton("last_login", "Last login")}
                    </th>
                    <th className="px-3 py-2">{headerButton("status", "Status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map(
                    ({
                      user,
                      sites,
                      outstanding,
                      primaryWebsiteUrl,
                      latestNote,
                    }) => (
                      <tr
                        key={user.id}
                        className="cursor-pointer transition-colors-fast hover:bg-muted/40"
                        onClick={() => navigate(`/admin/clients/${user.id}`)}
                      >
                        <td className="px-3 py-2.5 font-medium text-foreground">
                          {user.full_name || "Not set"}
                        </td>
                        <td className="px-3 py-2.5">
                          {primaryWebsiteUrl ? (
                            <a
                              href={primaryWebsiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-block"
                              title={primaryWebsiteUrl}
                            >
                              <WebsiteThumbnail url={primaryWebsiteUrl} size="sm" />
                            </a>
                          ) : (
                            <WebsiteThumbnail url={null} size="sm" />
                          )}
                        </td>
                        <td className="max-w-[160px] px-3 py-2.5">
                          {latestNote ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="block w-full truncate text-left text-muted-foreground hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/clients/${user.id}?tab=notes`);
                                  }}
                                >
                                  {truncateNote(latestNote)}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-xs whitespace-pre-wrap"
                              >
                                {latestNote}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="px-3 py-2.5">
                          {formatPlanLabel(user.current_plan)}
                        </td>
                        <td className="px-3 py-2.5 font-mono-nums text-xs">
                          {sites.label}
                        </td>
                        <td className="px-3 py-2.5 font-mono-nums">
                          £
                          {outstanding.toLocaleString("en-GB", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {user.last_login
                            ? format(new Date(user.last_login), "PP")
                            : "Never"}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge
                            variant={
                              user.status === "active"
                                ? "success"
                                : user.status === "suspended"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TooltipProvider>
      )}
    </AdminLayout>
  );
}
