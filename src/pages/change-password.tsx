import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { Logo } from "../components/ui/logo";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "../hooks/use-toast";
import { supabase } from "../lib/supabase";
import { ThemeToggle } from "../components/theme-toggle";

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { updatePassword, profile, user } = useAuth();

  useEffect(() => {
    const checkPasswordChangeRequired = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("requires_password_change")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error checking password status:", error);
        return;
      }

      if (!data?.requires_password_change && !profile?.requires_password_change) {
        navigate("/app");
      }
    };

    checkPasswordChangeRequired();
  }, [user, navigate, profile]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      await updatePassword(newPassword);

      if (user) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            requires_password_change: false,
            password_changed_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating user record:", updateError);
        }
      }

      toast({
        title: "Password changed successfully",
        description: "You can now access your dashboard.",
      });

      setTimeout(() => {
        navigate("/app", { replace: true });
      }, 1000);
    } catch (err) {
      setError("Failed to change password. Please try again.");
      console.error("Password change error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-md">
        <Card className="border-border bg-surface">
          <CardHeader className="items-center space-y-4 pb-2 pt-6">
            <Logo className="[&_img]:h-12" />
            <div className="text-center">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Change password
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Set a new password for your account
              </p>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {profile?.requires_password_change && (
              <div className="mb-4 flex items-start gap-2 rounded-sm border border-warning/30 bg-warning/10 p-3">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="text-sm font-medium text-warning">
                    Password change required
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    For security reasons, you must change the temporary password provided
                    by your administrator.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Your new password"
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

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
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

              <div className="rounded-sm border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                <p className="mb-2 font-medium text-foreground">Password requirements</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Contains uppercase and lowercase letters</li>
                  <li>Contains at least one number</li>
                  <li>Contains at least one special character</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Changing password..." : "Change password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
