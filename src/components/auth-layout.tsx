import React from "react";
import { DentalLogo } from "./dental-logo";
import { motion } from "framer-motion";
import { getAssetPath } from "@/lib/getAssetPath";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  largeCard?: boolean;
}

export function AuthLayout({ children, title, subtitle, largeCard = false }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden font-sans">
      
      {/* Background Image Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none" 
        style={{ backgroundImage: `url('${getAssetPath("/dental-bg.png")}')` }}
      />
      {/* Overlay Layer */}
      <div className="fixed inset-0 z-0 bg-white/50 pointer-events-none" />

      {/* Centered Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 w-full rounded-[28px] border border-white/22 bg-white/8 flex flex-col ${
          largeCard ? "max-w-[1150px] p-12 sm:p-14" : "max-w-[560px] p-12 sm:p-14"
        }`}
        style={{
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: "0 8px 32px rgba(15, 23, 42, 0.06)",
          borderColor: "rgba(255, 255, 255, 0.22)",
        }}
      >
        {/* Top Centered Logo (standard card only) */}
        {!largeCard && (
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex justify-center">
              <DentalLogo showText={false} iconClassName="h-[60px] w-[60px] rounded-[18px] shadow-lg shadow-blue-500/25" />
            </div>
          </div>
        )}

        {/* Dynamic Titles */}
        {!largeCard && (title || subtitle) && (
          <div className="text-center mb-10">
            {title && (
              <h2 className="text-[44px] font-bold tracking-[-0.03em] text-[#0F172A] leading-[1.2]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-[18px] font-normal text-[#64748B] leading-[1.7] max-w-[550px] mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content Children Forms */}
        <div className="w-full">{children}</div>
      </motion.div>
    </div>
  );
}
