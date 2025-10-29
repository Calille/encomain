import { Container } from "./ui/container";
import { ArrowUp, Clock, Users, DollarSign } from "lucide-react";

const clientWins = [
  {
    id: 1,
    client: "Bloom Bakery",
    industry: "Food & Beverage",
    challenge:
      "An outdated website that wasn't mobile-friendly and had poor conversion rates for online orders.",
    solution:
      "Complete redesign with mobile-first approach, online ordering system, and SEO optimisation.",
    results: [
      { metric: "Online Orders", value: "+150%", icon: ArrowUp },
      { metric: "Page Load Speed", value: "1.2s", icon: Clock },
      { metric: "New Customers", value: "+85%", icon: Users },
    ],
    testimonial:
      "The Enclosure completely transformed our outdated website into a modern, high-converting platform. Our online orders increased by 150% in just two months!",
    author: "Sarah Johnson, Owner",
  },
  {
    id: 2,
    client: "Chen Legal Group",
    industry: "Professional Services",
    challenge:
      "A generic template website that failed to establish trust and authority in a competitive legal market.",
    solution:
      "Professional custom design with trust-building elements, client testimonials, and case result showcases.",
    results: [
      { metric: "Consultation Bookings", value: "+200%", icon: ArrowUp },
      { metric: "Avg. Session Duration", value: "+3.5m", icon: Clock },
      { metric: "Revenue Increase", value: "+45%", icon: DollarSign },
    ],
    testimonial:
      "I was amazed by how quickly they delivered our new website. The 7-day turnaround time seemed impossible, but they delivered a stunning site that has significantly improved our online presence and doubled our consultation bookings.",
    author: "Michael Chen, Partner",
  },
  {
    id: 3,
    client: "Mountain Gear",
    industry: "E-commerce",
    challenge:
      "A slow, outdated online store with high cart abandonment rates and poor mobile experience.",
    solution:
      "Complete e-commerce redesign with optimised product pages, streamlined checkout, and mobile optimisation.",
    results: [
      { metric: "Conversion Rate", value: "+120%", icon: ArrowUp },
      { metric: "Cart Abandonment", value: "-35%", icon: ArrowUp },
      { metric: "Revenue Growth", value: "+65%", icon: DollarSign },
    ],
    testimonial:
      "Our e-commerce sales have skyrocketed since launching our redesigned website. The user experience is seamless, and customers love how easy it is to find and purchase products.",
    author: "Alex Rivera, CEO",
  },
];

export default function ClientWins() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-[#7FA99B]">
            Client Success Stories
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl">
            Real Results for Real Businesses
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            See how our AI-powered website redesigns have helped businesses
            across various industries achieve significant growth and ROI.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {clientWins.map((win) => (
            <div
              key={win.id}
              className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-[#1A4D2E]">
                      {win.client}
                    </h3>
                    <p className="text-sm text-gray-500">{win.industry}</p>
                  </div>
                  <div className="bg-[#1A4D2E]/10 text-[#1A4D2E] text-xs font-medium px-2 py-1 rounded-full">
                    Case Study
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Challenge:
                    </h4>
                    <p className="text-sm text-gray-600">{win.challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Solution:
                    </h4>
                    <p className="text-sm text-gray-600">{win.solution}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {win.results.map((result, index) => (
                    <div
                      key={index}
                      className="bg-[#F8FAF9] p-3 rounded-lg text-center"
                    >
                      <result.icon className="h-5 w-5 mx-auto text-[#2D5F3F] mb-1" />
                      <p className="text-xs text-gray-500">{result.metric}</p>
                      <p className="font-semibold text-[#1A4D2E]">
                        {result.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm italic text-gray-600">
                    "{win.testimonial}"
                  </p>
                  <p className="mt-2 text-xs font-medium text-[#1A4D2E]">
                    {win.author}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
