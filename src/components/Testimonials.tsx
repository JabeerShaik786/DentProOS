"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { getAssetPath } from "@/lib/getAssetPath";
import { clinicConfig, type TestimonialItem } from "@/config/clinic.config";

const TESTIMONIALS_DATA: TestimonialItem[] = clinicConfig.testimonials;

// Append first 3 items as clones for seamless infinite looping
const EXTENDED_TESTIMONIALS = [
  ...TESTIMONIALS_DATA,
  ...TESTIMONIALS_DATA.slice(0, 3),
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Responsive items count
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(1);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Handle transition end for seamless infinite loop
  const handleTransitionEnd = useCallback(() => {
    if (currentIndex >= TESTIMONIALS_DATA.length) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  }, [currentIndex]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    } else if (diff < -50 && currentIndex > 0) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
    }
    setTouchStart(null);
  };

  const translatePercent = currentIndex * (100 / itemsPerPage);

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-28 relative overflow-hidden bg-[#D5E8DD]"
    >
      {/* Large subtle white decorative circle on right side */}
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border-[100px] border-white/60 pointer-events-none select-none z-0" />

      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        
        {/* Header (Top Left Aligned) */}
        <div className="max-w-xl text-left mb-12 lg:mb-14">
          {/* Label with blue underline under TESTIMONIALS */}
          <div className="mb-3">
            <span className="relative inline-block text-xs md:text-sm font-bold tracking-[0.16em] uppercase pb-1 text-[#173D2A]">
              <span className="relative text-[#2E8B57]">
                TESTIMONIALS
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#2E8B57] rounded-full" />
              </span>
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#173D2A] tracking-tight leading-[1.18]">
            Smiles That Speak for<br />
            <span className="text-[#2E8B57]">Themselves</span>
          </h2>
        </div>

        {/* Carousel Container (Auto-advances smoothly every 5 seconds) */}
        <div
          className="max-w-[1160px] mx-auto overflow-hidden py-4 -my-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex -mx-3 items-stretch"
            style={{
              transform: `translate3d(-${translatePercent}%, 0, 0)`,
              transition: isTransitioning
                ? "transform 700ms cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {EXTENDED_TESTIMONIALS.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="w-full md:w-1/2 lg:w-1/3 px-3 shrink-0 flex"
              >
                <div className="w-full bg-white rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-slate-100 flex flex-col justify-between text-left hover:shadow-lg transition-shadow duration-300 h-full">
                  {/* Review Quote */}
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal mb-8">
                    {item.quote}
                  </p>

                  {/* Author & Rating */}
                  <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100/80">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-slate-200">
                      <Image
                        src={getAssetPath(item.avatar)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        style={{ objectPosition: item.objectPosition || "center" }}
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-bold text-sm text-[#173D2A] leading-tight">
                        {item.name}
                      </h4>
                      {/* 5 Yellow Stars */}
                      <div className="flex text-amber-400 gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Center "View All" Button */}
        <div className="mt-12 lg:mt-14 text-center">
          <a
            href={clinicConfig.website.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-9 py-2.5 bg-[#2E8B57] hover:bg-[#257348] text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
          >
            View All Reviews
          </a>
        </div>

      </div>
    </section>
  );
}
