"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Phone, Menu, X } from "lucide-react";
import { getAssetPath } from "@/lib/getAssetPath";
import { clinicConfig } from "@/config/clinic.config";

const NAV_ITEMS = [
  { name: "Home", href: "#home" },
  { name: "About Us", href: "#about" },
  { name: "Our Services", href: "#services" },
  { name: "Gallery", href: "#gallery" },
  { name: "Testimonials", href: "#testimonials" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  useEffect(() => {
    const sectionIds = ["home", "about", "services", "gallery", "testimonials", "contact"];
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash;
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          const navbarHeight = 100;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: "smooth",
          });
        }
      }, 150);
    }
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);

    if (href === "#home") {
      const homeEl = document.getElementById("home");
      if (homeEl) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", window.location.pathname);
      } else {
        e.preventDefault();
        window.location.href = getAssetPath("/");
      }
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navbarHeight = 100;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth",
      });
      window.history.pushState(null, "", href);
    } else {
      e.preventDefault();
      window.location.href = getAssetPath(`/${href}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full shadow-xs">
      {/* 1. Thin Green Top Gradient Strip */}
      <div className="w-full h-8 bg-gradient-to-r from-[#2E8B57] via-[#2E8B57] to-[#60A780] text-white flex items-center justify-end px-6 md:px-12 lg:px-20 text-xs font-medium tracking-wide">
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 fill-current" />
          <a href={`tel:${clinicConfig.contact.phone.replace(/[\s()-]/g, "")}`} className="hover:underline transition-all">
            {clinicConfig.contact.phone}
          </a>
          {clinicConfig.contact.secondaryPhone && (
            <>
              <span className="opacity-70 px-0.5">|</span>
              <a href={`tel:${clinicConfig.contact.secondaryPhone.replace(/[\s()-]/g, "")}`} className="hover:underline transition-all">
                {clinicConfig.contact.secondaryPhone}
              </a>
            </>
          )}
        </div>
      </div>

      {/* 2. Main White Navigation Bar */}
      <div className="w-full bg-white relative h-[72px] flex items-center">
        <div className="max-w-[1360px] mx-auto w-full px-6 md:px-12 lg:px-20 flex items-center justify-between">
          
          {/* Overlapping Logo Container Badge */}
          <div className="relative -top-3 z-20 shrink-0">
            <a
              href="#home"
              onClick={(e) => scrollToSection(e, "#home")}
              className="bg-white rounded-b-2xl shadow-md px-3.5 pt-2 pb-2.5 flex flex-col items-center border-b border-x border-slate-100 transition-transform hover:scale-[1.02]"
              style={{ width: "94px" }}
            >
              <div className="relative w-[72px] h-[64px]">
                <Image
                  src={getAssetPath(clinicConfig.logo.main)}
                  alt={clinicConfig.name}
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
              <div className="mt-1 px-2 py-0.5 bg-gradient-to-r from-[#2E8B57] to-[#60A780] rounded text-[9px] font-bold text-white tracking-wider uppercase shadow-2xs">
                ESTD. {clinicConfig.establishedYear}
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-9 ml-auto mr-8">
            {NAV_ITEMS.map((item) => {
              const itemId = item.href.replace("#", "");
              const isActive = activeSection === itemId;

              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={`text-[15px] font-semibold transition-colors duration-200 ${
                    isActive ? "text-[#2E8B57]" : "text-[#173D2A] hover:text-[#2E8B57]"
                  }`}
                >
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* Contact Us Button */}
          <div className="hidden lg:block shrink-0">
            <a
              href={`tel:${clinicConfig.contact.phone.replace(/[\s()-]/g, "")}`}
              className="inline-flex items-center justify-center px-6 py-2 text-[15px] font-semibold text-[#2E8B57] bg-white border border-[#2E8B57] rounded-lg hover:bg-[#2E8B57] hover:text-white transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95"
            >
              Contact Us
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-3">
            <a
              href={`tel:${clinicConfig.contact.phone.replace(/[\s()-]/g, "")}`}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#2E8B57] border border-[#2E8B57] rounded-md"
            >
              Contact Us
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#173D2A] hover:text-[#2E8B57] transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-white border-b border-slate-200 shadow-xl px-6 py-5 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="py-2 text-base font-semibold text-[#173D2A] hover:text-[#2E8B57] transition-colors border-b border-slate-100"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#2E8B57]" />
              <span>{clinicConfig.contact.displayPhone}</span>
            </div>
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, "#contact")}
              className="w-full py-2.5 text-center text-sm font-bold text-white bg-gradient-to-r from-[#2E8B57] to-[#60A780] rounded-lg shadow-sm"
            >
              Get Online Consultancy
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
