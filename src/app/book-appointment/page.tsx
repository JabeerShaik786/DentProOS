"use client";

import React from "react";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { PublicAppointmentForm } from "@/components/public-appointment-form";

export default function BookAppointmentPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      <PublicHeader />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-grow flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
            Online Appointment Request
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Schedule your visit with our expert dental team. Fill in your details below and we will get back to you shortly.
          </p>
        </div>

        <PublicAppointmentForm />
      </main>

      <PublicFooter />
    </div>
  );
}
