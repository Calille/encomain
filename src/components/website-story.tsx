import { memo, useRef, useState, useEffect } from "react";
import { Container } from "./ui/container";

const storySteps = [
  {
    id: 1,
    title: "Discovery & Planning",
    description: "We start by understanding your business goals, target audience, and brand identity. Through in-depth consultation, we identify your unique requirements and create a strategic roadmap tailored to your objectives.",
    icon: "💡"
  },
  {
    id: 2,
    title: "Design & Prototyping",
    description: "Our designers craft modern, user-centric wireframes and high-fidelity prototypes that align perfectly with your brand. Every design decision is made to enhance user experience and drive conversions.",
    icon: "✏️"
  },
  {
    id: 3,
    title: "Content & SEO",
    description: "We create compelling, SEO-optimised content that speaks directly to your audience and ranks well on search engines. From copywriting to meta tags, every element is crafted for maximum visibility.",
    icon: "📄"
  },
  {
    id: 4,
    title: "Development",
    description: "Our developers transform designs into a fast, responsive, and secure website. Using the latest technologies, we build a site that performs flawlessly across all devices and browsers.",
    icon: "💻"
  },
  {
    id: 5,
    title: "Testing & Launch",
    description: "Before launch, we rigorously test every feature, link, and interaction. Our comprehensive QA process ensures your website is bug-free, accessible, and delivers an exceptional user experience.",
    icon: "✓"
  },
  {
    id: 6,
    title: "Ongoing Support",
    description: "We handle the technical launch and provide ongoing support to keep your website performing at its best. From updates to troubleshooting, we're here to ensure your continued success.",
    icon: "🛟"
  }
];

const TimelineStep = memo(({ step, index, isLast }: { step: typeof storySteps[0], index: number, isLast: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '100px' }
    );

    if (stepRef.current) {
      observer.observe(stepRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div ref={stepRef} className="relative">
      {!isLast && (
        <div className="absolute left-1/2 top-20 w-0.5 h-full bg-[#7FA99B]/30 -translate-x-1/2 hidden md:block" />
      )}
      
      <div className={`flex flex-col md:flex-row items-center gap-8 mb-16 ${
        isEven ? 'md:flex-row-reverse' : ''
      }`}>
        <div 
          className={`flex-1 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${isEven ? 'translate-x-8' : '-translate-x-8'}`
          }`}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-[#1A4D2E] mb-3">
              {step.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>

        <div 
          className={`flex-shrink-0 w-16 h-16 rounded-full bg-[#7FA99B] flex items-center justify-center text-3xl shadow-lg z-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ transitionDelay: `${index * 100 + 200}ms` }}
        >
          {step.icon}
        </div>

        <div className="flex-1 hidden md:block" />
      </div>
    </div>
  );
});

TimelineStep.displayName = 'TimelineStep';

export default function WebsiteStory() {
  return (
    <div className="relative bg-[#F8FAF9] py-24 sm:py-32 overflow-hidden">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-[#7FA99B]">
            Your Website Journey
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl">
            From Concept to Reality
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Follow along as we transform your ideas into a stunning, high-performing website
            through our proven 6-step process.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {storySteps.map((step, index) => (
            <TimelineStep 
              key={step.id} 
              step={step} 
              index={index}
              isLast={index === storySteps.length - 1}
            />
          ))}
        </div>

        <div className="text-center mt-24">
          <h3 className="text-3xl font-bold text-[#1A4D2E] mb-6">Ready to Start Your Journey?</h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Let us help you transform your digital presence with a custom website 
            that drives real business results.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-[#7FA99B] text-[#1A1A1A] font-semibold px-10 py-5 rounded-md shadow-lg hover:bg-[#7FA99B]/90 transition-all hover:scale-105 text-xl"
          >
            Start Your Project
          </a>
        </div>
      </Container>
    </div>
  );
}
