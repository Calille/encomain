import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Logo } from "../ui/logo";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "../../hooks/use-toast";
import { ThemeToggle } from "../theme-toggle";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn(email, password, rememberMe);
      const { error: signInError, requiresPasswordChange } = result;

      if (signInError) {
        setError(signInError.message || "Invalid email or password");
        toast({
          title: "Login failed",
          description: signInError.message || "Invalid email or password",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Signed in",
        description: "You have successfully logged in.",
      });

      if (requiresPasswordChange) {
        navigate("/change-password", { replace: true });
      } else {
        // Role-aware landing waits for profile, then routes admin vs client
        navigate("/app", { replace: true });
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", err);
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -top-12 right-0">
        <ThemeToggle />
      </div>
      <Card className="border-border bg-surface">
        <CardHeader className="items-center space-y-4 pb-2 pt-6">
          <Logo className="[&_img]:h-12" />
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Log in to your account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Client progress portal
            </p>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          {error && (
            <div className="mb-4 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                Remember me
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Log in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Contact your administrator for account access.
          </p>

          <p className="mt-4 border-t border-border pt-4 text-center text-xs text-muted-foreground">
            By logging in, you agree to our{" "}
            <Link to="/terms-of-service" className="text-accent hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
