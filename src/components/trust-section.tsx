import { Container } from "./ui/container";

export default function TrustSection() {
  return (
    <div className="bg-[#F8FAF9] py-24 sm:py-32">
      <Container>
        {/* Minimalistic Founders Section */}
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <p className="uppercase text-[10px] tracking-[2.5px] text-gray-400 font-medium">
              LEADERSHIP
            </p>
          </div>

          {/* Founders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-20">
            {/* Josh Wicks */}
            <div className="text-center">
              <div className="w-[140px] h-[140px] mx-auto mb-8 bg-[#1A4D2E] rounded-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#1A4D2E]">
                  <circle cx="50" cy="35" r="15"/>
                  <path d="M 30 50 Q 30 45 35 45 L 65 45 Q 70 45 70 50 L 75 80 Q 75 85 70 85 L 30 85 Q 25 85 25 80 Z"/>
                </svg>
              </div>
              <h3 className="text-[22px] font-semibold text-black mb-1.5 tracking-tight">
                Josh Wicks
              </h3>
              <p className="text-[13px] text-gray-600 mb-5 tracking-wide">
                Dev (UI/UX)
              </p>
              <p className="text-[15px] text-gray-500 leading-relaxed max-w-[420px] mx-auto">
                Designs and builds intuitive digital experiences. Focused on creating accessible, high-performing websites.
              </p>
            </div>

            {/* Will Mitchell */}
            <div className="text-center">
              <div className="w-[140px] h-[140px] mx-auto mb-8 bg-[#1A4D2E] rounded-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#1A4D2E]">
                  <circle cx="50" cy="35" r="15"/>
                  <path d="M 30 50 Q 30 45 35 45 L 65 45 Q 70 45 70 50 L 75 80 Q 75 85 70 85 L 30 85 Q 25 85 25 80 Z"/>
                </svg>
              </div>
              <h3 className="text-[22px] font-semibold text-black mb-1.5 tracking-tight">
                Will Mitchell
              </h3>
              <p className="text-[13px] text-gray-600 mb-5 tracking-wide">
                Auto Marketing
              </p>
              <p className="text-[15px] text-gray-500 leading-relaxed max-w-[420px] mx-auto">
                Drives growth through intelligent automation. Specializes in AI-powered marketing solutions.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-[60px] h-[1px] bg-gray-300 mx-auto mb-20"></div>

          {/* Mission Text */}
          <p className="text-center max-w-[780px] mx-auto text-[16px] text-gray-600 leading-relaxed mb-16">
            Founded in 2020 to help small businesses compete online through quality website redesigns.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#7FA99B]">50+</span>
              <span className="mt-2 text-sm text-gray-600">Websites Launched</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#7FA99B]">100%</span>
              <span className="mt-2 text-sm text-gray-600">Satisfaction</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#7FA99B]">85%</span>
              <span className="mt-2 text-sm text-gray-600">Conversion Increase</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
} 