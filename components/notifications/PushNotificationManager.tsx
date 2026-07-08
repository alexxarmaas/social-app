"use client";

import { useEffect } from "react";

export default function PushNotificationManager() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let isActive = true;

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch {
        if (!isActive) {
          return;
        }
      }
    };

    void registerServiceWorker();

    return () => {
      isActive = false;
    };
  }, []);

  return null;
}