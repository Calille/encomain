import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Logo } from "../components/ui/logo";
import { ThemeToggle } from "../components/theme-toggle";
import { Skeleton } from "../components/ui/skeleton";
import { supabase } from "../lib/supabase";

/**
 * Public recovery page for soft-deleted accounts.
 * Uses recover-account Edge Function (service role) because anonymous clients
 * cannot look up users by recovery_token under RLS.
 */
export default function RecoverAccountPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<
    "loading" | "ready" | "restoring" | "done" | "invalid" | "missing"
  >(token ? "loading" : "missing");
  const [email, setEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const run = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("recover-account", {
          body: { token, action: "preview" },
        });
        if (error || data?.error || data?.valid === false) {
          setErrorMessage(
            data?.error ||
              "This recovery link is not valid or has expired. If you need help, contact hello@theenclosure.co.uk."
          );
          setStatus("invalid");
          return;
        }
        setEmail(data.email || null);
        setStatus("ready");
      } catch {
        setErrorMessage(
          "This recovery link is not valid or has expired. If you need help, contact hello@theenclosure.co.uk."
        );
        setStatus("invalid");
      }
    };

    run();
  }, [token]);

  const handleRestore = async () => {
    if (!token) return;
    setStatus("restoring");
    try {
      const { data, error } = await supabase.functions.invoke("recover-account", {
        body: { token, action: "restore" },
      });
      if (error || data?.error || !data?.success) {
        setErrorMessage(
          data?.error ||
            "This recovery link is not valid or has expired. If you need help, contact hello@theenclosure.co.uk."
        );
        setStatus("invalid");
        return;
      }
      setStatus("done");
    } catch {
      setErrorMessage(
        "This recovery link is not valid or has expired. If you need help, contact hello@theenclosure.co.uk."
      );
      setStatus("invalid");
    }
  };

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
              Recover account
            </h1>
          </CardHeader>
          <CardContent className="space-y-4 pb-6 text-center">
            {status === "loading" && (
              <div className="space-y-2">
                <Skeleton className="mx-auto h-4 w-3/4" />
                <Skeleton className="mx-auto h-4 w-1/2" />
              </div>
            )}
            {status === "missing" && (
              <p className="text-sm text-muted-foreground">
                This recovery link is missing a token. Please use the link from your
                deletion confirmation email.
              </p>
            )}
            {(status === "ready" || status === "restoring") && (
              <>
                <p className="text-sm text-muted-foreground">
                  Recover {email || "your account"}? Your account will be reactivated
                  immediately.
                </p>
                <Button
                  className="w-full"
                  onClick={handleRestore}
                  disabled={status === "restoring"}
                >
                  {status === "restoring" ? "Restoring..." : "Confirm recovery"}
                </Button>
              </>
            )}
            {status === "done" && (
              <p className="text-sm text-muted-foreground">
                Your account is active again. You can sign in as normal.
              </p>
            )}
            {status === "invalid" && (
              <p className="text-sm text-destructive">
                {errorMessage ||
                  "This recovery link is not valid or has expired. If you need help, contact hello@theenclosure.co.uk."}
              </p>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to={status === "done" ? "/login" : "/"}>
                {status === "done" ? "Sign in" : "Return home"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
