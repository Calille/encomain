import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../ui/logo";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "../../hooks/use-toast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  // Get the page they were trying to access before login
  const from = (location.state as any)?.from?.pathname || "/dashboard";

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

      // Show success message
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      // Redirect based on password change requirement
      if (requiresPasswordChange) {
        navigate("/change-password", { replace: true });
      } else {
        navigate(from, { replace: true });
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
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 border border-gray-200">
      <div className="flex justify-center mb-6">
        <Logo />
      </div>

      <h2 className="text-2xl font-bold text-center text-[#1A4D2E] mb-6">
        Log in to your account
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-sm text-[#1A4D2E] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
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
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 text-white py-4 sm:py-6 min-h-[44px]"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Contact your administrator for account access.
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          By logging in, you agree to our{" "}
          <Link
            to="/terms-of-service"
            className="text-[#1A4D2E] hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy-policy" className="text-[#1A4D2E] hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
