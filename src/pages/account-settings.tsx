import { useState } from "react";
import { DashboardLayout } from "../components/dashboard/dashboard-layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "../hooks/use-toast";
import { User, Lock, Eye, EyeOff, Save } from "lucide-react";

export default function AccountSettings() {
  const { profile, updateProfile, updatePassword } = useAuth();
  
  // Profile form state
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      await updateProfile({
        full_name: fullName,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);

    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      // Validate password strength
      const validationError = validatePassword(newPassword);
      if (validationError) {
        toast({
          title: "Error",
          description: validationError,
          variant: "destructive",
        });
        return;
      }

      await updatePassword(newPassword);

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <DashboardLayout title="Account Settings">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A4D2E]">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and security</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6 shadow-sm border border-gray-200">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed. Contact support if you need to update it.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      type="text"
                      value={profile?.role || ""}
                      disabled
                      className="bg-gray-50 cursor-not-allowed capitalize"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <Input
                      type="text"
                      value={profile?.status || ""}
                      disabled
                      className="bg-gray-50 cursor-not-allowed capitalize"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1A4D2E] mb-2">Change Password</h3>
                <p className="text-sm text-gray-600">
                  Update your password to keep your account secure.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                    <p className="font-medium mb-2">Password requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>At least 8 characters long</li>
                      <li>Contains uppercase and lowercase letters</li>
                      <li>Contains at least one number</li>
                      <li>Contains at least one special character</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

