# Marketing Site Inventory & Design Analysis — The Enclosure

**Date:** 2026-07-25  
**Scope:** Audit only of public/marketing routes and their UI. No code changes beyond this report.  
**Context:** App UI (portal, admin CRM, auth) was refreshed to a light/dark system with logo blue `#468EFD`, HSL tokens, Inter, JetBrains Mono, tight radii. Marketing was explicitly left alone — this document inventories that leftover surface.

**Routes source of truth:** `src/App.tsx` lines 66–75 (comment: “Public marketing (unchanged visually for this branch)”).

---

===============================================================================
1. Page inventory
===============================================================================

There is **no dedicated marketing layout component**. Each page composes its own shell: typically `Header` + `<main>` + `Footer`, often plus `Chatbot` and `StickyCTA`. Pages live mostly under `src/components/` (not `src/pages/marketing/`).

### 1.1 Home — `/`

| Field | Detail |
|--------|--------|
| **Route** | `/` (`src/App.tsx` L67) |
| **File** | `src/components/home.tsx` (~31 lines; thin composer) |
| **Purpose** | Primary acquisition landing: pitch, services overview, process story, inclusions, trust, teaser pricing, contact form |
| **Length** | **Long** (composer is short; composed sections total ~700+ lines of UI) |
| **Components used** | `Header`, `Hero`, `WhatWeDoSection`, `WebsiteStory`, `WhatsIncluded`, `TrustSection`, `PricingSimple`, `Contact`, `Footer`, `Chatbot`, `StickyCTA` |
| **Shell** | Own chrome: white page wrapper, shared Header/Footer; no shared MarketingLayout |

### 1.2 Services — `/services`

| Field | Detail |
|--------|--------|
| **Route** | `/services` (L68) |
| **File** | `src/components/services.tsx` (~386 lines) |
| **Purpose** | Full services catalogue, process timeline, tech stack, CTA |
| **Length** | **Long** |
| **Components used** | `Header`, `Footer`, `CTA`, `Chatbot`, `StickyCTA`; lucide icons; `framer-motion` inline |
| **Shell** | Own chrome (Header/Footer). Hero is full-bleed green gradient (not the soft `#F8FAF9` hero pattern) |

### 1.3 Pricing — `/pricing`

| Field | Detail |
|--------|--------|
| **Route** | `/pricing` (L69) |
| **File** | `src/components/pricing-page.tsx` (~18 lines) → renders `src/components/pricing.tsx` (~498 lines) |
| **Purpose** | Full package pricing (website + automation tabs), add-ons table, terms, benefits |
| **Length** | **Long** |
| **Components used** | `Header`, `Footer`, `Chatbot`, `StickyCTA`, `PricingSection` (`pricing.tsx`) |
| **Shell** | Own chrome. **Visual outlier:** uses Tailwind `blue-600` / `blue-50`, not brand green |

### 1.4 About — `/about`

| Field | Detail |
|--------|--------|
| **Route** | `/about` (L70) |
| **File** | `src/components/about.tsx` (~163 lines) |
| **Purpose** | Company story, values, team blurb, impact stats |
| **Length** | **Medium** |
| **Components used** | `Header`, `Footer`, `CTA`, `Container`, `Button`, `AnimatedBackground` |
| **Shell** | Own chrome. Soft mint hero + green stats band. **No Chatbot / StickyCTA** |

### 1.5 Contact — `/contact`

| Field | Detail |
|--------|--------|
| **Route** | `/contact` (L71) |
| **File** | `src/components/contact-page.tsx` (~122 lines) |
| **Purpose** | Contact details, Cal.com booking, FAQ, WhatsApp CTA |
| **Length** | **Medium–long** |
| **Components used** | `Header`, `Footer`, `Container`, `AnimatedBackground`, `@calcom/embed-react`, `FAQ`, `Chatbot`, `StickyCTA`; lucide `Calendar` |
| **Shell** | Own chrome; soft mint hero matching About/Careers/legal |

### 1.6 Careers — `/careers`

| Field | Detail |
|--------|--------|
| **Route** | `/careers` (L72) |
| **File** | `src/pages/careers.tsx` (~266 lines) |
| **Purpose** | Freelance recruiter page: benefits, skills, apply CTA |
| **Length** | **Medium–long** |
| **Components used** | `Header`, `Footer`, `Container`, `AnimatedBackground`; `framer-motion`; lucide icons |
| **Shell** | Own chrome. Linked from footer only (not in PillNav). **No Chatbot / StickyCTA** |

### 1.7 Privacy Policy — `/privacy-policy`

| Field | Detail |
|--------|--------|
| **Route** | `/privacy-policy` (L73) |
| **File** | `src/pages/privacy-policy.tsx` (~126 lines) |
| **Purpose** | UK GDPR privacy policy (prose) |
| **Length** | **Medium** |
| **Components used** | `Header`, `Footer`, `Container`, `AnimatedBackground` |
| **Shell** | Own chrome; soft mint hero + `prose prose-lg` body |

### 1.8 Terms of Service — `/terms-of-service`

| Field | Detail |
|--------|--------|
| **Route** | `/terms-of-service` (L74) |
| **File** | `src/pages/terms-of-service.tsx` (~160 lines) |
| **Purpose** | Legal terms for site/services |
| **Length** | **Medium** |
| **Components used** | Same pattern as Privacy |
| **Shell** | Own chrome |

### 1.9 Other public routes

| Route | File | Marketing? | Notes |
|--------|------|------------|--------|
| `/unsubscribe` | `src/pages/unsubscribe.tsx` (~82 lines) | **Utility public** | Uses **app** design system (`app-dot-canvas`, `Card`, `ThemeToggle`, HSL tokens) — not marketing green theme |
| `/login`, `/forgot-password`, etc. | `src/pages/login.tsx` … | Auth | Out of marketing scope (refreshed with app) |
| *(unrouted)* `/shop` | `src/pages/shop.tsx` | Orphan | Uses Header + shop components; **not in `App.tsx`** |
| *(unrouted)* signup | `src/pages/signup.tsx` | Orphan | Not wired in `App.tsx` |

**Global overlays on all routes (including marketing):** `CookieConsent` (`src/App.tsx` L267), `Toaster` (L268), `ScrollToTop`.

---

===============================================================================
2. Shared marketing components
===============================================================================

### Actively used across marketing

| Component | Path | ~Pages | Visual pattern established |
|-----------|------|--------|----------------------------|
| **Header / PillNav** | `header.tsx` → `ui/PillNav.jsx` + `PillNav.css` | 8 marketing pages | Fixed/absolute pill nav, dark green `#1A4D2E` capsule, off-white `#F8FAF9` pills, GSAP hover; Login/Account chip top-left |
| **Footer** | `footer.tsx` | 8 | Light gray `#f9fafb`, green link colour `#1f4d36` (not exact `#1A4D2E`), 4-col link grid, logo image |
| **Hero (home)** | `hero.tsx` | 1 (Home) | Soft `#F8FAF9` + optional WebGL `Threads`; centred bold H1; dual CTAs |
| **Soft-page hero pattern** | Inline in about/contact/careers/legal | 5 | `#F8FAF9` + `AnimatedBackground` canvas particles + 90% overlay; centred H1 with green accent span |
| **Services hero** | Inline in `services.tsx` | 1 | Full-bleed `from-[#1A4D2E] to-[#2D5F3F]` gradient |
| **CTA block** | `cta.tsx` | Services, About | Dark nested card on green band; sage→green gradient blob; dual buttons |
| **Pricing (full)** | `pricing.tsx` | Pricing | Gray-50 page, **blue-600** accent cards/tabs — breaks green system |
| **Pricing (teaser)** | `pricing-simple.tsx` | Home | 3-col cards, green rings/CTAs, £ prices |
| **FAQ** | `faq.tsx` | Contact | Accordion on `#F8FAF9`; sage eyebrow; green chevrons |
| **Feature / value grids** | `what-we-do.tsx` + `ui/card-hover-effect.tsx`; `whats-included.tsx`; services grid | Home, Services | Card grids with hover glow (`#7FA99B`/15%) or check-list cards |
| **Process / story** | `website-story.tsx`; process in `services.tsx` | Home, Services | Timeline with emoji icons / numbered green circles |
| **Trust / stats** | `trust-section.tsx`; stats in `about.tsx` | Home, About | Circular SVG badges, sage stat numbers, `#F8FAF9` band |
| **Contact form (home)** | `contact.tsx` | Home | Solid green section; sage submit `#7FA99B`; Google Sheets submit |
| **Chatbot** | `ui/chatbot.tsx` | Home, Services, Pricing, Contact | FAB + panel in `#1A4D2E` |
| **Sticky CTA (mobile)** | `sticky-cta.tsx` | Home, Services, Pricing, Contact | Fixed bottom bar, `#2D5F3F` button, `md:hidden` |
| **Cookie consent** | `ui/cookie-consent.tsx` | Global | Small bottom-left card; `system-ui` font override; Accept `#1f4d36` |
| **AnimatedBackground** | `ui/animated-background.tsx` | About, Contact, Careers, Privacy, Terms | Canvas particles `#1A4D2E` / `#7FA99B` / `#1A1A1A` |
| **Threads (WebGL)** | `ui/threads.tsx` (+ `threads.css`) | Home hero only | ogl shader ribbons; green RGB colour |
| **Cal.com embed** | `@calcom/embed-react` via `contact-page.tsx` | Contact | Inline calendar (`id="book"`) |
| **Container** | `ui/container.tsx` | Most pages | `max-w-7xl` + `px-4 sm:px-6 lg:px-8` |
| **Logo** | `ui/logo.tsx` | Footer (+ unsubscribe uses app Logo) | PNG from `src/assets/images/logo.png` |

### Present but **not mounted** on any live marketing route

| Component | Path | Notes |
|-----------|------|--------|
| Testimonials | `testimonials.tsx` | Green-themed cards; unused |
| Before/After | `before-after.tsx` | Unsplash pairs + motion; unused |
| Client Wins | `client-wins.tsx` | Case-study cards; unused |
| Services (alt) | `services-new.tsx` | Larger services+calculator page; unused (App imports `services.tsx`) |
| Cost Calculator | `ui/cost-calculator.tsx` | Green-themed; unused |
| Comparison Slider | `ui/comparison-slider.tsx` | Unused |
| Trust Badge | `ui/trust-badge.tsx` | Unused |
| Header backups | `header-old-backup.tsx`, `header-pillnav.tsx`, `PillNavExample.jsx` | Dead/example |

---

===============================================================================
3. Typography audit
===============================================================================

### 3.1 Fonts loaded

| Source | Detail |
|--------|--------|
| **`index.html` L8–13** | Google Fonts: **Inter** (400–700) + **JetBrains Mono** (400–600) |
| **`lang`** | `en-GB` on `<html>` (`index.html` L2) |
| **`src/index.css` L132–136** | `body { font-family: Inter …; font-size: 14px; line-height: 1.5; }` |
| **`tailwind.config.js` L20–22** | `fontFamily.sans` → Inter; `fontFamily.mono` → JetBrains Mono |
| **Global heading rule** | `index.css` L139–141: `h1–h6` get `font-semibold tracking-tight` via tokens |

Marketing does **not** load a separate display/serif font. It inherits the **app** font stack from the shared CSS refresh.

**Where applied:**

- Body/default → Inter (global)
- Headings → Inter + local `font-bold` / `font-semibold` classes (override global semibold weight often)
- Buttons → Inter via inheritance; weights `font-medium` / `font-semibold`
- JetBrains Mono → **not used on marketing pages** (app-only `font-mono` / `font-mono-nums`)
- Cookie banner → **overrides** to `system-ui, -apple-system, sans-serif` (`cookie-consent.tsx` L43–45)

### 3.2 Font families in use

| Family | Where |
|--------|--------|
| **Inter** (via body / Tailwind sans) | Nearly all marketing UI |
| **system-ui stack** | Cookie consent only (`cookie-consent.tsx` L44) |
| **JetBrains Mono** | Not on marketing routes |
| Explicit `font-sans` / `font-serif` / `font-mono` classes | **None** found in marketing page/component set |

### 3.3 Type scale in use

**Critical side-effect of the app refresh:** `tailwind.config.js` L24–31 **overrides** `text-xs` … `text-2xl` to a denser app scale, while `text-3xl`+ remain Tailwind defaults:

| Token | App override | Default Tailwind (approx) |
|-------|--------------|---------------------------|
| `text-xs` | 12px / 16 | 12px |
| `text-sm` | **13px** / 18 | 14px |
| `text-base` | **14px** / 20 | 16px |
| `text-lg` | **20px** / 28 | 18px |
| `text-xl` | **24px** / 32 | 20px |
| `text-2xl` | **32px** / 40 | 24px |
| `text-3xl` | *(not overridden)* | **30px** |
| `text-4xl` | default | 36px |
| `text-5xl` | default | 48px |
| `text-6xl` | default | 60px |

**Implication:** `text-2xl` (32px) is **larger than** `text-3xl` (30px). Marketing mix of both creates inverted hierarchy.

**Frequency across marketing file set** (composers + shared sections + PillNav/chatbot/etc.):

| Class | Count |
|-------|------:|
| `text-xs` | 16 |
| `text-sm` | 91 |
| `text-base` | 18 |
| `text-lg` | 61 |
| `text-xl` | 19 |
| `text-2xl` | 16 |
| `text-3xl` | 31 |
| `text-4xl` | 41 |
| `text-5xl` | 11 |
| `text-6xl` | 3 |
| `text-7xl`–`text-9xl` | 0 |

**Largest:** `text-6xl` (hero Home `hero.tsx` L55; Services hero `services.tsx` L158).  
**Smallest utility:** `text-xs`; absolute smallest arbitrary: `text-[10px]` in `trust-section.tsx` L10.

**Arbitrary / inline sizes:**

- `trust-section.tsx`: `text-[10px]`, `text-[22px]`, `text-[13px]`, `text-[15px]`, `text-[16px]` (L10–60)
- Cookie consent: no font-size in style; uses `text-base` / `text-xs` / `text-sm`
- Cal.com: minHeight 600px via embed style
- No `fontSize:` style attributes found on marketing pages (clip-path / animationDelay only)

### 3.4 Weights, line-heights, tracking

| Pattern | Frequency / notes |
|---------|-------------------|
| `font-semibold` | **96** — dominant |
| `font-bold` | **76** — almost all H1/H2 |
| `font-medium` | **33** |
| `font-normal` | 1 |
| `font-light` / `font-black` etc. | 0 |

**Leading:** `leading-6` (24), `leading-8` (20), `leading-relaxed` (14), `leading-7` (11), `leading-tight` (1 on Home H1).

**Tracking:** `tracking-tight` (23) on titles; `tracking-wide` (4); `tracking-[2.5px]` (1, trust eyebrow).

**Global vs local:** Global `h*` semibold + tight tracking in CSS; marketing **re-asserts** `font-bold tracking-tight` on most titles. Body size 14px global (from app tokens) — marketing copy often expected ~16px; many sections use `text-lg` (now **20px**) for body, so body can feel oversized relative to design intent.

### 3.5 Headings

- **Not consistent.** No shared Heading component.
- Pattern A (many sections): sage eyebrow `h2` at `text-base font-semibold text-[#7FA99B]` + larger `p` or second `h2` as visual title (`whats-included`, `faq`, `pricing-simple`, `about` values).
- Pattern B: direct `h1`/`h2` at `text-3xl`–`text-6xl font-bold text-[#1A1A1A]`.
- **Pricing page** (`pricing.tsx` L317): primary page title is **`<h2>`**, not `<h1>` — missing document H1.
- **What We Do** (`what-we-do.tsx` L7): section `h2` at `text-4xl md:text-5xl` in **green** — can compete with Home `h1` visually.
- About Team section is text-only (no people cards) despite “The Team” H2 (`about.tsx` L126–131).

### 3.6 Body text

| Property | Current state |
|----------|----------------|
| Font | Inter |
| Default size | **14px** (`index.css` L135) — marketing written assuming denser app tokens |
| Weight | Normal / medium |
| Colour | Mostly `text-gray-600` / `text-gray-700`; dark titles `#1A1A1A` |
| Line-height | Global 1.5; sections often `leading-8` |

Consistency: **good within soft-mint pages**; **weaker** on Pricing (gray-900/blue) and Services (white-on-green hero).

### 3.7 Buttons and CTAs

| Pattern | Example | Font / size / weight |
|---------|---------|----------------------|
| Shared `Button` + green override | `hero.tsx` L65–66 | `font-medium`, `text-base sm:text-lg` |
| Shared `Button` default (no override) | Would be **accent blue** from refreshed `button.tsx` L12–13 | Marketing usually overrides |
| Raw `<button>` / `<a>` | Services, Careers, Pricing | `font-semibold text-lg`, large padding |
| Sticky CTA | `sticky-cta.tsx` L24–28 | `size="sm"` + green fill |
| Home contact submit | `contact.tsx` L170 | `text-sm font-semibold`, sage fill |

**Inconsistency:** mix of `font-medium` vs `font-semibold`; green `#1A4D2E` vs `#2D5F3F` vs Pricing `blue-600` vs cookie `#1f4d36`.

---

===============================================================================
4. Colour and visual identity
===============================================================================

### 4.1 Brand colour usage

#### `#1A4D2E` (old dark green) — primary marketing brand

Widely hard-coded. Representative file/line pairs (active marketing surface):

| File | Lines (non-exhaustive) |
|------|------------------------|
| `header.tsx` | 38, 41, 49, 50, 53, 99 |
| `ui/PillNav.css` | 48, 86, 106, 146, 173, 206, 227 (+ defaults) |
| `hero.tsx` | 14, 72 |
| `services.tsx` | 143, 176, 183, 231, 245, 293, 302, 329, 340, 387 |
| `about.tsx` | 47, 81, 108, 111, 138 |
| `contact-page.tsx` | 52, 62, 78–79, 81, 97, 111 |
| `contact.tsx` | 65, 170 (text on sage button) |
| `cta.tsx` | 7, 15, 25 |
| `pricing-simple.tsx` | 66, 71, 76, 89, 99–100, 112 |
| `faq.tsx` | 98, 100, 124 |
| `whats-included.tsx` | 81–82, 84 |
| `website-story.tsx` | 83, 138 |
| `trust-section.tsx` | 19–20, 38–39 |
| `what-we-do.tsx` | 7 |
| `ui/chatbot.tsx` | 251, 261, 283, 320, 370 |
| `ui/animated-background.tsx` | 45 |
| `careers.tsx` | 100, 139, 192, 219, 229, 236, 246, 256, 273 |
| `privacy-policy.tsx` | 21, 38, 103, 127 |
| `terms-of-service.tsx` | 21, 38, 163 |

Also in unused: `services-new.tsx`, `testimonials.tsx`, `before-after.tsx`, `client-wins.tsx`, `cost-calculator.tsx`, header backups.

#### Logo blue `#468EFD`

| Location | Usage |
|----------|--------|
| `src/index.css` L7 | Comment only — documents app accent sample |
| Marketing components | **Does not appear** as a hard-coded colour |
| Indirect | Shared `Button` default / CSS `--primary` / `--accent` are HSL of this blue — only shows if a marketing control uses un-overridden `Button` `default` variant |

#### Other brand / accent colours

| Colour | Role | Examples |
|--------|------|----------|
| `#2D5F3F` | Mid green (hover/CTA fill) | Hero primary button, StickyCTA, CTA button, Services icons |
| `#7FA99B` | Sage / pastel accent | Eyebrows, Threads-adjacent, contact submit, stats, hover cards |
| `#F8FAF9` | Soft mint page bg | Heroes, alternating sections |
| `#1A1A1A` | Near-black text / dark CTA card | Titles, CTA inner panel |
| `#1f4d36` / `#0b3b25` / `#1a1f1c` | Footer / cookie greens (near but ≠ `#1A4D2E`) | `footer.tsx`, `cookie-consent.tsx` |
| Tailwind `blue-600` / `blue-50` / `blue-200` | **Pricing page only** | `pricing.tsx` L31–35, 54, 63, 113–114, 332+, 490–497 — **third brand language** |
| Gray scale | Neutrals | `gray-50`–`gray-900` heavily on Pricing |

### 4.2 Backgrounds

| Context | Treatment |
|---------|-----------|
| Page root | Usually `bg-white` |
| Soft heroes | `#F8FAF9` + canvas particles or Threads |
| Alternating sections | White ↔ `#F8FAF9` |
| Solid brand bands | `#1A4D2E` (contact form, about stats, careers CTA, cta outer) |
| Dark nested CTA | `#1A1A1A` card with sage→green gradient blob (`cta.tsx` L9–19) |
| Services hero | Linear gradient green + soft white orbs |
| Pricing | `bg-gray-50` throughout (`pricing.tsx` L314) |
| Imagery | Unsplash photos (About team; unused Before/After) — stock, not product screenshots |

### 4.3 Borders, shadows, radii

**Radii (marketing):** `rounded-lg` (42), `rounded-full` (37 — pills, avatars, badges), `rounded-xl` (17), `rounded-md` (14), `rounded-2xl` (9), `rounded-3xl` (2). PillNav uses `border-radius: 9999px` (`PillNav.css` L49).

**Contrast with app tokens:** app `--radius` ≈ 0.5rem / tight; marketing still loves large pills and `rounded-2xl` cards.

**Shadows:** `shadow-lg` (28), `shadow-sm` (23), `shadow-md` (11), `shadow-xl` (7), `shadow-2xl` (1 on CTA). PillNav custom: `0 4px 20px rgba(26, 77, 46, 0.15)` (`PillNav.css` L50).

**Borders:** `border-gray-100/200/300`, rings `ring-[#1A4D2E]` or Pricing `ring-blue-600`, hairlines rare compared to app.

---

===============================================================================
5. Layout patterns
===============================================================================

| Pattern | Convention |
|---------|------------|
| **Max width** | Shared `Container`: `max-w-7xl` (`container.tsx` L11). Also frequent `max-w-2xl` (copy), `max-w-3xl`/`4xl` (heroes), Services often raw `max-w-7xl mx-auto px-6` |
| **Horizontal padding** | Container: `px-4 sm:px-6 lg:px-8`. Services/Pricing sometimes `px-6` / `px-4 sm:px-6 lg:px-8` |
| **Vertical rhythm** | Dominant `py-24` / `sm:py-32` section padding; heroes `pt-32` under fixed nav; Services `py-16 md:py-24` |
| **Feature grids** | 1→2→3 cols (`what-we-do` HoverEffect); 2×4 inclusions; Services 8-card grid; Pricing 3-col packages; About values 4-col |
| **Breakpoints used** | `sm:` ~123, `md:` ~46, `lg:` ~22, `xl:` ~6, `2xl:` ~0 in core marketing set — **sm-heavy** |
| **Sticky affordances** | PillNav top; StickyCTA bottom mobile; Chatbot FAB; Cookie bottom-left |

---

===============================================================================
6. Imagery, icons, illustrations
===============================================================================

### `public/`

| File | Used on marketing? |
|------|---------------------|
| `public/vite.svg` | Favicon only (`index.html` L5) — not page imagery |
| `public/google-sheets-script.js` | Backend helper for contact form, not visual |

**No marketing photos live in `public/`.**

### Bundled assets

| File | Usage |
|------|--------|
| `src/assets/images/logo.png` | Header PillNav + Footer Logo |
| `src/assets/images/logo - Copy.png` | Duplicate; unused |

### Remote / decorative

| Asset | Where |
|-------|--------|
| Unsplash team photo | `about.tsx` L83 |
| Unsplash before/after sets | `before-after.tsx` (unused on routes) |
| Canvas particles | `animated-background.tsx` |
| WebGL threads | `threads.tsx` in Home hero |
| Inline SVG | Phone/mail icons on Contact; circular badge SVGs in `trust-section.tsx` L20+; commented SVG in `logo.tsx` |
| Emoji as “illustration” | Website story steps; Pricing tabs/benefits (`💼`, `⚙️`, `🎯`, `✅`) |

### Icon libraries

| Library | Marketing usage |
|---------|-----------------|
| **lucide-react** | Primary — Header, Footer social, Services, Careers, FAQ chevrons, Chatbot, Cookie X, Contact Calendar |
| **@radix-ui/react-icons** | Via shared UI primitives if used; not marketing-specific |
| **react-icons** | In package.json; not required by inventoried marketing imports |

---

===============================================================================
7. Content assessment
===============================================================================

### Tone

**Salesy agency / conversion-led**, confident and slightly punchy (“Outdated Website? We Fix That.” — `hero.tsx` L56–57). Mix of AI-agency positioning and traditional web studio. About page is warmer/story-driven.

### British vs American English

**Mixed — leaning inconsistently British.**

| British | American / mixed |
|---------|------------------|
| `lang="en-GB"` (`index.html` L2) | “SEO Optimization” in footer (`footer.tsx` L77) vs “SEO Optimisation” on Services (`services.tsx` L78) |
| “colour palette” (`pricing.tsx` L259) | “organizational” in Privacy (`privacy-policy.tsx` L78) |
| “SEO-optimised” (`website-story.tsx` L20) | “optimization” in What We Do AI card (`what-we-do.tsx` L40–42) |
| £ pricing, WhatsApp (`wa.me`), `.co.uk` | Plain-text phone removed from marketing; use WhatsApp CTAs |
| UK GDPR / Data Protection Act 2018 | — |

### Emoji / exclamation

- **Emoji-heavy on Pricing** (tabs, benefits, CTA card) and **Website Story** timeline icons.
- Hero / many CTAs use short punchy lines; exclamations present but not extreme.
- Legal pages use 📧 on contact lines (`privacy-policy.tsx` L127, `terms-of-service.tsx` L163).

### Outdated / stale / broken signals

| Issue | Detail |
|-------|--------|
| Document title | `index.html` L7: **“The Enclosure \| Client Portal”** on all routes including marketing |
| About claims | “hundreds of businesses” (`about.tsx` L77) vs stats “50+ Websites” — inconsistent |
| Team section | Empty of people (`about.tsx` L121–134) |
| Pricing CTA | `href="#contact"` (`pricing.tsx` L496) — **no `#contact` on pricing page** (dead jump) |
| Pricing “Get Started” | `console.log` only (`pricing.tsx` L110) — no navigation |
| Social links | Footer points to generic facebook.com / twitter.com etc. (`footer.tsx` L17–20) |
| Unmounted case studies | Before/After & Client Wins unused — gaps if promised elsewhere |
| Shop page | Exists but unrouted |
| Last Updated legal | “October 2025” — fine relative to 2026 audit date |

---

===============================================================================
8. Technical dependencies
===============================================================================

### Used specifically / heavily by marketing

| Package | Marketing usage | App also? |
|---------|-----------------|-----------|
| **framer-motion** | Services, Careers, FAQ, WhatsIncluded | Yes (dashboard chat, legacy) |
| **gsap** | PillNav (`PillNav.jsx`) | **Primarily marketing nav** |
| **ogl** | Threads WebGL hero | **Marketing-only** |
| **motion** (`motion/react`) | `card-hover-effect.tsx` (What We Do) | Marketing-primary |
| **lucide-react** | Icons throughout | Shared |
| **react-router-dom** | Links / routes | Shared |
| Cal.com (`@calcom/embed-react`) | Contact | Marketing-only integration |
| Google Sheets util | Home contact form | Marketing lead-gen |

### In package.json but not driving live marketing routes

| Package | Notes |
|---------|--------|
| `react-vertical-timeline-component` | Not imported by marketing pages checked |
| `flowbite-react` | Not in marketing imports |
| `embla-carousel-react` | Carousel UI primitive; not wired into marketing pages |
| `react-hook-form` / zod | Form primitives exist; Home contact uses local state + Sheets |

### Marketing-only evaluation candidates

1. **`ogl` + Threads** — Home-only, performance-gated  
2. **`gsap` + PillNav** — nav animation stack  
3. **`motion` vs `framer-motion`** — two animation libs for similar effects  
4. Orphan components (`cost-calculator`, before/after, testimonials) if deleted later  

---

===============================================================================
9. First impressions
===============================================================================

### Overall feel

**UK SME web-agency / conversion-landing hybrid** — soft mint backgrounds, dark green pills, sage accents, lots of card grids and CTAs. Closer to mid-2010s–early-2020s agency template than to the refreshed app’s tight blue SaaS UI. Pricing page briefly feels like a **generic blue SaaS pricing** screen dropped into a green site.

### Working well

- Clear acquisition funnel (Home → Pricing/Contact)
- Recognisable green + sage palette on most pages
- PillNav is distinctive
- Strong CTA repetition (sticky + chatbot + section CTAs)
- Soft-mint hero pattern is coherent across About/Contact/Careers/legal

### Dated / inconsistent

- Three accent systems: green, sage, **Tailwind blue**
- Type scale collision after app Tailwind overrides
- Emoji / stock Unsplash / empty Team
- Footer greens ≠ `#1A4D2E`
- App body 14px / Inter applied under marketing that still sizes like a classic marketing site
- Document title “Client Portal”

### Top designer flags (first glance)

1. **Pricing is a different brand** (blue-600 vs forest green).  
2. **Type hierarchy broken** by `text-2xl` > `text-3xl` after token overrides.  
3. **Pill / soft-mint / large radii** clash with the new app’s tight, blue, hairline system.  
4. **Dead CTAs** on Pricing (`#contact`, console.log Get Started).  
5. **Chrome inconsistency** — some pages omit Chatbot/StickyCTA; Careers missing from PillNav.

---

===============================================================================
10. Ready-state assessment for refresh
===============================================================================

### 10.1 Typography-only refresh — touch points

Every file that sets type size/weight/tracking or loads fonts for marketing chrome:

**Pages / composers**

- `src/components/home.tsx` (wrapper only — light)
- `src/components/services.tsx`
- `src/components/pricing-page.tsx`
- `src/components/pricing.tsx`
- `src/components/about.tsx`
- `src/components/contact-page.tsx`
- `src/pages/careers.tsx`
- `src/pages/privacy-policy.tsx`
- `src/pages/terms-of-service.tsx`

**Sections / chrome**

- `src/components/header.tsx`
- `src/components/footer.tsx`
- `src/components/hero.tsx`
- `src/components/cta.tsx`
- `src/components/faq.tsx`
- `src/components/pricing-simple.tsx`
- `src/components/contact.tsx`
- `src/components/sticky-cta.tsx`
- `src/components/website-story.tsx`
- `src/components/what-we-do.tsx`
- `src/components/whats-included.tsx`
- `src/components/trust-section.tsx`
- `src/components/ui/chatbot.tsx`
- `src/components/ui/cookie-consent.tsx` (fontFamily override)
- `src/components/ui/PillNav.jsx` + `src/components/ui/PillNav.css`
- `src/components/ui/card-hover-effect.tsx`
- `src/config/marketing.ts` (Cal.com + WhatsApp config)

**Shared config (affects marketing whether you want it or not)**

- `index.html` (font links, title)
- `src/index.css` (body 14px, heading defaults)
- `tailwind.config.js` (fontSize overrides — **must** decide marketing vs app scale)

**Optional orphans if brought back:** `testimonials.tsx`, `before-after.tsx`, `client-wins.tsx`, `services-new.tsx`, `ui/cost-calculator.tsx`

### 10.2 Broader visual refresh (type + colour + layout) — scope

All of 10.1, plus colour/layout-heavy files:

- Same list as above  
- `src/components/ui/animated-background.tsx` (particle colours)  
- `src/components/ui/threads.tsx` (shader colour)  
- `src/components/ui/logo.tsx` / `src/assets/images/logo.png`  
- `src/components/ui/button.tsx` (if marketing stops hard-overriding)  
- Possibly extract a real `MarketingLayout` / tokens to avoid dual systems  
- Decide fate of orphan components and unrouted `shop.tsx`

### 10.3 Structural obstacles

1. **No MarketingLayout / design tokens for marketing** — colours and type duplicated per file as hex + utility classes.  
2. **Shared Tailwind fontSize tokens** already remapped for the app — marketing refresh must either namespace marketing type (`marketing-text-*`) or split Tailwind themes.  
3. **PillNav is a self-contained CSS+GSAP island** (`PillNav.css` CSS variables) — not Tailwind-tokenised.  
4. **Pricing is a parallel design system** (blue) — needs intentional re-skin or replacement.  
5. **Two animation stacks** (`framer-motion` + `motion` + `gsap` + `ogl`) couple behaviour to structure.  
6. **Shared `Button`** now defaults to logo blue — marketing overrides are fragile.  
7. **Eyebrow-as-h2 + visual-title-as-p** pattern hurts a11y hierarchy; refresh should introduce a heading primitive.  
8. **Unsubscribe** already on app system — keep out of marketing refresh scope.

---

===============================================================================
Appendix A — File tree
===============================================================================

```
src/
├── App.tsx                          # Public marketing routes L66–75
├── index.css                        # Global Inter + app tokens (affects marketing)
├── assets/images/
│   ├── logo.png                     # Header + Footer
│   └── logo - Copy.png              # Unused duplicate
├── components/                      # Most “pages” live here
│   ├── home.tsx                     # /
│   ├── services.tsx                 # /services
│   ├── services-new.tsx             # ORPHAN
│   ├── pricing-page.tsx             # /pricing shell
│   ├── pricing.tsx                  # Full pricing body
│   ├── pricing-simple.tsx           # Home teaser
│   ├── about.tsx                    # /about
│   ├── contact-page.tsx             # /contact
│   ├── contact.tsx                  # Home form section
│   ├── header.tsx
│   ├── footer.tsx
│   ├── hero.tsx
│   ├── cta.tsx
│   ├── faq.tsx
│   ├── sticky-cta.tsx
│   ├── website-story.tsx
│   ├── what-we-do.tsx
│   ├── whats-included.tsx
│   ├── trust-section.tsx
│   ├── testimonials.tsx             # ORPHAN
│   ├── before-after.tsx             # ORPHAN
│   ├── client-wins.tsx              # ORPHAN
│   ├── header-old-backup.tsx        # ORPHAN
│   ├── header-pillnav.tsx           # ORPHAN
│   ├── PillNavExample.jsx           # ORPHAN
│   └── ui/
│       ├── PillNav.jsx + PillNav.css
│       ├── chatbot.tsx
│       ├── cookie-consent.tsx
│       ├── animated-background.tsx
│       ├── threads.tsx + threads.css
│       ├── (calendly.tsx removed; Cal.com embed on contact-page)
│       ├── container.tsx
│       ├── logo.tsx
│       ├── card-hover-effect.tsx
│       ├── cost-calculator.tsx      # ORPHAN
│       ├── comparison-slider.tsx    # ORPHAN
│       └── trust-badge.tsx          # ORPHAN
└── pages/
    ├── careers.tsx                  # /careers
    ├── privacy-policy.tsx
    ├── terms-of-service.tsx
    ├── unsubscribe.tsx             # Public, app-styled
    ├── shop.tsx                     # ORPHAN (unrouted)
    └── signup.tsx                   # ORPHAN (unrouted)

public/
├── vite.svg
└── google-sheets-script.js
```

---

===============================================================================
Appendix B — Screenshot descriptions
===============================================================================

### Home `/`

**Above the fold:** Soft mint field with optional green WebGL thread animation; centred bold headline “Outdated Website? / We Fix That.”; short conversion subcopy; two large CTAs (“Let's Redesign Your Site”, “See the Results”). Floating green PillNav top-centre; Login chip top-left.  
**Below:** What We Do hover-card grid → emoji process timeline → “what's included” checklist grid → trust badges + stats → 3-tier green pricing teaser → solid green contact form → footer. Mobile sticky CTA + chatbot FAB appear on scroll.

### Services `/services`

**Above the fold:** Full-bleed dark green gradient hero; large white headline about converting websites; dual CTAs (consultation / learn more).  
**Below:** Soft mint services icon grid → process timeline (numbered green circles) → tech stack tiles → dark nested CTA band → footer. Chatbot + sticky CTA present.

### Pricing `/pricing`

**Above the fold:** Light gray page; H2 “Simple, Transparent Pricing”; blue-accented tab switcher (Website Design / Business Automation) with emoji.  
**Below:** Three pricing cards (Most Popular in blue); expandable add-ons table; “Important Information” cards; blue “Not Sure…” CTA box; “Why Work With Us” emoji benefits. Visually distinct from green marketing pages.

### About `/about`

**Above the fold:** Soft mint + particle canvas; “About The Enclosure” with green word mark; agency positioning paragraph.  
**Below:** Two-column story + Unsplash team photo → four value cards → sparse “The Team” text → solid green “By the Numbers” stats → CTA band → footer. No chatbot.

### Contact `/contact`

**Above the fold:** Soft mint hero “Let's Build Something Great Together”.  
**Below:** WhatsApp/email cards → Cal.com “Book a free intro call” embed (`#book`) → FAQ accordion on mint → footer. Chatbot + sticky CTA.

### Careers `/careers`

**Above the fold:** Soft mint hero recruiting freelancers; “Apply Now” scrolls to apply block.  
**Below:** Three benefit cards → skills checklist → apply/contact panel → solid green closing CTA → footer. No chatbot/sticky bar; not in main nav.

### Privacy Policy `/privacy-policy`

**Above the fold:** Soft mint hero “Privacy Policy” with green accent.  
**Below:** Long `prose` legal content (UK GDPR), last updated October 2025, email with 📧 → footer.

### Terms of Service `/terms-of-service`

**Above the fold:** Same soft-mint legal hero pattern.  
**Below:** Long terms prose, company contact with 📧 → footer.

### Unsubscribe `/unsubscribe`

**Above the fold:** App-styled centred card on dotted canvas with theme toggle — confirmation/loading/error for email unsubscribe. Not part of the green marketing look; included as public route only.

---

*End of inventory. Audit only — no source files modified except creation of this report.*
