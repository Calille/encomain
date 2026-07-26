import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { MetricCard } from "../ui/metric-card";
import { EmptyState } from "../ui/empty-state";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "../../hooks/use-toast";
import { Gift, Send, Users, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { Tables } from "../../types/supabase";

type Referral = Tables<"referrals">;

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline";
    icon: typeof Clock;
  }
> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  contacted: { label: "Contacted", variant: "default", icon: Users },
  converted: { label: "Converted", variant: "success", icon: CheckCircle2 },
  credited: { label: "Credited", variant: "success", icon: Gift },
  expired: { label: "Expired", variant: "destructive", icon: Clock },
};

export default function ReferralProgram() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [referredEmail, setReferredEmail] = useState("");
  const [referredName, setReferredName] = useState("");

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();

    const channel = supabase
      .channel("referrals_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "referrals",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchReferrals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(referredEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("referrals").insert({
        user_id: user?.id,
        referred_email: referredEmail.toLowerCase().trim(),
        referred_name: referredName.trim() || null,
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("You have already referred this email address.");
        }
        throw error;
      }

      toast({
        title: "Referral sent",
        description:
          "We'll notify you when your friend becomes a client and you earn £250 credit.",
      });

      setReferredEmail("");
      setReferredName("");
      fetchReferrals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalEarned = referrals
    .filter((r) => r.status === "credited")
    .reduce((sum, r) => sum + Number(r.reward_amount || 250), 0);

  const pendingRewards = referrals.filter((r) => r.status === "converted").length * 250;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <CardTitle>Refer a friend, earn £250 credit</CardTitle>
        </div>
        <CardDescription>
          Invite friends who need a website. When they sign up and pay their deposit,
          you'll receive £250 credit toward your next project or monthly plan.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard label="Total referrals" value={referrals.length} icon={Users} />
          <MetricCard
            label="Pending rewards"
            value={pendingRewards}
            prefix="£"
            icon={Clock}
          />
          <MetricCard label="Total earned" value={totalEarned} prefix="£" icon={Gift} />
        </div>

        <div className="rounded-sm border border-border bg-muted/40 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Send className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-foreground">Send an invitation</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referred_name">Friend's name (optional)</Label>
              <Input
                id="referred_name"
                placeholder="John Smith"
                value={referredName}
                onChange={(e) => setReferredName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referred_email">Friend's email *</Label>
              <Input
                id="referred_email"
                type="email"
                placeholder="friend@example.com"
                value={referredEmail}
                onChange={(e) => setReferredEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full gap-1.5">
              <Send className="h-4 w-4" strokeWidth={1.5} />
              {isSubmitting ? "Sending..." : "Send invitation"}
            </Button>
          </form>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Your referrals</h3>
          {referrals.length === 0 ? (
            <EmptyState
              icon={Users}
              message="No referrals yet. Invite a friend to get started."
              className="py-10"
            />
          ) : (
            <div className="space-y-2">
              {referrals.map((referral) => {
                const config =
                  statusConfig[referral.status as keyof typeof statusConfig] || {
                    label: referral.status,
                    variant: "secondary" as const,
                    icon: Clock,
                  };
                const StatusIcon = config.icon;
                return (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between gap-3 rounded-sm border border-border px-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {referral.referred_name || referral.referred_email}
                      </p>
                      {referral.referred_name && (
                        <p className="text-sm text-muted-foreground truncate">
                          {referral.referred_email}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Sent {format(new Date(referral.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant={config.variant} className="gap-1 shrink-0">
                      <StatusIcon className="h-3 w-3" strokeWidth={1.5} />
                      {config.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
