"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Clock, CheckCircle, Send, Calendar } from "lucide-react";
import { clinicConfig } from "@/config/clinic.config";

interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  service: string;
  message: string;
}

interface ContactCardProps {
  icon: React.ElementType;
  title: string;
  details: string;
}

function ContactCard({ icon: Icon, title, details }: ContactCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-5 rounded-[18px] border transition-all duration-300 flex items-start gap-4 bg-white border-borders/50 shadow-sm hover:shadow-md hover:border-primary/10"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-primary/5 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-text">
          {title}
        </span>
        {title === "Email" ? (
          <a
            href={`mailto:${clinicConfig.contact.email}`}
            className="text-sm font-semibold text-dark-text mt-1 hover:text-primary transition-colors"
          >
            {details}
          </a>
        ) : title === "Reception & Booking" ? (
          <a
            href={`tel:${clinicConfig.contact.phone.replace(/[\s()-]/g, "")}`}
            className="text-sm font-semibold text-dark-text mt-1 hover:text-primary transition-colors"
          >
            {details}
          </a>
        ) : title === "Working Hours" ? (
          <div className="text-sm font-semibold text-dark-text mt-1 leading-relaxed whitespace-pre-line">
            {details}
          </div>
        ) : (
          <span className="text-sm font-semibold text-dark-text mt-1 leading-relaxed">
            {details}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function ContactSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>();

  const onSubmit = async (data: BookingFormData) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Appointment booked:", data);
    setIsSubmitted(true);
    reset();
  };

  return (
    <section id="appointment" className="py-28 bg-gradient-to-b from-[#F1F6FA] to-[#F8FAFC] relative overflow-hidden">
      {/* Decorative backdrop shapes */}
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* SECTION 1: Dentist Image + Appointment Booking Form */}
      <div className="max-w-[1320px] mx-auto px-6 md:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-20">
          <span className="text-sm font-bold text-primary uppercase tracking-widest mb-3">
            Appointment Booking
          </span>
          <h2 className="font-heading font-extrabold text-3xl md:text-[48px] text-dark-text tracking-tight leading-tight">
            Book Your Dental Appointment
          </h2>
          <div className="h-[3px] w-12 bg-primary rounded-full mt-6" />
        </div>

        {/* Form Container */}
        <div className="max-w-[800px] mx-auto w-full mb-24">
          <div className="rounded-[28px] p-8 md:p-12 bg-white border border-borders/60 shadow-xl shadow-primary/[0.01] relative min-h-[580px] flex flex-col justify-center">
              
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-heading font-extrabold text-3xl text-dark-text tracking-tight mb-2 text-left">
                      Book Your Dental Appointment
                    </h3>
                    <p className="text-sm text-gray-text font-normal leading-relaxed text-left mb-8">
                      Take the first step towards a healthier and more confident smile.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                      {/* Name */}
                      <div className="sm:col-span-2 flex flex-col">
                        <label htmlFor="fullName" className="text-xs font-bold text-dark-text uppercase tracking-wider mb-2">
                          Full Name *
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          placeholder="e.g. Rahul Verma"
                          className={`w-full h-14 px-5 rounded-2xl bg-[#F8FAFC] border text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${
                            errors.fullName ? "border-red-500" : "border-borders/60"
                          }`}
                          {...register("fullName", { required: "Full name is required" })}
                        />
                        {errors.fullName && (
                          <span className="text-xs text-red-500 mt-1.5 font-bold">{errors.fullName.message}</span>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col">
                        <label htmlFor="phone" className="text-xs font-bold text-dark-text uppercase tracking-wider mb-2">
                          Phone Number *
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          placeholder="10-digit mobile number"
                          className={`w-full h-14 px-5 rounded-2xl bg-[#F8FAFC] border text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${
                            errors.phone ? "border-red-500" : "border-borders/60"
                          }`}
                          {...register("phone", {
                            required: "Phone number is required",
                            pattern: { value: /^[6-9]\d{9}$/, message: "Please enter a valid 10-digit mobile number" },
                          })}
                        />
                        {errors.phone && (
                          <span className="text-xs text-red-500 mt-1.5 font-bold">{errors.phone.message}</span>
                        )}
                      </div>

                      {/* Email */}
                      <div className="flex flex-col">
                        <label htmlFor="email" className="text-xs font-bold text-dark-text uppercase tracking-wider mb-2">
                          Email Address *
                        </label>
                        <input
                          id="email"
                          type="email"
                          placeholder="e.g. rahul@example.com"
                          className={`w-full h-14 px-5 rounded-2xl bg-[#F8FAFC] border text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${
                            errors.email ? "border-red-500" : "border-borders/60"
                          }`}
                          {...register("email", {
                            required: "Email is required",
                            pattern: { value: /^\S+@\S+$/i, message: "Please enter a valid email address" },
                          })}
                        />
                        {errors.email && (
                          <span className="text-xs text-red-500 mt-1.5 font-bold">{errors.email.message}</span>
                        )}
                      </div>

                      {/* Preferred Date */}
                      <div className="flex flex-col">
                        <label htmlFor="date" className="text-xs font-bold text-dark-text uppercase tracking-wider mb-2">
                          Preferred Date *
                        </label>
                        <input
                          id="date"
                          type="date"
                          className={`w-full h-14 px-5 rounded-2xl bg-[#F8FAFC] border text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${
                            errors.date ? "border-red-500" : "border-borders/60"
                          }`}
                          {...register("date", { required: "Please select a date" })}
                        />
                        {errors.date && (
                          <span className="text-xs text-red-500 mt-1.5 font-bold">{errors.date.message}</span>
                        )}
                      </div>

                      {/* Preferred Time */}
                      <div className="flex flex-col">
                        <label htmlFor="time" className="text-xs font-bold text-dark-text uppercase tracking-wider mb-2">
                          Preferred Time *
                        </label>
                        <input
                          id="time"
                          type="time"
                          className={`w-full h-14 px-5 rounded-2xl bg-[#F8FAFC] border text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${
                            errors.time ? "border-red-500" : "border-borders/60"
                          }`}
                          {...register("time", { required: "Please select a time slot" })}
                        />
                        {errors.time && (
                          <span className="text-xs text-red-500 mt-1.5 font-bold">{errors.time.message}</span>
                        )}
                      </div>

                      {/* Service Category */}
                      <div className="sm:col-span-2 flex flex-col">
                        <label htmlFor="service" className="text-xs font-bold text-dark-text uppercase tracking-wider mb-2">
                          Dental Service *
                        </label>
                        <select
                          id="service"
                          className={`w-full h-14 px-5 rounded-2xl bg-[#F8FAFC] border text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${
                            errors.service ? "border-red-500" : "border-borders/60"
                          }`}
                          defaultValue=""
                          {...register("service", { required: "Please select a dental service" })}
                        >
                          <option value="" disabled>Select dental service</option>
                          <option value="General Dentistry">General Dentistry</option>
                          <option value="Root Canal Treatment">Root Canal Treatment</option>
                          <option value="Cavity Inspection">Cavity Inspection</option>
                          <option value="Dental Implants">Dental Implants</option>
                          <option value="Orthodontics">Orthodontics</option>
                          <option value="Teeth Alignment">Teeth Alignment</option>
                          <option value="Cosmetic Dentistry">Cosmetic Dentistry</option>
                          <option value="Teeth Whitening">Teeth Whitening</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.service && (
                          <span className="text-xs text-red-500 mt-1.5 font-bold">{errors.service.message}</span>
                        )}
                      </div>

                      {/* Message / Dental Concern */}
                      <div className="sm:col-span-2 flex flex-col">
                        <label htmlFor="message" className="text-xs font-bold text-dark-text uppercase tracking-wider mb-2">
                          Message / Dental Concern
                        </label>
                        <textarea
                          id="message"
                          rows={3}
                          placeholder="Describe any symptoms, pain location, cosmetic goals, or questions..."
                          className="w-full p-5 rounded-2xl bg-[#F8FAFC] border border-borders/60 text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 resize-none animate-none"
                          {...register("message")}
                        />
                      </div>

                      {/* Submit Button & Direct Call stack */}
                      <div className="sm:col-span-2 pt-2 flex flex-col gap-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-14 bg-primary hover:bg-[#066bbd] text-white font-bold text-base rounded-2xl shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-75 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                        >
                          {isSubmitting ? (
                            <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          ) : (
                            <>
                              <Send className="w-5 h-5 text-white" />
                              <span>Book Appointment</span>
                            </>
                          )}
                        </button>
                        
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-text font-medium">
                          <span>Or call directly:</span>
                          <a href={`tel:${clinicConfig.contact.phone.replace(/[\s()-]/g, "")}`} className="text-primary font-bold hover:underline">
                            Call {clinicConfig.contact.phone}
                          </a>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="flex flex-col items-center text-center p-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-6 shadow-sm shadow-green-500/5">
                      <CheckCircle className="w-10 h-10 stroke-[2.5]" />
                    </div>
                    
                    <h3 className="font-heading font-extrabold text-2xl md:text-3xl text-dark-text tracking-tight mb-3">
                      Request Submitted!
                    </h3>
                    
                    <p className="text-base text-gray-text max-w-md leading-relaxed font-normal mb-8">
                      Thank you for choosing {clinicConfig.name}. Our clinical team has received your request and will call you back at your provided phone number to confirm your slot.
                    </p>
                    
                    <div className="p-4 rounded-2xl bg-slate-50 border border-borders/60 flex items-center gap-3 text-left w-full max-w-sm mb-8">
                      <Calendar className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-xs md:text-sm font-semibold text-dark-text">
                        A confirmation SMS and email summary have been sent.
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-2.5 rounded-xl border border-borders bg-white font-bold text-xs text-gray-text hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Book Another Slot
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      {/* SECTION 2: Map + Contact Information Stack */}
      <div id="contact" className="max-w-[1320px] mx-auto px-6 md:px-8 border-t border-borders/60 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Side (70% width -> lg:col-span-8) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-8 w-full rounded-[24px] overflow-hidden shadow-[0_15px_50px_rgba(15,23,42,0.05)] border border-borders relative h-[450px]"
          >
            <iframe
              title={`${clinicConfig.name} Map Location`}
              src={clinicConfig.contact.address.mapsEmbedUrl}
              className="absolute inset-0 w-full h-full border-none"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          {/* Right Side (30% width -> lg:col-span-4) */}
          <div className="lg:col-span-4 w-full flex flex-col gap-5 text-left">
            <ContactCard
              icon={MapPin}
              title="Clinic Address"
              details={clinicConfig.contact.address.full}
            />
            <ContactCard
              icon={Phone}
              title="Reception & Booking"
              details={clinicConfig.contact.phone}
            />
            <ContactCard
              icon={Mail}
              title="Email"
              details={clinicConfig.contact.email}
            />
            <ContactCard
              icon={Clock}
              title="Working Hours"
              details={`${clinicConfig.hours.weekdays}\n${clinicConfig.hours.sunday}`}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
