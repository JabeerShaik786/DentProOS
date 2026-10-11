import React from "react";
import Link from "next/link";
import { DentalLogo } from "@/components/dental-logo";
import { LogIn, UserPlus, KeyRound, RefreshCw, CheckCircle, Shield, Sparkles, Smartphone, Calendar } from "lucide-react";

export default function PreviewHub() {
  const pages = [
    {
      title: "Clinic Login",
      description: "Sign in to access your clinic workspace. Features validation, loading states, and customizable password reveal.",
      href: "/login",
      icon: <LogIn className="h-6 w-6 text-blue-600" />,
      features: ["Client-side Zod validation", "Simulated API delay (1.5s)", "Test error credentials with error@dental.com", "Secure remember browser checkbox"],
    },
    {
      title: "Clinic Registration",
      description: "A 3-step setup wizard for registering a new clinic, including practice details, owner credentials, and operational preferences.",
      href: "/register",
      icon: <UserPlus className="h-6 w-6 text-cyan-600" />,
      features: ["Step 1: Complete Clinic Profile", "Step 2: Account Owner Setup", "Step 3: Operational Preferences", "Welcome screen & direct auto-auth"],
    },
    {
      title: "Forgot Password",
      description: "Send recovery link instructions to a registered email address. Features full success confirmation.",
      href: "/forgot-password",
      icon: <KeyRound className="h-6 w-6 text-emerald-600" />,
      features: ["Email format validations", "Simulated email dispatching delay", "Checking-inbox visual confirmation screen"],
    },
    {
      title: "Reset Password",
      description: "Set a new secure password. Features real-time validation feedback and password strength measurement.",
      href: "/reset-password",
      icon: <RefreshCw className="h-6 w-6 text-purple-600" />,
      features: ["Complexity requirement check", "Visual password strength meter", "Password match validation", "Autoredirect on success"],
    },
    {
      title: "Public Appointment Booking",
      description: "Public website appointment request form for patient self-service booking.",
      href: "/book-appointment",
      icon: <Calendar className="h-6 w-6 text-amber-600" />,
      features: ["Supabase Edge Function /functions/v1/public-appointment", "Phone normalization & patient matching", "Duplicate request prevention", "Direct Supabase synchronization"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-50 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <DentalLogo />
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-blue-600 hover:text-blue-500 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
            >
              Go to SaaS Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex-grow flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Authentication Module
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Welcome to the authentication and clinic onboarding prototype for **DentPro OS**. This module consists of modular, responsive, and validated pages designed for dental practice groups.
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pages.map((page, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 shadow-inner">
                  {page.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{page.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{page.description}</p>
                
                <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {page.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={page.href}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm"
                >
                  Open Page
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DentPro OS. All rights reserved. Prototype Preview.</p>
        </div>
      </footer>
    </div>
  );
}
