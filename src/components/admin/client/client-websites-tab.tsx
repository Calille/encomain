import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Globe,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { EmptyState } from "../../ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { WebsiteThumbnail } from "../WebsiteThumbnail";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "../../../hooks/use-toast";
import {
  isPlausibleWebsiteInput,
  normaliseWebsiteUrl,
  websiteDisplayName,
} from "../../../lib/website-url";
import {
  ClientDetailData,
  ClientProjectUpdate,
  ClientWebsite,
} from "./types";

const WEBSITE_STATUSES = [
  "active",
  "in_progress",
  "completed",
  "on_hold",
] as const;

type WebsiteStatus = (typeof WEBSITE_STATUSES)[number];

type Props = {
  data: ClientDetailData;
  onRefresh: () => void;
};

type FormState = {
  name: string;
  url: string;
  status: WebsiteStatus;
  progress: string;
};

const emptyForm = (): FormState => ({
  name: "",
  url: "",
  status: "active",
  progress: "0",
});

function statusVariant(
  status: string
): "success" | "default" | "warning" | "secondary" {
  if (status === "active" || status === "completed") return "success";
  if (status === "in_progress") return "default";
  if (status === "on_hold") return "warning";
  return "secondary";
}

function statusLabel(status: string): string {
  if (status === "in_progress") return "In progress";
  if (status === "on_hold") return "On hold";
  if (status === "completed") return "Completed";
  if (status === "active") return "Active";
  return status;
}

function isWebsiteStatus(value: string): value is WebsiteStatus {
  return (WEBSITE_STATUSES as readonly string[]).includes(value);
}

export function ClientWebsitesTab({ data, onRefresh }: Props) {
  const { user } = useAuth();
  const { websites, updates } = data;

  const sortedWebsites = useMemo(
    () =>
      [...websites].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [websites]
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClientWebsite | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [urlConfirmOpen, setUrlConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState<{
    normalisedUrl: string;
    name: string;
    status: WebsiteStatus;
    progress: number;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ClientWebsite | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [refreshKeys, setRefreshKeys] = useState<Record<string, number>>({});

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updTitle, setUpdTitle] = useState("");
  const [updContent, setUpdContent] = useState("");
  const [updWebsiteId, setUpdWebsiteId] = useState("");

  useEffect(() => {
    if (!dialogOpen) return;
    if (editing) {
      setForm({
        name: editing.name,
        url: editing.url || "",
        status: isWebsiteStatus(editing.status) ? editing.status : "active",
        progress: String(editing.progress_percentage ?? 0),
      });
    } else {
      setForm(emptyForm());
    }
    setUrlError(null);
  }, [dialogOpen, editing]);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (site: ClientWebsite) => {
    setEditing(site);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setUrlError(null);
    setPendingSave(null);
  };

  const validateAndPrepare = (): {
    normalisedUrl: string;
    name: string;
    status: WebsiteStatus;
    progress: number;
  } | null => {
    const rawUrl = form.url.trim();
    if (!rawUrl) {
      setUrlError("URL is required.");
      return null;
    }
    if (!isPlausibleWebsiteInput(rawUrl)) {
      setUrlError("Enter a valid website URL.");
      return null;
    }

    let normalisedUrl: string;
    try {
      normalisedUrl = normaliseWebsiteUrl(rawUrl);
    } catch (err) {
      setUrlError(
        err instanceof Error ? err.message : "Enter a valid website URL."
      );
      return null;
    }
    setUrlError(null);

    const prog = Number(form.progress);
    if (!Number.isFinite(prog) || prog < 0 || prog > 100) {
      toast({
        title: "Invalid progress",
        description: "Progress must be between 0 and 100.",
        variant: "destructive",
      });
      return null;
    }

    const name =
      form.name.trim() || websiteDisplayName(normalisedUrl);

    return {
      normalisedUrl,
      name,
      status: form.status,
      progress: Math.round(prog),
    };
  };

  const persistWebsite = async (payload: {
    normalisedUrl: string;
    name: string;
    status: WebsiteStatus;
    progress: number;
  }) => {
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("websites")
          .update({
            name: payload.name,
            url: payload.normalisedUrl,
            status: payload.status,
            progress_percentage: payload.progress,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Website updated" });
      } else {
        const { error } = await supabase.from("websites").insert({
          user_id: data.user.id,
          name: payload.name,
          url: payload.normalisedUrl,
          status: payload.status,
          progress_percentage: payload.progress,
        });
        if (error) throw error;
        toast({ title: "Website added" });
      }
      closeDialog();
      setUrlConfirmOpen(false);
      setPendingSave(null);
      onRefresh();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save website.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = async () => {
    const prepared = validateAndPrepare();
    if (!prepared) return;

    if (
      editing &&
      (editing.url || "").trim() !== prepared.normalisedUrl
    ) {
      setPendingSave(prepared);
      setUrlConfirmOpen(true);
      return;
    }

    await persistWebsite(prepared);
  };

  const confirmUrlChange = async () => {
    if (!pendingSave) return;
    await persistWebsite(pendingSave);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("websites")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      toast({ title: "Website deleted" });
      setDeleteTarget(null);
      onRefresh();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete website.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const refreshThumbnail = (siteId: string) => {
    setRefreshKeys((prev) => ({
      ...prev,
      [siteId]: Date.now(),
    }));
    toast({
      title: "Thumbnail refresh requested",
      description: "Fetching a fresh screenshot from Microlink.",
    });
  };

  const addUpdate = async () => {
    if (!updTitle.trim() || !updContent.trim()) {
      toast({
        title: "Missing fields",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }
    if (!updWebsiteId) {
      toast({
        title: "Website required",
        description: "Select a website for this update.",
        variant: "destructive",
      });
      return;
    }
    if (!user?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("project_updates").insert({
        user_id: data.user.id,
        website_id: updWebsiteId,
        title: updTitle.trim(),
        description: updContent.trim(),
        created_by: user.id,
        update_type: "general",
      });
      if (error) throw error;
      toast({ title: "Update posted" });
      setUpdateOpen(false);
      setUpdTitle("");
      setUpdContent("");
      setUpdWebsiteId("");
      onRefresh();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to add update.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const siteName = (id: string) =>
    websites.find((w) => w.id === id)?.name || "Website";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setUpdWebsiteId(sortedWebsites[0]?.id || "");
            setUpdateOpen(true);
          }}
          disabled={sortedWebsites.length === 0}
        >
          Add project update
        </Button>
        <Button size="sm" className="gap-1.5" onClick={openAdd}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add website
        </Button>
      </div>

      {sortedWebsites.length === 0 ? (
        <Card>
          <EmptyState icon={Globe} message="No websites for this client." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Thumbnail</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Progress</TableHead>
                <TableHead className="w-[100px]">Added</TableHead>
                <TableHead className="w-[60px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedWebsites.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>
                    <WebsiteThumbnail
                      url={w.url}
                      size="sm"
                      refreshKey={refreshKeys[w.id]}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">
                    {w.url ? (
                      <a
                        href={w.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground hover:underline"
                        title={w.url}
                      >
                        {w.url}
                      </a>
                    ) : (
                      "No URL"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(w.status)}>
                      {statusLabel(w.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono-nums text-muted-foreground">
                    {w.progress_percentage}%
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(w.created_at), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          aria-label={`Actions for ${w.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onClick={() => openEdit(w)}>
                          <Pencil className="mr-2 h-4 w-4" strokeWidth={1.5} />
                          Edit website
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={!w.url?.trim()}
                          onClick={() => refreshThumbnail(w.id)}
                        >
                          <RefreshCw
                            className="mr-2 h-4 w-4"
                            strokeWidth={1.5}
                          />
                          Refresh thumbnail
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(w)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                          Delete website
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent project updates</CardTitle>
        </CardHeader>
        <CardContent>
          {updates.length === 0 ? (
            <EmptyState icon={Globe} message="No project updates yet." />
          ) : (
            <ul className="divide-y divide-border">
              {updates.map((u: ClientProjectUpdate) => (
                <li key={u.id} className="py-2.5 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{u.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(u.created_at), "PP")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {siteName(u.website_id)}
                  </p>
                  {u.description && (
                    <p className="mt-1 text-muted-foreground">{u.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
          else setDialogOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit website" : "Add website"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update URL, name, status, and progress for this site."
                : "Add a site for this client. Name defaults from the hostname if left blank."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="site_url">URL</Label>
              <Input
                id="site_url"
                placeholder="https://example.com"
                value={form.url}
                onChange={(e) => {
                  setForm((f) => ({ ...f, url: e.target.value }));
                  if (urlError) setUrlError(null);
                }}
                aria-invalid={!!urlError}
              />
              {urlError ? (
                <p className="text-xs text-destructive">{urlError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Required. Bare domains are normalised to https://
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="site_name">Name</Label>
              <Input
                id="site_name"
                placeholder="Auto from hostname if blank"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => {
                  if (isWebsiteStatus(value)) {
                    setForm((f) => ({ ...f, status: value }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="site_progress">Progress (%)</Label>
              <Input
                id="site_progress"
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, progress: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveClick} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save" : "Add website"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={urlConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setUrlConfirmOpen(false);
            setPendingSave(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change website URL?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing the URL affects screenshot thumbnails and any linked
              audit data. The Microlink thumbnail may stay cached for up to
              about 24 hours unless you use Refresh thumbnail after saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUrlChange} disabled={saving}>
              {saving ? "Saving…" : "Change URL"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete website?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete this website? This will remove it from the client&apos;s
              record and stop appearing on the clients listing thumbnail if
              it&apos;s their primary site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete website"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add project update</DialogTitle>
            <DialogDescription>
              Post a progress update visible on the client dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label>Website</Label>
              <Select value={updWebsiteId} onValueChange={setUpdWebsiteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select website" />
                </SelectTrigger>
                <SelectContent>
                  {sortedWebsites.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="upd_title">Title</Label>
              <Input
                id="upd_title"
                value={updTitle}
                onChange={(e) => setUpdTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="upd_content">Content</Label>
              <Textarea
                id="upd_content"
                rows={4}
                value={updContent}
                onChange={(e) => setUpdContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addUpdate} disabled={saving}>
              {saving ? "Saving…" : "Post update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
