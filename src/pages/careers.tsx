import Header from "../components/header";
import Footer from "../components/footer";
import { MarketingHeading } from "../components/marketing/marketing-heading";
import {
  MarketingCard,
  MarketingCardIcon,
} from "../components/marketing/marketing-card";
import { CtaButton } from "../components/marketing/cta-button";
import { PageHero } from "../components/marketing/page-hero";
import { Section } from "../components/marketing/section";
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
        <PageHero
          title="Join our freelance network"
          description="We're often looking for developers, designers, and digital creators to collaborate on client web projects. Flexible, remote, project-based work with clear scope and pay."
          actions={
            <CtaButton variant="on-dark" size="lg" onClick={scrollToApply}>
              Apply now
            </CtaButton>
          }
        />

        <Section tone="mist">
          <div className="mb-12 text-center">
            <MarketingHeading level="h2" variant="section">
              Why join The Enclosure?
            </MarketingHeading>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <MarketingCard key={benefit.title} interactive accentEdge>
                  <MarketingCardIcon>
                    <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                  </MarketingCardIcon>
                  <h3 className="mb-3 font-marketing-display text-marketing-xl font-medium text-marketing-ink">
                    {benefit.title}
                  </h3>
                  <p className="text-marketing-base leading-relaxed text-marketing-muted">
                    {benefit.description}
                  </p>
                </MarketingCard>
              );
            })}
          </div>
        </Section>

        <Section tone="navy" hairline className="overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[400px] w-[820px] max-w-[120vw] rounded-full bg-marketing-blue/10 blur-[150px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-5xl">
            <MarketingHeading
              level="h2"
              variant="section"
              tone="dark"
              className="mb-12 text-center"
            >
              We're looking for freelancers with experience in:
            </MarketingHeading>

            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="mb-6 text-marketing-lg leading-relaxed text-marketing-sky/85">
                  We work with freelancers who bring solid craft to client projects. Whether you specialise in front-end work or cover the full stack, get in touch if the skills below sound like you.
                </p>
                <p className="text-marketing-lg leading-relaxed text-marketing-sky/85">
                  If you care about clear design, clean code, and finishing work properly, you'll fit in.
                </p>
              </div>

              <MarketingCard tone="dark" accentEdge>
                <ul className="space-y-4">
                  {skills.map((skill) => (
                    <li key={skill} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marketing-blue">
                        <Check className="h-4 w-4 text-white" strokeWidth={2} aria-hidden="true" />
                      </span>
                      <span className="text-marketing-base font-medium text-white">
                        {skill}
                      </span>
                    </li>
                  ))}
                </ul>
              </MarketingCard>
            </div>
          </div>
        </Section>

        <Section tone="ice" id="apply">
          <div className="mx-auto max-w-2xl">
            <MarketingHeading level="h2" variant="section" className="mb-8 text-center">
              How to apply
            </MarketingHeading>

            <MarketingCard accentEdge className="marketing-glow-sm md:p-10">
              <p className="mb-8 text-marketing-lg leading-relaxed text-marketing-muted">
                Send us a short introduction and a link to your portfolio, GitHub, or any recent work. We'll reach out if your skill set matches an upcoming project.
              </p>

              <div className="mb-8 rounded-xl border border-marketing-border bg-marketing-mist p-6">
                <h3 className="mb-4 text-marketing-base font-semibold text-marketing-ink">
                  Contact details
                </h3>
                <div className="space-y-3">
                  <a
                    href="mailto:josh@theenclosure.co.uk"
                    className="marketing-focus flex items-center gap-3 rounded font-semibold text-marketing-blue-deep transition-colors hover:text-marketing-blue"
                  >
                    <Mail className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    <span>josh@theenclosure.co.uk</span>
                  </a>
                </div>
              </div>

              <CtaButton
                href="mailto:josh@theenclosure.co.uk?subject=Freelance%20Developer%20Application"
                variant="primary"
                fullWidth
              >
                Email Josh
              </CtaButton>
            </MarketingCard>
          </div>
        </Section>

        <Section tone="navy-deep" hairline className="overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[380px] w-[760px] max-w-[120vw] rounded-full bg-marketing-blue/12 blur-[140px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <MarketingHeading level="h2" variant="section" tone="dark" className="mb-6">
              Interested in working with us?
            </MarketingHeading>
            <p className="mb-10 text-marketing-xl leading-relaxed text-marketing-sky/85">
              We work with freelancers who value clean design, efficient builds, and careful craft. If that sounds like you, send a short note.
            </p>
            <div className="flex justify-center">
              <CtaButton variant="on-dark" size="lg" onClick={scrollToApply}>
                Apply now
              </CtaButton>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
