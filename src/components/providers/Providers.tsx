"use client";

import React, { useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import DailyStreakModal from "@/components/streak/DailyStreakModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
        <DailyStreakModal />
      </NotificationProvider>
    </AuthProvider>
  );
}

