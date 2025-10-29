import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container } from "./ui/container";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { Logo } from "./ui/logo";
import { t } from "../utils/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { slideInLeft, slideInRight, staggerContainer } from "../lib/animation";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle navigation and make sure mobile menu is closed
  const handleNavigation = () => {
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"}`}
    >
      <Container>
        <nav
          className="flex items-center justify-between py-4"
          aria-label="Global"
        >
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center" onClick={handleNavigation}>
              <Logo />
            </Link>
          </motion.div>
          <div className="flex lg:hidden">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </motion.button>
          </div>
          <motion.div 
            className="hidden lg:flex lg:gap-x-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  variants={slideInRight(0.05 * index)}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    to={item.href}
                    className={`text-sm font-semibold leading-6 transition-colors ${isActive ? "text-[#1A4D2E]" : "text-gray-900 hover:text-[#1A4D2E]"}`}
                    onClick={handleNavigation}
                  >
                    {t(`nav.${item.name.toLowerCase()}`, item.name)}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
          <motion.div 
            className="hidden lg:flex lg:justify-end lg:items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/contact" onClick={handleNavigation}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="default"
                  className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90"
                >
                  {t("button.contactUs", "Contact Us")}
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </nav>
      </Container>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />

            {/* Menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="rounded-md p-1 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </motion.button>
              </div>

              <div className="mt-6 flow-root">
                <div className="space-y-2 py-6">
                  {navigation.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <motion.div
                        key={item.name}
                        variants={slideInLeft(0.05 * index)}
                        initial="hidden"
                        animate="visible"
                      >
                        <Link
                          to={item.href}
                          className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                            isActive
                              ? "text-[#1A4D2E] bg-[#1A4D2E]/5"
                              : "text-gray-900 hover:bg-gray-50"
                          }`}
                          onClick={handleNavigation}
                        >
                          {t(`nav.${item.name.toLowerCase()}`, item.name)}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="border-t border-gray-200 py-6">
                  <motion.div variants={slideInLeft(0.35)} initial="hidden" animate="visible" className="mt-3">
                    <Link
                      to="/contact"
                      className="flex w-full items-center justify-center rounded-md bg-[#1A4D2E] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1A4D2E]/90"
                      onClick={handleNavigation}
                    >
                      {t("button.contactUs", "Contact Us")}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
