import { Container } from "./ui/container";
import { Button } from "./ui/button";
import { AnimatedBackground } from "./ui/animated-background";
import Header from "./header";
import Footer from "./footer";
import CTA from "./cta";


const values = [
  {
    title: "Innovation",
    description:
      "We stay ahead of the curve, constantly exploring new tools and techniques to give our clients an edge.",
  },
  {
    title: "Efficiency",
    description:
      "Our AI-powered workflow cuts timelines without cutting corners—so you get a world-class website in weeks, not months.",
  },
  {
    title: "Results-Driven",
    description:
      "Every design decision is made with one goal: turning your visitors into customers and growing your business.",
  },
  {
    title: "Transparency",
    description:
      "No jargon, no hidden fees, no surprises. Just honest communication and a process you can trust from day one.",
  },
];

export default function About() {
  return (
    <div className="bg-white">
      <Header />
      <main>
        {/* Hero section */}
        <div className="relative bg-[#F8FAF9] pt-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatedBackground />
            <div className="absolute left-0 top-0 h-full w-full bg-[#F8FAF9] opacity-90" />
          </div>

          <Container className="relative pt-16 pb-20 sm:pt-24 sm:pb-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A] sm:text-5xl">
                About <span className="text-[#1A4D2E]">The Enclosure</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
                We're a creative web agency that helps small businesses punch above their weight online. Through AI-powered design and conversion-focused strategy, we build websites that don't just look good—they work hard for your business.
              </p>
            </div>
          </Container>
        </div>

        {/* Our story section */}
        <div className="py-24 sm:py-32">
          <Container>
            <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl">
                  Our Story
                </h2>
                <p className="mt-6 text-lg leading-8 text-gray-600 font-semibold">
                  The Enclosure started with a frustration.
                </p>
                <p className="mt-4 text-lg leading-8 text-gray-600">
                  Too many great small businesses were stuck with websites that looked outdated, loaded slowly, and failed to turn visitors into customers. Meanwhile, traditional agencies were charging five figures and taking months to deliver.
                </p>
                <p className="mt-4 text-lg leading-8 text-gray-600 font-semibold">
                  We knew there had to be a better way.
                </p>
                <p className="mt-4 text-lg leading-8 text-gray-600">
                  By combining AI-driven insights with hands-on creative expertise, we've built a process that delivers premium, high-converting websites faster and more affordably than anyone thought possible.
                </p>
                <p className="mt-4 text-lg leading-8 text-gray-600">
                  Since launching, we've helped hundreds of businesses transform their online presence—and prove that smart design and the right technology can level the playing field against even the biggest competitors.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#1A4D2E]/10">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                    alt="The Enclosure team"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Our values section */}
        <div className="bg-[#F8FAF9] py-24 sm:py-32">
          <Container>
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-[#7FA99B]">
                Our Values
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl">
                What Drives Us
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-4">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-sm">
                  <div className="mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-[#1A4D2E]/10 text-[#1A4D2E] font-bold text-xl">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-[#1A4D2E]">
                    {value.title}
                  </h3>
                  <p className="mt-4 text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </div>

        {/* Team section */}
        <div className="py-24 sm:py-32">
          <Container>
            <div className="max-w-[1100px] mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl mb-6">
                  The Team
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  We're a close-knit group of designers, developers, and digital strategists who love what we do—and love seeing our clients succeed even more.
                </p>
              </div>
            </div>
          </Container>
        </div>

        {/* Stats section */}
        <div className="bg-[#1A4D2E] py-24 sm:py-32">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-[#7FA99B]">
                Our Impact
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                By the Numbers
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {[
                { value: "50+", label: "Websites Launched" },
                { value: "100%", label: "Satisfaction" },
                { value: "85%", label: "Average Conversion Increase" },
              ].map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-lg font-medium text-gray-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </div>
        
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
