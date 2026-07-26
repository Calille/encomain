import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Logo } from "../components/ui/logo";
import { ThemeToggle } from "../components/theme-toggle";
import { Skeleton } from "../components/ui/skeleton";
import { supabase } from "../lib/supabase";

/**
 * Public unsubscribe confirmation.
 * Uses process-unsubscribe Edge Function (service role) because email_events RLS is admin-only.
 */
export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "done" | "error" | "missing">(
    token ? "loading" : "missing"
  );

  useEffect(() => {
    if (!token) return;

    const run = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("process-unsubscribe", {
          body: { token },
        });
        if (error || data?.error) {
          setStatus("error");
          return;
        }
        setStatus("done");
      } catch {
        setStatus("error");
      }
    };

    run();
  }, [token]);

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
              Unsubscribe
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
                This unsubscribe link is missing a token. If you received an email from us,
                please use the link in that message.
              </p>
            )}
            {status === "done" && (
              <p className="text-sm text-muted-foreground">
                You have been unsubscribed. You will not receive further emails from The Enclosure.
                If this was a mistake, please contact hello@theenclosure.co.uk.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-destructive">
                We could not process this request. Please contact hello@theenclosure.co.uk.
              </p>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Return home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
