import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  ChevronDown,
  MessageSquare,
  ArrowUpCircle,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Logo } from "../ui/logo";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeToggle } from "../theme-toggle";
import { CommandPalette } from "../command-palette";
import { isViewingAsClient, setViewAsClient } from "../auth/ProtectedRoute";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import AISupportChat from "./AISupportChat";

type NavIcon = React.ComponentType<{
  className?: string;
  strokeWidth?: number | string;
}>;

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  /** Optional nav override for admin shell */
  navigation?: { name: string; href: string; icon: NavIcon }[];
  showAdminToggle?: boolean;
}

const defaultClientNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Website Progress", href: "/dashboard/progress", icon: TrendingUp },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Support", href: "/dashboard/support", icon: MessageSquare },
  { name: "Upgrade", href: "/dashboard/upgrade", icon: ArrowUpCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardLayout({
  children,
  title,
  navigation = defaultClientNav,
  showAdminToggle = false,
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="mt-6 flex-1 space-y-0.5 px-2">
      {navigation.map((item) => {
        const active =
          location.pathname === item.href ||
          (item.href !== "/dashboard" &&
            item.href !== "/admin/dashboard" &&
            location.pathname.startsWith(item.href));
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors-fast",
              active
                ? "bg-[hsl(var(--sidebar-active))] text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent" />
            )}
            <item.icon
              className={cn(
                "h-[18px] w-[18px]",
                active ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
              )}
              strokeWidth={1.5}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <CommandPalette />

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", isMobileMenuOpen ? "block" : "hidden")}>
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="relative flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
          <div className="flex items-center justify-between px-4 py-4">
            <Logo className="[&_img]:h-9" />
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Button>
          </div>
          <NavLinks onNavigate={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <Logo className="[&_img]:h-9" />
        </div>
        <NavLinks />
        <div className="mt-auto border-t border-sidebar-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors-fast hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface/75 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Button>
            <h1 className="text-md font-semibold tracking-tight text-foreground">{title}</h1>
          </div>

          <div className="flex items-center gap-1.5">
            {showAdminToggle && isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="hidden gap-1.5 sm:inline-flex"
                onClick={() => {
                  setViewAsClient(true);
                  navigate("/dashboard");
                }}
              >
                <Eye className="h-4 w-4" strokeWidth={1.5} />
                View as client
              </Button>
            )}
            {!showAdminToggle && isAdmin && isViewingAsClient() && (
              <Button
                variant="outline"
                size="sm"
                className="hidden gap-1.5 sm:inline-flex"
                onClick={() => {
                  setViewAsClient(false);
                  navigate("/admin/dashboard");
                }}
              >
                <Shield className="h-4 w-4" strokeWidth={1.5} />
                Back to admin
              </Button>
            )}
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors-fast hover:bg-muted">
                  <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent/15 text-xs font-semibold text-accent">
                    {profile?.full_name?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase() || (
                        <User className="h-4 w-4" strokeWidth={1.5} />
                      )}
                  </div>
                  <span className="hidden max-w-[140px] truncate text-foreground sm:block">
                    {profile?.full_name || user?.email}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email || user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    if (isAdmin) {
                      setViewAsClient(true);
                    }
                    navigate("/dashboard");
                  }}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Client dashboard
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setViewAsClient(false);
                      navigate("/admin/dashboard");
                    }}
                  >
                    <Shield className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    Admin dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="app-dot-canvas min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <AISupportChat />
    </div>
  );
}
