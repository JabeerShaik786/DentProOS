"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getAssetPath } from "@/lib/getAssetPath";
import { clinicConfig } from "@/config/clinic.config";

export default function AboutDoctor() {
  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
    <section id="doctor" className="py-20 lg:py-28 bg-white relative overflow-hidden text-slate-800">
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ================= LEFT CONTENT COLUMN ================= */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            {/* Eyebrow: ABOUT OUR DOCTOR */}
            <div className="mb-4">
              <span className="relative inline-block text-xs md:text-sm font-bold tracking-[0.18em] uppercase pb-1">
                <span className="relative text-[#2E8B57]">
                  ABOUT
                  <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#2E8B57] rounded-full" />
                </span>
                <span className="ml-2.5 font-bold text-[#173D2A]">OUR DOCTOR</span>
              </span>
            </div>

            {/* Main Heading: Expert Care for / Your Perfect Smile */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#173D2A] tracking-tight leading-[1.18] mb-4">
              Expert Care for<br />
              <span className="text-[#2E8B57]">Your Perfect Smile</span>
            </h2>

            {/* Tagline */}
            <p className="text-[#2E8B57] font-bold text-base sm:text-lg mb-4 tracking-wide">
              Experienced. Compassionate. Dedicated to Your Smile.
            </p>

            {/* Paragraph Body */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal mb-8 max-w-xl">
              With years of experience in advanced dental care, our doctor is committed to providing personalized, gentle, and high-quality treatment. Every patient is cared for with expertise, compassion, and a focus on achieving a healthy, confident smile.
            </p>

            {/* CTA Button: Know More → */}
            <div>
              <a
                href="#contact"
                onClick={scrollToContact}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#2E8B57] text-white font-semibold text-sm sm:text-base rounded-lg shadow-md shadow-[#2E8B57]/25 hover:bg-[#257348] hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer group"
              >
                <span>Know More</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: DOCTOR & DECORATIVE GRAPHICS ================= */}
          <div className="lg:col-span-6 w-full relative flex items-center justify-center py-6 lg:py-0">
            <div className="relative w-full max-w-[480px] lg:max-w-[520px] aspect-[4/4.5] flex items-center justify-center">

              {/* 1. Large Soft Light-Blue Circular Background */}
              <div className="absolute w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full bg-[#D5E8DD] border border-[#81BA9A]/40 -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner" />

              {/* 2. Inner Layer Circular Accent */}
              <div className="absolute w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] rounded-full bg-gradient-to-tr from-[#D5E8DD] to-[#F7F7F7] -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90" />

              {/* 3. Subtle Gradient Wash Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2E8B57]/10 via-transparent to-transparent blur-2xl -z-10 rounded-full" />

              {/* 4. Dotted Grid (Upper-Left of Doctor Area) */}
              <div className="absolute top-4 left-2 sm:left-6 w-24 h-24 -z-10 opacity-35 pointer-events-none">
                <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
                  <pattern id="dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="3" cy="3" r="2.5" fill="#2E8B57" />
                  </pattern>
                  <rect width="96" height="96" fill="url(#dot-grid)" />
                </svg>
              </div>

              {/* 5. Thin Curved Arc (Right side of Doctor) */}
              <div className="absolute right-0 sm:right-2 top-1/4 w-24 sm:w-28 h-48 -z-10 pointer-events-none">
                <svg viewBox="0 0 100 200" fill="none" className="w-full h-full">
                  <path
                    d="M 10,10 C 80,60 80,140 10,190"
                    stroke="#60A780"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* 6. Subtle Tooth Outline (Upper-Right) */}
              <div className="absolute top-2 right-6 sm:right-12 w-20 h-20 -z-10 opacity-15 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2E8B57" strokeWidth="1.2">
                  <path d="M12 2C8 2 5 4 5 7c0 3 1.5 5 2 7.5S8 22 10 22s2-3.5 2-6c0 2.5 0 6 2 6s3-4.5 3-7.5 2-4.5 2-7.5c0-3-3-5-7-5z" />
                </svg>
              </div>

              {/* 7. Subtle Decorative Ring (Bottom-Right) */}
              <div className="absolute bottom-4 right-8 w-16 h-16 rounded-full border-2 border-dashed border-[#2E8B57]/25 -z-10 pointer-events-none" />

              {/* Doctor Image Overlay */}
              <div className="relative w-full h-full z-10 flex items-end justify-center">
                <Image
                  src={getAssetPath("/doctor.png")}
                  alt={`${clinicConfig.name} Lead Dentist & Specialist`}
                  fill
                  className="object-contain object-bottom filter drop-shadow-[0_15px_25px_rgba(15,41,66,0.15)]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
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
