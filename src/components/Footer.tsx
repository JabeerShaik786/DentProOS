"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, MessageSquare, Clock } from "lucide-react";
import { getAssetPath } from "@/lib/getAssetPath";
import { clinicConfig } from "@/config/clinic.config";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (href === "#home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          window.history.pushState(null, "", window.location.pathname);
          return;
        }
        const headerEl = document.querySelector("header");
        const navbarHeight = headerEl ? headerEl.getBoundingClientRect().height + 16 : 96;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 12;
        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: "smooth",
        });
        window.history.pushState(null, "", href);
      } else {
        e.preventDefault();
        window.location.href = getAssetPath(`/${href}`);
      }
    }
  };

  return (
    <footer className="w-full bg-[#173D2A] text-white/90 pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#2E8B57]/10 blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#60A780]/5 blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand Column */}
        <div className="flex flex-col gap-6">
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, "#home")}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src={getAssetPath(clinicConfig.logo.main)}
                alt={clinicConfig.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-sm tracking-tight text-white leading-tight uppercase">
                {clinicConfig.shortName}
              </span>
              <span className="font-sans font-medium text-[8px] tracking-[0.05em] text-[#81BA9A] uppercase leading-none mt-0.5">
                {clinicConfig.subtitle}
              </span>
            </div>
          </a>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm text-left">
            {clinicConfig.tagline}. Professional and personalized dental care in a modern and comfortable environment.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[12px] bg-[#2E8B57]/20 text-[#81BA9A] px-3.5 py-1 rounded-full font-semibold border border-[#2E8B57]/10 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {clinicConfig.hours.badgeDisplay}
            </span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="flex flex-col gap-5 text-left">
          <h4 className="font-heading font-bold text-base text-white tracking-wide uppercase">
            Navigation
          </h4>
          <ul className="flex flex-col gap-3.5 text-sm text-white/60">
            {[
              { name: "Home", href: "#home" },
              { name: "Services", href: "#services" },
              { name: "About", href: "#about" },
              { name: "Blog", href: "#blog" },
              { name: "Contact", href: "#contact" },
              { name: "Book Appointment", href: "#appointment" },
            ].map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="hover:text-[#81BA9A] transition-colors duration-200"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services Column */}
        <div className="flex flex-col gap-5 text-left">
          <h4 className="font-heading font-bold text-base text-white tracking-wide uppercase">
            Services
          </h4>
          <ul className="flex flex-col gap-3.5 text-sm text-white/60">
            {[
              { name: "Root Canal Treatment", href: "#services" },
              { name: "Cavity Inspection", href: "#services" },
              { name: "Dental Implants", href: "#services" },
              { name: "Orthodontics", href: "#services" },
              { name: "Teeth Alignment", href: "#services" },
              { name: "Cosmetic Dentistry", href: "#services" },
            ].map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="hover:text-[#81BA9A] transition-colors duration-200"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Column */}
        <div className="flex flex-col gap-5 text-left">
          <h4 className="font-heading font-bold text-base text-white tracking-wide uppercase">
            Contact Us
          </h4>
          <div className="flex flex-col gap-4 text-sm text-white/60">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-[#81BA9A] shrink-0 mt-0.5" />
              <span>{clinicConfig.contact.address.short || clinicConfig.contact.address.full}</span>
            </div>
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-[#81BA9A] shrink-0 mt-0.5" />
              <a href={`tel:${clinicConfig.contact.phone.replace(/[\s()-]/g, "")}`} className="hover:text-white transition-colors">
                {clinicConfig.contact.phone}
              </a>
            </div>
            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-[#81BA9A] shrink-0 mt-0.5" />
              <a
                href={`mailto:${clinicConfig.contact.email}`}
                className="hover:text-white transition-colors"
              >
                {clinicConfig.contact.email}
              </a>
            </div>
            <div className="flex gap-3">
              <MessageSquare className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <a
                href={`https://wa.me/${clinicConfig.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-white/10 max-w-[1440px] mx-auto px-6 md:px-12" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 text-center md:text-left pb-24 md:pb-8">
        <p>© {currentYear} {clinicConfig.name}. All rights reserved.</p>
        <p className="text-white/40 flex items-center justify-center gap-1.5">
          <Image
            src={getAssetPath("/jk-logo.png")}
            alt="JK & Co."
            width={18}
            height={18}
            className="w-[18px] h-[18px] object-contain shrink-0"
            unoptimized
          />
          <span>Designed and Managed by JK & Co.</span>
        </p>
        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3.5 text-center md:text-left max-w-xs md:max-w-none mx-auto md:mx-0 md:pr-24 lg:pr-28">
          <Link href="/privacy-policy" className="hover:text-white transition-colors duration-200 py-1">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-white transition-colors duration-200 py-1">
            Terms of Service
          </Link>
          <a href="#" className="hover:text-white transition-colors duration-200 py-1">
            Sitemap
          </a>
          <Link
            href="/login"
            className="hover:text-white transition-colors duration-200 opacity-70 hover:opacity-100 py-1"
          >
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
