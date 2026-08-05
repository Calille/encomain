# PillNav

The floating glass navigation used across the marketing pages. Pill-shaped links
with GSAP hover animations, a logo chip, a trailing slot for the account control,
and a hamburger menu below 768px.

Files:

- `src/components/ui/PillNav.jsx` — component
- `src/components/ui/PillNav.css` — styles
- `src/components/header.tsx` — the site's usage

## Colours

PillNav has no colour props. It reads the marketing tokens defined in
`src/index.css`, so it follows the brand palette automatically:

| Token | Used for |
|-------|----------|
| `--marketing-navy-900` | translucent bar and mobile menu background |
| `--marketing-blue` | hover fill, borders, active pill tint |
| `--marketing-blue-bright` | active indicator and focus outline |
| `--marketing-sky` | link text and hamburger lines |

The logo sits on a light chip because the wordmark is black on transparent and
would otherwise disappear against the navy bar.

## Usage

```jsx
import { useLocation } from 'react-router-dom';
import PillNav from './ui/PillNav';
import logo from '../assets/images/logo.png';

function Header() {
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
      logoAlt="The Enclosure"
      items={navItems}
      activeHref={location.pathname}
      trailing={<LoginButton />}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | string | required | Path to logo image |
| `logoAlt` | string | `'Logo'` | Alt text for logo |
| `items` | array | required | Navigation items `[{ label, href, ariaLabel }]` |
| `activeHref` | string | - | Current route, used to mark the active pill |
| `trailing` | node | - | Rendered at the end of the bar, e.g. the account control |
| `ease` | string | `'power3.easeOut'` | GSAP easing function |
| `initialLoadAnimation` | boolean | `true` | Enable the load-in animation |
| `onMobileMenuClick` | function | - | Called when the hamburger is toggled |

The first item's `href` is also used as the logo's link target.

## Behaviour

- Fixed to the top of the viewport, and shrinks slightly once the page scrolls
  past 24px.
- Hovering a pill grows a blue circle from its bottom edge while the label
  slides up and a white copy slides in behind it.
- The active route gets a tinted pill and a glowing underline.
- Below 768px the links collapse into a hamburger menu, and the bar lays out as
  logo on the left with the trailing slot and hamburger grouped on the right.
- External links (`http://`, `https://`, `//`, `mailto:`, `tel:`, `#`) render as
  anchors; everything else renders as a react-router `Link`.
- Pills and the hamburger expose a visible focus outline for keyboard users.
