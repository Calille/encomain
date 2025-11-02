import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import { Loader2, Gift, Send, Users, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Tables } from "../../types/supabase";

type Referral = Tables<"referrals">;

const statusConfig = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-800", icon: Clock },
  contacted: { label: "Contacted", color: "bg-blue-100 text-blue-800", icon: Users },
  converted: { label: "Converted", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  credited: { label: "Credited", color: "bg-purple-100 text-purple-800", icon: Gift },
  expired: { label: "Expired", color: "bg-red-100 text-red-800", icon: Clock },
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(referredEmail)) {
      toast({
        title: "Invalid Email",
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
        title: "Referral Sent! 🎉",
        description: "We'll notify you when your friend becomes a client and you earn £250 credit.",
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
      <Card className="p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1A4D2E] border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600">Loading referral program...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Gift className="h-6 w-6 text-[#1A4D2E]" />
          <CardTitle className="text-xl font-bold text-[#1A4D2E]">
            Refer a Friend – Earn £250 Credit
          </CardTitle>
        </div>
        <CardDescription>
          Invite friends who need a website. When they sign up and pay their deposit, you'll
          receive £250 credit toward your next project or monthly plan.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-gray-600" />
              <p className="text-sm font-medium text-gray-500">Total Referrals</p>
            </div>
            <p className="text-2xl font-bold text-[#1A4D2E]">{referrals.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-50 p-4 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-700">Pending Rewards</p>
            </div>
            <p className="text-2xl font-bold text-yellow-700">£{pendingRewards}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-green-50 p-4 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-1">
              <Gift className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-700">Total Earned</p>
            </div>
            <p className="text-2xl font-bold text-green-700">£{totalEarned}</p>
          </motion.div>
        </div>

        {/* Referral Form */}
        <Card className="bg-gradient-to-r from-[#1A4D2E] to-[#2D5F3F] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Send className="h-5 w-5" />
              Send an Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referred_name" className="text-white">
                  Friend's Name (Optional)
                </Label>
                <Input
                  id="referred_name"
                  placeholder="John Smith"
                  value={referredName}
                  onChange={(e) => setReferredName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referred_email" className="text-white">
                  Friend's Email *
                </Label>
                <Input
                  id="referred_email"
                  type="email"
                  placeholder="friend@example.com"
                  value={referredEmail}
                  onChange={(e) => setReferredEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-[#1A4D2E] hover:bg-white/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Referral List */}
        {referrals.length > 0 && (
          <div>
            <h3 className="font-semibold text-[#1A4D2E] mb-4">Your Referrals</h3>
            <div className="space-y-3">
              {referrals.map((referral) => {
                const StatusIcon = statusConfig[referral.status as keyof typeof statusConfig]?.icon || Clock;
                return (
                  <motion.div
                    key={referral.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {referral.referred_name || referral.referred_email}
                      </p>
                      {referral.referred_name && (
                        <p className="text-sm text-gray-600">{referral.referred_email}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Sent {format(new Date(referral.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge
                      className={`${statusConfig[referral.status as keyof typeof statusConfig]?.color || "bg-gray-100 text-gray-800"}`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[referral.status as keyof typeof statusConfig]?.label || referral.status}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

