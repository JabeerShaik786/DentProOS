"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 1,
    question: "How often should I visit the dentist for a routine checkup?",
    answer: "We recommend visiting the dentist at least once every 6 months for a comprehensive exam and professional cleaning. Regular visits prevent plaque build-up, check for early signs of decay, and keep your gums healthy.",
  },
  {
    id: 2,
    question: "Are root canal treatments painful?",
    answer: "No. With modern local anesthetics and advanced treatment techniques, root canal therapy is extremely comfortable. Most patients describe the sensation as being no different from receiving a standard cavity filling.",
  },
  {
    id: 3,
    question: "What is the difference between dental implants and dentures?",
    answer: "Dental implants are titanium posts surgically anchored into the jawbone, functioning as stable, permanent artificial tooth roots topped with ceramic crowns. Dentures are removable dental appliances that rest on top of the gums and require daily removal.",
  },
  {
    id: 4,
    question: "Is a referral required to book an appointment?",
    answer: "No, you do not need a physician's referral to consult with us. You can book directly using our website appointment form or by contacting our front desk phone line.",
  },
  {
    id: 5,
    question: "What counts as a dental emergency?",
    answer: "Dental emergencies include knocked-out teeth, severe dental pain, facial swelling, cracked or broken restorations, or uncontrolled oral bleeding. Contact our clinic immediately if you experience any of these symptoms.",
  },
  {
    id: 6,
    question: "How should I prepare for my first dental checkup?",
    answer: "Simply brush and floss your teeth before your visit. Bring a list of any medications you are taking, and arrive 10 minutes early to review your dental history details with our administrative team.",
  },
];

function AccordionItem({ question, answer, isOpen, onClick }: FAQItem & { isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-borders/60 last:border-none py-5">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between text-left gap-4 font-heading font-extrabold text-base md:text-lg text-dark-text hover:text-primary transition-colors duration-200 cursor-pointer"
      >
        <span>{question}</span>
        <div className="w-8 h-8 rounded-full bg-slate-50 border border-borders/40 flex items-center justify-center shrink-0 text-gray-text group-hover:text-primary transition-all duration-200">
          {isOpen ? <Minus className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-gray-text text-sm md:text-base leading-relaxed pt-3 pb-1 font-normal">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <section id="faq" className="py-24 bg-white relative">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Column: Heading */}
        <div className="lg:col-span-5 flex flex-col items-start text-left">
          <span className="text-sm font-bold text-primary uppercase tracking-widest mb-3">
            FAQ
          </span>
          <h2 className="font-heading font-extrabold text-3xl md:text-[48px] text-dark-text tracking-tight leading-tight mb-6">
            Frequently Asked Dental Questions
          </h2>
          <p className="text-gray-text text-base md:text-lg font-normal leading-relaxed mb-8">
            Can&apos;t find the answer you&apos;re looking for? Reach out to our front desk team at any time. We are here to assist you with scheduling, clinical questions, or payment support.
          </p>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              const target = document.querySelector("#contact");
              if (target) {
                const headerEl = document.querySelector("header");
                const navbarHeight = headerEl ? headerEl.getBoundingClientRect().height + 16 : 96;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 12;
                window.scrollTo({ top: Math.max(0, targetPosition), behavior: "smooth" });
              }
            }}
            className="px-6 py-3 border border-primary/20 hover:border-primary text-primary text-sm font-bold rounded-full transition-all duration-300 hover:bg-primary/5 cursor-pointer"
          >
            Ask a Specific Question
          </a>
        </div>

        {/* Right Column: Accordion */}
        <div className="lg:col-span-7 w-full p-6 md:p-8 rounded-3xl bg-[#F8FAFC] border border-borders/50">
          <div className="flex flex-col">
            {FAQS.map((faq) => (
              <AccordionItem
                key={faq.id}
                {...faq}
                isOpen={openId === faq.id}
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
