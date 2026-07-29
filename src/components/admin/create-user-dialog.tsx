import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "../../hooks/use-toast";
import { PLAN_OPTIONS, type PlanId } from "../../lib/plans";
import {
  isPlausibleWebsiteInput,
  normaliseWebsiteUrl,
} from "../../lib/website-url";

type PlanFormValue = PlanId | "";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

function generateRandomPassword() {
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
}

function validatePassword(pwd: string) {
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
}

const emptyForm = {
  email: "",
  full_name: "",
  role: "user" as "admin" | "user",
  status: "active" as "active" | "inactive" | "suspended",
  current_plan: "" as PlanFormValue,
  password: "",
  requires_password_change: true,
  primary_website_url: "",
};

/**
 * Admin create-user dialog (was on /admin/users).
 * Calls admin-create-user Edge Function with optional primary website.
 */
export function CreateUserDialog({ open, onOpenChange, onCreated }: Props) {
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [websiteUrlError, setWebsiteUrlError] = useState<string | null>(null);

  const passwordChecks = validatePassword(formData.password);

  const resetForm = () => {
    setFormData(emptyForm);
    setPasswordCopied(false);
    setWebsiteUrlError(null);
    setShowPassword(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const copyPassword = async () => {
    if (!formData.password) return;
    try {
      await navigator.clipboard.writeText(formData.password);
      setPasswordCopied(true);
      toast({ title: "Copied", description: "Password copied to clipboard." });
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the password manually.",
        variant: "destructive",
      });
    }
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

      let primaryWebsiteUrl: string | null = null;
      const rawWebsite = formData.primary_website_url.trim();
      if (rawWebsite) {
        if (!isPlausibleWebsiteInput(rawWebsite)) {
          setWebsiteUrlError(
            "Enter a valid URL starting with http:// or https://, or a bare domain."
          );
          setIsSubmitting(false);
          return;
        }
        try {
          primaryWebsiteUrl = normaliseWebsiteUrl(rawWebsite);
          setWebsiteUrlError(null);
        } catch (err) {
          setWebsiteUrlError(
            err instanceof Error ? err.message : "Enter a valid website URL."
          );
          setIsSubmitting(false);
          return;
        }
      }

      const { data: functionData, error: functionError } =
        await supabase.functions.invoke("admin-create-user", {
          body: {
            email: formData.email,
            password: tempPassword,
            full_name: formData.full_name || null,
            role: formData.role,
            status: formData.status,
            current_plan: formData.current_plan || null,
            requires_password_change: formData.requires_password_change,
            primary_website_url: primaryWebsiteUrl,
          },
        });

      if (functionError) throw functionError;
      if (functionData?.error) throw new Error(functionData.error);
      if (!functionData?.success) {
        throw new Error("User creation failed - no success response");
      }

      if (primaryWebsiteUrl && functionData.websiteCreated) {
        toast({
          title: "Client created and website added",
          description: `User ${formData.email} has been created. A welcome email with their temporary password has been sent.`,
        });
      } else if (primaryWebsiteUrl && functionData.websiteError) {
        toast({
          title: "Client created",
          description: `Client created, but adding the website failed: ${functionData.websiteError}. Add it from the Websites tab.`,
        });
      } else {
        toast({
          title: "User created",
          description: `User ${formData.email} has been created. A welcome email with their temporary password has been sent.`,
        });
      }

      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
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
            <Label htmlFor="create_full_name">Full name</Label>
            <Input
              id="create_full_name"
              placeholder="Alex Smith"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create_email">Email</Label>
            <Input
              id="create_email"
              type="email"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create_password">Password</Label>
            <div className="relative">
              <Input
                id="create_password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter or generate password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="pr-20"
              />
              <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={copyPassword}
                  disabled={!formData.password}
                  aria-label="Copy password"
                >
                  {passwordCopied ? (
                    <Check className="h-4 w-4 text-success" strokeWidth={1.5} />
                  ) : (
                    <Copy className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setFormData({
                  ...formData,
                  password: generateRandomPassword(),
                })
              }
            >
              Generate password
            </Button>
            {formData.password && (
              <div className="space-y-0.5 text-xs">
                <div
                  className={
                    passwordChecks.minLength
                      ? "text-success"
                      : "text-muted-foreground"
                  }
                >
                  {passwordChecks.minLength ? "Met:" : "Needed:"} at least 8
                  characters
                </div>
                <div
                  className={
                    passwordChecks.hasUppercase
                      ? "text-success"
                      : "text-muted-foreground"
                  }
                >
                  {passwordChecks.hasUppercase ? "Met:" : "Needed:"} one
                  uppercase letter
                </div>
                <div
                  className={
                    passwordChecks.hasLowercase
                      ? "text-success"
                      : "text-muted-foreground"
                  }
                >
                  {passwordChecks.hasLowercase ? "Met:" : "Needed:"} one
                  lowercase letter
                </div>
                <div
                  className={
                    passwordChecks.hasNumber
                      ? "text-success"
                      : "text-muted-foreground"
                  }
                >
                  {passwordChecks.hasNumber ? "Met:" : "Needed:"} one number
                </div>
                <div
                  className={
                    passwordChecks.hasSpecial
                      ? "text-success"
                      : "text-muted-foreground"
                  }
                >
                  {passwordChecks.hasSpecial ? "Met:" : "Needed:"} one special
                  character (!@#$%^&*)
                </div>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create_role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value as "admin" | "user" })
              }
            >
              <SelectTrigger id="create_role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User (client)</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create_plan">Plan</Label>
            <Select
              value={formData.current_plan || "none"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  current_plan: (value === "none" ? "" : value) as PlanFormValue,
                })
              }
            >
              <SelectTrigger id="create_plan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAN_OPTIONS.map((opt) => (
                  <SelectItem key={opt.label} value={opt.value || "none"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create_primary_website_url">Primary website URL</Label>
            <Input
              id="create_primary_website_url"
              type="url"
              placeholder="https://example.com"
              value={formData.primary_website_url}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  primary_website_url: e.target.value,
                });
                setWebsiteUrlError(null);
              }}
              aria-invalid={!!websiteUrlError}
            />
            {websiteUrlError ? (
              <p className="text-xs text-destructive">{websiteUrlError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Optional. Adds their site straight to the client's Websites tab so
                we can preview and audit it.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create_status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as "active" | "inactive" | "suspended",
                })
              }
            >
              <SelectTrigger id="create_status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="create_requires_password_change"
                checked={formData.requires_password_change}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requires_password_change: e.target.checked,
                  })
                }
                className="mt-0.5 h-4 w-4 rounded-sm border-border text-accent focus:ring-ring"
              />
              <Label
                htmlFor="create_requires_password_change"
                className="cursor-pointer text-sm font-normal leading-snug"
              >
                Require password change on first login
              </Label>
            </div>
            <p className="pl-6 text-xs text-muted-foreground">
              Users will receive their temporary password by email and be prompted
              to set a new one on first sign in. Recommended for security.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
