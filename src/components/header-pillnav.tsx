import { useLocation } from 'react-router-dom';
import PillNav from './ui/PillNav';
import logo from '../assets/images/logo.png';

/**
 * Header Component using PillNav
 * 
 * This replaces the standard Header with the animated pill navigation.
 * Matches your exact navigation: Home, Services, Pricing, About, Contact
 */

export default function Header() {
  const location = useLocation();

  const navigation = [
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
      items={navigation}
      activeHref={location.pathname}
      baseColor="#1A4D2E"              // Your primary dark green
      pillColor="#F8FAF9"              // Your off-white background
      hoveredPillTextColor="#FFFFFF"  // White text on hover
      pillTextColor="#1A4D2E"          // Dark green text
    />
  );
}

