"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

export interface NotificationItem {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  link?: string | null;
  time?: string;
  created_at?: string | Date | null;
  read?: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isPulsing: boolean;
  fetchNotifications: (force?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearSingleNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const NOTIFICATIONS_STORAGE_KEY = "cosmodex_notifications_cache";

function formatRelativeTime(dateStr?: string | Date | null): string {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotificationsState] = useState<NotificationItem[]>(
    () => {
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
          if (cached) {
            return JSON.parse(cached);
          }
        } catch {
          return [];
        }
      }
      return [];
    }
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const pendingFetchRef = useRef<Promise<void> | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  const setNotifications = useCallback(
    (action: React.SetStateAction<NotificationItem[]>) => {
      setNotificationsState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              NOTIFICATIONS_STORAGE_KEY,
              JSON.stringify(next)
            );
          } catch {
            // Ignore storage access errors
          }
        }
        return next;
      });
    },
    []
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(
    async (force = false) => {
      if (!isAuthenticated) return;
      const now = Date.now();
      if (!force && now - lastFetchTimeRef.current < 10000) {
        return;
      }
      if (pendingFetchRef.current && !force) {
        return pendingFetchRef.current;
      }
      lastFetchTimeRef.current = now;

      const fetchPromise = (async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/notifications", {
            credentials: "include",
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.notifications)) {
              const formatted = data.notifications.map((n: NotificationItem) => ({
                ...n,
                time: n.time || formatRelativeTime(n.created_at),
              }));
              setNotifications(formatted);
              const hasUnread = formatted.some((n: NotificationItem) => !n.read);
              if (hasUnread) {
                setIsPulsing(true);
                setTimeout(() => setIsPulsing(false), 3000);
              }
            }
          }
        } catch {
          // Ignore network errors
        } finally {
          setIsLoading(false);
          pendingFetchRef.current = null;
        }
      })();

      pendingFetchRef.current = fetchPromise;
      return fetchPromise;
    },
    [isAuthenticated, setNotifications]
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    const handleAuthSync = (event: Event) => {
      const customEvt = event as CustomEvent;
      if (customEvt.detail?.action === "logout") {
        setNotificationsState([]);
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
          } catch {
            // Ignore storage access errors
          }
        }
      }
    };

    window.addEventListener("cosmodex_auth_sync", handleAuthSync);
    return () => {
      window.removeEventListener("cosmodex_auth_sync", handleAuthSync);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Lightweight visibility-aware polling every 60s instead of long-lived SSE streams
    // to eliminate continuous Vercel Serverless Function duration burn.
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications(true);
      }
    }, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications(true);
      }
    };

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );

      try {
        await fetch(`/api/notifications/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "read" }),
        });
      } catch {
        // Ignore network errors
      }
    },
    [setNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read_all" }),
      });
    } catch {
      // Ignore network errors
    }
  }, [setNotifications]);

  const clearSingleNotification = useCallback(
    async (id: string) => {
      setNotifications((current) => current.filter((n) => n.id !== id));

      try {
        await fetch(`/api/notifications/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "clear" }),
        });
      } catch {
        // Ignore network errors
      }
    },
    [setNotifications]
  );

  const clearAllNotifications = useCallback(async () => {
    setNotifications([]);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
      });
    } catch {
      // Ignore network errors
    }
  }, [setNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    isPulsing,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearSingleNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
