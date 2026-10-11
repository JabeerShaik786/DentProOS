"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Share, PlusSquare, X, Smartphone, Monitor } from "lucide-react";
import { getAssetPath } from "@/lib/getAssetPath";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    // 1. Detect standalone mode (already installed or opened as PWA)
    const checkStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true ||
        document.referrer.includes("android-app://")
      );
    };

    if (checkStandalone()) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream;
    const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios|android/i.test(ua);
    if (isIosDevice && isSafari) {
      setIsIos(true);
    }

    // 3. Listen for beforeinstallprompt event (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 4. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosModal(true);
    } else {
      setShowInfoModal(true);
    }
  };

  // Do not show button when app is already installed / running in standalone mode
  if (isInstalled) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="hover:text-white transition-colors duration-200 cursor-pointer inline-flex items-center gap-1.5 text-xs text-white/60"
        title="Add DentPro OS to Home Screen"
      >
        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
        <span>Add to Home Screen</span>
      </button>

      {/* iOS Safari Instruction Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white">
            <button
              onClick={() => setShowIosModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="relative w-16 h-16 mb-3 rounded-2xl overflow-hidden shadow-md">
                <Image
                  src={getAssetPath("/icon-192.png")}
                  alt="DentPro OS Logo"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Add DentPro OS to your Home Screen
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                Install on your iPhone or iPad for quick access.
              </p>

              <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-3.5 text-left text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 mt-0.5">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Step 1:</span> Tap the <span className="font-semibold">Share</span> icon in Safari&apos;s bottom toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Step 2:</span> Scroll down and select <span className="font-semibold">&quot;Add to Home Screen&quot;</span>.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIosModal(false)}
                className="mt-5 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop / Session Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="relative w-16 h-16 mb-3 rounded-2xl overflow-hidden shadow-md">
                <Image
                  src={getAssetPath("/icon-192.png")}
                  alt="DentPro OS Logo"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Install DentPro OS
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold mb-4">
                <Monitor className="w-4 h-4" />
                <span>Browser Installation Guide</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
                Installation isn&apos;t available directly from this button in your current browser session. If your browser shows an <span className="font-bold text-slate-900 dark:text-white">Install option</span> in the address bar (top right) or browser menu, use that to install DentPro OS.
              </p>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
