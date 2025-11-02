import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { Logo } from "../components/ui/logo";
import { useAuth } from "../contexts/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error) {
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 border border-gray-200">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A4D2E] mb-4">
              Check your email
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Link to="/login">
              <Button className="w-full bg-[#1A4D2E] hover:bg-[#1A4D2E]/90">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 border border-gray-200">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <h2 className="text-2xl font-bold text-center text-[#1A4D2E] mb-2">
          Reset your password
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

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

          <Button
            type="submit"
            className="w-full bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 text-white py-6"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-[#1A4D2E] hover:underline inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

