# 🌿 PillNav Component - Dark Green Theme

A beautiful, animated navigation component with pill-shaped buttons and smooth GSAP animations, styled in your dark green brand colors.

## ✅ Installation Complete

GSAP has been installed and the component files are ready to use:
- `src/components/ui/PillNav.jsx` - Main component
- `src/components/ui/PillNav.css` - Styles
- `src/components/PillNavExample.jsx` - Usage example

## 🎨 Default Colors (Dark Green Theme)

- **Base Color**: `#0d3b2e` (deep forest green) - navbar background
- **Pill Color**: `#e8f5e9` (light mint/cream) - button backgrounds
- **Hover Text**: `#e8f5e9` (light cream) - text on hover
- **Pill Text**: `#0d3b2e` (dark green) - default button text

## 🚀 How to Use

### Option 1: Use the Example Component

Import and use the pre-configured example:

```jsx
import PillNavExample from './components/PillNavExample';

function App() {
  return (
    <div>
      <PillNavExample />
      {/* Your content */}
    </div>
  );
}
```

### Option 2: Custom Implementation

```jsx
import { useLocation } from 'react-router-dom';
import PillNav from './components/ui/PillNav';
import logo from './assets/images/logo.png';

function YourComponent() {
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
      logoAlt="Your Logo"
      items={navItems}
      activeHref={location.pathname}
    />
  );
}
```

### Option 3: Match Your Exact Brand Colors

Customize to perfectly match your redesigned color scheme:

```jsx
<PillNav
  logo={logo}
  logoAlt="The Enclosure"
  items={navItems}
  activeHref={location.pathname}
  baseColor="#1A4D2E"        // Your primary dark green
  pillColor="#F8FAF9"        // Your off-white
  hoveredPillTextColor="#FFFFFF"  // White on hover
  pillTextColor="#1A4D2E"    // Dark green text
/>
```

## 🎯 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | string | required | Path to logo image |
| `logoAlt` | string | `'Logo'` | Alt text for logo |
| `items` | array | required | Navigation items `[{ label, href }]` |
| `activeHref` | string | - | Current active route |
| `baseColor` | string | `'#0d3b2e'` | Dark green navbar background |
| `pillColor` | string | `'#e8f5e9'` | Light button background |
| `hoveredPillTextColor` | string | `'#e8f5e9'` | Text color on hover |
| `pillTextColor` | string | `baseColor` | Default button text color |
| `ease` | string | `'power3.easeOut'` | GSAP easing function |
| `initialLoadAnimation` | boolean | `true` | Enable load animation |
| `onMobileMenuClick` | function | - | Mobile menu callback |

## ✨ Features

- 🎭 **Smooth GSAP animations** - Buttery smooth pill hover effects
- 📱 **Fully responsive** - Works on all screen sizes
- 🔄 **Logo rotation** - Logo spins on hover
- 🎨 **Customizable colors** - Match any brand
- 🌙 **Dark green theme** - Pre-configured for your brand
- ♿ **Accessible** - Proper ARIA labels and keyboard navigation
- 📍 **Active state indicator** - Shows current page
- 🍔 **Mobile hamburger menu** - Smooth slide-down menu

## 🔄 Replace Your Current Header

To replace your existing header with PillNav:

1. Open a page component (e.g., `src/components/home.tsx`)
2. Replace the `<Header />` import and usage with:

```jsx
import PillNavExample from './PillNavExample';

export default function Home() {
  return (
    <div>
      <PillNavExample />
      {/* Rest of your content */}
    </div>
  );
}
```

## 🎨 Color Matching Guide

Your website's green color palette:
- Primary Dark Green: `#1A4D2E`
- Forest Green: `#2D5F3F`
- Sage Green: `#7FA99B`
- Off-White: `#F8FAF9`
- Charcoal: `#1A1A1A`

Suggested PillNav configurations:

**Option A - Deep Green (Default)**
```jsx
baseColor="#0d3b2e"
pillColor="#e8f5e9"
```

**Option B - Your Primary Green**
```jsx
baseColor="#1A4D2E"
pillColor="#F8FAF9"
```

**Option C - Forest Green**
```jsx
baseColor="#2D5F3F"
pillColor="#F8FAF9"
hoveredPillTextColor="#FFFFFF"
```

## 📝 Notes

- The component uses `react-router-dom` for internal navigation
- External links (http://, mailto:, tel:) are automatically handled
- The logo rotates 360° on hover for a nice interactive effect
- Mobile menu has smooth GSAP animations
- Active route gets a small indicator dot below the pill

## 🎥 Animation Details

- **Hover Effect**: Circular expansion from bottom with smooth easing
- **Text Animation**: Label slides up while hover text fades in
- **Logo**: 360° rotation on mouseenter
- **Mobile Menu**: Fade and slide animation with hamburger morph
- **Load Animation**: Logo scales in, nav items reveal left-to-right

Enjoy your new animated navigation! 🌿✨

