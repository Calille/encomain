import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { EmptyState } from "../ui/empty-state";
import { useToast } from "../../hooks/use-toast";
import { ArrowUpCircle, Check, Sparkles, Zap } from "lucide-react";

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

  const currentPlan =
    (profile?.current_plan as "essential" | "growth" | "ultimate") || "essential";

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
        title: "Upgrade request received",
        description:
          "Our team will contact you within 24 hours to finalise your upgrade and discuss next steps.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to submit upgrade request. Please try again.",
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
      <Card>
        <EmptyState
          icon={Zap}
          message="You're on the Ultimate plan. You have access to all premium features."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {availableUpgrades.map((tier) => (
          <Card
            key={tier.id}
            className={tier.popular ? "border-accent" : undefined}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-3">
                    <span className="font-mono text-2xl font-semibold tracking-tight text-foreground font-mono-nums">
                      £{tier.upfrontCost.toLocaleString("en-GB")}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">upfront</span>
                  </div>
                  <CardDescription className="mt-1">
                    then £{tier.monthlyCost}/month
                  </CardDescription>
                </div>
                {tier.popular && (
                  <Badge className="gap-1">
                    <Sparkles className="h-3 w-3" strokeWidth={1.5} />
                    Popular
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-success"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(tier.id)}
                disabled={isUpgrading}
                variant={tier.popular ? "default" : "outline"}
                className="w-full gap-1.5"
              >
                <ArrowUpCircle className="h-4 w-4" strokeWidth={1.5} />
                {isUpgrading ? "Processing..." : `Upgrade to ${tier.name}`}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Includes full redesign if required. Immediate access to all features.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-sm border border-accent/20 bg-accent/5 p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Note:</span> All upgrades
          include a comprehensive review of your current site and implementation of new
          features within 2 weeks.
        </p>
      </div>
    </div>
  );
}
