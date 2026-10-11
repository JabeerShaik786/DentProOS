"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { clinicConfig } from "@/config/clinic.config";

export default function ConsultancyCard() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      const addressText = formData.address ? `, Address: ${formData.address}` : "";
      const msg = encodeURIComponent(
        `Hello ${clinicConfig.shortName || clinicConfig.name}, I requested online consultancy for ${formData.name}, Phone: ${formData.phone}, Email: ${formData.email}${addressText}`
      );
      window.open(`https://wa.me/${clinicConfig.contact.whatsapp}?text=${msg}`, "_blank");
    }, 800);
  };

  return (
    <div id="consultancy" className="relative z-30 max-w-[1060px] mx-auto px-4 sm:px-6 w-full -mt-20 lg:-mt-24">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-slate-100 p-6 md:p-10 lg:p-12 relative overflow-hidden">
        
        {/* Subtle decorative tooth line-art watermark on the left side */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none select-none">
          <svg width="280" height="280" viewBox="0 0 24 24" fill="none" stroke="#60A780" strokeWidth="1.5">
            <path d="M12 2C8 2 5 4 5 7c0 3 1.5 5 2 7.5S8 22 10 22s2-3.5 2-6c0 2.5 0 6 2 6s3-4.5 3-7.5 2-4.5 2-7.5c0-3-3-5-7-5z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Heading */}
          <div className="lg:col-span-5 text-left">
            <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#173D2A] tracking-tight leading-[1.25]">
              Quick Online<br />
              Consultancy Only<br />
              on <span className="text-[#2E8B57]">Few Minutes</span>
            </h3>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-lg font-bold text-emerald-900">Consultancy Request Received!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Our doctor will review your details and contact you shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", phone: "", email: "", address: "" });
                  }}
                  className="mt-4 text-xs font-semibold text-emerald-800 underline hover:text-emerald-950"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                {/* 2x2 Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Name*"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-11 px-4 text-sm rounded-lg bg-[#f4f5f8] border border-transparent focus:border-[#2E8B57] focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number*"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-11 px-4 text-sm rounded-lg bg-[#f4f5f8] border border-transparent focus:border-[#2E8B57] focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-11 px-4 text-sm rounded-lg bg-[#f4f5f8] border border-transparent focus:border-[#2E8B57] focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full h-11 px-4 text-sm rounded-lg bg-[#f4f5f8] border border-transparent focus:border-[#2E8B57] focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Full-width green button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-1 rounded-lg bg-[#2E8B57] hover:bg-[#257348] text-white font-semibold text-sm sm:text-base active:scale-[0.99] transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Get Online Consultancy</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
