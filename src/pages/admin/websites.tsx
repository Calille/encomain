import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { supabase } from "../../lib/supabase";
import { Tables } from "../../types/supabase";
import { Globe, Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { format } from "date-fns";

type Website = Tables<"websites">;
type User = Tables<"users">;

function statusVariant(
  status: string
): "success" | "default" | "warning" | "secondary" {
  if (status === "active" || status === "completed") return "success";
  if (status === "in_progress") return "default";
  if (status === "on_hold") return "warning";
  return "secondary";
}

export default function WebsitesManagement() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);

  const [formData, setFormData] = useState({
    user_id: "",
    name: "",
    url: "",
    status: "in_progress" as "active" | "in_progress" | "completed" | "on_hold",
    progress_percentage: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [websitesResult, usersResult] = await Promise.all([
        supabase
          .from("websites")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("users")
          .select("*")
          .eq("status", "active")
          .order("full_name", { ascending: true }),
      ]);

      if (websitesResult.error) throw websitesResult.error;
      if (usersResult.error) throw usersResult.error;

      setWebsites(websitesResult.data || []);
      setUsers(usersResult.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load websites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredWebsites = websites.filter((website) => {
    const matchesSearch =
      website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.url?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || website.status === statusFilter;
    const matchesUser = userFilter === "all" || website.user_id === userFilter;

    return matchesSearch && matchesStatus && matchesUser;
  });

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.full_name || user?.email || "Unknown";
  };

  const handleCreateWebsite = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("websites").insert({
        user_id: formData.user_id,
        name: formData.name,
        url: formData.url || null,
        status: formData.status,
        progress_percentage: formData.progress_percentage,
      });

      if (error) throw error;

      toast({
        title: "Website created",
        description: `Website "${formData.name}" has been created successfully.`,
      });

      setFormData({
        user_id: "",
        name: "",
        url: "",
        status: "in_progress",
        progress_percentage: 0,
      });
      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      console.error("Error creating website:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWebsite = async () => {
    if (!selectedWebsite) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("websites")
        .update({
          name: formData.name,
          url: formData.url || null,
          status: formData.status,
          progress_percentage: formData.progress_percentage,
        })
        .eq("id", selectedWebsite.id);

      if (error) throw error;

      toast({
        title: "Website updated",
        description: "Website details have been updated successfully.",
      });

      setIsEditDialogOpen(false);
      setSelectedWebsite(null);
      fetchData();
    } catch (error) {
      console.error("Error updating website:", error);
      toast({
        title: "Error",
        description: "Failed to update website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWebsite = async (website: Website) => {
    if (
      !confirm(
        `Are you sure you want to delete "${website.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("websites")
        .delete()
        .eq("id", website.id);

      if (error) throw error;

      toast({
        title: "Website deleted",
        description: `Website "${website.name}" has been deleted.`,
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting website:", error);
      toast({
        title: "Error",
        description: "Failed to delete website. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (website: Website) => {
    setSelectedWebsite(website);
    setFormData({
      user_id: website.user_id,
      name: website.name,
      url: website.url || "",
      status: website.status as
        | "active"
        | "in_progress"
        | "completed"
        | "on_hold",
      progress_percentage: website.progress_percentage,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <AdminLayout title="Websites">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Search websites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="in_progress">In Progress</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
        <select
          className="h-9 rounded-sm border border-border bg-surface px-2 text-sm"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        >
          <option value="all">All clients</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name || user.email}
            </option>
          ))}
        </select>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto gap-1.5">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Add website
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add new website</DialogTitle>
              <DialogDescription>
                Create a new website project for a client.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="user">Client *</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, user_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Website name *</Label>
                <Input
                  id="name"
                  placeholder="My Website"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as typeof formData.status,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="progress">
                  Progress: {formData.progress_percentage}%
                </Label>
                <input
                  id="progress"
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      progress_percentage: parseInt(e.target.value),
                    })
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-accent"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateWebsite}
                disabled={isSubmitting || !formData.user_id || !formData.name}
              >
                {isSubmitting ? "Creating..." : "Create website"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : filteredWebsites.length === 0 ? (
        <Card>
          <EmptyState
            icon={Globe}
            message={
              searchQuery || statusFilter !== "all" || userFilter !== "all"
                ? "No websites match your filters."
                : "No websites yet."
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredWebsites.map((website) => (
            <Card key={website.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">{website.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getUserName(website.user_id)}
                  </p>
                  {website.url && (
                    <a
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      Visit site <Eye className="h-3 w-3" strokeWidth={1.5} />
                    </a>
                  )}
                </div>
                <Badge variant={statusVariant(website.status)}>
                  {website.status.replace("_", " ")}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-mono-nums">
                    {website.progress_percentage}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${website.progress_percentage}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Last updated: {format(new Date(website.updated_at), "PP")}
                </p>
              </CardContent>
              <CardFooter className="gap-2 border-t border-border pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(website)}
                  className="flex-1 gap-1.5"
                >
                  <Edit className="h-4 w-4" strokeWidth={1.5} />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteWebsite(website)}
                  aria-label={`Delete ${website.name}`}
                >
                  <Trash2
                    className="h-4 w-4 text-destructive"
                    strokeWidth={1.5}
                  />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit website</DialogTitle>
            <DialogDescription>
              Update website information and progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Input
                value={getUserName(formData.user_id)}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Client cannot be changed
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_name">Website name</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_url">URL</Label>
              <Input
                id="edit_url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as typeof formData.status,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_progress">
                Progress: {formData.progress_percentage}%
              </Label>
              <input
                id="edit_progress"
                type="range"
                min="0"
                max="100"
                value={formData.progress_percentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    progress_percentage: parseInt(e.target.value),
                  })
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-accent"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateWebsite} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update website"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
