import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Logo } from "../components/ui/logo";
import { ThemeToggle } from "../components/theme-toggle";

/**
 * Shown after a user successfully requests account deletion.
 */
export default function AccountDeletedPage() {
  return (
    <div className="app-dot-canvas flex min-h-screen items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-12 right-0">
          <ThemeToggle />
        </div>
        <Card>
          <CardHeader className="items-center space-y-4 pb-2 pt-6">
            <Logo className="[&_img]:h-12" />
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Account deleted
            </h1>
          </CardHeader>
          <CardContent className="space-y-4 pb-6 text-center">
            <p className="text-sm text-muted-foreground">
              Your account has been deactivated. Check your email for recovery details.
              You have 30 days to restore it before personal data is permanently removed.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Return home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
