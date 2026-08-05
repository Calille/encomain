import Header from "../components/header";
import Footer from "../components/footer";
import { PageHero } from "../components/marketing/page-hero";
import { Section } from "../components/marketing/section";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Mail, MapPin } from "lucide-react";

export default function PrivacyPolicy() {
  useDocumentTitle("Privacy policy");

  return (
    <div className="bg-white">
      <Header />
      <main>
        <PageHero
          size="sm"
          title={
            <>
              Privacy <span className="marketing-gradient-text">policy</span>
            </>
          }
          description="This Privacy Policy describes how The Enclosure collects, uses, and shares your personal information."
        />

        <Section tone="white" size="lg">
            <div className="prose prose-lg mx-auto max-w-3xl prose-headings:font-marketing-display prose-a:text-marketing-blue-deep prose-headings:text-marketing-ink">
              <p className="mb-8 text-marketing-sm text-marketing-muted">
                <strong>Last Updated:</strong> October 2025
                <br />
                <strong>Company:</strong> The Enclosure
                <br />
                <strong>Website:</strong>{" "}
                <a href="https://theenclosure.co.uk">https://theenclosure.co.uk</a>
              </p>

              <h2>1. Introduction</h2>
              <p>
                Your privacy is important to us. This Privacy Policy explains how The Enclosure collects, uses, and protects your information when you visit our website or use our services.
              </p>
              <p>
                We comply with the UK GDPR and Data Protection Act 2018.
              </p>

              <h2>2. Information We Collect</h2>
              <p>We may collect the following types of information:</p>
              <ul>
                <li><strong>Personal Information:</strong> Name, email address, phone number, business name, billing details, etc.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and website usage data.</li>
                <li><strong>Communication Data:</strong> Messages sent via our contact forms, email, or chat.</li>
                <li><strong>Marketing Preferences:</strong> Newsletter sign-ups and campaign engagement.</li>
              </ul>

              <h2>3. How We Use Your Information</h2>
              <p>We use your data to:</p>
              <ul>
                <li>Provide and improve our services</li>
                <li>Process payments and invoices</li>
                <li>Respond to enquiries and support requests</li>
                <li>Send project updates and service information</li>
                <li>Deliver marketing communications (only with your consent)</li>
                <li>Comply with legal or regulatory obligations</li>
              </ul>

              <h2>4. Cookies</h2>
              <p>
                Our website uses cookies to improve user experience, analyze performance, and enable certain functionality.
                You can control or delete cookies at any time through your browser settings.
              </p>

              <h2>5. Data Storage & Security</h2>
              <p>
                All data is securely stored on encrypted servers.
                We implement technical and organizational measures to protect your information from unauthorized access, loss, or misuse.
              </p>
              <p>
                We retain data only as long as necessary to fulfill the purposes outlined in this policy.
              </p>

              <h2>6. Third-Party Sharing</h2>
              <p>
                We do not sell or rent your personal information.
                We may share limited data with trusted third parties (e.g., hosting providers, payment processors, analytics tools) solely to deliver our services.
              </p>
              <p>
                Each third party is required to maintain GDPR-compliant data protection standards.
              </p>

              <h2>7. Your Rights</h2>
              <p>Under the UK GDPR, you have the right to:</p>
              <ul>
                <li>Access the data we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal data</li>
                <li>Object to data processing for marketing</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p>
                To exercise your rights, contact us at{" "}
                <a href="mailto:info@theenclosure.co.uk">info@theenclosure.co.uk</a>.
              </p>

              <h2>8. Email Marketing</h2>
              <p>
                If you subscribe to our newsletter or updates, you can unsubscribe at any time by clicking the "unsubscribe" link in our emails or by contacting us directly.
              </p>

              <h2>9. Data Transfers</h2>
              <p>
                We primarily store and process data in the United Kingdom.
                If data is transferred outside the UK, we ensure it is protected by appropriate legal safeguards.
              </p>

              <h2>10. Updates to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. The latest version will always be available on our website with a revised "Last Updated" date.
              </p>

              <h2>11. Contact</h2>
              <p>
                If you have any questions about this Privacy Policy or how your data is handled, please contact:
              </p>
              <p className="not-prose flex flex-col gap-2 text-marketing-base text-marketing-ink">
                <a
                  href="mailto:info@theenclosure.co.uk"
                  className="inline-flex items-center gap-2 text-marketing-blue-deep hover:text-marketing-blue"
                >
                  <Mail className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  info@theenclosure.co.uk
                </a>
                <span className="inline-flex items-center gap-2 text-marketing-muted">
                  <MapPin className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  Bedfordshire, United Kingdom
                </span>
              </p>

              <p className="mt-8 text-marketing-sm text-marketing-muted">
                Last Updated: October 2025
              </p>
            </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
