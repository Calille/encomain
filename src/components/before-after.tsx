import { Container } from "./ui/container";
import { motion } from "framer-motion";
import { useState } from "react";

export default function BeforeAfter() {
  const [activeCase, setActiveCase] = useState(0);
  
  const caseStudies = [
    {
      client: "Mountain View Dental",
      industry: "Healthcare",
      beforeImage: "https://images.unsplash.com/photo-1599911980000-c90118ad2697?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      afterImage: "https://images.unsplash.com/photo-1586232702178-f044c5f4d4b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      results: "85% increase in appointment bookings and 130% increase in organic traffic within 3 months of launch.",
      quote: "The Enclosure completely transformed our online presence. The new website not only looks more professional but has significantly increased our new patient inquiries.",
      person: "Dr. Sarah Johnson, Owner"
    },
    {
      client: "Coast Café",
      industry: "Restaurant",
      beforeImage: "https://images.unsplash.com/photo-1594487431116-6df7718b2617?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      afterImage: "https://images.unsplash.com/photo-1567532900872-f4e906cbf06a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      results: "95% increase in online orders and 70% increase in reservations after the website redesign.",
      quote: "Our old website was holding us back. Now we have a beautiful site that showcases our food and makes ordering simple for our customers.",
      person: "Marco Sanchez, Owner"
    },
    {
      client: "Green Thumb Landscaping",
      industry: "Home Services",
      beforeImage: "https://images.unsplash.com/photo-1621631536691-526e4daaa42a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      afterImage: "https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      results: "120% increase in quote requests and 45% reduction in bounce rate within the first month.",
      quote: "The redesign perfectly captures our brand's connection to nature while making it easy for potential clients to request services.",
      person: "James Chen, Operations Manager"
    }
  ];

  const current = caseStudies[activeCase];

  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="text-center mb-16">
          <motion.h2 
            className="text-base font-semibold leading-7 text-[#7FA99B]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Before & After Transformations
          </motion.h2>
          <motion.p 
            className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Real Results for Real Businesses
          </motion.p>
          <motion.p 
            className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            See how we've transformed websites and delivered measurable business impacts for our clients.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            key={`before-${activeCase}`}
          >
            <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
              <div className="bg-gray-800 text-white text-center py-2 text-sm font-medium">BEFORE</div>
              <img 
                src={current.beforeImage} 
                alt={`${current.client} website before redesign`} 
                className="w-full h-64 object-cover object-top" 
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            key={`after-${activeCase}`}
          >
            <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
              <div className="bg-[#1A4D2E] text-white text-center py-2 text-sm font-medium">AFTER</div>
              <img 
                src={current.afterImage} 
                alt={`${current.client} website after redesign`} 
                className="w-full h-64 object-cover object-top" 
              />
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="bg-[#F8FAF9] p-8 rounded-xl shadow-sm max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          key={`details-${activeCase}`}
        >
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-[#1A4D2E]">{current.client}</h3>
              <p className="text-gray-500">{current.industry}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-block bg-[#7FA99B]/20 text-[#7FA99B] px-3 py-1 rounded-full text-sm font-medium">
                Success Story
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Results:</h4>
            <p className="text-gray-600">{current.results}</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg border-l-4 border-[#7FA99B] italic">
            <p className="text-gray-600 mb-3">"{current.quote}"</p>
            <p className="text-[#1A4D2E] font-medium">— {current.person}</p>
          </div>
        </motion.div>

        <div className="flex justify-center mt-12 gap-3">
          {caseStudies.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveCase(index)}
              className={`w-3 h-3 rounded-full ${index === activeCase ? 'bg-[#1A4D2E]' : 'bg-gray-300'}`}
              aria-label={`View case study ${index + 1}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
} 