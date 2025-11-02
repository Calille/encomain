import { useLocation, Link } from 'react-router-dom';
import PillNav from './ui/PillNav';
import logo from '../assets/images/logo.png';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, LogOut, Settings, LayoutDashboard, Shield } from 'lucide-react';

/**
 * Header Component using PillNav with Account Dropdown
 */

export default function Header() {
  const location = useLocation();
  const { user, profile, signOut, isAdmin } = useAuth();

  const navigation = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <div className="relative">
      <PillNav
        logo={logo}
        logoAlt="The Enclosure Logo"
        items={navigation}
        activeHref={location.pathname}
        baseColor="#1A4D2E"
        pillColor="#F8FAF9"
        hoveredPillTextColor="#FFFFFF"
        pillTextColor="#1A4D2E"
      />
      
      {/* Account Dropdown - positioned in top left */}
      <div className="fixed top-4 left-4 z-[9999]">
        {user && profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-[#1A4D2E]">
                <div className="w-8 h-8 rounded-full bg-[#1A4D2E] flex items-center justify-center text-white font-medium">
                  {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[#1A4D2E] hidden sm:inline">
                  {profile.full_name || 'Account'}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500">{profile.email}</p>
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
                onClick={() => signOut()}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 bg-[#1A4D2E] text-white rounded-full shadow-md hover:shadow-lg transition-all hover:bg-[#1A4D2E]/90"
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}

