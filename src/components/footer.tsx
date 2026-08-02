import { Container } from "./ui/container";
import { Link } from "react-router-dom";
import { Mail, MessageCircle } from "lucide-react";
import { Logo } from "./ui/logo";
import { t } from "../utils/i18n";
import { whatsappLink } from "../config/marketing";

const navigation = {
  main: [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-marketing-mint">
      <Container className="py-12 md:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link to="/" className="flex items-center">
              <Logo />
            </Link>
            <p className="text-marketing-sm leading-6 text-marketing-ink">
              {t(
                "footer.tagline",
                "If your website looks like it's from 2013, it's costing you enquiries."
              )}
            </p>
            <div className="space-y-3">
              <a
                href="mailto:hello@theenclosure.co.uk"
                className="flex items-center gap-2 text-marketing-sm text-marketing-muted transition-colors hover:text-marketing-forest"
              >
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                hello@theenclosure.co.uk
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-marketing-sm text-marketing-muted transition-colors hover:text-marketing-forest"
              >
                <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                Message us on WhatsApp
              </a>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-marketing-sm font-semibold leading-6 text-marketing-forest">
                  {t("footer.navigation", "Navigation")}
                </h3>
                <ul className="mt-6 space-y-4">
                  {navigation.main.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-marketing-sm leading-6 text-marketing-forest transition-colors hover:text-marketing-forest-dark hover:underline"
                      >
                        {t(`nav.${item.name.toLowerCase()}`, item.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-marketing-sm font-semibold leading-6 text-marketing-forest">
                  Services
                </h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="/services"
                      className="text-marketing-sm leading-6 text-marketing-forest transition-colors hover:text-marketing-forest-dark hover:underline"
                    >
                      Website redesign
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/services"
                      className="text-marketing-sm leading-6 text-marketing-forest transition-colors hover:text-marketing-forest-dark hover:underline"
                    >
                      Get found locally
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/services"
                      className="text-marketing-sm leading-6 text-marketing-forest transition-colors hover:text-marketing-forest-dark hover:underline"
                    >
                      Sell online without the faff
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/services"
                      className="text-marketing-sm leading-6 text-marketing-forest transition-colors hover:text-marketing-forest-dark hover:underline"
                    >
                      Site care and updates
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-marketing-sm font-semibold leading-6 text-marketing-forest">
                  Company
                </h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="/about"
                      className="text-marketing-sm leading-6 text-marketing-forest transition-colors hover:text-marketing-forest-dark hover:underline"
                    >
                      About us
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/careers"
                      className="text-marketing-sm leading-6 text-marketing-forest transition-colors hover:text-marketing-forest-dark hover:underline"
                    >
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-marketing-sm font-semibold leading-6 text-marketing-forest">
                  Legal
                </h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="/privacy-policy"
                      className="text-marketing-sm leading-6 text-marketing-forest transition-colors hover:text-marketing-forest-dark hover:underline"
                    >
                      Privacy policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms-of-service"
                      className="text-marketing-sm leading-6 text-marketing-forest transition-colors hover:text-marketing-forest-dark hover:underline"
                    >
                      Terms of service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-marketing-border pt-8 sm:mt-20 lg:mt-24">
          <p className="text-marketing-xs leading-5 text-marketing-muted">
            &copy; {new Date().getFullYear()} The Enclosure. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
