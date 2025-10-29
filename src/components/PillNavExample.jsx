import { useLocation } from 'react-router-dom';
import PillNav from './ui/PillNav';
import logo from '../assets/images/logo.png';

/**
 * PillNav Header Component
 * 
 * Replaces the standard navigation bar with an animated pill-style nav.
 * Matches your navigation items: Home, Services, Pricing, About, Contact
 * Styled with your dark green theme colors.
 */

export default function PillNavHeader() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <PillNav
      logo={logo}
      logoAlt="The Enclosure Logo"
      items={navItems}
      activeHref={location.pathname}
      // Customize colors to match your exact dark green brand
      baseColor="#1A4D2E"  // Your primary dark green
      pillColor="#F8FAF9"  // Your off-white background
      hoveredPillTextColor="#FFFFFF"  // White text on hover
      pillTextColor="#1A4D2E"  // Dark green text on pills
    />
  );
}

