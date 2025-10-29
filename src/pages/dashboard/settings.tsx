import { useState } from "react";
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
import { User, Mail, Lock, Bell, Shield } from "lucide-react";

export default function Settings() {
  const [profileForm, setProfileForm] = useState({
    name: localStorage.getItem("user_name") || "John Doe",
    email: localStorage.getItem("user_email") || "hello@theenclosure.co.uk",
    company: "Acme Inc.",
    phone: "+1 (555) 123-4567",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailUpdates: true,
    projectMilestones: true,
    paymentReminders: true,
    marketingEmails: false,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to localStorage for demo purposes
    localStorage.setItem("user_name", profileForm.name);
    localStorage.setItem("user_email", profileForm.email);
    alert("Profile updated successfully!");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    // In a real app, you would send this to your API
    alert("Password updated successfully!");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to your API
    alert("Notification preferences updated successfully!");
  };

  return (
    <DashboardLayout title="Account Settings">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
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
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Personal Information
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
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
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name (Optional)</Label>
                  <Input
                    id="company"
                    name="company"
                    value={profileForm.company}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Change Password
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="pl-10"
                      required
                    />
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
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-[#1A4D2E] mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  Two-Factor Authentication
                </h2>
              </div>
              <Button variant="outline">Enable</Button>
            </div>

            <p className="text-gray-600">
              Add an extra layer of security to your account by enabling
              two-factor authentication. When enabled, you'll be required to
              enter a security code in addition to your password when signing
              in.
            </p>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Notification Preferences
            </h2>

            <form onSubmit={handleNotificationSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="emailUpdates"
                      name="emailUpdates"
                      type="checkbox"
                      checked={notificationSettings.emailUpdates}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#1A4D2E] focus:ring-[#1A4D2E]"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="emailUpdates"
                      className="font-medium text-gray-700"
                    >
                      Email Updates
                    </label>
                    <p className="text-gray-500">
                      Receive email notifications about your website development
                      progress.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="projectMilestones"
                      name="projectMilestones"
                      type="checkbox"
                      checked={notificationSettings.projectMilestones}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#1A4D2E] focus:ring-[#1A4D2E]"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="projectMilestones"
                      className="font-medium text-gray-700"
                    >
                      Project Milestones
                    </label>
                    <p className="text-gray-500">
                      Get notified when your project reaches important
                      milestones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="paymentReminders"
                      name="paymentReminders"
                      type="checkbox"
                      checked={notificationSettings.paymentReminders}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#1A4D2E] focus:ring-[#1A4D2E]"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="paymentReminders"
                      className="font-medium text-gray-700"
                    >
                      Payment Reminders
                    </label>
                    <p className="text-gray-500">
                      Receive reminders about upcoming or overdue payments.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="marketingEmails"
                      name="marketingEmails"
                      type="checkbox"
                      checked={notificationSettings.marketingEmails}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#1A4D2E] focus:ring-[#1A4D2E]"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="marketingEmails"
                      className="font-medium text-gray-700"
                    >
                      Marketing Emails
                    </label>
                    <p className="text-gray-500">
                      Receive promotional emails about our services and special
                      offers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
                >
                  Save Preferences
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
