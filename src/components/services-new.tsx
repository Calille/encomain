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

interface CalculatorState {
  businessType: 'brochure' | 'ecommerce' | 'custom';
  pageCount: string;
  addons: {
    seo: boolean;
    content: boolean;
    support: boolean;
    ecommerce: boolean;
  };
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

  // Calculator state
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    businessType: 'brochure',
    pageCount: '1-5',
    addons: {
      seo: false,
      content: false,
      support: false,
      ecommerce: false
    }
  });
  const [showEstimate, setShowEstimate] = useState(false);

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

  // Calculator pricing logic
  const calculateEstimate = (): { min: number; max: number; monthly: number } => {
    const basePrices = {
      brochure: 2000,
      ecommerce: 5000,
      custom: 8000
    };

    const pageMultipliers: { [key: string]: number } = {
      '1-5': 1.0,
      '6-10': 1.3,
      '11-20': 1.6,
      '21+': 2.0
    };

    const base = basePrices[calculatorState.businessType];
    const multiplier = pageMultipliers[calculatorState.pageCount] || 1.0;

    let addonsTotal = 0;
    let monthlyTotal = 0;

    if (calculatorState.addons.seo) addonsTotal += 800;
    if (calculatorState.addons.content) addonsTotal += 600;
    if (calculatorState.addons.support) monthlyTotal += 400;
    if (calculatorState.addons.ecommerce && calculatorState.businessType !== 'ecommerce') {
      addonsTotal += 1500;
    }

    const subtotal = Math.round(base * multiplier + addonsTotal);
    
    return {
      min: subtotal,
      max: Math.round(subtotal * 1.15),
      monthly: monthlyTotal
    };
  };

  const handleCalculate = () => {
    setShowEstimate(true);
  };

  const estimate = calculateEstimate();

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

        {/* Interactive Cost Calculator */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
                Get an Instant Estimate
              </h2>
              <p className="text-lg text-gray-600">
                Calculate the cost of your project in seconds.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
              className="bg-[#F8FAF9] p-8 md:p-12 rounded-2xl shadow-lg"
            >
              {/* Business Type Selection */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-[#1A1A1A] mb-4">
                  Business Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { value: 'brochure', label: 'Brochure Site' },
                    { value: 'ecommerce', label: 'E-Commerce' },
                    { value: 'custom', label: 'Custom App' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        calculatorState.businessType === option.value
                          ? 'border-[#1A4D2E] bg-[#1A4D2E] text-white'
                          : 'border-gray-300 bg-white hover:border-[#1A4D2E]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="businessType"
                        value={option.value}
                        checked={calculatorState.businessType === option.value}
                        onChange={(e) =>
                          setCalculatorState({
                            ...calculatorState,
                            businessType: e.target.value as any
                          })
                        }
                        className="sr-only"
                      />
                      <span className="font-semibold">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Page Count */}
              <div className="mb-8">
                <label htmlFor="pageCount" className="block text-lg font-semibold text-[#1A1A1A] mb-4">
                  Number of Pages
                </label>
                <select
                  id="pageCount"
                  value={calculatorState.pageCount}
                  onChange={(e) =>
                    setCalculatorState({ ...calculatorState, pageCount: e.target.value })
                  }
                  className="w-full p-4 rounded-lg border-2 border-gray-300 bg-white focus:border-[#1A4D2E] focus:outline-none focus:ring-2 focus:ring-[#1A4D2E] focus:ring-offset-2"
                >
                  <option value="1-5">1–5 pages</option>
                  <option value="6-10">6–10 pages</option>
                  <option value="11-20">11–20 pages</option>
                  <option value="21+">21+ pages</option>
                </select>
              </div>

              {/* Add-ons */}
              <div className="mb-8">
                <p className="block text-lg font-semibold text-[#1A1A1A] mb-4">
                  Optional Add-ons
                </p>
                <div className="space-y-3">
                  {[
                    { key: 'seo', label: 'SEO Package', price: '+£800' },
                    { key: 'content', label: 'Content Writing', price: '+£600' },
                    { key: 'support', label: 'Priority Support', price: '+£400/month' },
                    { key: 'ecommerce', label: 'E-Commerce Integration', price: '+£1,500', disabled: calculatorState.businessType === 'ecommerce' }
                  ].map((addon) => (
                    <label
                      key={addon.key}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        calculatorState.addons[addon.key as keyof typeof calculatorState.addons]
                          ? 'border-[#1A4D2E] bg-[#1A4D2E]/5'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      } ${addon.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={calculatorState.addons[addon.key as keyof typeof calculatorState.addons]}
                          onChange={(e) =>
                            setCalculatorState({
                              ...calculatorState,
                              addons: {
                                ...calculatorState.addons,
                                [addon.key]: e.target.checked
                              }
                            })
                          }
                          disabled={addon.disabled}
                          className="w-5 h-5 text-[#1A4D2E] border-gray-300 rounded focus:ring-2 focus:ring-[#1A4D2E] focus:ring-offset-2"
                        />
                        <span className="ml-3 font-medium text-[#1A1A1A]">{addon.label}</span>
                      </div>
                      <span className="text-gray-600 font-semibold">{addon.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-[#1A4D2E] text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-[#2D5F3F] transition-all transform hover:scale-[1.02] shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A4D2E] focus:ring-offset-2"
              >
                Calculate Estimate
              </button>

              {showEstimate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-8 bg-white rounded-xl border-2 border-[#1A4D2E] shadow-lg"
                >
                  <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                    Your Estimated Cost
                  </h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold text-[#1A4D2E]">
                      £{estimate.min.toLocaleString()}
                    </span>
                    {estimate.max !== estimate.min && (
                      <>
                        <span className="text-2xl text-gray-600">—</span>
                        <span className="text-5xl font-bold text-[#1A4D2E]">
                          £{estimate.max.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                  {estimate.monthly > 0 && (
                    <p className="text-gray-600 mb-6">
                      + £{estimate.monthly}/month ongoing support
                    </p>
                  )}
                  <p className="text-gray-600 mb-6">
                    This is an estimate based on your selections. Final pricing may vary based on specific requirements.
                  </p>
                  <a
                    href="/contact"
                    className="block w-full text-center bg-[#1A4D2E] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2D5F3F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A4D2E] focus:ring-offset-2"
                  >
                    Get Detailed Quote
                  </a>
                </motion.div>
              )}
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

