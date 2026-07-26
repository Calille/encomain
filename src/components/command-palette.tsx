import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  TrendingUp,
  ArrowUpCircle,
  Users,
  Ban,
  LifeBuoy,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useAuth } from "../contexts/AuthContext";

const clientRoutes = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Website Progress", href: "/dashboard/progress", icon: TrendingUp },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Support", href: "/dashboard/support", icon: MessageSquare },
  { name: "Upgrade", href: "/dashboard/upgrade", icon: ArrowUpCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminRoutes = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Support tickets", href: "/admin/support-tickets", icon: LifeBuoy },
  { name: "Audits and Leads", href: "/admin/audits", icon: TrendingUp },
  { name: "Outreach", href: "/admin/outreach", icon: MessageSquare },
  { name: "Suppressions", href: "/admin/suppressions", icon: Ban },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to a page..." />
      <CommandList>
        <CommandEmpty>No matching pages.</CommandEmpty>
        <CommandGroup heading="Client">
          {clientRoutes.map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)} className="gap-2">
              <item.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              {item.name}
            </CommandItem>
          ))}
        </CommandGroup>
        {isAdmin && (
          <CommandGroup heading="Admin">
            {adminRoutes.map((item) => (
              <CommandItem key={item.href} onSelect={() => go(item.href)} className="gap-2">
                <item.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <Shield className="sr-only" />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
