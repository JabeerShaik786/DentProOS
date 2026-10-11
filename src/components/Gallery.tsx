"use client";

import Image from "next/image";
import { getAssetPath } from "@/lib/getAssetPath";
import { clinicConfig } from "@/config/clinic.config";

export default function Gallery() {
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
    <section id="gallery" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Dental Instruments decoration in bottom right corner */}
      <div className="absolute right-0 bottom-0 w-[140px] md:w-[170px] aspect-[172/140] pointer-events-none select-none z-10">
        <Image
          src={getAssetPath("/figma/dental_tools.png")}
          alt="Dental Tools Decoration"
          fill
          className="object-contain object-bottom-right"
          unoptimized
        />
      </div>

      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-20 relative z-20 text-center">
        
        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#173D2A] tracking-tight mb-12 lg:mb-16">
          Gallery
        </h2>

        {/* Gallery 1 + 4 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch max-w-[1100px] mx-auto">
          
          {/* LEFT: One Large Clinic Operatory Image (~50% width) */}
          <div className="lg:col-span-6 relative w-full aspect-[4/3] lg:aspect-auto lg:h-[430px] rounded-2xl md:rounded-3xl overflow-hidden shadow-md border border-slate-100 group">
            <Image
              src={getAssetPath("/gallery/chair.jpg")}
              alt={`${clinicConfig.name} Modern Operatory Chair Room`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized
            />
          </div>

          {/* RIGHT: 2x2 Grid of 4 Smaller Images */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 md:gap-5 w-full">
            
            {/* Top-Left: Exterior Building */}
            <div className="relative w-full aspect-[4/3] lg:h-[202px] rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
              <Image
                src={getAssetPath("/gallery/building.jpg")}
                alt={`${clinicConfig.name} Building Exterior`}
                fill
                className="object-cover object-[center_28%] group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 50vw, 25vw"
                unoptimized
              />
            </div>

            {/* Top-Right: Reception Desk */}
            <div className="relative w-full aspect-[4/3] lg:h-[202px] rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
              <Image
                src={getAssetPath("/gallery/reception.jpg")}
                alt={`${clinicConfig.name} Clinic Reception Desk`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 50vw, 25vw"
                unoptimized
              />
            </div>

            {/* Bottom-Left: OPG / X-ray Unit */}
            <div className="relative w-full aspect-[4/3] lg:h-[202px] rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
              <Image
                src={getAssetPath("/gallery/xray.jpg")}
                alt={`${clinicConfig.name} Digital X-Ray Setup`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 50vw, 25vw"
                unoptimized
              />
            </div>

            {/* Bottom-Right: 3D Intraoral Scanner Laptop Setup */}
            <div className="relative w-full aspect-[4/3] lg:h-[202px] rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
              <Image
                src={getAssetPath("/gallery/scanner.png")}
                alt={`${clinicConfig.name} 3D Intraoral Scanner`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 50vw, 25vw"
                unoptimized
              />
            </div>

          </div>

        </div>

        {/* Bottom Center "View All" Button */}
        <div className="mt-12 lg:mt-16">
          <a
            href="#contact"
            onClick={scrollToContact}
            className="inline-flex items-center justify-center px-9 py-2.5 bg-[#2E8B57] hover:bg-[#257348] text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
          >
            View All
          </a>
        </div>

      </div>
    </section>
  );
}
