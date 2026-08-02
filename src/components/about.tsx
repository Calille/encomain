import { Link } from "react-router-dom";
import { Container } from "./ui/container";
import { AnimatedBackground } from "./ui/animated-background";
import Header from "./header";
import Footer from "./footer";
import { MarketingHeading } from "./marketing/marketing-heading";
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
        {/* Hero */}
        <section className="relative bg-marketing-mint pt-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatedBackground />
            <div className="absolute left-0 top-0 h-full w-full bg-marketing-mint opacity-90" />
          </div>

          <Container className="relative pt-16 pb-20 sm:pt-24 sm:pb-24">
            <div className="mx-auto max-w-3xl text-center">
              <MarketingHeading level="h1" variant="display">
                A small UK studio that builds sites meant to earn enquiries.
              </MarketingHeading>
              <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted max-w-2xl mx-auto">
                We're two people. You talk to the people doing the work. We help businesses whose website has become a passive brochure get something that looks the part and brings in contact.
              </p>
            </div>
          </Container>
        </section>

        {/* What we do */}
        <section className="py-20 sm:py-28 bg-white">
          <Container>
            <div className="mx-auto max-w-3xl">
              <MarketingHeading level="h2" variant="section">
                What that means for you
              </MarketingHeading>
              <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted">
                You get a site designed to win enquiries and show up for local search, plus the quiet systems behind it when you need them. We handle the build and the fiddly bits so you can stay on the work you're good at.
              </p>
            </div>
          </Container>
        </section>

        {/* How we work */}
        <section className="py-20 sm:py-28 bg-marketing-mint">
          <Container>
            <div className="mx-auto max-w-3xl mb-14">
              <MarketingHeading level="h2" variant="section">
                How we work
              </MarketingHeading>
            </div>
            <div className="mx-auto max-w-3xl space-y-10">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="border-l-2 border-marketing-forest pl-6"
                >
                  <h3 className="font-marketing-display text-marketing-xl font-medium text-marketing-ink">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-marketing-base leading-relaxed text-marketing-muted">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* What we build */}
        <section className="py-20 sm:py-28 bg-white">
          <Container>
            <div className="mx-auto max-w-3xl">
              <MarketingHeading level="h2" variant="section">
                What you can get
              </MarketingHeading>
              <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted">
                Business websites, booking and enquiry flows, and custom tools when a standard site isn't enough. For fixed packages versus bespoke work, see our{" "}
                <Link
                  to="/pricing"
                  className="font-semibold text-marketing-forest hover:text-marketing-forest-dark underline underline-offset-2"
                >
                  pricing page
                </Link>
                .
              </p>
            </div>
          </Container>
        </section>

        {/* CTA band */}
        <section className="py-20 sm:py-24 bg-marketing-forest">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <MarketingHeading level="h2" variant="section" tone="dark">
                Curious what we'd change on your site?
              </MarketingHeading>
              <div className="mt-8">
                <Link
                  to="/contact#book"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-marketing-base font-semibold text-marketing-forest transition-colors hover:bg-marketing-mint min-h-[44px]"
                >
                  Book a 20 min chat
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
