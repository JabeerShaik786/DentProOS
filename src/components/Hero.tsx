"use client";

import Image from "next/image";
import { getAssetPath } from "@/lib/getAssetPath";
import { clinicConfig } from "@/config/clinic.config";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full min-h-[580px] lg:min-h-[660px] flex items-center pt-28 pb-32 overflow-hidden bg-[#D5E8DD]"
    >
      {/* Background Image: Woman smiling with dentist instruments */}
      <div className="absolute inset-0 z-0">
        <Image
          src={getAssetPath("/hero-bg.png")}
          alt="Perfect Smile Dental Treatment"
          fill
          className="object-cover object-[60%_center] md:object-[75%_center] lg:object-right opacity-90"
          priority
          unoptimized
        />
        {/* Soft Mint Gradient Wash from left to right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#D5E8DD] via-[#D5E8DD]/95 md:via-[#D5E8DD]/85 via-45% to-transparent to-75% pointer-events-none" />
      </div>

      {/* Hero Content on Left (Positioned approx 80px from left on desktop) */}
      <div className="max-w-[1360px] mx-auto w-full px-6 md:px-12 lg:px-20 relative z-10">
        <div className="max-w-xl text-left flex flex-col items-start pt-6 sm:pt-10">
          
          {/* Small Uppercase Label with Green Underline under "PERFECT" */}
          <div className="mb-4">
            <span className="relative inline-block text-xs md:text-sm font-bold tracking-[0.18em] text-[#173D2A] uppercase pb-1.5">
              <span className="relative">
                PERFECT
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#2E8B57] rounded-full" />
              </span>
              <span className="ml-2 font-semibold text-[#173D2A]">SMILE</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#173D2A] tracking-tight leading-[1.12] mb-7">
            Your <span className="text-[#2E8B57]">Journey</span> to a perfect<br />
            smile begins with us!
          </h1>

          {/* Green Contact Us Button */}
          <div>
            <a
              href={`tel:${clinicConfig.contact.phone.replace(/[\s()-]/g, "")}`}
              className="inline-flex items-center justify-center px-8 py-3 bg-[#2E8B57] hover:bg-[#257348] text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 transition-all duration-200"
            >
              Contact Us
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
