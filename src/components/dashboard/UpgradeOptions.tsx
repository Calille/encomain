import { useState } from "react";
import { Check, Code2, Boxes, Zap, Database } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { formatPlanLabel } from "../../lib/plans";
import { sendTicketNotification } from "../../utils/emailHelpers";

// Copied from src/components/pricing.tsx to keep portal and marketing in sync
const packages = [
  {
    id: "essential" as const,
    name: "Essential",
    oneOff: "£1,749.99",
    year1: "£50/month for year 1",
    year2: "£37.50/month from year 2",
    description: "For small businesses that need a professional presence online.",
    features: [
      "Up to 5 pages",
      "Mobile-optimised responsive design",
      "Contact form with email delivery",
      "Basic on-page SEO setup",
      "Hosting included",
      "Basic database for form submissions and simple content",
      "2 rounds of revisions during build",
    ],
    featured: false,
  },
  {
    id: "professional" as const,
    name: "Professional",
    oneOff: "£2,499.99",
    year1: "£50/month for year 1",
    year2: "£37.50/month from year 2",
    description: "For businesses that need more than a brochure site.",
    features: [
      "Up to 10 pages",
      "Everything in Essential",
      "Fully custom design, no templates",
      "Blog or news section with content management",
      "Lead capture forms with CRM integration",
      "Google Business Profile setup and optimisation",
      "Intermediate database for content, users, and custom data",
      "3 rounds of revisions during build",
    ],
    featured: true,
  },
  {
    id: "signature" as const,
    name: "Signature",
    oneOff: "£3,999.99",
    year1: "£100/month for year 1",
    year2: "£75/month from year 2",
    description: "For businesses that want a full digital operation.",
    features: [
      "Unlimited pages",
      "Everything in Professional",
      "Custom web application features (booking, calculators, member areas)",
      "Third-party integrations (Stripe, Mailchimp, HubSpot, and similar)",
      "Custom automation and workflows",
      "Enterprise database for high-traffic and complex data",
      "Priority support in the monthly retainer",
      "4 rounds of revisions during build",
    ],
    featured: false,
  },
];

const bespokeOfferings = [
  {
    icon: Code2,
    title: "Custom web applications",
    description: "Purpose-built tools and experiences beyond a standard marketing site.",
  },
  {
    icon: Boxes,
    title: "SaaS products",
    description: "Product interfaces, dashboards, and platforms shaped around your users.",
  },
  {
    icon: Zap,
    title: "Integrations and automation",
    description: "Stripe, CRM, and third-party API wiring that removes manual work.",
  },
  {
    icon: Database,
    title: "Internal tools and CRM",
    description: "Admin panels, client portals, and systems tailored to how you work.",
  },
];

type EnquiryState = {
  subject: string;
  category: "upgrade" | "bespoke";
} | null;

export default function UpgradeOptions() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [enquiry, setEnquiry] = useState<EnquiryState>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPlan = profile?.current_plan ?? null;

  const openEnquiry = (subject: string, category: "upgrade" | "bespoke") => {
    setEnquiry({ subject, category });
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !enquiry) return;

    if (message.trim().length < 10) {
      toast({
        title: "Message too short",
        description: "Please add a little more context (at least 10 characters).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: enquiry.subject,
          message: message.trim(),
          category: enquiry.category,
          priority: "normal",
        })
        .select("id")
        .single();

      if (error) throw error;

      if (data?.id) {
        void sendTicketNotification({
          type: "new_ticket",
          ticketId: data.id,
          subject: enquiry.subject,
          category: enquiry.category,
          clientEmail: user.email || profile?.email || "",
          clientName: profile?.full_name || undefined,
        });
      }

      toast({
        title: "Message sent",
        description: "Message sent, we'll be in touch shortly.",
      });
      setEnquiry(null);
      setMessage("");
    } catch (error: unknown) {
      const description =
        error instanceof Error
          ? error.message
          : "Failed to send your message. Please try again.";
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="rounded-sm border border-border bg-surface px-4 py-3">
        <p className="text-sm text-muted-foreground">
          You&apos;re currently on:{" "}
          <span className="font-medium text-foreground">
            {currentPlan ? formatPlanLabel(currentPlan).toLowerCase() : "no active plan"}
          </span>
        </p>
      </div>

      <section className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Standard packages
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you need to go live and stay live. One-off build fee plus a small
            monthly retainer that covers ongoing maintenance and support.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {packages.map((pkg) => {
            const isCurrent = currentPlan === pkg.id;
            return (
              <article
                key={pkg.id}
                className={`relative flex flex-col rounded-sm border p-5 ${
                  isCurrent
                    ? "border-accent bg-accent/5"
                    : pkg.featured
                      ? "border-border bg-muted/30"
                      : "border-border bg-surface"
                }`}
              >
                {isCurrent && (
                  <Badge className="absolute -top-2.5 left-4" variant="default">
                    Your current plan
                  </Badge>
                )}
                {!isCurrent && pkg.featured && (
                  <Badge className="absolute -top-2.5 left-4" variant="secondary">
                    Most popular
                  </Badge>
                )}
                <h4 className="text-base font-semibold text-foreground">{pkg.name}</h4>
                <div className="mt-3">
                  <p className="font-mono text-2xl font-semibold tracking-tight text-foreground font-mono-nums">
                    {pkg.oneOff}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">one-off</p>
                  <p className="mt-2 text-sm text-foreground">{pkg.year1}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{pkg.year2}</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{pkg.description}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-success"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-5 w-full"
                  variant={isCurrent ? "outline" : "default"}
                  onClick={() =>
                    openEnquiry(`Upgrade request: ${pkg.name}`, "upgrade")
                  }
                >
                  Talk to us about upgrading
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Something more ambitious?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We also build custom software, SaaS applications, integrations, and internal
            tools for businesses that have outgrown a standard website. Every bespoke
            project is quoted individually based on scope.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bespokeOfferings.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-sm border border-border bg-surface p-5"
              >
                <Icon
                  className="mb-3 h-5 w-5 text-accent"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => openEnquiry("Bespoke project enquiry", "bespoke")}
        >
          Talk to us about a bespoke project
        </Button>
      </section>

      <p className="text-sm text-muted-foreground">
        Changes take effect at your next billing cycle. Get in touch and we&apos;ll walk
        you through it.
      </p>

      <Dialog
        open={Boolean(enquiry)}
        onOpenChange={(open) => {
          if (!open) {
            setEnquiry(null);
            setMessage("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Talk to us</DialogTitle>
            <DialogDescription>
              Send a short note and we&apos;ll follow up to walk through what&apos;s
              included before any changes are made.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="upgrade-subject">Subject</Label>
              <p
                id="upgrade-subject"
                className="rounded-sm border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
              >
                {enquiry?.subject}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="upgrade-message">Message</Label>
              <Textarea
                id="upgrade-message"
                placeholder="Tell us what you're looking for..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={5000}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEnquiry(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send message"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
