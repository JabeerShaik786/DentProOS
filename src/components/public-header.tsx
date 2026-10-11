"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Calendar, UserCheck, Shield } from "lucide-react";
import { DentalLogo } from "@/components/dental-logo";
import { createClient } from "@/lib/supabase/client";

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Book Appointment", href: "/book-appointment" },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 dark:border-slate-800 dark:bg-slate-950/90 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <DentalLogo />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold transition-colors hover:text-[#2E8B57] dark:hover:text-[#81BA9A] ${
                    isActive
                      ? "text-[#2E8B57] dark:text-[#81BA9A] font-bold"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/book-appointment"
            className="text-xs font-bold text-white bg-[#2E8B57] hover:bg-[#257348] px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5" /> Book Appointment
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#2E8B57] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <UserCheck className="h-3.5 w-3.5 text-[#2E8B57]" /> Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#2E8B57] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Shield className="h-3.5 w-3.5 text-slate-500" /> Staff Portal
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm font-medium py-1.5 ${
                  isActive
                    ? "text-[#2E8B57] dark:text-[#81BA9A] font-bold"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Link
              href="/book-appointment"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-xs font-bold text-white bg-[#2E8B57] hover:bg-[#257348] py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5" /> Book Appointment
            </Link>
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5 text-[#2E8B57]" /> Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Shield className="h-3.5 w-3.5 text-slate-500" /> Staff Portal Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
