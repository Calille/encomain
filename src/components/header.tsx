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
 *
 * The account control is passed into the nav as its trailing slot rather than
 * being positioned separately, which is what used to make it collide with the
 * logo and hamburger on narrow screens.
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

  const accountControl =
    user && profile ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-11 items-center gap-2 rounded-full border border-marketing-blue/25 bg-marketing-navy-900/70 px-2.5 text-white backdrop-blur transition-colors hover:border-marketing-blue/60 hover:bg-marketing-navy-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketing-blue-bright sm:px-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-marketing-blue text-sm font-semibold text-white">
              {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
            </span>
            <span className="hidden max-w-[9rem] truncate text-sm font-medium text-marketing-sky sm:inline">
              {profile.full_name || 'Account'}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
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
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <Link
        to="/login"
        className="flex h-11 items-center gap-2 rounded-full border border-marketing-blue/25 bg-marketing-navy-900/70 px-3.5 text-marketing-sky backdrop-blur transition-colors hover:border-marketing-blue/60 hover:bg-marketing-blue/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketing-blue-bright"
      >
        <User className="h-4 w-4 flex-shrink-0" />
        <span className="hidden text-sm font-semibold sm:inline">Login</span>
      </Link>
    );

  return (
    <PillNav
      logo={logo}
      logoAlt="The Enclosure Logo"
      items={navigation}
      activeHref={location.pathname}
      trailing={accountControl}
    />
  );
}
