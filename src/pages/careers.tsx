import { Container } from "../components/ui/container";
import { AnimatedBackground } from "../components/ui/animated-background";
import Header from "../components/header";
import Footer from "../components/footer";
import { motion } from "framer-motion";
import { Mail, Phone, Check, Calendar, DollarSign, Sparkles } from "lucide-react";

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

export default function Careers() {
  const scrollToApply = () => {
    const applySection = document.getElementById('apply');
    if (applySection) {
      applySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const benefits = [
    {
      icon: Calendar,
      title: "Flexible Work",
      description: "Work on projects that fit your schedule and skills — fully remote and asynchronous."
    },
    {
      icon: DollarSign,
      title: "Fair Pay",
      description: "Transparent project-based payments, always agreed upfront."
    },
    {
      icon: Sparkles,
      title: "Creative Freedom",
      description: "Collaborate on innovative builds using React, Next.js, and AI-driven design tools."
    }
  ];

  const skills = [
    "React / Next.js",
    "Tailwind CSS",
    "TypeScript",
    "UI/UX Design",
    "API Integrations",
    "Framer Motion or GSAP animations",
    "WordPress or Shopify (bonus)"
  ];

  return (
    <div className="bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-[#F8FAF9] pt-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatedBackground />
            <div className="absolute left-0 top-0 h-full w-full bg-[#F8FAF9] opacity-90" />
          </div>

          <Container className="relative pt-16 pb-20 sm:pt-24 sm:pb-24">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-4xl font-bold tracking-tight text-[#1A1A1A] sm:text-5xl"
              >
                Join Our Network of Freelance Developers
              </motion.h1>
              
              <motion.p
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
                className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto"
              >
                We're always looking for talented developers, designers, and digital creators to collaborate on exciting web projects. Work flexibly, build beautiful websites, and get paid for what you love doing.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
                className="mt-10"
              >
                <button
                  onClick={scrollToApply}
                  className="bg-[#1A4D2E] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#2D5F3F] transition-all duration-200 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A4D2E] focus:ring-offset-2"
                >
                  Apply Now
                </button>
              </motion.div>
            </motion.div>
          </Container>
        </section>

        {/* Why Work With Us */}
        <section className="py-16 md:py-20 bg-white">
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
                Why Join The Enclosure?
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100"
                  >
                    <div className="w-14 h-14 bg-[#1A4D2E] rounded-lg flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                      {benefit.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Container>
        </section>

        {/* Who We're Looking For */}
        <section className="py-16 md:py-20 bg-[#F8FAF9]">
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="max-w-5xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-12 text-center">
                We're Looking For Freelancers With Experience In:
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    We collaborate with skilled professionals who bring creativity and technical expertise to every project. Whether you're a specialist in modern frameworks or a versatile full-stack developer, we'd love to hear from you.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    If you're passionate about modern design, clean code, and problem-solving — you'll fit right in.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <ul className="space-y-4">
                    {skills.map((skill, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-[#1A4D2E] rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" aria-hidden="true" />
                        </div>
                        <span className="text-gray-700 font-medium">{skill}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* How to Apply */}
        <section className="py-16 md:py-20 bg-white" id="apply">
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-8 text-center">
                How to Apply
              </h2>

              <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg border-2 border-[#1A4D2E]/20">
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  Send us a short introduction and a link to your portfolio, GitHub, or any recent work. We'll reach out if your skill set matches an upcoming project.
                </p>

                <div className="bg-[#F8FAF9] p-6 rounded-lg mb-8">
                  <h3 className="font-semibold text-[#1A1A1A] mb-4">Contact Details:</h3>
                  <div className="space-y-3">
                    <a
                      href="mailto:josh@theenclosure.co.uk"
                      className="flex items-center gap-3 text-[#1A4D2E] font-semibold hover:text-[#2D5F3F] transition-colors duration-200"
                    >
                      <Mail className="w-5 h-5" aria-hidden="true" />
                      <span>josh@theenclosure.co.uk</span>
                    </a>
                    <a
                      href="tel:07877700777"
                      className="flex items-center gap-3 text-[#1A4D2E] font-semibold hover:text-[#2D5F3F] transition-colors duration-200"
                    >
                      <Phone className="w-5 h-5" aria-hidden="true" />
                      <span>07877 700 777</span>
                    </a>
                  </div>
                </div>

                <a
                  href="mailto:josh@theenclosure.co.uk?subject=Freelance%20Developer%20Application"
                  className="block w-full text-center bg-[#1A4D2E] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#2D5F3F] transition-all duration-200 transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-[#1A4D2E] focus:ring-offset-2"
                >
                  Email Josh
                </a>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-[#1A4D2E] text-white">
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Let's Build Something Brilliant Together
              </h2>
              <p className="text-xl text-gray-200 mb-10 leading-relaxed">
                We collaborate with developers who love clean design, efficient builds, and pushing boundaries. Think you'd fit in?
              </p>
              <button
                onClick={scrollToApply}
                className="bg-white text-[#1A4D2E] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1A4D2E]"
              >
                Get in Touch
              </button>
            </motion.div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}

