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
import { Users as UsersIcon, Plus, Edit, Ban, CheckCircle, Search, Mail, Eye, EyeOff, Copy, Check } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { format } from "date-fns";

type User = Tables<"users">;

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    role: "user" as "admin" | "user",
    status: "active" as "active" | "inactive" | "suspended",
    password: "",
    must_change_password: true,
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one of each type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase
    password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Special char
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Copy password to clipboard
  const copyPassword = async () => {
    if (!formData.password) return;
    try {
      await navigator.clipboard.writeText(formData.password);
      setPasswordCopied(true);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      });
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the password manually",
        variant: "destructive",
      });
    }
  };

  // Validate password strength
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

  const handleCreateUser = async () => {
    setIsSubmitting(true);

    try {
      const tempPassword = formData.password || generateRandomPassword();

      // Validate password if provided
      if (!tempPassword || tempPassword.length < 8) {
        toast({
          title: "Invalid Password",
          description: "Password must be at least 8 characters",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Use Edge Function to create user (uses service role key server-side)
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        "admin-create-user",
        {
          body: {
            email: formData.email,
            password: tempPassword,
            full_name: formData.full_name || null,
            role: formData.role,
            status: formData.status,
            must_change_password: formData.must_change_password,
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

      toast({
        title: "User created successfully! 🎉",
        description: `User ${formData.email} has been created. Temporary password: ${tempPassword}. Remember to share the credentials securely with the user.`,
      });

      // Reset form
      setFormData({
        email: "",
        full_name: "",
        role: "user",
        status: "active",
        password: "",
        must_change_password: true,
      });
      setPasswordCopied(false);
      setIsCreateDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
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
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout title="User Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#1A4D2E] border-r-transparent"></div>
            <p className="mt-4 text-[#1A4D2E] font-medium">Loading users...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Management">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A4D2E]">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90">
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Set up a new user account with admin-defined credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  placeholder="John Smith"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, password: generateRandomPassword() })}
                  >
                    Generate Password
                  </Button>
                  {formData.password && validatePassword(formData.password).isValid && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyPassword}
                    >
                      {passwordCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Password
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1 text-xs mt-2">
                    <div className={validatePassword(formData.password).minLength ? "text-green-600" : "text-gray-500"}>
                      {validatePassword(formData.password).minLength ? "✓" : "○"} At least 8 characters
                    </div>
                    <div className={validatePassword(formData.password).hasUppercase ? "text-green-600" : "text-gray-500"}>
                      {validatePassword(formData.password).hasUppercase ? "✓" : "○"} One uppercase letter
                    </div>
                    <div className={validatePassword(formData.password).hasLowercase ? "text-green-600" : "text-gray-500"}>
                      {validatePassword(formData.password).hasLowercase ? "✓" : "○"} One lowercase letter
                    </div>
                    <div className={validatePassword(formData.password).hasNumber ? "text-green-600" : "text-gray-500"}>
                      {validatePassword(formData.password).hasNumber ? "✓" : "○"} One number
                    </div>
                    <div className={validatePassword(formData.password).hasSpecial ? "text-green-600" : "text-gray-500"}>
                      {validatePassword(formData.password).hasSpecial ? "✓" : "○"} One special character (!@#$%^&*)
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as "admin" | "user" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User (Client)</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "inactive" | "suspended" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="must_change_password"
                  checked={formData.must_change_password}
                  onChange={(e) => setFormData({ ...formData, must_change_password: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-[#1A4D2E] focus:ring-[#1A4D2E]"
                />
                <Label htmlFor="must_change_password" className="text-sm font-normal cursor-pointer">
                  Require password change on first login
                </Label>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 text-lg">📋</span>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">Important: Share Credentials Securely</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      After creating this user, you must share the email and password with them through a secure channel (phone call, in-person, encrypted message). They will NOT receive an email from the system.
                    </p>
                  </div>
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({
                    email: "",
                    full_name: "",
                    role: "user",
                    status: "active",
                    password: "",
                    must_change_password: true,
                  });
                  setPasswordCopied(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleCreateUser}
                disabled={isSubmitting || !formData.email || !formData.full_name || !formData.password || !validatePassword(formData.password).isValid}
                className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 shadow-sm border border-gray-200">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "all" ? "No users match your filters" : "No users yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Created</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1A4D2E] flex items-center justify-center text-white font-medium">
                          {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{user.full_name || "No name"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{user.email}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === "active" ? "bg-green-100 text-green-800" : 
                        user.status === "suspended" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {format(new Date(user.created_at), "PP")}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          className="hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                          className={user.status === "active" ? "hover:bg-red-50" : "hover:bg-green-50"}
                        >
                          {user.status === "active" ? (
                            <Ban className="h-4 w-4 text-red-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={formData.email} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as "admin" | "user" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "inactive" | "suspended" })}
              >
                <SelectTrigger>
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
            <Button
              onClick={handleUpdateUser}
              disabled={isSubmitting}
              className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
            >
              {isSubmitting ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

