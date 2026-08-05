import { Link } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import { MarketingHeading } from "./marketing/marketing-heading";
import { CtaButton } from "./marketing/cta-button";
import { PageHero } from "./marketing/page-hero";
import { Section } from "./marketing/section";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const values = [
  {
    title: "Fast, and honest about it.",
    description:
      "Most agencies take eight weeks because it fills the invoice. We'd rather ship in three when the scope allows. If your project needs longer, we'll say so upfront.",
  },
  {
    title: "Show, don't sell.",
    description:
      "For a small fee, we'll draft your site before you commit to the full build. If you go ahead, that fee comes off the final invoice. Better to show you than talk at you.",
  },
  {
    title: "Small on purpose.",
    description:
      "You'll talk to the people building your project. No account managers, no handoffs, no juniors doing the actual work.",
  },
];

export default function About() {
  useDocumentTitle(
    "About",
    "A small UK studio building websites meant to win enquiries. You talk to the people doing the work."
  );

  return (
    <div className="bg-white">
      <Header />
      <main>
        <PageHero
          title="A small UK studio that builds sites meant to earn enquiries."
          description="We're two people. You talk to the people doing the work. We help businesses whose website has become a passive brochure get something that looks the part and brings in contact."
        />

        {/* What we do */}
        <Section tone="mist">
          <div className="mx-auto max-w-3xl">
            <MarketingHeading level="h2" variant="section">
              What that means for you
            </MarketingHeading>
            <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted">
              You get a site designed to win enquiries and show up for local search, plus the quiet systems behind it when you need them. We handle the build and the fiddly bits so you can stay on the work you're good at.
            </p>
          </div>
        </Section>

        {/* How we work */}
        <Section tone="navy" hairline className="overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[400px] w-[820px] max-w-[120vw] rounded-full bg-marketing-blue/10 blur-[150px]"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="mx-auto mb-14 max-w-3xl">
              <MarketingHeading level="h2" variant="section" tone="dark">
                How we work
              </MarketingHeading>
            </div>
            <div className="mx-auto max-w-3xl space-y-10">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="border-l-2 border-marketing-blue pl-6"
                >
                  <h3 className="font-marketing-display text-marketing-xl font-medium text-white">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-marketing-base leading-relaxed text-marketing-sky/80">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* What we build */}
        <Section tone="white">
          <div className="mx-auto max-w-3xl">
            <MarketingHeading level="h2" variant="section">
              What you can get
            </MarketingHeading>
            <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted">
              Business websites, booking and enquiry flows, and custom tools when a standard site isn't enough. For fixed packages versus bespoke work, see our{" "}
              <Link
                to="/pricing"
                className="marketing-focus rounded font-semibold text-marketing-blue-deep underline underline-offset-4 hover:text-marketing-blue"
              >
                pricing page
              </Link>
              .
            </p>
          </div>
        </Section>

        {/* CTA band */}
        <Section tone="ice" size="sm">
          <div className="marketing-glow-lg relative isolate overflow-hidden rounded-3xl border border-marketing-navy-700 bg-marketing-navy-950 px-6 py-14 text-center sm:px-16">
            <div
              className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-[320px] w-[680px] max-w-[120vw] rounded-full bg-marketing-blue/20 blur-[130px]"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-2xl">
              <MarketingHeading level="h2" variant="section" tone="dark">
                Curious what we'd change on your site?
              </MarketingHeading>
              <div className="mt-8 flex justify-center">
                <CtaButton to="/contact#book" variant="on-dark" size="lg">
                  Book a 20 min chat
                </CtaButton>
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
