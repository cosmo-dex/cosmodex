"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  Clock3,
  X,
  ExternalLink,
  Megaphone,
  AlertTriangle,
  Flame,
  Swords,
  Info,
  Radio,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface NotificationBellProps {
  initialNotifications?: NotificationItem[];
  className?: string;
}

const TYPE_ICONS: Record<
  string,
  {
    icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
    color: string;
    bg: string;
  }
> = {
  announcement: { icon: Megaphone, color: "#E873C3", bg: "rgba(232, 115, 195, 0.15)" },
  warning: { icon: AlertTriangle, color: "#F5A623", bg: "rgba(245, 166, 35, 0.15)" },
  event: { icon: Flame, color: "#D95FD1", bg: "rgba(217, 95, 209, 0.15)" },
  battle: { icon: Swords, color: "#FF6B35", bg: "rgba(255, 107, 53, 0.15)" },
  system: { icon: Radio, color: "#8D37D6", bg: "rgba(141, 55, 214, 0.15)" },
  info: { icon: Info, color: "#4ECDC4", bg: "rgba(78, 205, 196, 0.15)" },
};

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

export function NotificationBell({
  initialNotifications = [],
  className,
}: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [open, setOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  /* ----------------------------------------------------
     FETCH NOTIFICATIONS FROM SERVER
  ---------------------------------------------------- */
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch {
      // Fallback silently if offline
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {
        // Fallback silently if offline
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /* ----------------------------------------------------
     REAL-TIME WEBSOCKET / SSE STREAM SUBSCRIPTION
  ---------------------------------------------------- */
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    try {
      eventSource = new EventSource("/api/notifications/stream");

      eventSource.addEventListener("notification", (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "notification:created" && payload.notification) {
            const newNotif: NotificationItem = {
              ...payload.notification,
              time: formatRelativeTime(payload.notification.created_at),
              read: false,
            };

            setNotifications((prev) => {
              // Avoid duplicates
              if (prev.some((n) => n.id === newNotif.id)) return prev;
              return [newNotif, ...prev];
            });

            // Trigger visual glow pulse
            setIsPulsing(true);
            setTimeout(() => setIsPulsing(false), 3000);
          } else if (payload.type === "notification:updated" && payload.notification) {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.notification.id
                  ? { ...n, ...payload.notification, time: formatRelativeTime(payload.notification.created_at) }
                  : n
              )
            );
          } else if (payload.type === "notification:deleted" && payload.notificationId) {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.notificationId));
          }
        } catch (e) {
          console.error("Failed to parse realtime notification payload", e);
        }
      });

      eventSource.onerror = () => {
        // SSE error - fallback to light polling
        if (!fallbackInterval) {
          fallbackInterval = setInterval(fetchNotifications, 30000);
        }
      };
    } catch {
      fallbackInterval = setInterval(fetchNotifications, 30000);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [fetchNotifications]);

  /* ----------------------------------------------------
     CLOSE ON OUTSIDE CLICK
  ---------------------------------------------------- */
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* ----------------------------------------------------
     ACTIONS: MARK AS READ, CLEAR ALL, CLEAR SINGLE
  ---------------------------------------------------- */
  const markAsRead = async (id: string, link?: string | null) => {
    // Optimistic local update
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
      // Ignored
    }

    if (link) {
      setOpen(false);
      if (link.startsWith("http")) {
        window.open(link, "_blank");
      } else {
        router.push(link);
      }
    }
  };

  const markAllAsRead = async () => {
    // Optimistic local update
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
      // Ignored
    }
  };

  const clearSingleNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Optimistic local update
    setNotifications((current) => current.filter((n) => n.id !== id));

    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
    } catch {
      // Ignored
    }
  };

  const clearAllNotifications = async () => {
    setNotifications([]);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
      });
    } catch {
      // Ignored
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          if (!open) {
            fetchNotifications();
          }
        }}
        aria-label="Notifications"
        aria-expanded={open}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer",
          "border border-white/10 bg-white/[0.03]",
          "text-white/75 transition-all duration-200",
          "hover:border-[#E873C3]/40 hover:bg-[#E873C3]/10",
          "hover:text-white",
          "focus:outline-none focus:ring-2 focus:ring-[#E873C3]/40",
          open && "border-[#E873C3]/40 bg-[#E873C3]/10 text-white",
          isPulsing && "border-[#E873C3] shadow-[0_0_15px_rgba(232,115,195,0.6)] animate-pulse"
        )}
      >
        <Bell
          size={18}
          strokeWidth={1.8}
          className={cn("transition-transform duration-200", isPulsing && "rotate-12 scale-110 text-[#E873C3]")}
        />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-[#050508] bg-[#E873C3] px-1 text-[9px] font-black leading-none text-white shadow-[0_0_10px_rgba(232,115,195,0.6)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-white/10 bg-[#09090d]/98 shadow-[0_20px_70px_rgba(0,0,0,0.75),0_0_30px_rgba(232,115,195,0.1)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3.5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Notifications</h3>

                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#E873C3]/15 px-2 py-0.5 text-[9px] font-bold text-[#E873C3] border border-[#E873C3]/30">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-[10px] text-white/40">
                Real-time updates & announcements
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
              className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Actions Bar */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2 bg-white/[0.01]">
              <span className="text-[10px] text-white/35 font-medium">
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </span>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#E873C3] transition-colors hover:text-white cursor-pointer"
                >
                  <Check size={12} />
                  Mark all as read
                </button>
              )}
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                  <Bell size={20} className="text-white/30" />
                </div>

                <h4 className="text-sm font-semibold text-white/75">All caught up</h4>

                <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-white/35">
                  You don&apos;t have any notifications right now.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const typeCfg = TYPE_ICONS[notification.type || "info"] || TYPE_ICONS.info;
                const Icon = typeCfg.icon;

                return (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id, notification.link)}
                    className={cn(
                      "group relative flex w-full gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer hover:bg-white/[0.04]",
                      !notification.read ? "bg-[#E873C3]/[0.035]" : ""
                    )}
                  >
                    {/* Status Dot / Icon */}
                    <div className="relative mt-1 shrink-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center border"
                        style={{
                          backgroundColor: typeCfg.bg,
                          borderColor: `${typeCfg.color}30`,
                        }}
                      >
                        <Icon size={14} style={{ color: typeCfg.color }} />
                      </div>
                      {!notification.read && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#E873C3] shadow-[0_0_6px_rgba(232,115,195,0.9)] ring-2 ring-[#09090d]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={cn(
                            "text-xs font-bold leading-snug",
                            notification.read ? "text-white/65" : "text-white"
                          )}
                        >
                          {notification.title}
                        </h4>

                        {!notification.read && (
                          <span className="mt-0.5 shrink-0 text-[8px] font-bold uppercase tracking-wider text-[#E873C3]">
                            New
                          </span>
                        )}
                      </div>

                      {notification.description && (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/45">
                          {notification.description}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between gap-2 text-[9px] text-white/30">
                        <div className="flex items-center gap-1">
                          <Clock3 size={10} />
                          <span>{notification.time || formatRelativeTime(notification.created_at)}</span>
                        </div>

                        {notification.link && (
                          <span className="flex items-center gap-0.5 text-[#4ECDC4] font-medium group-hover:underline">
                            View <ExternalLink size={9} />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Dismiss / Clear single */}
                    <button
                      type="button"
                      onClick={(e) => clearSingleNotification(e, notification.id)}
                      title="Dismiss notification"
                      className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-white transition-opacity shrink-0 self-start"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-white/[0.08] px-4 py-2.5 bg-white/[0.01]">
              <button
                type="button"
                onClick={clearAllNotifications}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-semibold text-white/35 transition-colors hover:bg-white/[0.04] hover:text-white/70 cursor-pointer"
              >
                <Trash2 size={11} />
                <span>Clear all notifications</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}