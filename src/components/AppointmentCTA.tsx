"use client";

import Image from "next/image";
import { getAssetPath } from "@/lib/getAssetPath";
import { clinicConfig } from "@/config/clinic.config";

export default function AppointmentCTA() {
  const scrollToBooking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector("#consultancy") || document.querySelector("#contact");
    if (target) {
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="contact"
      className="py-20 lg:py-24 relative overflow-hidden text-white"
      style={{
        background: "linear-gradient(160deg, #2E8B57 0%, #257348 50%, #173D2A 100%)",
      }}
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT: Text & CTA Button */}
          <div className="lg:col-span-6 flex flex-col items-start text-left max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-[50px] font-extrabold text-white tracking-tight leading-[1.14] mb-6">
              Book Your<br />
              Appointment Today!
            </h2>

            <p className="text-white/90 text-sm sm:text-base leading-relaxed font-normal mb-8">
              Your smile deserves the best care! Whether you need a routine check-up, cosmetic enhancement, or specialized treatment, our expert team at {clinicConfig.name} is here to help. Schedule your appointment now and take the first step toward a healthier, brighter smile. Easy booking, expert care, and a comfortable experience await you!
            </p>

            {/* White Button with Green Text */}
            <div>
              <a
                href="#consultancy"
                onClick={scrollToBooking}
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#2E8B57] font-bold text-sm sm:text-base rounded-lg shadow-lg hover:bg-slate-50 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* RIGHT: Large Cartoon Smiling Tooth in Circular Light Green Container */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            {/* Circular Backdrop */}
            <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[430px] lg:h-[430px] rounded-full bg-[#81BA9A]/40 flex items-center justify-center border-4 border-white/20 shadow-2xl">
              {/* Cartoon Smiling Tooth Character */}
              <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[390px] lg:h-[390px] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]">
                <Image
                  src={getAssetPath("/smiling-tooth.png")}
                  alt={`Friendly Smiling Tooth - ${clinicConfig.name}`}
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
