import { MarketingHeading } from "./marketing/marketing-heading";
import { Section } from "./marketing/section";

const people = [
  {
    name: "Josh Wicks",
    role: "Design and build",
    bio: "Designs and builds the site you'll actually use. Focused on clear journeys, phone-friendly layouts, and pages that ask for the enquiry.",
  },
  {
    name: "Will Mitchell",
    role: "Growth and automation",
    bio: "Helps the site keep working after launch: the follow-ups, tracking, and quiet systems that save you time.",
  },
];

const stats = [
  { figure: "50+", label: "Websites launched" },
  { figure: "100%", label: "Client satisfaction" },
  { figure: "85%", label: "Average lift in enquiries" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function TrustSection() {
  return (
    <Section tone="navy-deep" size="lg" hairline className="overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/3 mx-auto h-[420px] w-[760px] max-w-[120vw] rounded-full bg-marketing-blue/10 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1100px]">
        <div className="mb-14 text-center">
          <MarketingHeading level="p" variant="eyebrow" tone="dark">
            Who you'll work with
          </MarketingHeading>
        </div>

        <div className="mb-20 grid grid-cols-1 gap-14 md:grid-cols-2">
          {people.map((person) => (
            <div key={person.name} className="text-center">
              {/* Monogram tile: intentional branding rather than a stock silhouette */}
              <div
                className="marketing-glow-lg mx-auto mb-7 flex h-[120px] w-[120px] items-center justify-center rounded-3xl bg-gradient-to-br from-marketing-blue to-marketing-blue-deep"
                aria-hidden="true"
              >
                <span className="font-marketing-display text-marketing-4xl font-semibold tracking-tight text-white">
                  {initials(person.name)}
                </span>
              </div>
              <h3 className="mb-1.5 font-marketing-display text-marketing-2xl font-medium tracking-tight text-white">
                {person.name}
              </h3>
              <p className="mb-5 text-marketing-sm uppercase tracking-[0.16em] text-marketing-blue-bright">
                {person.role}
              </p>
              <p className="mx-auto max-w-[420px] text-marketing-base leading-relaxed text-marketing-sky/80">
                {person.bio}
              </p>
            </div>
          ))}
        </div>

        <div className="marketing-hairline mx-auto mb-16 h-px w-[160px]" />

        <p className="mx-auto mb-14 max-w-[780px] text-center text-marketing-base leading-relaxed text-marketing-sky/80">
          Founded in 2020 to help small UK businesses compete online with sites that look the part and bring in work.
        </p>

        <dl className="mx-auto grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map(({ figure, label }) => (
            <div key={label} className="flex flex-col items-center">
              <dt className="marketing-glow-text font-marketing-display text-marketing-5xl font-semibold text-marketing-blue-bright">
                {figure}
              </dt>
              <dd className="mt-2 text-marketing-sm text-marketing-sky/70">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
