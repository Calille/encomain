/**
 * Services Page - The Enclosure
 * Complete services page with Header/Footer and all site components
 */

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Palette,
  Search,
  ShoppingCart,
  Smartphone,
  Wrench,
  Code,
  Globe,
  FileText,
  Zap,
  CheckCircle2,
  X,
  ChevronRight
} from 'lucide-react';
import Header from "./header";
import Footer from "./footer";
import CTA from "./cta";
import { Chatbot } from "./ui/chatbot";
import StickyCTA from "./sticky-cta";

// Type definitions
interface Service {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  link: string;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Services() {
  const prefersReducedMotion = useReducedMotion();
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [stickyBarDismissed, setStickyBarDismissed] = useState(false);

  // Sticky CTA scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > window.innerHeight * 0.5;
      setShowStickyBar(scrolled && !stickyBarDismissed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stickyBarDismissed]);

  // Services data
  const services: Service[] = [
    {
      icon: Palette,
      title: 'Website Redesign',
      description: 'Transform your outdated website into a modern platform. Mobile-first design that drives real business results.',
      link: '#'
    },
    {
      icon: Search,
      title: 'SEO Optimisation',
      description: 'Boost search rankings and attract organic traffic. Data-driven strategies that deliver measurable growth.',
      link: '#'
    },
    {
      icon: ShoppingCart,
      title: 'E-Commerce Solutions',
      description: 'Create seamless shopping experiences that convert. Secure checkout, inventory management, payment integration.',
      link: '#'
    },
    {
      icon: Smartphone,
      title: 'Mobile & Performance',
      description: 'Fast-loading, responsive sites that work flawlessly on all devices. App-like experience for your users.',
      link: '#'
    },
    {
      icon: Wrench,
      title: 'Website Maintenance',
      description: 'Keep your site secure and performing at its best. Regular updates, monitoring, and technical support.',
      link: '#'
    },
    {
      icon: Code,
      title: 'Custom Development',
      description: 'Build tailored web applications for your specific needs. API integrations, custom features, database design.',
      link: '#'
    },
    {
      icon: Globe,
      title: 'International SEO',
      description: 'Expand globally with multilingual strategies. Attract international customers with geo-targeting optimization.',
      link: '#'
    },
    {
      icon: FileText,
      title: 'Content Strategy',
      description: 'Engage your audience and drive conversions. SEO-optimized copywriting and comprehensive content planning.',
      link: '#'
    }
  ];

  // Process steps
  const processSteps = [
    { number: 1, icon: Search, title: 'Discovery', duration: '1 week', description: 'We analyze your business and goals' },
    { number: 2, icon: Palette, title: 'Design', duration: '2 weeks', description: 'Create conversion-focused mockups' },
    { number: 3, icon: Code, title: 'Development', duration: '3-4 weeks', description: 'Build with modern technologies' },
    { number: 4, icon: CheckCircle2, title: 'Delivery', duration: 'Launch', description: 'Go live with full training' }
  ];

  // Technology stack
  const technologies = [
    { name: 'React', icon: Code },
    { name: 'Next.js', icon: Zap },
    { name: 'Tailwind', icon: Palette },
    { name: 'TypeScript', icon: FileText },
    { name: 'WordPress', icon: Globe },
    { name: 'Shopify', icon: ShoppingCart }
  ];

  return (
    <div className="bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1A4D2E] to-[#2D5F3F] text-white overflow-hidden pt-24">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              >
                Smart, Modern Websites — Designed to Convert
              </motion.h1>
              
              <motion.p
                variants={fadeInUp}
                className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto"
              >
                AI-powered design meets measurable results. We build websites that work as hard as you do.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <a
                  href="/contact"
                  className="bg-white text-[#1A4D2E] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1A4D2E]"
                >
                  Book a Free Consultation
                </a>
                
                <a
                  href="/about"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#1A4D2E] transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1A4D2E]"
                >
                  Learn More
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 md:py-24 bg-[#F8FAF9]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4"
              >
                Comprehensive Web Solutions
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                From complete redesigns to ongoing maintenance, we've got you covered.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.article
                    key={index}
                    variants={fadeInUp}
                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
                  >
                    <div className="w-14 h-14 bg-[#1A4D2E] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#2D5F3F] transition-colors">
                      <Icon className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <a
                      href={service.link}
                      className="inline-flex items-center text-[#1A4D2E] font-semibold hover:text-[#2D5F3F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A4D2E] focus:ring-offset-2 rounded"
                    >
                      Learn More
                      <ChevronRight className="w-5 h-5 ml-1" aria-hidden="true" />
                    </a>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Process Timeline */}
        <section className="py-16 md:py-24 bg-[#F8FAF9]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
                Our Process
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A streamlined approach that delivers results.
              </p>
            </motion.div>

            {/* Desktop Timeline */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute top-12 left-0 right-0 h-0.5 bg-gray-300" />
                
                <div className="grid grid-cols-4 gap-8 relative">
                  {processSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={index}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        transition={{ delay: index * 0.1 }}
                        className="text-center"
                      >
                        <div className="relative inline-flex items-center justify-center w-24 h-24 bg-[#1A4D2E] text-white rounded-full font-bold text-2xl mb-6 shadow-lg">
                          <span>{step.number}</span>
                          <div className="absolute -bottom-2 right-0 w-10 h-10 bg-[#2D5F3F] rounded-full flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm font-semibold text-[#1A4D2E] mb-2">
                          {step.duration}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {step.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Timeline */}
            <div className="md:hidden space-y-8">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="flex gap-6"
                  >
                    <div className="flex-shrink-0">
                      <div className="relative w-16 h-16 bg-[#1A4D2E] text-white rounded-full font-bold text-xl flex items-center justify-center shadow-lg">
                        {step.number}
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#2D5F3F] rounded-full flex items-center justify-center">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm font-semibold text-[#1A4D2E] mb-2">
                        {step.duration}
                      </p>
                      <p className="text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
                Built with Modern Technologies
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We use the latest tools to ensure your website is fast, secure, and scalable.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8"
            >
              {technologies.map((tech, index) => {
                const Icon = tech.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="flex flex-col items-center gap-4 p-6 rounded-xl bg-[#F8FAF9] hover:bg-white hover:shadow-lg transition-all group"
                  >
                    <div className="w-16 h-16 flex items-center justify-center bg-[#1A4D2E] text-white rounded-lg group-hover:bg-[#2D5F3F] transition-colors">
                      <Icon className="w-8 h-8" />
                    </div>
                    <span className="font-semibold text-[#1A1A1A] text-sm">
                      {tech.name}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <CTA />
      </main>
      <Footer />
      <Chatbot />
      <StickyCTA />
    </div>
  );
}

