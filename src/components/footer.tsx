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

const serviceLinks = [
  "Website redesign",
  "Get found locally",
  "Sell online without the faff",
  "Site care and updates",
];

const companyLinks = [
  { name: "About us", href: "/about" },
  { name: "Careers", href: "/careers" },
];

const legalLinks = [
  { name: "Privacy policy", href: "/privacy-policy" },
  { name: "Terms of service", href: "/terms-of-service" },
];

const linkClasses =
  "marketing-focus rounded text-marketing-sm leading-6 text-marketing-sky/80 transition-colors hover:text-white";

const groupHeadingClasses =
  "text-marketing-sm font-semibold uppercase leading-6 tracking-[0.14em] text-marketing-blue-bright";

function FooterGroup({
  heading,
  children,
  className,
}: {
  heading: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className={groupHeadingClasses}>{heading}</h3>
      <ul className="mt-6 space-y-4">{children}</ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-marketing-navy-950">
      <div
        className="marketing-hairline pointer-events-none absolute inset-x-0 top-0 h-px"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 -bottom-40 mx-auto h-[420px] w-[900px] max-w-[120vw] rounded-full bg-marketing-blue/10 blur-[150px]"
        aria-hidden="true"
      />

      <Container className="relative py-14 md:py-20">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-7">
            {/* The wordmark is black on transparent, so it needs a light chip on navy */}
            <Link
              to="/"
              className="marketing-focus inline-flex w-fit items-center rounded-2xl bg-white/95 px-4 py-2.5"
            >
              <Logo className="[&_img]:h-10" />
            </Link>
            <p className="max-w-sm text-marketing-base leading-relaxed text-marketing-sky/85">
              {t(
                "footer.tagline",
                "If your website looks like it's from 2013, it's costing you enquiries."
              )}
            </p>
            <div className="space-y-3">
              <a
                href="mailto:hello@theenclosure.co.uk"
                className={`flex items-center gap-2 ${linkClasses}`}
              >
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                hello@theenclosure.co.uk
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 ${linkClasses}`}
              >
                <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                Message us on WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <FooterGroup heading={t("footer.navigation", "Navigation")}>
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className={linkClasses}>
                      {t(`nav.${item.name.toLowerCase()}`, item.name)}
                    </Link>
                  </li>
                ))}
              </FooterGroup>

              <FooterGroup heading="Services" className="mt-10 md:mt-0">
                {serviceLinks.map((name) => (
                  <li key={name}>
                    <Link to="/services" className={linkClasses}>
                      {name}
                    </Link>
                  </li>
                ))}
              </FooterGroup>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8">
              <FooterGroup heading="Company">
                {companyLinks.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className={linkClasses}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </FooterGroup>

              <FooterGroup heading="Legal" className="mt-10 md:mt-0">
                {legalLinks.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className={linkClasses}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </FooterGroup>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-marketing-navy-700 pt-8">
          <p className="text-marketing-xs leading-5 text-marketing-sky/55">
            &copy; {new Date().getFullYear()} The Enclosure. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
