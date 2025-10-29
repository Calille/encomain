import { Container } from "./ui/container";
import { Link } from "react-router-dom";

const pricingTiers = [
  {
    name: "Essential",
    price: "£1,997",
    description: "Perfect for startups and small businesses",
    features: [
      "5-page responsive website",
      "Mobile-first design",
      "Contact form integration",
      "Core SEO setup",
      "SSL & hosting assistance"
    ]
  },
  {
    name: "Professional",
    price: "£2,997",
    description: "For growing brands ready to convert",
    features: [
      "10-page responsive website",
      "Advanced SEO optimization",
      "Booking/CRM integration",
      "Analytics & tracking",
      "Priority support"
    ],
    featured: true
  },
  {
    name: "Signature",
    price: "£5,499",
    description: "Premium digital experience",
    features: [
      "Up to 18 custom pages",
      "Bespoke UI/UX design",
      "AI conversion optimization",
      "Full copywriting",
      "Dedicated project manager"
    ]
  }
];

export default function PricingSimple() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-[#7FA99B]">
            Pricing
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl">
            Simple, Transparent Pricing
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose the package that fits your needs. No surprises, no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 ${
                tier.featured
                  ? 'ring-2 ring-[#1A4D2E] shadow-xl relative'
                  : 'ring-1 ring-gray-200'
              } transition-all hover:shadow-lg`}
            >
              {tier.featured && (
                <div className="absolute -top-3 right-4 bg-[#1A4D2E] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-semibold text-[#1A4D2E] mb-2">
                {tier.name}
              </h3>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {tier.price}
              </p>
              <p className="text-gray-600 mb-6">
                {tier.description}
              </p>
              
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-[#1A4D2E] font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/pricing">
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    tier.featured
                      ? 'bg-[#1A4D2E] text-white hover:bg-[#1A4D2E]/90'
                      : 'border-2 border-gray-300 text-gray-900 hover:border-[#1A4D2E] hover:text-[#1A4D2E]'
                  }`}
                >
                  Learn More
                </button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/pricing">
            <button className="inline-flex items-center gap-2 text-[#1A4D2E] font-semibold hover:underline">
              View Full Pricing Details →
            </button>
          </Link>
        </div>
      </Container>
    </section>
  );
}

