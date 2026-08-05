import Header from "../components/header";
import Footer from "../components/footer";
import { PageHero } from "../components/marketing/page-hero";
import { Section } from "../components/marketing/section";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Mail, MapPin } from "lucide-react";

export default function TermsOfService() {
  useDocumentTitle("Terms of service");

  return (
    <div className="bg-white">
      <Header />
      <main>
        <PageHero
          size="sm"
          title={
            <>
              Terms of <span className="marketing-gradient-text">service</span>
            </>
          }
          description="Please read these terms and conditions carefully before using our services."
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
                Welcome to The Enclosure ("we," "our," "us"). By accessing or using our website and services, you agree to be bound by these Terms of Service.
                If you do not agree, please do not use our website or any of our services.
              </p>
              <p>
                These Terms apply to all users of our site, including clients, visitors, and partners.
              </p>

              <h2>2. Our Services</h2>
              <p>
                The Enclosure provides website design, development, automation, SEO, and digital marketing services.
                All services are detailed on our website and in individual project proposals or agreements.
              </p>
              <p>
                We reserve the right to modify or discontinue any service at any time without prior notice.
              </p>

              <h2>3. Project Scope & Revisions</h2>
              <p>
                All projects include the specific number of revisions stated in the selected package. Additional revisions or changes beyond the agreed scope will incur extra charges, which will be communicated before implementation.
              </p>
              <p>
                Content and materials must be provided by the client before project commencement. Delays in providing content may extend the timeline.
              </p>

              <h2>4. Payments & Deposits</h2>
              <p>
                A <strong>20% deposit</strong> is required to secure your project start date.
                The remaining balance can be paid through flexible monthly installments based on the total package value.
              </p>
              <p>
                Invoices are payable within 7 days of issue unless otherwise agreed in writing.
                Failure to pay may result in project delays or suspension of services.
              </p>
              <p>
                Ongoing monthly maintenance and hosting fees are billed at the beginning of each month.
                All prices are listed in GBP (£) and are exclusive of VAT unless stated otherwise.
              </p>

              <h2>5. Cancellations & Refunds</h2>
              <p>
                You may cancel your project or ongoing service with <strong>30 days' written notice</strong>.
                Deposits are non-refundable once work has commenced.
                Refunds for partially completed work are assessed on a case-by-case basis at our discretion.
              </p>
              <p>
                If you cancel before providing required materials or feedback, your slot may be released to another client.
              </p>

              <h2>6. Intellectual Property</h2>
              <p>
                All intellectual property rights in the website design, code, and related materials remain the property of The Enclosure until full payment is received.
                Upon full payment, ownership of the final deliverables is transferred to the client.
              </p>
              <p>
                We reserve the right to display completed projects in our portfolio and marketing materials unless otherwise requested in writing.
              </p>

              <h2>7. Client Responsibilities</h2>
              <p>Clients are responsible for:</p>
              <ul>
                <li>Providing all necessary text, images, and content before the project begins.</li>
                <li>Ensuring they have rights to use all materials provided.</li>
                <li>Reviewing and approving drafts within reasonable timeframes.</li>
              </ul>
              <p>
                We are not liable for any errors, omissions, or legal issues arising from client-provided content.
              </p>

              <h2>8. Website Maintenance & Support</h2>
              <p>
                Maintenance and support services are provided according to the selected plan.
                Failure to maintain an active plan may result in outdated plugins, security risks, or reduced performance.
              </p>
              <p>
                We are not responsible for issues arising from client modifications or third-party interference.
              </p>

              <h2>9. Limitation of Liability</h2>
              <p>
                While we take every measure to ensure the quality and functionality of your website, The Enclosure will not be held liable for:
              </p>
              <ul>
                <li>Any loss of revenue, profits, or data</li>
                <li>Service interruptions caused by third-party providers</li>
                <li>Damages resulting from client misuse, hosting failures, or external factors</li>
              </ul>
              <p>
                Our liability shall never exceed the total fees paid for the project.
              </p>

              <h2>10. Third-Party Services</h2>
              <p>
                Our services may involve integrations with third-party tools (e.g., hosting providers, CRMs, or payment gateways).
                We are not responsible for outages, policy changes, or service failures from third parties.
              </p>

              <h2>11. Termination</h2>
              <p>
                We reserve the right to suspend or terminate services if a client:
              </p>
              <ul>
                <li>Fails to make payments</li>
                <li>Violates these Terms</li>
                <li>Engages in abusive or unlawful behaviour</li>
              </ul>
              <p>
                In such cases, all outstanding fees become immediately due.
              </p>

              <h2>12. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with English law.
                Any disputes shall be handled exclusively in the courts of England and Wales.
              </p>

              <h2>13. Contact</h2>
              <p>
                For any questions or legal notices, please contact:
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
