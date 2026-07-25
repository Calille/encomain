import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { Card } from "../../components/ui/card";
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
import {
  Users as UsersIcon,
  Plus,
  Edit,
  Ban,
  CheckCircle,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { format } from "date-fns";
import { sendWelcomeEmail } from "../../utils/emailHelpers";

type User = Tables<"users">;

function statusVariant(
  status: string
): "success" | "destructive" | "secondary" {
  if (status === "active") return "success";
  if (status === "suspended") return "destructive";
  return "secondary";
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    role: "user" as "admin" | "user",
    status: "active" as "active" | "inactive" | "suspended",
    password: "",
    requires_password_change: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const generateRandomPassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const copyPassword = async () => {
    if (!formData.password) return;
    try {
      await navigator.clipboard.writeText(formData.password);
      setPasswordCopied(true);
      toast({
        title: "Copied",
        description: "Password copied to clipboard.",
      });
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the password manually.",
        variant: "destructive",
      });
    }
  };

  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*]/.test(pwd);

    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial,
    };
  };

  const resetCreateForm = () => {
    setFormData({
      email: "",
      full_name: "",
      role: "user",
      status: "active",
      password: "",
      requires_password_change: true,
    });
    setPasswordCopied(false);
  };

  const handleCreateUser = async () => {
    setIsSubmitting(true);

    try {
      const tempPassword = formData.password || generateRandomPassword();

      if (!tempPassword || tempPassword.length < 8) {
        toast({
          title: "Invalid password",
          description: "Password must be at least 8 characters.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        "admin-create-user",
        {
          body: {
            email: formData.email,
            password: tempPassword,
            full_name: formData.full_name || null,
            role: formData.role,
            status: formData.status,
            requires_password_change: formData.requires_password_change,
          },
        }
      );

      if (functionError) {
        console.error("Edge Function error:", functionError);
        throw functionError;
      }

      if (functionData?.error) {
        throw new Error(functionData.error);
      }

      if (!functionData?.success) {
        throw new Error("User creation failed - no success response");
      }

      try {
        await sendWelcomeEmail(formData.email, {
          userName: formData.full_name || formData.email.split("@")[0],
          loginUrl: "https://theenclosure.co.uk/login",
          dashboardUrl: "https://theenclosure.co.uk/dashboard",
        });
      } catch (welcomeError) {
        console.error("Welcome email failed after user creation:", welcomeError);
      }

      toast({
        title: "User created",
        description: `User ${formData.email} has been created. Temporary password: ${tempPassword}. Share the credentials securely with the user.`,
      });

      resetCreateForm();
      setIsCreateDialogOpen(false);
      fetchUsers();
    } catch (error: unknown) {
      console.error("Error creating user:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create user. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          role: formData.role,
          status: formData.status,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast({
        title: "User updated",
        description: "User details have been updated successfully.",
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";

    try {
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "User status updated",
        description: `User is now ${newStatus}.`,
      });

      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || "",
      role: user.role as "admin" | "user",
      status: user.status as "active" | "inactive" | "suspended",
      password: "",
      requires_password_change: user.requires_password_change ?? false,
    });
    setIsEditDialogOpen(true);
  };

  const passwordChecks = validatePassword(formData.password);

  return (
    <AdminLayout title="Users">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Search name or email"
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto gap-1.5">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Create user
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create new user</DialogTitle>
              <DialogDescription>
                Set up a new user account with admin-defined credentials.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateUser();
              }}
              className="grid gap-4 py-2"
            >
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  placeholder="Alex Smith"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter or generate password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData({ ...formData, password: generateRandomPassword() })
                    }
                  >
                    Generate password
                  </Button>
                  {formData.password && passwordChecks.isValid && (
                    <Button type="button" variant="outline" size="sm" onClick={copyPassword}>
                      {passwordCopied ? (
                        <>
                          <Check className="mr-1 h-4 w-4" strokeWidth={1.5} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-4 w-4" strokeWidth={1.5} />
                          Copy password
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {formData.password && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div
                      className={
                        passwordChecks.minLength ? "text-success" : "text-muted-foreground"
                      }
                    >
                      {passwordChecks.minLength ? "Met:" : "Needed:"} at least 8 characters
                    </div>
                    <div
                      className={
                        passwordChecks.hasUppercase ? "text-success" : "text-muted-foreground"
                      }
                    >
                      {passwordChecks.hasUppercase ? "Met:" : "Needed:"} one uppercase letter
                    </div>
                    <div
                      className={
                        passwordChecks.hasLowercase ? "text-success" : "text-muted-foreground"
                      }
                    >
                      {passwordChecks.hasLowercase ? "Met:" : "Needed:"} one lowercase letter
                    </div>
                    <div
                      className={
                        passwordChecks.hasNumber ? "text-success" : "text-muted-foreground"
                      }
                    >
                      {passwordChecks.hasNumber ? "Met:" : "Needed:"} one number
                    </div>
                    <div
                      className={
                        passwordChecks.hasSpecial ? "text-success" : "text-muted-foreground"
                      }
                    >
                      {passwordChecks.hasSpecial ? "Met:" : "Needed:"} one special character
                      (!@#$%^&*)
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as "admin" | "user" })
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User (client)</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as "active" | "inactive" | "suspended",
                    })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requires_password_change"
                  checked={formData.requires_password_change}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requires_password_change: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded-sm border-border text-accent focus:ring-ring"
                />
                <Label
                  htmlFor="requires_password_change"
                  className="cursor-pointer text-sm font-normal"
                >
                  Require password change on first login
                </Label>
              </div>
              <div className="rounded-sm border border-warning/30 bg-warning/10 p-3">
                <p className="text-sm font-medium text-foreground">
                  Share credentials securely
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  After creating this user, share the email and password through a secure
                  channel. A welcome email is sent when creation succeeds, but the temporary
                  password must still be shared separately.
                </p>
              </div>
            </form>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetCreateForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleCreateUser}
                disabled={
                  isSubmitting ||
                  !formData.email ||
                  !formData.full_name ||
                  !formData.password ||
                  !passwordChecks.isValid
                }
              >
                {isSubmitting ? "Creating…" : "Create user"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : filteredUsers.length === 0 ? (
        <Card>
          <EmptyState
            icon={UsersIcon}
            message={
              searchQuery || statusFilter !== "all"
                ? "No users match your filters."
                : "No users yet."
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Created</th>
                  <th className="px-3 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors-fast hover:bg-muted/40"
                  >
                    <td className="px-3 py-2.5 font-medium text-foreground">
                      {user.full_name || "Not set"}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{user.email}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={statusVariant(user.status)}>{user.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {format(new Date(user.created_at), "PP")}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(user)}
                          aria-label="Edit user"
                        >
                          <Edit className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(user)}
                          aria-label={
                            user.status === "active" ? "Deactivate user" : "Activate user"
                          }
                        >
                          {user.status === "active" ? (
                            <Ban className="h-4 w-4 text-destructive" strokeWidth={1.5} />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-success" strokeWidth={1.5} />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={formData.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_full_name">Full name</Label>
              <Input
                id="edit_full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as "admin" | "user" })
                }
              >
                <SelectTrigger id="edit_role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as "active" | "inactive" | "suspended",
                  })
                }
              >
                <SelectTrigger id="edit_status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={isSubmitting}>
              {isSubmitting ? "Updating…" : "Update user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
