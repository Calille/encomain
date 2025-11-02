import { useState } from 'react';

interface PricingCardProps {
  title: string;
  price: string;
  monthlyPrice: string;
  tagline: string;
  features: string[];
  ongoingCare?: string[];
  timeline: string;
  bestFor: string;
  featured?: boolean;
}

function PricingCard({ 
  title, 
  price, 
  monthlyPrice, 
  tagline, 
  features, 
  ongoingCare,
  timeline, 
  bestFor, 
  featured = false 
}: PricingCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <article 
      className={`relative bg-white rounded-xl shadow-sm p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
        featured ? 'ring-2 ring-blue-600' : ''
      }`}
    >
      {featured && (
        <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
          ⭐ Most Popular
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-lg text-gray-600">+ {monthlyPrice}</span>
        </div>
        <p className="text-base text-gray-600">{tagline}</p>
      </div>

      <div className="border-t border-gray-200 pt-6 mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">What You Get:</h4>
        <ul className="space-y-2">
          {features.slice(0, 4).map((feature, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        {features.length > 4 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            {showDetails ? '− Show Less' : `+ ${features.length - 4} More Features`}
          </button>
        )}
        
        {showDetails && (
          <ul className="space-y-2 mt-3 pt-3 border-t border-gray-100">
            {features.slice(4).map((feature, index) => (
              <li key={index + 4} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {ongoingCare && ongoingCare.length > 0 && (
        <details className="mb-6 group">
          <summary className="cursor-pointer text-sm font-semibold text-gray-900 flex items-center justify-between hover:text-blue-600 transition-colors">
            <span>Ongoing Care ({ongoingCare.length} items)</span>
            <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <ul className="space-y-2 mt-4 pl-1">
            {ongoingCare.map((care, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                <span>{care}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Timeline:</span>
          <span className="font-semibold text-gray-900">{timeline}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Best for:</span>
          <span className="font-medium text-gray-700 text-right">{bestFor}</span>
        </div>
      </div>

      <button
        onClick={() => console.log(`Selected: ${title}`)}
        className={`w-full py-4 rounded-lg font-semibold transition-colors duration-200 min-h-[44px] flex items-center justify-center ${
          featured
            ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            : 'border-2 border-gray-300 text-gray-900 hover:border-blue-600 hover:text-blue-600'
        }`}
        aria-label={`Get started with ${title} package`}
      >
        Get Started
      </button>
    </article>
  );
}

export default function PricingSection() {
  const [activeTab, setActiveTab] = useState<'website' | 'automation'>('website');

  const websitePackages = [
    {
      title: "Essential",
      price: "£1,997",
      monthlyPrice: "£79/month",
      tagline: "Perfect for startups and small businesses launching their first professional website",
      features: [
        "5-page responsive website (Home, About, Services, Contact + 1 custom page)",
        "Mobile-first, fast-loading design",
        "Contact form with email notifications",
        "Core SEO setup (meta tags, sitemap, search console)",
        "SSL certificate & hosting setup assistance",
        "1 round of revisions"
      ],
      ongoingCare: [
        "Weekly security & plugin updates",
        "Monthly performance check",
        "Monthly backup with cloud storage",
        "1 content change per month (text/image swap, max 30 mins)",
        "Email support (48hr response time)"
      ],
      timeline: "3–4 weeks from content approval",
      bestFor: "Service businesses, consultants, local shops"
    },
    {
      title: "Professional",
      price: "£2,997",
      monthlyPrice: "£119/month",
      tagline: "For growing brands ready to convert visitors into customers",
      featured: true,
      features: [
        "10-page responsive website (expandable structure)",
        "Advanced on-page SEO (keyword research, schema markup)",
        "Booking system OR CRM integration (Calendly, HubSpot, etc.)",
        "Google Analytics 4 + social media pixel setup",
        "Subtle scroll animations & micro-interactions",
        "Content structure guidance & copywriting review",
        "2 rounds of revisions"
      ],
      ongoingCare: [
        "Everything in Essential, plus:",
        "Monthly performance & SEO report",
        "2 content updates per month (up to 1 hour total)",
        "Priority email support (24hr response time)",
        "Quarterly strategy call"
      ],
      timeline: "5–7 weeks from content approval",
      bestFor: "Coaches, agencies, health & wellness, B2B services"
    },
    {
      title: "Signature",
      price: "£5,499",
      monthlyPrice: "£179/month",
      tagline: "For established brands who demand a premium digital experience",
      features: [
        "Up to 18 custom pages (or e-commerce with up to 100 products)",
        "Bespoke UI/UX design with brand-aligned motion graphics",
        "AI-powered conversion optimization (heatmaps, A/B testing setup)",
        "Full copywriting for core pages (up to 2,500 words)",
        "Custom integrations (payment gateways, membership areas, APIs)",
        "Dedicated project manager",
        "3 rounds of revisions"
      ],
      ongoingCare: [
        "Everything in Professional, plus:",
        "Full analytics & conversion tracking dashboard",
        "Monthly SEO audit with action plan",
        "Unlimited minor updates (text, images, links)",
        "Security monitoring + 99.9% uptime guarantee",
        "Phone & WhatsApp support",
        "Monthly strategy session"
      ],
      timeline: "8–12 weeks from content approval",
      bestFor: "E-commerce, SaaS, membership sites, high-traffic brands"
    }
  ];

  const automationPackages = [
    {
      title: "Starter Automations",
      price: "£599",
      monthlyPrice: "£39/month",
      tagline: "Simple workflows that make an immediate impact",
    features: [
        "Contact form → CRM auto-sync (HubSpot, Pipedrive, etc.)",
        "Instant email reply with custom branding",
        "Lead notification to your phone/email",
        "1 custom workflow (e.g., appointment reminder)",
        "Setup documentation & training video"
      ],
      timeline: "1–2 weeks from approval",
      bestFor: "Solo entrepreneurs, new businesses"
    },
    {
      title: "Scale Automations",
      price: "£1,299",
      monthlyPrice: "£69/month",
      tagline: "Turn leads into customers on autopilot",
      featured: true,
    features: [
        "Everything in Starter, plus:",
        "5-email nurture sequence (we write the copy)",
        "WhatsApp or SMS follow-up workflows",
        "Automated appointment booking with calendar sync",
        "Lead tagging & segmentation",
        "Workflow analytics dashboard"
      ],
      timeline: "2–3 weeks from approval",
      bestFor: "Service providers, course creators, coaches"
    },
    {
      title: "Suite Automations",
      price: "£2,499",
      monthlyPrice: "£99/month",
      tagline: "Enterprise-level automation for scaling businesses",
    features: [
        "Everything in Scale, plus:",
        "AI-powered chatbot for instant client responses",
        "Smart lead scoring & priority alerts",
        "Multi-platform integrations (Stripe, Xero, Slack, Zapier, etc.)",
        "Custom reporting dashboards",
        "Quarterly automation audit & optimization"
      ],
      timeline: "3–4 weeks from approval",
      bestFor: "Agencies, e-commerce, high-volume service businesses"
    }
  ];

  const addOns = [
    {
      service: "Brand Identity Design",
      price: "from £499",
      description: "Logo, colour palette, typography, brand guidelines"
    },
    {
      service: "Email Marketing Setup",
      price: "£249",
      description: "List migration, template design, 3 campaign automations"
    },
    {
      service: "Blog Content Writing",
      price: "£129/post",
      description: "800–1,200 words, SEO optimized, royalty-free images"
    },
    {
      service: "E-commerce Product Uploads",
      price: "£3.50/product",
      description: "Title, description, images, pricing, inventory setup"
    },
    {
      service: "Additional Pages",
      price: "£199/page",
      description: "After initial build is complete"
    },
    {
      service: "Expedited Delivery",
      price: "+30%",
      description: "Reduce timeline by up to 50% (subject to availability)"
    }
  ];

  const benefits = [
    {
      icon: "✅",
      title: "No Hidden Fees",
      description: "What you see is what you pay"
    },
    {
      icon: "✅",
      title: "Transparent Timelines",
      description: "We deliver on time or communicate early"
    },
    {
      icon: "✅",
      title: "You Own Everything",
      description: "Full access to your site, no lock-in"
    },
    {
      icon: "✅",
      title: "Real Support",
      description: "Actual humans, not chatbots"
    }
  ];

  const currentPackages = activeTab === 'website' ? websitePackages : automationPackages;

  return (
    <section className="bg-gray-50 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the package that fits your needs. No surprises, no hidden fees.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div role="tablist" className="inline-flex gap-4 border-b border-gray-200">
            <button
              role="tab"
              aria-selected={activeTab === 'website'}
              aria-controls="website-pricing"
              onClick={() => setActiveTab('website')}
              className={`px-6 py-3 font-semibold border-b-2 transition-all duration-200 ${
                activeTab === 'website'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              💼 Website Design
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'automation'}
              aria-controls="automation-pricing"
              onClick={() => setActiveTab('automation')}
              className={`px-6 py-3 font-semibold border-b-2 transition-all duration-200 ${
                activeTab === 'automation'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ Business Automation
            </button>
          </div>
        </div>

        <div 
          id={activeTab === 'website' ? 'website-pricing' : 'automation-pricing'}
          role="tabpanel"
          className="transition-opacity duration-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {currentPackages.map((pkg, index) => (
              <PricingCard key={index} {...pkg} />
            ))}
          </div>
        </div>

        <div className="mb-16">
          <details className="group" open>
            <summary className="cursor-pointer text-3xl font-bold text-gray-900 text-center mb-8 hover:text-blue-600 transition-colors flex items-center justify-center gap-3">
              <span>Add-Ons & Extras</span>
              <span className="text-2xl text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
          
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden mt-8">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                </tr>
              </thead>
              <tbody>
                {addOns.map((addOn, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{addOn.service}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{addOn.price}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{addOn.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4 mt-8">
            {addOns.map((addOn, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">{addOn.service}</h4>
                <p className="text-blue-600 font-semibold mb-2">{addOn.price}</p>
                <p className="text-sm text-gray-600">{addOn.description}</p>
              </div>
            ))}
          </div>
          </details>
        </div>

        <div className="mb-16">
          <details className="group">
            <summary className="cursor-pointer text-3xl font-bold text-gray-900 text-center mb-8 hover:text-blue-600 transition-colors flex items-center justify-center gap-3">
              <span>Important Information</span>
              <span className="text-2xl text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">What's NOT Included</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 flex-shrink-0 mt-1">•</span>
                  <span>Domain registration (we can advise on purchase)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 flex-shrink-0 mt-1">•</span>
                  <span>Third-party software licenses (e.g., premium plugins, tools)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 flex-shrink-0 mt-1">•</span>
                  <span>Stock photos beyond our standard library</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 flex-shrink-0 mt-1">•</span>
                  <span>Ongoing paid advertising management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 flex-shrink-0 mt-1">•</span>
                  <span>Content creation beyond scope specified in each package</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Payment Terms</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 flex-shrink-0 mt-1">•</span>
                  <span>20% deposit to begin, remaining balance in flexible monthly installments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 flex-shrink-0 mt-1">•</span>
                  <span>Monthly maintenance begins the month after site goes live</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 flex-shrink-0 mt-1">•</span>
                  <span>Cancel anytime with 30 days' notice (no long-term contracts)</span>
                </li>
              </ul>
              </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Our Process</h4>
              <ol className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600 flex-shrink-0">1.</span>
                  <span>Discovery Call — Understand your goals & audience (free, 30 mins)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600 flex-shrink-0">2.</span>
                  <span>Strategy & Planning — Sitemap, wireframes, content outline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600 flex-shrink-0">3.</span>
                  <span>Design — Visual mockups for your approval</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600 flex-shrink-0">4.</span>
                  <span>Development — Build, test, optimize</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600 flex-shrink-0">5.</span>
                  <span>Launch & Training — Go live + 1-hour walkthrough session</span>
                </li>
              </ol>
            </div>
          </div>
          </details>
        </div>
        
        <div className="mb-16">
          <div className="bg-blue-50 border-2 border-blue-200 p-8 rounded-xl text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">🎯 Not Sure Which Package is Right?</h3>
            <p className="text-gray-700 mb-6">
              Book a free 30-minute discovery call and we'll help you choose the perfect fit.
            </p>
            <a
              href="#contact"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              aria-label="Schedule your free discovery call"
            >
              Schedule Your Free Call →
            </a>
          </div>
            </div>

        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Work With Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
    </div>
    </section>
  );
}
