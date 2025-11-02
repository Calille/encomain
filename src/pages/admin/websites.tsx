import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { supabase } from "../../lib/supabase";
import { Tables } from "../../types/supabase";
import { Globe, Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { format } from "date-fns";

type Website = Tables<"websites">;
type User = Tables<"users">;

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

  // Form state
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

  const filteredWebsites = websites.filter(website => {
    const matchesSearch = 
      website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.url?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || website.status === statusFilter;
    const matchesUser = userFilter === "all" || website.user_id === userFilter;

    return matchesSearch && matchesStatus && matchesUser;
  });

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || user?.email || "Unknown";
  };

  const handleCreateWebsite = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("websites")
        .insert({
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

      // Reset form
      setFormData({
        user_id: "",
        name: "",
        url: "",
        status: "in_progress",
        progress_percentage: 0,
      });
      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error creating website:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create website. Please try again.",
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
    if (!confirm(`Are you sure you want to delete "${website.name}"? This action cannot be undone.`)) {
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
      status: website.status as "active" | "in_progress" | "completed" | "on_hold",
      progress_percentage: website.progress_percentage,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Website Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#1A4D2E] border-r-transparent"></div>
            <p className="mt-4 text-[#1A4D2E] font-medium">Loading websites...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Website Management">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A4D2E]">Website Management</h1>
          <p className="text-gray-600 mt-1">Manage client websites and project progress</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Website
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Website</DialogTitle>
              <DialogDescription>
                Create a new website project for a client.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user">Client *</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Website Name *</Label>
                <Input
                  id="name"
                  placeholder="My Website"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
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
              <div className="space-y-2">
                <Label htmlFor="progress">Progress: {formData.progress_percentage}%</Label>
                <input
                  id="progress"
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress_percentage}
                  onChange={(e) => setFormData({ ...formData, progress_percentage: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1A4D2E]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateWebsite}
                disabled={isSubmitting || !formData.user_id || !formData.name}
                className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
              >
                {isSubmitting ? "Creating..." : "Create Website"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 shadow-sm border border-gray-200">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search websites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]"
          >
            <option value="all">All Status</option>
            <option value="in_progress">In Progress</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]"
          >
            <option value="all">All Clients</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name || user.email}
              </option>
            ))}
          </select>
        </div>

        {/* Websites Grid */}
        {filteredWebsites.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "all" || userFilter !== "all" ? "No websites match your filters" : "No websites yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebsites.map((website) => (
              <Card key={website.id} className="p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#1A4D2E]">{website.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{getUserName(website.user_id)}</p>
                    {website.url && (
                      <a
                        href={website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        Visit site <Eye className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      website.status
                    )}`}
                  >
                    {website.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-gray-700">
                      {website.progress_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#1A4D2E] h-2.5 rounded-full"
                      style={{ width: `${website.progress_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Last updated: {format(new Date(website.updated_at), "PP")}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(website)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteWebsite(website)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Website Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Website</DialogTitle>
            <DialogDescription>
              Update website information and progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Input value={getUserName(formData.user_id)} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500">Client cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_name">Website Name</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_url">URL</Label>
              <Input
                id="edit_url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
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
            <div className="space-y-2">
              <Label htmlFor="edit_progress">Progress: {formData.progress_percentage}%</Label>
              <input
                id="edit_progress"
                type="range"
                min="0"
                max="100"
                value={formData.progress_percentage}
                onChange={(e) => setFormData({ ...formData, progress_percentage: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1A4D2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateWebsite}
              disabled={isSubmitting}
              className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
            >
              {isSubmitting ? "Updating..." : "Update Website"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

