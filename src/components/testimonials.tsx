import { Container } from "./ui/container";
import { memo, useRef, useState, useEffect } from "react";

const testimonials = [
  {
    id: 1,
    content: "The Enclosure completely transformed our outdated website into a modern, high-converting platform. Our online bookings increased by 200% in just two months!",
    author: {
      name: "Sarah Thompson",
      role: "Owner, Thompson Dental Practice",
      location: "Manchester",
    },
  },
  {
    id: 2,
    content: "I was amazed by how quickly they delivered our new website. They delivered a stunning site that has significantly improved our online presence.",
    author: {
      name: "Michael Peters",
      role: "Managing Partner, Peters & Associates Solicitors",
      location: "Birmingham",
    },
  },
  {
    id: 3,
    content: "Working with The Enclosure was the best decision we made for our business. Their approach to design created a website that truly resonates with our target audience.",
    author: {
      name: "Jessica Clarke",
      role: "Marketing Director, Clarke Home Improvements",
      location: "Leeds",
    },
  },
];

const TestimonialCard = memo(({ testimonial, index }: { testimonial: typeof testimonials[0], index: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`flex flex-col justify-between bg-white rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-lg ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ 
        transitionDelay: `${index * 150}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform'
      }}
    >
      <div>
        <div className="flex gap-x-1 text-[#7FA99B] mb-6">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>
        <div className="text-lg leading-8 text-gray-600">
          "{testimonial.content}"
        </div>
      </div>
      <div className="mt-8 flex items-center gap-x-4">
        <div className="h-12 w-12 rounded-full bg-[#1A4D2E]/10 flex items-center justify-center text-[#1A4D2E] font-bold text-lg">
          {testimonial.author.name[0]}
        </div>
        <div>
          <div className="font-semibold text-[#1A4D2E]">
            {testimonial.author.name}
          </div>
          <div className="text-sm leading-6 text-gray-600">
            {testimonial.author.role}
          </div>
          {testimonial.author.location && (
            <div className="text-xs leading-5 text-gray-500">
              {testimonial.author.location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TestimonialCard.displayName = 'TestimonialCard';

export default function Testimonials() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-[#7FA99B]">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl">
            What Our Clients Say
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id} 
              testimonial={testimonial} 
              index={index}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
