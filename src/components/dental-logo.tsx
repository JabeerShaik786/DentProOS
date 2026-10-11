import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getAssetPath } from "@/lib/getAssetPath";

interface DentalLogoProps {
  className?: string;
  showText?: boolean;
  collapsed?: boolean;
  onLogoClick?: () => void;
  onTextClick?: () => void;
  iconClassName?: string;
}

export function DentalLogo({
  className = "",
  showText = true,
  collapsed = false,
  onLogoClick,
  onTextClick,
  iconClassName = "",
}: DentalLogoProps) {
  const logoContent = (
    <div
      className={`relative shrink-0 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 transition-all duration-300 ${
        iconClassName ? iconClassName : collapsed ? "h-8 w-8" : "h-10 w-10"
      }`}
    >
      <Image
        src={getAssetPath("/dentpro-icon.png")}
        alt="DentProOS Logo"
        fill
        className="object-cover"
        priority
        unoptimized
      />
    </div>
  );

  const textContent = (
    <div
      className={`flex items-center text-left transition-all duration-300 ease-in-out origin-left ${
        showText ? "opacity-100 w-auto min-w-0" : "opacity-0 max-w-0 overflow-hidden pointer-events-none"
      }`}
    >
      <span className="text-[20px] font-bold tracking-tight leading-none whitespace-nowrap select-none">
        <span className="text-[#0F172A] dark:text-white">DentPro</span>{" "}
        <span className="text-[#0284c7]">OS</span>
      </span>
    </div>
  );

  return (
    <div className={`flex items-center transition-all duration-300 ${collapsed ? "gap-2" : "gap-2.5"} ${className}`}>
      {onLogoClick ? (
        <button
          type="button"
          onClick={onLogoClick}
          className="cursor-pointer hover:opacity-90 transition-opacity focus:outline-none shrink-0"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {logoContent}
        </button>
      ) : (
        <Link
          href="/dashboard"
          className="cursor-pointer hover:opacity-90 transition-opacity focus:outline-none shrink-0"
          title="DentProOS Dashboard"
        >
          {logoContent}
        </Link>
      )}

      {showText && (
        onTextClick ? (
          <button
            type="button"
            onClick={onTextClick}
            className="cursor-pointer hover:opacity-85 transition-opacity focus:outline-none text-left"
            title="Collapse Sidebar"
          >
            {textContent}
          </button>
        ) : (
          textContent
        )
      )}
    </div>
  );
}
