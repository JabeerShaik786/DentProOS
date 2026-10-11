import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { ShieldCheck, ArrowLeft, Lock, FileText, Phone, Mail, MapPin } from "lucide-react";
import { clinicConfig } from "@/config/clinic.config";

export const metadata: Metadata = {
  title: `Privacy Policy | ${clinicConfig.name}`,
  description: `Privacy Policy and patient data protection practices for ${clinicConfig.name}.`,
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-28 pb-20 bg-[#f8fafc]">
        {/* Header Banner */}
        <section className="bg-gradient-to-r from-[#2E8B57] via-[#60A780] to-[#81BA9A] text-white py-14 px-6 md:px-12 lg:px-20 relative overflow-hidden">
          <div className="max-w-[1100px] mx-auto relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2 bg-white/20 backdrop-blur-xs rounded-lg inline-flex">
                <ShieldCheck className="w-6 h-6 text-white" />
              </span>
              <span className="text-xs md:text-sm uppercase tracking-widest font-bold text-white/90">
                Patient Privacy & Trust
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-3 text-white/90 text-sm sm:text-base max-w-2xl font-normal">
              How {clinicConfig.name} collects, uses, and safeguards your health and personal information.
            </p>
            <p className="mt-2 text-xs text-white/70">
              Last Updated: September 2026 | Effective Date: September 2026
            </p>
          </div>
        </section>

        {/* Policy Content */}
        <section className="max-w-[1100px] mx-auto px-6 md:px-12 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 sm:p-12 space-y-10 text-[#1e293b]">
            
            {/* Introduction */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#173D2A] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#2E8B57] rounded-full inline-block" />
                1. Introduction
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Welcome to <strong>{clinicConfig.name}</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to maintaining the confidentiality, integrity, and security of your personal and dental medical information. This Privacy Policy describes how we collect, store, process, and protect information obtained through our clinic visits, website, online consultancy requests, and communication channels.
              </p>
            </div>

            {/* Information We Collect */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#173D2A] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#2E8B57] rounded-full inline-block" />
                2. Information We Collect
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-4">
                To provide safe, accurate, and personalized dental treatments, we may collect the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2.5 text-slate-600 text-sm sm:text-base pl-2">
                <li>
                  <strong className="text-slate-800">Personal Identification:</strong> Full name, age, gender, contact phone number, email address, and residential address.
                </li>
                <li>
                  <strong className="text-slate-800">Dental & Medical Records:</strong> Dental history, past surgeries, X-rays, 3D intraoral scans, medical conditions (e.g., hypertension, diabetes, allergies), current medications, and physician notes.
                </li>
                <li>
                  <strong className="text-slate-800">Appointment & Inquiry Details:</strong> Requested consultation times, treatment preferences, feedback, and notes provided via our Quick Online Consultancy form or direct phone/WhatsApp communication.
                </li>
                <li>
                  <strong className="text-slate-800">Billing & Payment Information:</strong> Payment records and receipts required for clinical accounting (we do not store credit card or banking credentials on our web servers).
                </li>
              </ul>
            </div>

            {/* How We Use Your Information */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#173D2A] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#2E8B57] rounded-full inline-block" />
                3. How We Use Your Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <h3 className="font-semibold text-sm text-[#173D2A] mb-1.5 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2E8B57]" /> Clinical Care
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Formulating accurate treatment plans, performing surgical procedures, tracking healing progress, and scheduling recalls.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <h3 className="font-semibold text-sm text-[#173D2A] mb-1.5 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#2E8B57]" /> Patient Communication
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Sending appointment confirmations, pre-procedure instructions, post-treatment care advice, and responses to your inquiries.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <h3 className="font-semibold text-sm text-[#173D2A] mb-1.5 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#2E8B57]" /> Emergency Response
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Contacting patients or designated emergency contacts in acute dental or medical situations during clinical treatment.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <h3 className="font-semibold text-sm text-[#173D2A] mb-1.5 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2E8B57]" /> Statutory Compliance
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Complying with the Dental Council of India (DCI), state health authorities, and Indian medical record retention requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* Confidentiality & Security */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#173D2A] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#2E8B57] rounded-full inline-block" />
                4. Confidentiality & Data Security
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                We implement industry-standard physical, technical, and administrative security measures to prevent unauthorized access, disclosure, or misuse of your clinical records. Only authorized medical and administrative personnel directly involved in your care have access to your personal files.
              </p>
            </div>

            {/* Sharing of Information */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#173D2A] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#2E8B57] rounded-full inline-block" />
                5. Information Sharing
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                We <strong className="text-slate-800">never sell, rent, or trade</strong> your personal or health data to commercial third parties. Information is disclosed strictly under the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm sm:text-base pl-2 mt-3">
                <li>With external dental laboratories and 3D imaging specialists strictly for custom prosthesis, aligners, and crowns fabrication.</li>
                <li>With specialist dental surgeons or medical doctors for multi-disciplinary consultations, with your consent.</li>
                <li>When required by law, court order, or governmental healthcare authority.</li>
              </ul>
            </div>

            {/* Patient Rights */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#173D2A] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#2E8B57] rounded-full inline-block" />
                6. Your Rights
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                As a patient, you have the right to request a copy of your clinical treatment records and X-rays, update inaccurate contact details, and inquire about how your data is being handled. You may contact our clinic administration at any time to exercise these rights.
              </p>
            </div>

            {/* Contact Information */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-base text-[#173D2A] mb-3">
                Questions or Concerns Regarding Privacy?
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                If you have questions about this Privacy Policy or wish to update your records, please reach out to us:
              </p>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2E8B57] shrink-0" />
                  <span>{clinicConfig.contact.address.full}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#2E8B57] shrink-0" />
                  <a href={`tel:${clinicConfig.contact.phone.replace(/[\s()-]/g, "")}`} className="hover:underline">
                    {clinicConfig.contact.displayPhone}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#2E8B57] shrink-0" />
                  <a href={`mailto:${clinicConfig.contact.email}`} className="hover:underline">
                    {clinicConfig.contact.email}
                  </a>
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
