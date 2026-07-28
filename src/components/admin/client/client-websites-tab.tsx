import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Globe } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "../../../hooks/use-toast";
import {
  ClientDetailData,
  ClientProjectUpdate,
  ClientWebsite,
} from "./types";

type Props = {
  data: ClientDetailData;
  onRefresh: () => void;
};

export function ClientWebsitesTab({ data, onRefresh }: Props) {
  const { user } = useAuth();
  const { websites, updates } = data;
  const [editSite, setEditSite] = useState<ClientWebsite | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("planning");
  const [progress, setProgress] = useState("0");
  const [saving, setSaving] = useState(false);

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updTitle, setUpdTitle] = useState("");
  const [updContent, setUpdContent] = useState("");
  const [updWebsiteId, setUpdWebsiteId] = useState("");

  useEffect(() => {
    if (!editSite) return;
    setName(editSite.name);
    setUrl(editSite.url || "");
    setStatus(editSite.status);
    setProgress(String(editSite.progress_percentage ?? 0));
  }, [editSite]);

  const saveWebsite = async () => {
    if (!editSite) return;
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Enter a website name.",
        variant: "destructive",
      });
      return;
    }
    const prog = Number(progress);
    if (!Number.isFinite(prog) || prog < 0 || prog > 100) {
      toast({
        title: "Invalid progress",
        description: "Progress must be between 0 and 100.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("websites")
        .update({
          name: name.trim(),
          url: url.trim() || null,
          status,
          progress_percentage: Math.round(prog),
        })
        .eq("id", editSite.id);
      if (error) throw error;
      toast({ title: "Website updated" });
      setEditSite(null);
      onRefresh();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update website.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setUpdWebsiteId(websites[0]?.id || "");
            setUpdateOpen(true);
          }}
          disabled={websites.length === 0}
        >
          Add project update
        </Button>
      </div>

      {websites.length === 0 ? (
        <Card>
          <EmptyState icon={Globe} message="No websites for this client." />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {websites.map((w) => (
            <Card key={w.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">{w.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {w.url || "No URL"}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditSite(w)}>
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline">{w.status}</Badge>
                <span className="font-mono-nums text-muted-foreground">
                  {w.progress_percentage}%
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
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
        open={Boolean(editSite)}
        onOpenChange={(o) => {
          if (!o) setEditSite(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit website</DialogTitle>
            <DialogDescription>Update name, URL, status, and progress.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="site_name">Name</Label>
              <Input
                id="site_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="site_url">URL</Label>
              <Input
                id="site_url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
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
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSite(null)}>
              Cancel
            </Button>
            <Button onClick={saveWebsite} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  {websites.map((w) => (
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
