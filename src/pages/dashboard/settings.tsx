import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
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
import { toast } from "../../hooks/use-toast";
import { User, Mail, Lock, Bell, Shield, Eye, EyeOff, Save } from "lucide-react";

export default function Settings() {
  const { profile, updateProfile, updatePassword } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    emailUpdates: true,
    projectMilestones: true,
    paymentReminders: true,
    marketingEmails: false,
  });
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

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
      if (newPassword !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

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
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4" strokeWidth={1.5} />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Lock className="h-4 w-4" strokeWidth={1.5} />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-4 w-4" strokeWidth={1.5} />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <div className="relative">
                      <User
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                      <Input
                        id="fullName"
                        name="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="cursor-not-allowed bg-muted pl-9"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if you need to update it.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      type="text"
                      value={profile?.role || ""}
                      disabled
                      className="cursor-not-allowed bg-muted capitalize"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Account status</Label>
                    <Input
                      type="text"
                      value={profile?.status || ""}
                      disabled
                      className="cursor-not-allowed bg-muted capitalize"
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-border pt-4">
                  <Button type="submit" disabled={isUpdatingProfile} className="gap-1.5">
                    <Save className="h-4 w-4" strokeWidth={1.5} />
                    {isUpdatingProfile ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <div className="relative">
                      <Lock
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-9 pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                        ) : (
                          <Eye className="h-4 w-4" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <div className="relative">
                      <Lock
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-9 pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                        ) : (
                          <Eye className="h-4 w-4" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-sm border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    <p className="mb-2 font-medium text-foreground">Password requirements</p>
                    <ul className="list-inside list-disc space-y-1">
                      <li>At least 8 characters long</li>
                      <li>Contains uppercase and lowercase letters</li>
                      <li>Contains at least one number</li>
                      <li>Contains at least one special character</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end border-t border-border pt-4">
                  <Button type="submit" disabled={isUpdatingPassword} className="gap-1.5">
                    <Lock className="h-4 w-4" strokeWidth={1.5} />
                    {isUpdatingPassword ? "Updating..." : "Update password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div className="flex gap-3">
                <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Two-factor authentication
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add an extra layer of security to your account. When enabled, you'll
                    be required to enter a security code in addition to your password when
                    signing in.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                Enable
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateNotifications} className="space-y-6">
                <div className="space-y-5">
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
                      <Label htmlFor="emailUpdates" className="cursor-pointer text-sm">
                        Email updates
                      </Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Receive email notifications about your website development progress.
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
                        className="cursor-pointer text-sm"
                      >
                        Project milestones
                      </Label>
                      <p className="mt-1 text-sm text-muted-foreground">
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
                        className="cursor-pointer text-sm"
                      >
                        Payment reminders
                      </Label>
                      <p className="mt-1 text-sm text-muted-foreground">
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
                      <Label htmlFor="marketingEmails" className="cursor-pointer text-sm">
                        Marketing emails
                      </Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Receive promotional emails about our services and special offers.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-border pt-4">
                  <Button
                    type="submit"
                    disabled={isUpdatingNotifications}
                    className="gap-1.5"
                  >
                    <Save className="h-4 w-4" strokeWidth={1.5} />
                    {isUpdatingNotifications ? "Saving..." : "Save preferences"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
