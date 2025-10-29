import { Container } from "./ui/container";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function WhatsIncluded() {
  const includedFeatures = [
    {
      title: "Responsive Design",
      description: "Your website will look great and function perfectly on all devices, from desktops to smartphones."
    },
    {
      title: "Custom Branding",
      description: "We'll incorporate your brand colors, logos, and style guidelines for a consistent visual identity."
    },
    {
      title: "SEO Optimization",
      description: "Built-in SEO best practices to help improve your rankings and drive more organic traffic."
    },
    {
      title: "Performance Tuning",
      description: "Optimized code and images for lightning-fast loading speeds and improved user experience."
    },
    {
      title: "Content Creation",
      description: "Professional copywriting that highlights your value proposition and converts visitors."
    },
    {
      title: "Lead Generation Forms",
      description: "Strategic placement of contact forms and CTAs to capture leads and grow your business."
    },
    {
      title: "Analytics Integration",
      description: "Track visitor behavior and conversion metrics to measure your website's performance."
    },
    {
      title: "30-Day Support",
      description: "Post-launch technical support and adjustments to ensure everything runs smoothly."
    }
  ];

  return (
    <section className="bg-[#F8FAF9] py-24">
      <Container>
        <div className="text-center mb-16">
          <motion.h2 
            className="text-base font-semibold leading-7 text-[#7FA99B]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            What's Included
          </motion.h2>
          <motion.p 
            className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything You Need For Success
          </motion.p>
          <motion.p 
            className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our comprehensive website redesign packages include all the essential elements needed to create a high-performing online presence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {includedFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-4">
                <div className="bg-[#1A4D2E]/10 p-2 rounded-full mr-3">
                  <Check className="h-5 w-5 text-[#1A4D2E]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1A4D2E]">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
} 