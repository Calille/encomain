import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../ui/logo";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Shield,
  ChevronDown,
  MessageSquare,
  ArrowUpCircle,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import AISupportChat from "./AISupportChat";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Website Progress", href: "/dashboard/progress", icon: TrendingUp },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { name: "Support", href: "/dashboard/support", icon: MessageSquare },
    { name: "Upgrade", href: "/dashboard/upgrade", icon: ArrowUpCircle },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />

        <div className="fixed inset-0 flex z-40">
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <Logo />
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon
                      className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full rounded-md"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                Sign out
              </button>
            </div>
          </div>

          <div className="flex-shrink-0 w-14">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Logo />
            </div>
            <nav className="mt-8 flex-1 px-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1A4D2E]"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1">
          <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 bg-white">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-medium leading-6 text-gray-900 sm:truncate">
                {title}
              </h1>
            </div>
            <div className="mt-4 flex sm:mt-0 sm:ml-4">
              <div className="flex items-center space-x-4">
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A4D2E]">
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-[#1A4D2E] flex items-center justify-center text-white">
                        {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                        {profile?.full_name || user?.email}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500">{profile?.email || user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
        </main>
      </div>
      
      {/* AI Support Chat - Floating button appears on all dashboard pages */}
      <AISupportChat />
    </div>
  );
}
