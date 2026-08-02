import { Container } from "../components/ui/container";
import { AnimatedBackground } from "../components/ui/animated-background";
import Header from "../components/header";
import Footer from "../components/footer";
import { MarketingHeading } from "../components/marketing/marketing-heading";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Mail, Check, Calendar, DollarSign, Sparkles } from "lucide-react";

export default function Careers() {
  useDocumentTitle(
    "Careers",
    "Freelance web projects with The Enclosure. Flexible, remote collaboration for developers and designers."
  );

  const scrollToApply = () => {
    const applySection = document.getElementById("apply");
    if (applySection) {
      applySection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const benefits = [
    {
      icon: Calendar,
      title: "Flexible work",
      description:
        "Projects that fit your schedule and skills. Fully remote and asynchronous.",
    },
    {
      icon: DollarSign,
      title: "Fair pay",
      description: "Project-based pay, agreed upfront. No surprises.",
    },
    {
      icon: Sparkles,
      title: "Creative freedom",
      description:
        "Collaborate on real client builds with modern design and front-end tools.",
    },
  ];

  const skills = [
    "React / Next.js",
    "Tailwind CSS",
    "TypeScript",
    "UI/UX design",
    "API integrations",
    "Framer Motion or GSAP animations",
    "WordPress or Shopify (bonus)",
  ];

  return (
    <div className="bg-white">
      <Header />
      <main>
        <section className="relative overflow-hidden bg-marketing-mint pt-32">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatedBackground />
            <div className="absolute left-0 top-0 h-full w-full bg-marketing-mint opacity-90" />
          </div>

          <Container className="relative pb-20 pt-16 sm:pb-24 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <MarketingHeading level="h1" variant="display">
                Join our freelance network
              </MarketingHeading>
              <p className="mx-auto mt-6 max-w-2xl text-marketing-lg leading-8 text-marketing-muted">
                We're often looking for developers, designers, and digital creators to collaborate on client web projects. Flexible, remote, project-based work with clear scope and pay.
              </p>
              <div className="mt-10">
                <button
                  onClick={scrollToApply}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-marketing-ink px-8 py-3 text-marketing-base font-semibold text-white transition-colors hover:bg-marketing-forest"
                >
                  Apply now
                </button>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white py-16 md:py-20">
          <Container>
            <div className="mb-12 text-center">
              <MarketingHeading level="h2" variant="section">
                Why join The Enclosure?
              </MarketingHeading>
            </div>

            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="rounded-xl border border-marketing-border bg-white p-8"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-marketing-forest">
                      <Icon className="h-7 w-7 text-white" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <h3 className="mb-3 font-marketing-display text-marketing-xl font-medium text-marketing-ink">
                      {benefit.title}
                    </h3>
                    <p className="leading-relaxed text-marketing-muted text-marketing-base">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="bg-marketing-mint py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-5xl">
              <MarketingHeading level="h2" variant="section" className="mb-12 text-center">
                We're looking for freelancers with experience in:
              </MarketingHeading>

              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <div>
                  <p className="mb-6 text-marketing-lg leading-relaxed text-marketing-muted">
                    We work with freelancers who bring solid craft to client projects. Whether you specialise in front-end work or cover the full stack, get in touch if the skills below sound like you.
                  </p>
                  <p className="text-marketing-lg leading-relaxed text-marketing-muted">
                    If you care about clear design, clean code, and finishing work properly, you'll fit in.
                  </p>
                </div>

                <div className="rounded-xl border border-marketing-border bg-white p-8">
                  <ul className="space-y-4">
                    {skills.map((skill) => (
                      <li key={skill} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marketing-forest">
                          <Check className="h-4 w-4 text-white" strokeWidth={1.5} aria-hidden="true" />
                        </div>
                        <span className="font-medium text-marketing-ink text-marketing-base">
                          {skill}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white py-16 md:py-20" id="apply">
          <Container>
            <div className="mx-auto max-w-2xl">
              <MarketingHeading level="h2" variant="section" className="mb-8 text-center">
                How to apply
              </MarketingHeading>

              <div className="rounded-xl border border-marketing-forest/20 bg-white p-8 md:p-10">
                <p className="mb-8 text-marketing-lg leading-relaxed text-marketing-muted">
                  Send us a short introduction and a link to your portfolio, GitHub, or any recent work. We'll reach out if your skill set matches an upcoming project.
                </p>

                <div className="mb-8 rounded-lg bg-marketing-mint p-6">
                  <h3 className="mb-4 font-semibold text-marketing-ink text-marketing-base">
                    Contact details
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="mailto:josh@theenclosure.co.uk"
                      className="flex items-center gap-3 font-semibold text-marketing-forest transition-colors hover:text-marketing-forest-dark"
                    >
                      <Mail className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                      <span>josh@theenclosure.co.uk</span>
                    </a>
                  </div>
                </div>

                <a
                  href="mailto:josh@theenclosure.co.uk?subject=Freelance%20Developer%20Application"
                  className="flex w-full min-h-[44px] items-center justify-center rounded-lg bg-marketing-forest px-8 py-3 text-center text-marketing-base font-semibold text-white transition-colors hover:bg-marketing-forest-dark"
                >
                  Email Josh
                </a>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-marketing-forest py-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <MarketingHeading level="h2" variant="section" tone="dark" className="mb-6">
                Interested in working with us?
              </MarketingHeading>
              <p className="mb-10 text-marketing-xl leading-relaxed text-white/80">
                We work with freelancers who value clean design, efficient builds, and careful craft. If that sounds like you, send a short note.
              </p>
              <button
                onClick={scrollToApply}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-white px-8 py-3 text-marketing-base font-semibold text-marketing-forest transition-colors hover:bg-marketing-mint"
              >
                Apply now
              </button>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
