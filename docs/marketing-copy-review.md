# Marketing copy review draft

**Status:** Awaiting Josh's approval before any page component edits  
**Branch:** `feat/marketing-outcome-tone`  
**Rules applied:** British English · no em dashes · no emoji · no exclamation marks in body copy · prices and package names unchanged · copy only

---

## Audience assumption (confirmed)

Small-to-medium UK businesses whose current website is a passive brochure and isn't bringing in enquiries. Local service operators, professional services, independent retailers, small clinics. Not enterprise, not pure e-commerce platforms, not agencies.

**Outcomes that matter, in order of weight:**
1. More enquiries / bookings from the site
2. Being found by local people searching for what they offer
3. Looking legitimately better than local competitors
4. Getting time back — Josh handles it, they don't fiddle

**Location signal for SEO:** UK (no specific city)

**Careers:** light touch only — tidy weak copy, keep tone consistent, do not apply outcome-led sell framing

---

## Home

### Hero
**File:** `src/components/hero.tsx`

**Was:** Outdated Website? We Fix That. / Modern design. Smart strategy. Proven to convert. We build websites that turn clicks into clients. / Let's Redesign Your Site · See the Results

**Now:** A website that brings in enquiries, not just looks busy. / For UK businesses whose site has stopped earning its keep. Clear, local-first design that turns visitors into calls and bookings. / Book a 20 min chat · Message us on WhatsApp

**Notes:** Primary CTA routes to `/contact#book` (intro call). Secondary CTA uses WhatsApp (`whatsappLink()`), replacing the current Services link so the hero matches the brief (intro call + WhatsApp).

### Section: What we do
**File:** `src/components/what-we-do.tsx`

**Was (heading):** Building digital experiences that convert. / We design intelligent, high-performing websites that merge clean design, smart strategy, and seamless user experience.

**Now (heading):** You get a site that works as hard as you do. / We design around the outcome that matters: more of the right people finding you, trusting you, and getting in touch.

**Was → Now (cards):**

| Was title / description | Now title / description |
|---|---|
| Strategic web design / We craft conversion-focused websites designed around clear goals, modern aesthetics, and exceptional user experience. | Built to win enquiries / You get pages shaped around what you sell and how customers buy, so the next step is obvious. |
| Brand identity / From logos to typography, we create cohesive brand systems that communicate trust, clarity, and personality across every touchpoint. | Look like the obvious choice / Local customers should see a site that feels as trustworthy as the best competitor in your area, without looking like a template. |
| UI / UX design / Beautiful interfaces meet effortless navigation. We design intuitive digital experiences that keep visitors engaged and exploring. | Easy to use on a phone / Most people will find you on mobile. You get a site that loads cleanly and makes booking or contacting you simple. |
| AI-powered optimisation / Leverage automation and analytics to refine performance, SEO, and user satisfaction, keeping your website smart and efficient. | Know what's working / You can see where enquiries come from and what people look at, so you're not guessing. |
| Content and copywriting / Persuasive, clear, and conversion-driven. We write copy that connects with your audience and drives measurable action. | Words that ask for the sale / Clear copy in your customers' language: what you do, why you're the right fit, and how to get in touch. |
| Maintenance and growth / Stay ahead with ongoing updates, performance tracking, and support designed to evolve your site as your business grows. | We keep it ticking / Updates, fixes, and small changes handled for you, so you're not fiddling with the site after hours. |

### Section: Website story (process)
**File:** `src/components/website-story.tsx`

**Was (heading):** Your website journey / From concept to reality / Follow along as we transform your ideas into a high-performing website through our proven six-step process.

**Now (heading):** How you get from stuck to live / A clear path from first chat to a site that can earn enquiries. / Six steps, plain English, no mystery about what happens next.

**Was → Now (steps):**

| Was | Now |
|---|---|
| Discovery and planning / We start by understanding your business goals, target audience, and brand identity. Through a focused consultation, we identify your requirements and create a roadmap tailored to your objectives. | We learn what should change / You tell us who you serve, what isn't working, and what a good week of enquiries looks like. We turn that into a simple plan. |
| Design and prototyping / We craft modern, user-centric wireframes and high-fidelity prototypes that align with your brand. Every design decision is made to improve experience and drive conversions. | You see the direction early / You get layouts that show how the site will look and where people enquire, before we build the real thing. |
| Content and SEO / We create compelling, SEO-optimised content that speaks to your audience and ranks well on search engines. From copywriting to meta tags, every element is built for visibility. | Written so locals can find you / Copy and page setup aimed at people nearby searching for what you offer, not jargon for search engines. |
| Development / We turn designs into a fast, responsive, and secure website. Using modern technologies, we build a site that performs cleanly across devices and browsers. | Built to stay fast and solid / You get a site that works on phones, loads quickly, and is set up properly so you're not fighting with it later. |
| Testing and launch / Before launch, we rigorously test features, links, and interactions. Our QA process helps ensure your website is accessible, reliable, and ready for real users. | Checked before it goes live / Forms, links, and key journeys get a proper once-over so your first visitors aren't the ones finding problems. |
| Ongoing support / We handle the technical launch and can provide ongoing support to keep your website performing well. From updates to troubleshooting, we're here when you need us. | Support after launch / When something needs changing or fixing, you message us. We handle the technical side so you can get back to the day job. |

**Was (closing):** Ready to start your journey? / Book a free intro call and we'll talk through what you're trying to build. / Book a free intro call

**Now (closing):** Want to see what we'd change? / Book a short intro call and we'll walk through your current site with fresh eyes. / Book a 20 min chat

### Section: What's included
**File:** `src/components/whats-included.tsx`

**Was (heading):** What's included / Everything you need for a solid launch / Our website packages include the essentials needed to create a high-performing online presence.

**Now (heading):** What's included / The basics that help a site earn its keep / Every package is set up so visitors can find you, trust you, and get in touch without friction.

**Was → Now (items):**

| Was | Now |
|---|---|
| Responsive design / Your website will look and work well on desktops, tablets, and smartphones. | Works on phones / Customers can browse and contact you cleanly from any device. |
| Custom branding / We'll incorporate your brand colours, logos, and style guidelines for a consistent visual identity. | Looks like your business / Your colours, logo, and tone carried through so the site feels like you, not a template. |
| SEO optimisation / Built-in SEO best practices to help improve rankings and drive more organic traffic. | Set up to be found / Page titles, structure, and basics in place so local search has something solid to work with. |
| Performance tuning / Optimised code and images for fast loading speeds and a better user experience. | Loads quickly / Fast pages so people don't bounce before they read who you are. |
| Content creation / Professional copywriting that highlights your value proposition and converts visitors. | Copy that earns replies / Clear wording that explains what you do and nudges people to enquire. |
| Lead generation forms / Strategic placement of contact forms and CTAs to capture leads and grow your business. | Easy ways to enquire / Forms and contact points placed where people are ready to act. |
| Analytics integration / Track visitor behaviour and conversion metrics to measure your website's performance. | See where interest comes from / Simple tracking so you know which pages and sources lead to contact. |
| 30-day support / Post-launch technical support and adjustments to help everything run smoothly. | Support after go-live / A short window of hands-on help so launch week isn't left to you alone. |

### Section: Trust / leadership
**File:** `src/components/trust-section.tsx`

**Was (eyebrow):** Leadership

**Now (eyebrow):** Who you'll work with

**Was (Josh):** Dev (UI/UX) / Designs and builds intuitive digital experiences. Focused on creating accessible, high-performing websites.

**Now (Josh):** Design and build / Designs and builds the site you'll actually use. Focused on clear journeys, phone-friendly layouts, and pages that ask for the enquiry.

**Was (Will):** Auto Marketing / Drives growth through intelligent automation. Specialises in AI-powered marketing solutions.

**Now (Will):** Growth and automation / Helps the site keep working after launch: the follow-ups, tracking, and quiet systems that save you time.

**Was (founding line):** Founded in 2020 to help small businesses compete online through quality website redesigns.

**Now (founding line):** Founded in 2020 to help small UK businesses compete online with sites that look the part and bring in work.

**Stats labels (keep numbers):** Websites launched · Satisfaction · Conversion increase  
**Now labels (same numbers):** Websites launched · Client satisfaction · Average lift in enquiries

### Section: Pricing teaser
**File:** `src/components/home.tsx` (`PricingTeaser`)

**Was:** Pricing / Clear packages for standard web work / Fixed packages for most business websites, plus bespoke quotes when you need something more ambitious. / See our packages

**Now:** Pricing / Clear packages, no mystery maths / Fixed packages for most business sites, plus a bespoke quote when you need something bigger. / See our packages

### Section: Contact form (home)
**File:** `src/components/contact.tsx`

**Was:** Contact / Ready to talk about your project? / Fill out the form below and we'll get back to you within 24 hours. Or book a free intro call. Prefer WhatsApp? Message us here.

**Now:** Contact / Tell us what's not working / Send a short note and we'll reply within 24 hours. Or book a 20 min chat. Prefer WhatsApp? Message us here.

*(Form field labels and success messages stay as-is unless they contain sell copy; success line already fine.)*

---

## Pricing

**File:** `src/components/pricing.tsx`

### Hero
**Was:** Clear packages, or bespoke to fit. / Fixed packages for standard web design work, or a bespoke quote if your project needs something more custom. Every project starts with a free intro call. / Book a free intro call

**Now:** Pick a package that matches what you need. / Fixed packages for most business websites, or a bespoke quote when the work is bigger. Every project starts with a short intro call. / Book a 20 min chat

### Standard packages intro
**Was:** Standard packages / Everything you need to go live and stay live. One-off build fee plus a small monthly retainer that covers ongoing maintenance and support.

**Now:** Standard packages / Everything you need to go live, then peace of mind after. One-off build fee plus a small monthly retainer so you're not left maintaining it alone.

### Package: Essential
**Names and prices unchanged:** Essential · £1,749.99 · £50/month for year 1 · £37.50/month from year 2

**Was (summary):** For small businesses that need a professional presence online.

**Now (summary):** For businesses that need a proper site fast without paying for things they won't use.

**Was (features):**
- Up to 5 pages
- Mobile-optimised responsive design
- Contact form with email delivery
- Basic on-page SEO setup
- Hosting included
- Basic database for form submissions and simple content
- 2 rounds of revisions during build

**Now (features, max 5):**
- A five-page site that captures enquiries and works cleanly on phones
- Contact form that lands in your inbox
- Set up so local search has a fair shot at finding you
- Hosting included so you're not hunting for a host
- Two revision rounds during the build

### Package: Professional
**Names and prices unchanged:** Professional · £2,499.99 · £50/month for year 1 · £37.50/month from year 2

**Was (summary):** For businesses that need more than a brochure site.

**Now (summary):** For businesses that want the site to keep working after launch: more pages, clearer leads, and a stronger local presence.

**Was (features):**
- Up to 10 pages
- Everything in Essential
- Fully custom design, no templates
- Blog or news section with content management
- Lead capture forms with CRM integration
- Google Business Profile setup and optimisation
- Intermediate database for content, users, and custom data
- 3 rounds of revisions during build

**Now (features, max 5):**
- Up to ten pages, everything in Essential, plus room to grow
- Designed for your business, not pulled from a template
- Forms that capture leads and feed into the tools you already use
- Google Business Profile set up so locals can find and trust you
- Three revision rounds during the build

### Package: Signature
**Names and prices unchanged:** Signature · £3,999.99 · £100/month for year 1 · £75/month from year 2

**Was (summary):** For businesses that want a full digital operation.

**Now (summary):** For businesses that need the site to do more than explain: bookings, members areas, payments, and the workflows behind them.

**Was (features):**
- Unlimited pages
- Everything in Professional
- Custom web application features (booking, calculators, member areas)
- Third-party integrations (Stripe, Mailchimp, HubSpot, and similar)
- Custom automation and workflows
- Enterprise database for high-traffic and complex data
- Priority support in the monthly retainer
- 4 rounds of revisions during build

**Now (features, max 5):**
- Everything in Professional, with room for custom features
- Bookings, calculators, or member areas built around how you sell
- Payments and mailing tools connected so you're not copying data by hand
- Priority support in the monthly retainer
- Four revision rounds during the build

**Featured badge:** Most popular → unchanged

**Package CTAs:** Book a free intro call → Book a 20 min chat

### Annual / third-party note
**Was:** Prefer to pay annually? Ten months upfront covers the year and saves you two. Third-party services like paid advertising, premium integrations, and specialist tools are billed at cost when relevant.

**Now:** Prefer to pay annually? Ten months upfront covers the year and saves you two. Paid ads, premium tools, and specialist add-ons are billed at cost when you need them.

### Bespoke lane
**Was:** Something more ambitious? / We also build custom software, SaaS applications, integrations, and internal tools for businesses that have outgrown a standard website. Every bespoke project is quoted individually based on scope. / Book a free intro call to discuss your project

**Now:** Need something beyond a standard site? / We also build custom tools, customer portals, and the quiet systems that save a team hours each week. Every bespoke project is quoted on scope. / Book a 20 min chat about your project

**Bespoke cards Was → Now:**

| Was | Now |
|---|---|
| Custom web applications / Purpose-built tools and experiences beyond a standard marketing site. | Tools built around your process / Software shaped to how you actually work, not a bolted-on form. |
| SaaS products / Product interfaces, dashboards, and platforms shaped around your users. | Products your customers can use / Clear interfaces and dashboards for the people who pay you. |
| Integrations and automation / Stripe, CRM, and third-party API wiring that removes manual work. | Less copying between apps / Payments, mail, and your other tools talking to each other so you don't. |
| Internal tools and CRM / Admin panels, client portals, and systems tailored to how you work. | Systems your team can live in / Client portals and admin tools that match your real workflow. |

### Draft-first
**Was:** Not sure yet? Start with a draft. / For a small fee, we will design and prototype a draft of your site before you commit to the full project. If you go ahead, the cost of the draft comes off your final invoice. / Book a free intro call to discuss a draft

**Now:** Not sure yet? Start with a draft. / For a small fee, we'll design a draft of your site before you commit to the full build. If you go ahead, that fee comes off your final invoice. / Book a 20 min chat about a draft

### Pricing FAQ
**Was → Now:**

| Was Q / A | Now Q / A |
|---|---|
| What does the monthly retainer cover? / The monthly covers ongoing maintenance, backend fixes, and support if anything goes wrong with your site. Hosting is included in the build fee. Third-party services like paid advertising or premium tools are billed at cost. | What does the monthly retainer cover? / Peace of mind after launch: fixes, updates, and support when something goes wrong. Hosting is included in the build fee. Paid ads and premium tools are billed at cost. |
| What happens after year 2? / The monthly stays at the year 2 rate for as long as you want us to maintain the site. There is no long-term contract, you can end the retainer at any time with 30 days notice. | What happens after year 2? / The monthly stays at the year 2 rate for as long as you want us looking after the site. No long-term lock-in; you can end the retainer with 30 days' notice. |
| Do I own the site? / Yes. Once the build is complete and paid for, the code and content are yours. If you ever want to move to a different provider, we will hand everything over cleanly. | Do I own the site? / Yes. Once the build is complete and paid for, the site is yours. If you ever move elsewhere, we'll hand everything over cleanly. |
| How long does a build take? / Essential and Professional builds typically take 3 to 4 weeks. Signature and bespoke projects vary based on scope. We will give you a firm timeline during the intro call. | How long does a build take? / Essential and Professional builds typically take 3 to 4 weeks. Signature and bespoke work varies with scope. We'll give you a firm timeline on the intro call. |

---

## Services

**File:** `src/components/services.tsx`

### Hero
**Was:** Smart, modern websites designed to convert / Clear design, solid engineering, and measurable results. We build websites that work as hard as you do. / Book a free intro call · See our packages

**Now:** The site local customers find when they search for what you sell / Clear design built to win enquiries, show up in local search, and look more trustworthy than the competition. / Book a 20 min chat · See our packages

### Services grid intro
**Was:** Comprehensive web solutions / From complete redesigns to ongoing maintenance, we cover the full stack of work most businesses need online.

**Now:** What you can get from us / From a full redesign to quiet ongoing care, the work most UK businesses actually need online.

### Service cards Was → Now

| Was | Now |
|---|---|
| Website redesign / Transform an outdated site into a modern, mobile-first platform built to drive real business results. | Website redesign / Replace a tired brochure with a site that wins enquiries and looks the part next to local competitors. |
| SEO optimisation / Improve search rankings and attract organic traffic with strategies grounded in measurable growth. | Get found locally / Show up when nearby people search for what you offer, with clear pages and sensible search setup. |
| E-commerce solutions / Shopping experiences with secure checkout, inventory management, and payment integration. | Sell without the faff / A shop that takes payment cleanly, shows stock sensibly, and doesn't confuse customers on their phone. |
| Mobile and performance / Fast-loading, responsive sites that work cleanly on every device your customers use. | Fast on every phone / Pages that load quickly and stay usable wherever your customers are browsing. |
| Website maintenance / Keep your site secure and performing well with regular updates, monitoring, and support. | We look after it / Updates, monitoring, and support handled for you so the site stays safe without your evenings. |
| Custom development / Tailored web applications, API integrations, custom features, and database design. | Built for how you work / Extra features and connections shaped around your process, not a generic template. |
| International SEO / Multilingual and geo-targeted strategies for businesses expanding beyond a single market. | Reach beyond one area / Clear structure and language setup when you need customers outside a single local market. |
| Content strategy / SEO-optimised copywriting and content planning that engages your audience and drives conversions. | Content that earns trust / Copy and page plans that explain what you do and make the next step feel obvious. |

### Process
**Was:** Our process / A clear path from discovery to launch.

**Now:** How the work unfolds / A clear path from first chat to a live site that can take enquiries.

**Steps Was → Now:**

| Was | Now |
|---|---|
| Discovery / 1 week / We analyse your business and goals | Discovery / 1 week / We learn what should change for your customers |
| Design / 2 weeks / Create conversion-focused mockups | Design / 2 weeks / You see layouts built to win the enquiry |
| Development / 3-4 weeks / Build with modern technologies | Build / 3-4 weeks / We build a fast, phone-friendly site |
| Delivery / Launch / Go live with full training | Launch / Go live / You go live with clear handover |

### Tech stack section
**Was:** Built with modern technologies / We use proven tools so your website stays fast, secure, and scalable. / React · Next.js · Tailwind · TypeScript · WordPress · Shopify

**Now:** Built to stay fast and secure / You get a site that loads quickly, works on phones, and is set up properly for the long run. / *(Keep the six tool labels as factual build notes, or rename the section eyebrow only; do not expand tech sell copy. Preferred section heading above replaces the tech-led H2.)*

**Josh flag:** The current grid names React, Next.js, Tailwind, TypeScript, WordPress, Shopify. Brief says cut tech stack language from prospect-facing sell copy. Options for apply step:
- **A (recommended):** Keep the six logos/names as a quiet “tools we use” strip under the new outcome heading (factual, not sold).
- **B:** Replace names with outcome labels (e.g. Fast pages, Easy updates, Secure checkout) and drop framework names.

### Shared CTA band (also used on Services)
**File:** `src/components/cta.tsx`

**Was:** Ready to talk about your project? / Book a free intro call and discover how we can improve your online presence. / Book a free intro call

**Now:** Want a straight view of what's holding the site back? / Book a short intro call and we'll talk through what we'd change. / Book a 20 min chat

---

## About

**File:** `src/components/about.tsx`

### Hero
**Was:** Two people, one small studio. / The Enclosure is a small independent studio building websites, SaaS applications, and lead generation systems for businesses that want more than a brochure site.

**Now:** A small UK studio that builds sites meant to earn enquiries. / We're two people. You talk to the people doing the work. We help businesses whose website has become a passive brochure get something that looks the part and brings in contact.

### What we do (keep short; two paragraphs max across page body)
**Was:** What we do / We make websites that turn visitors into customers. We build software that gives businesses better internal tools than they'd otherwise have. And we help clients grow, through lead generation, review systems, and the sort of backend work that lets a business focus on what it's actually good at.

**Now:** What that means for you / You get a site designed to win enquiries and show up for local search, plus the quiet systems behind it when you need them. We handle the build and the fiddly bits so you can stay on the work you're good at.

### How we work
**Was → Now:**

| Was | Now |
|---|---|
| Fast, and honest about it. / Most agencies take eight weeks to build a site because it fills the invoice. We'd rather ship in three and move on. If your project needs longer, we'll tell you why. | Fast, and honest about it. / Most agencies take eight weeks because it fills the invoice. We'd rather ship in three when the scope allows. If your project needs longer, we'll say so upfront. |
| Show, don't sell. / For a small fee, we'll design and prototype a draft of your site before you commit to the full project. If you go ahead, that cost comes off your final invoice. We'd rather prove what we can build than talk about it. | Show, don't sell. / For a small fee, we'll draft your site before you commit to the full build. If you go ahead, that fee comes off the final invoice. Better to show you than talk at you. |
| Small on purpose. / You'll talk to the people building your project. No account managers, no handoffs, no juniors doing the actual work. | Small on purpose. / You'll talk to the people building your project. No account managers, no handoffs, no juniors doing the actual work. *(unchanged; already outcome-clear)* |

### What we build
**Was:** What we build / Web design, custom web applications, SaaS products, CRM builds, integrations, and automation. If you want a clear view of fixed packages versus bespoke work, see our pricing page.

**Now:** What you can get / Business websites, booking and enquiry flows, and custom tools when a standard site isn't enough. For fixed packages versus bespoke work, see our pricing page.

### CTA band
**Was:** Ready to talk about your project? / Book a free intro call

**Now:** Curious what we'd change on your site? / Book a 20 min chat

---

## Contact

**File:** `src/components/contact-page.tsx`

### Hero
**Was:** Let's talk about what you're building / Whether you're ready to start or still exploring ideas, we're happy to walk through your goals and what a good next step looks like. / Book a free intro call

**Now:** Tell us what's not working / Whether you're ready to start or still weighing it up, we'll walk through your site and what a sensible next step looks like. / Book a 20 min chat

### Get in touch
**Was:** Get in touch / Prefer to write? Message us directly or drop us an email, we'll reply within 24 hours.

**Now:** Prefer to write first? / Message us on WhatsApp or email. We'll reply within 24 hours.

**WhatsApp card Was:** Message us on WhatsApp / Quick questions or a chat before booking.

**WhatsApp card Now:** Message us on WhatsApp / Quick questions, or a short chat before you book a call.

**Email card:** Email us / hello@theenclosure.co.uk → unchanged (factual)

**Scroll link Was:** Or scroll down to book a call  
**Scroll link Now:** Or scroll down to pick a time

### Cal.com block
**Was:** Book a free intro call / Free 30-minute intro call. No pitch, no strings, just a conversation about what you're trying to build.

**Now:** Book a 20 min chat / A short intro call. No hard sell. Just a look at your current site and what we'd change.

**Josh flag:** Cal.com event is still named/configured as intro-call in `src/config/marketing.ts`. Copy can say “20 min” if the Cal event length matches; if the live Cal event is 30 minutes, use “Book a short intro call” / “A free 30-minute intro call…” instead at apply time. Please confirm duration.

### FAQ (Contact page)
**File:** `src/components/faq.tsx`

**Was (heading):** Frequently asked questions / Common questions answered / Answers to the questions we hear most about our process and packages.

**Now (heading):** Frequently asked questions / Common questions / Straight answers about timing, cost, and what happens after launch.

**FAQ items Was → Now (light outcome tidy; keep factual):**

| Was | Now |
|---|---|
| How much do I need to pay upfront to get started? / We typically require a deposit to begin your project. The remaining balance can be paid through flexible instalments based on your package. Exact terms are confirmed on your intro call. | How much do I need to pay upfront? / We usually take a deposit to start. The rest can be staged by package. Exact terms are confirmed on your intro call. |
| How long does it take to complete a website? / Timelines vary by package and content readiness. Most standard sites take a few weeks once assets are approved. We'll set clear expectations before work begins. | How long does a website take? / It depends on the package and how ready your content is. Most standard sites take a few weeks once assets are approved. We'll set expectations before we start. |
| Do you offer ongoing maintenance after launch? / Yes. We can handle security updates, performance checks, and content changes so your site stays fast, secure, and up to date. | Do you look after the site after launch? / Yes. Updates, checks, and small content changes so the site stays fast and secure without you managing it. |
| Can I make changes to my website after it's launched? / Yes. You'll have full access to your site, and packages can include monthly content updates. Larger edits or new pages can be added as ongoing care. | Can I change things after launch? / Yes. You'll have access to your site, and packages can include monthly updates. Bigger edits or new pages can be added as ongoing care. |
| What happens if I need more than the included pages? / Additional pages can be added after the initial build. Each new page is designed, made mobile-friendly, and integrated into your existing site. | What if I need more pages later? / Extra pages can be added after the first build. Each one is designed, phone-friendly, and fitted into your existing site. |
| Do you provide domain registration or hosting? / Domain registration isn't included, but we'll guide you through purchasing the right one. We assist with hosting setup and SSL so your site is secure and live-ready. | Do you provide domain or hosting? / Domain registration isn't included, but we'll guide you through buying the right one. Hosting setup and security certificates are part of getting you live. |
| Can I cancel my maintenance plan at any time? / Ongoing plans are month-to-month with no long-term contracts. You can cancel with 30 days' notice, and your website remains fully yours. | Can I cancel the retainer any time? / Yes. Month-to-month, no long-term lock-in. Cancel with 30 days' notice. The website remains yours. |
| What if I don't have content or branding ready yet? / We can help you develop brand identity, content strategy, and copywriting before the build begins so your site launches with strong visuals and messaging. | What if I don't have content ready yet? / We can help with branding and copy before the build so you don't launch with half-finished pages. |

**FAQ footer Was:** Don't see your question? Book a free intro call and we'll help.  
**FAQ footer Now:** Don't see your question? Book a 20 min chat and we'll help.

---

## Careers (light touch only)

**File:** `src/pages/careers.tsx`  
**Intent:** tidy weak copy; keep recruiter tone; **do not** apply SME outcome-led sell framing.

### Hero
**Was:** Join our network of freelance developers / We're always looking for talented developers, designers, and digital creators to collaborate on web projects. Work flexibly, build beautiful websites, and get paid for what you love doing. / Apply now

**Now:** Join our freelance network / We're often looking for developers, designers, and digital creators to collaborate on client web projects. Flexible, remote, project-based work with clear scope and pay. / Apply now

### Benefits (light tidy)
| Was | Now |
|---|---|
| Flexible work / Work on projects that fit your schedule and skills, fully remote and asynchronous. | Flexible work / Projects that fit your schedule and skills. Fully remote and asynchronous. |
| Fair pay / Transparent project-based payments, always agreed upfront. | Fair pay / Project-based pay, agreed upfront. No surprises. |
| Creative freedom / Collaborate on builds using React, Next.js, and modern design tools. | Creative freedom / Collaborate on real client builds with modern design and front-end tools. |

### Skills intro / list
Keep the skills list factual (React / Next.js etc. is appropriate for a developer audience).  
Light tidy only if surrounding intro prose is weak; no rewrite of the skill chips themselves unless needed for British English consistency (already fine).

### Apply section
Keep “Apply now” and email CTA factual. Tidy surrounding sentences only if they sound salesy or vague when applying; prefer minimal change.

---

## Shared chrome and CTAs

### Sticky mobile CTA
**File:** `src/components/sticky-cta.tsx`

**Was:** Book a free intro call  
**Now:** Book a 20 min chat

### Footer
**File:** `src/components/footer.tsx`

**Was (tagline):** If your website looks like it's from 2013, it is costing you leads.  
**Now (tagline):** If your website looks like it's from 2013, it's costing you enquiries.

**Was (WhatsApp label):** WhatsApp  
**Now (WhatsApp label):** Message us on WhatsApp

**Footer service links Was → Now (labels only; routes unchanged):**
| Was | Now |
|---|---|
| Website redesign | Website redesign |
| SEO optimisation | Get found locally |
| E-commerce solutions | Sell online without the faff |
| Website maintenance | Site care and updates |

### WhatsApp prefilled message
**File:** `src/config/marketing.ts`

**Was:** Hi, I'd like to chat about a project.  
**Now:** Hi, I'd like a quick chat about what's not working on our website.

### Marketing chatbot (on Home, Services, Pricing, Contact)
**File:** `src/components/ui/chatbot.tsx`

**Was (greeting):** Hi there. I'm the Enclosure assistant. How can I help with your website or project today?

**Now (greeting):** Hi. I'm the Enclosure assistant. Ask about packages, timing, or what's included, or book a short intro call.

**Canned replies:** rewrite any tech-stack or feature-led answers to outcome language at apply time (e.g. replace “We build with modern tools including React…” with “Sites are built to be fast, phone-friendly, and secure.”). Keep factual answers about deposits, timelines, and ownership. CTA phrases: “book a free intro call” → “book a 20 min chat” / “book a short intro call” (match Cal duration flag above).

---

## SEO meta tags and page titles

**Files:** `index.html`, `src/hooks/useDocumentTitle.ts`  
**Constraint:** titles under 60 characters; descriptions under 155. Location signal: UK.  
**Note:** There are currently **no** meta descriptions in the codebase. Apply step should add them in a copy-only way (e.g. `document` meta via a small hook extension or static tags in `index.html` for home + per-route if already patterned). Prefer extending `useDocumentTitle` to also set `meta[name=description]` so behaviour stays route-local without new routes/components of substance. Flag if you want descriptions deferred.

| Page | Was title | Now title (≤60) | Now meta description (≤155) |
|---|---|---|---|
| Home | The Enclosure \| Web design and lead generation | The Enclosure \| Websites that win UK enquiries | We build websites for UK businesses that need more enquiries, stronger local search, and a site that looks the part. |
| Services | Services \| The Enclosure | Services \| The Enclosure | Redesign, local search setup, site care, and custom features for UK businesses that want their website to earn enquiries. |
| Pricing | Pricing \| The Enclosure | Pricing \| The Enclosure | Clear Essential, Professional, and Signature packages for UK business websites, plus a short intro call to choose the right fit. |
| About | About \| The Enclosure | About \| The Enclosure | A small UK studio building websites meant to win enquiries. You talk to the people doing the work. |
| Contact | Contact \| The Enclosure | Contact \| The Enclosure | Tell us what's not working on your site. Book a short intro call, message on WhatsApp, or email The Enclosure. |
| Careers | Careers \| The Enclosure | Careers \| The Enclosure | Freelance web projects with The Enclosure. Flexible, remote collaboration for developers and designers. *(light touch)* |

Default home title in `useDocumentTitle` when no page title is passed should match the new Home title above.

---

## Explicitly out of scope (no changes)

- Admin CRM and client dashboard (including upgrade package copy in the portal)
- Auth screens
- Transactional email copy (`emails/`)
- Privacy Policy and Terms of Service
- Unused / unmounted marketing experiments (`testimonials`, `client-wins`, etc.)
- Prices, package names (Essential / Professional / Signature), brand colours, fonts, routes, interactive behaviour

---

## Open questions for Josh before apply

1. **Cal.com duration:** Copy proposes “20 min chat”. Confirm live Cal event length (20 vs 30). If 30, swap labels to “Book a short intro call” and keep “30-minute” in the Cal block body.
2. **Services tech strip:** Option A (keep tool names under outcome heading) or B (replace with outcome labels)?
3. **Meta descriptions:** OK to extend `useDocumentTitle` to set `meta description` (still copy-facing, no route/behaviour change), or titles only for this pass?
4. **Hero secondary CTA:** Confirm WhatsApp as secondary (per brief) vs keeping “See our packages / services”.

---

## Approval gate

No page components have been edited in this commit.  
After Josh approves this document (with answers to open questions), apply copy to components, run `npm run build`, smoke-check pages, then commit:

`feat: rewrite marketing copy to sell outcomes`
