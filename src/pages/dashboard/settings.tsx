import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Checkbox } from "../../components/ui/checkbox";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { toast } from "../../hooks/use-toast";
import { User, Mail, Lock, Bell, Shield, Eye, EyeOff, Save } from "lucide-react";

export default function Settings() {
  const { profile, updateProfile, updatePassword } = useAuth();
  
  // Profile form state
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailUpdates: true,
    projectMilestones: true,
    paymentReminders: true,
    marketingEmails: false,
  });
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  // Update form when profile changes
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

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
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
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

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingNotifications(true);

    try {
      // In a real app, you would save this to the database
      // For now, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error: any) {
      console.error("Error updating notifications:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  return (
    <DashboardLayout title="Account Settings">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-[#1A4D2E] mb-6">
              Personal Information
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="pl-10 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="flex justify-end pt-4 border-t border-gray-200">
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
          <Card className="p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-[#1A4D2E] mb-6">
              Change Password
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
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
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
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

              <div className="flex justify-end pt-4 border-t border-gray-200">
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

          <Card className="p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-[#1A4D2E] mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Two-Factor Authentication
                </h2>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>

            <p className="text-gray-600 text-sm">
              Add an extra layer of security to your account by enabling
              two-factor authentication. When enabled, you'll be required to
              enter a security code in addition to your password when signing in.
            </p>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-[#1A4D2E] mb-6">
              Notification Preferences
            </h2>

            <form onSubmit={handleUpdateNotifications} className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="emailUpdates"
                    checked={notificationSettings.emailUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailUpdates: checked as boolean,
                      })
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="emailUpdates"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Email Updates
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Receive email notifications about your website development
                      progress.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="projectMilestones"
                    checked={notificationSettings.projectMilestones}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        projectMilestones: checked as boolean,
                      })
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="projectMilestones"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Project Milestones
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Get notified when your project reaches important milestones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="paymentReminders"
                    checked={notificationSettings.paymentReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        paymentReminders: checked as boolean,
                      })
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="paymentReminders"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Payment Reminders
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Receive reminders about upcoming or overdue payments.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketingEmails"
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        marketingEmails: checked as boolean,
                      })
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="marketingEmails"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Marketing Emails
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Receive promotional emails about our services and special
                      offers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isUpdatingNotifications}
                  className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
                >
                  {isUpdatingNotifications ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
