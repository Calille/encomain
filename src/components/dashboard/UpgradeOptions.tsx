import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import { ArrowUpCircle, Check, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface PricingTier {
  id: "essential" | "growth" | "ultimate";
  name: string;
  upfrontCost: number;
  monthlyCost: number;
  features: string[];
  popular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: "essential",
    name: "Essential",
    upfrontCost: 1997,
    monthlyCost: 79,
    features: [
      "5-page professional website",
      "Mobile-responsive design",
      "Basic SEO setup",
      "Contact form integration",
      "Monthly maintenance & updates",
      "24/7 technical support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    upfrontCost: 2997,
    monthlyCost: 129,
    popular: true,
    features: [
      "Everything in Essential",
      "Up to 10 pages",
      "Advanced SEO optimization",
      "Blog setup with CMS",
      "Analytics & reporting",
      "Social media integration",
      "Priority support",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    upfrontCost: 4997,
    monthlyCost: 199,
    features: [
      "Everything in Growth",
      "Unlimited pages",
      "E-commerce functionality",
      "Custom integrations",
      "Advanced animations",
      "Dedicated account manager",
      "White-glove service",
    ],
  },
];

export default function UpgradeOptions() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Get current plan from user profile
  const currentPlan = (profile?.current_plan as "essential" | "growth" | "ultimate") || "essential";

  const handleUpgrade = async (planId: "essential" | "growth" | "ultimate") => {
    setIsUpgrading(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          current_plan: planId,
          plan_started_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Upgrade Request Received!",
        description: "Our team will contact you within 24 hours to finalize your upgrade and discuss next steps.",
      });

      // TODO: Redirect to checkout or billing page
      // window.location.href = `/checkout?plan=${planId}`;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit upgrade request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const tierIndex = pricingTiers.findIndex((tier) => tier.id === currentPlan);
  const availableUpgrades = pricingTiers.slice(tierIndex + 1);

  if (availableUpgrades.length === 0) {
    return (
      <Card className="p-6 shadow-sm border border-gray-200">
        <div className="text-center py-12">
          <Zap className="h-16 w-16 text-[#1A4D2E] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A4D2E] mb-2">
            You're on the Ultimate Plan!
          </h3>
          <p className="text-gray-600">
            You have access to all our premium features. Thank you for being a valued client! 🎉
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpCircle className="h-6 w-6 text-[#1A4D2E]" />
          <CardTitle className="text-xl font-bold text-[#1A4D2E]">
            Upgrade Your Plan
          </CardTitle>
        </div>
        <CardDescription>
          Unlock more features and take your website to the next level
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableUpgrades.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full ${tier.popular ? "border-2 border-[#1A4D2E]" : ""}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#1A4D2E] text-white px-4 py-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-[#1A4D2E] mb-2">
                    {tier.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-[#1A4D2E]">
                      £{tier.upfrontCost.toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-2">upfront</span>
                  </div>
                  <p className="text-sm text-gray-600">then £{tier.monthlyCost}/month</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={isUpgrading}
                    className={`w-full ${
                      tier.popular
                        ? "bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {isUpgrading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Upgrade to {tier.name}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Includes full redesign if required • Immediate access to all features
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Note:</strong> All upgrades include a comprehensive review of your current
              site and implementation of new features within 2 weeks.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

