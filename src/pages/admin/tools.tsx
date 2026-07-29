import { useCallback, useMemo, useState } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { ToolUploadDialog } from "../../components/admin/tool-upload-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import { LoadError } from "../../components/ui/load-error";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { toast } from "../../hooks/use-toast";
import { useCancellableLoad } from "../../hooks/useCancellableLoad";
import {
  INTERNAL_TOOLS,
  deleteRelease,
  formatFileSize,
  getDownloadUrl,
  listReleases,
  markAsLatest,
  platformLabel,
  resolveUploaderNames,
  updateReleaseNotes,
  type Platform,
  type ToolRelease,
} from "../../lib/tool-releases";
import { Apple, ChevronDown, ChevronRight, Download, MoreHorizontal, Wrench } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ReleasesByTool = Record<string, ToolRelease[]>;

export default function AdminToolsPage() {
  const [releasesByTool, setReleasesByTool] = useState<ReleasesByTool>({});
  const [uploaderNames, setUploaderNames] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadToolSlug, setUploadToolSlug] = useState("sentry");
  const [deleteTarget, setDeleteTarget] = useState<ToolRelease | null>(null);
  const [notesTarget, setNotesTarget] = useState<ToolRelease | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = useCallback(async (ctl: { isCancelled: () => boolean }) => {
    const next: ReleasesByTool = {};
    const allUploaderIds: string[] = [];

    for (const tool of INTERNAL_TOOLS) {
      const rows = await listReleases(tool.slug);
      if (ctl.isCancelled()) return;
      next[tool.slug] = rows;
      for (const row of rows) {
        if (row.uploaded_by) allUploaderIds.push(row.uploaded_by);
      }
    }

    const names = await resolveUploaderNames(allUploaderIds);
    if (ctl.isCancelled()) return;
    setReleasesByTool(next);
    setUploaderNames(names);
  }, []);

  const { loading, error, retry } = useCancellableLoad(load, [], 15_000);

  const startDownload = async (release: ToolRelease) => {
    setDownloadingId(release.id);
    try {
      const url = await getDownloadUrl(release.id);
      window.location.assign(url);
    } catch (err) {
      toast({
        title: "Download failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionBusy(true);
    try {
      await deleteRelease(deleteTarget.id);
      toast({ title: "Release deleted" });
      setDeleteTarget(null);
      retry();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setActionBusy(false);
    }
  };

  const saveNotes = async () => {
    if (!notesTarget) return;
    setActionBusy(true);
    try {
      await updateReleaseNotes(notesTarget.id, notesDraft);
      toast({ title: "Release notes updated" });
      setNotesTarget(null);
      retry();
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setActionBusy(false);
    }
  };

  const setLatest = async (release: ToolRelease) => {
    setActionBusy(true);
    try {
      await markAsLatest(release.id);
      toast({
        title: "Marked as latest",
        description: `${release.tool_name} ${release.version} (${platformLabel(release.platform)})`,
      });
      retry();
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <AdminLayout title="Tools">
      <p className="mb-6 text-sm text-muted-foreground">
        Internal tools for The Enclosure team
      </p>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <LoadError message={error} onRetry={retry} />
      ) : (
        <div className="space-y-6">
          {INTERNAL_TOOLS.map((tool) => {
            const releases = releasesByTool[tool.slug] ?? [];
            const latestMac = releases.find((r) => r.platform === "mac" && r.is_latest) ?? null;
            const latestWindows =
              releases.find((r) => r.platform === "windows" && r.is_latest) ?? null;
            const isExpanded = !!expanded[tool.slug];

            return (
              <Card key={tool.slug}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setUploadToolSlug(tool.slug);
                      setUploadOpen(true);
                    }}
                  >
                    Upload new release
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {releases.length === 0 ? (
                    <EmptyState
                      icon={Wrench}
                      message={`No ${tool.name} releases uploaded yet. Once you've built the desktop app, upload the installer here.`}
                      className="py-10"
                    />
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-3">
                        <DownloadPlatformButton
                          label="Download for Mac"
                          release={latestMac}
                          busy={downloadingId === latestMac?.id}
                          onDownload={startDownload}
                        />
                        <DownloadPlatformButton
                          label="Download for Windows"
                          release={latestWindows}
                          busy={downloadingId === latestWindows?.id}
                          onDownload={startDownload}
                        />
                      </div>

                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [tool.slug]: !prev[tool.slug],
                          }))
                        }
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        View all versions
                      </button>

                      {isExpanded && (
                        <VersionsTable
                          releases={releases}
                          uploaderNames={uploaderNames}
                          downloadingId={downloadingId}
                          actionBusy={actionBusy}
                          onDownload={startDownload}
                          onEditNotes={(r) => {
                            setNotesTarget(r);
                            setNotesDraft(r.release_notes ?? "");
                          }}
                          onMarkLatest={setLatest}
                          onDelete={setDeleteTarget}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ToolUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        defaultToolSlug={uploadToolSlug}
        onUploaded={retry}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !actionBusy && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete release</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes{" "}
              {deleteTarget
                ? `${deleteTarget.tool_name} ${deleteTarget.version} (${platformLabel(deleteTarget.platform)})`
                : "this release"}{" "}
              and its installer file from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={actionBusy}>
              {actionBusy ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!notesTarget}
        onOpenChange={(open) => !open && !actionBusy && setNotesTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit release notes</DialogTitle>
            <DialogDescription>
              {notesTarget
                ? `${notesTarget.tool_name} ${notesTarget.version} · ${platformLabel(notesTarget.platform)}`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              rows={5}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              disabled={actionBusy}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={actionBusy}
              onClick={() => setNotesTarget(null)}
            >
              Cancel
            </Button>
            <Button onClick={saveNotes} disabled={actionBusy}>
              {actionBusy ? "Saving…" : "Save notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function DownloadPlatformButton({
  label,
  release,
  busy,
  onDownload,
}: {
  label: string;
  release: ToolRelease | null;
  busy: boolean;
  onDownload: (release: ToolRelease) => void;
}) {
  const available = !!release;
  return (
    <Button
      size="lg"
      variant={available ? "default" : "outline"}
      disabled={!available || busy}
      onClick={() => release && onDownload(release)}
      className="min-w-[200px] justify-start gap-2"
    >
      <Download className="h-4 w-4 shrink-0" />
      <span className="flex flex-col items-start text-left leading-tight">
        <span>{label}</span>
        <span className="text-xs font-normal opacity-80">
          {available
            ? `v${release.version} · ${formatFileSize(release.file_size)}`
            : "Not available"}
        </span>
      </span>
    </Button>
  );
}

function VersionsTable({
  releases,
  uploaderNames,
  downloadingId,
  actionBusy,
  onDownload,
  onEditNotes,
  onMarkLatest,
  onDelete,
}: {
  releases: ToolRelease[];
  uploaderNames: Record<string, string>;
  downloadingId: string | null;
  actionBusy: boolean;
  onDownload: (r: ToolRelease) => void;
  onEditNotes: (r: ToolRelease) => void;
  onMarkLatest: (r: ToolRelease) => void;
  onDelete: (r: ToolRelease) => void;
}) {
  const sorted = useMemo(
    () =>
      [...releases].sort(
        (a, b) =>
          new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime(),
      ),
    [releases],
  );

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Version</th>
              <th className="px-3 py-2 font-medium">Platform</th>
              <th className="px-3 py-2 font-medium">Size</th>
              <th className="px-3 py-2 font-medium">Notes</th>
              <th className="px-3 py-2 font-medium">Uploaded by</th>
              <th className="px-3 py-2 font-medium">Uploaded</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((row) => (
              <tr key={row.id}>
                <td className="px-3 py-2.5 font-medium">{row.version}</td>
                <td className="px-3 py-2.5">
                  <PlatformBadge platform={row.platform} />
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formatFileSize(row.file_size)}
                </td>
                <td className="max-w-[180px] truncate px-3 py-2.5 text-muted-foreground">
                  {row.release_notes?.trim()
                    ? row.release_notes.trim().slice(0, 80)
                    : "—"}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {row.uploaded_by
                    ? uploaderNames[row.uploaded_by] || "Unknown"
                    : "—"}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formatDistanceToNow(new Date(row.uploaded_at), {
                    addSuffix: true,
                  })}
                </td>
                <td className="px-3 py-2.5">
                  {row.is_latest ? (
                    <Badge variant="secondary">Latest</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={actionBusy}
                        aria-label="Release actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={downloadingId === row.id}
                        onClick={() => onDownload(row)}
                      >
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditNotes(row)}>
                        Edit notes
                      </DropdownMenuItem>
                      {!row.is_latest && (
                        <DropdownMenuItem onClick={() => onMarkLatest(row)}>
                          Mark as latest
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(row)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <Badge variant="outline" className="gap-1 font-normal">
      {platform === "mac" ? <Apple className="h-3 w-3" /> : null}
      {platformLabel(platform)}
    </Badge>
  );
}
