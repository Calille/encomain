import { Container } from "./ui/container";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Logo } from "./ui/logo";
import { Button } from "./ui/button";
import { t } from "../utils/i18n";

const navigation = {
  main: [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  social: [
    { name: "Facebook", href: "https://facebook.com", icon: Facebook },
    { name: "Instagram", href: "https://instagram.com", icon: Instagram },
    { name: "Twitter", href: "https://twitter.com", icon: Twitter },
    { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#f9fafb]">
      <Container className="py-12 md:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link to="/" className="flex items-center">
              <Logo color="#1f4d36" />
            </Link>
            <p className="text-sm leading-6 text-[#1a1f1c]">
              {t(
                "footer.tagline",
                "If your website looks like it's from 2013, it is costing you leads.",
              )}
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-[#1f4d36]">
                  {t("footer.navigation", "Navigation")}
                </h3>
                <ul className="mt-6 space-y-4">
                  {navigation.main.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-sm leading-6 text-[#1f4d36] hover:text-[#0b3b25] hover:underline transition-colors"
                      >
                        {t(`nav.${item.name.toLowerCase()}`, item.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-[#1f4d36]">
                  Services
                </h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="/services"
                      className="text-sm leading-6 text-[#1f4d36] hover:text-[#0b3b25] hover:underline transition-colors"
                    >
                      Website Redesign
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/services"
                      className="text-sm leading-6 text-[#1f4d36] hover:text-[#0b3b25] hover:underline transition-colors"
                    >
                      SEO Optimization
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/services"
                      className="text-sm leading-6 text-[#1f4d36] hover:text-[#0b3b25] hover:underline transition-colors"
                    >
                      E-commerce Solutions
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/services"
                      className="text-sm leading-6 text-[#1f4d36] hover:text-[#0b3b25] hover:underline transition-colors"
                    >
                      Website Maintenance
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-[#1f4d36]">
                  Company
                </h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="/about"
                      className="text-sm leading-6 text-[#1f4d36] hover:text-[#0b3b25] hover:underline transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/careers"
                      className="text-sm leading-6 text-[#1f4d36] hover:text-[#0b3b25] hover:underline transition-colors"
                    >
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-[#1f4d36]">
                  Legal
                </h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="/privacy-policy"
                      className="text-sm leading-6 text-[#1f4d36] hover:text-[#0b3b25] hover:underline transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms-of-service"
                      className="text-sm leading-6 text-[#1f4d36] hover:text-[#0b3b25] hover:underline transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-black/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-[#1a1f1c]/70">
            &copy; {new Date().getFullYear()} The Enclosure. All rights
            reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
