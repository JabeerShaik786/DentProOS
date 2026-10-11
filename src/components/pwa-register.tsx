"use client";

import { useEffect } from "react";
import { getAssetPath } from "@/lib/getAssetPath";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        const swUrl = getAssetPath("/sw.js");
        navigator.serviceWorker.register(swUrl).catch(() => {
          // Silently ignore registration errors
        });
      } else {
        // Unregister service worker in development mode to prevent local dev caching issues
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().catch(() => {});
          }
        }).catch(() => {});
      }
    }
  }, []);

  return null;
}
