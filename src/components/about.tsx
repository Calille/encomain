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
      "Most agencies take eight weeks to build a site because it fills the invoice. We'd rather ship in three and move on. If your project needs longer, we'll tell you why.",
  },
  {
    title: "Show, don't sell.",
    description:
      "For a small fee, we'll design and prototype a draft of your site before you commit to the full project. If you go ahead, that cost comes off your final invoice. We'd rather prove what we can build than talk about it.",
  },
  {
    title: "Small on purpose.",
    description:
      "You'll talk to the people building your project. No account managers, no handoffs, no juniors doing the actual work.",
  },
];

export default function About() {
  useDocumentTitle("About");

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
                Two people, one small studio.
              </MarketingHeading>
              <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted max-w-2xl mx-auto">
                The Enclosure is a small independent studio building websites, SaaS applications, and lead generation systems for businesses that want more than a brochure site.
              </p>
            </div>
          </Container>
        </section>

        {/* What we do */}
        <section className="py-20 sm:py-28 bg-white">
          <Container>
            <div className="mx-auto max-w-3xl">
              <MarketingHeading level="h2" variant="section">
                What we do
              </MarketingHeading>
              <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted">
                We make websites that turn visitors into customers. We build software that gives businesses better internal tools than they'd otherwise have. And we help clients grow, through lead generation, review systems, and the sort of backend work that lets a business focus on what it's actually good at.
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
                What we build
              </MarketingHeading>
              <p className="mt-6 text-marketing-lg leading-8 text-marketing-muted">
                Web design, custom web applications, SaaS products, CRM builds, integrations, and automation. If you want a clear view of fixed packages versus bespoke work, see our{" "}
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
              <h2 className="font-marketing-display text-marketing-3xl sm:text-marketing-4xl font-medium text-white tracking-tight">
                Ready to talk about your project?
              </h2>
              <div className="mt-8">
                <Link
                  to="/contact#book"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-marketing-base font-semibold text-marketing-forest transition-colors hover:bg-marketing-mint min-h-[44px]"
                >
                  Book a free intro call
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
