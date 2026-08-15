"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, Clock3, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  read?: boolean;
}

interface NotificationBellProps {
  notifications?: NotificationItem[];
  className?: string;
}

export function NotificationBell({
  notifications: initialNotifications = [],
  className,
}: NotificationBellProps) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

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

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
    >
      {/* Notification Button */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Notifications"
        aria-expanded={open}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg",
          "border border-white/10 bg-white/[0.03]",
          "text-white/75 transition-all duration-200",
          "hover:border-[#E873C3]/40 hover:bg-[#E873C3]/10",
          "hover:text-white",
          "focus:outline-none focus:ring-2 focus:ring-[#E873C3]/40",
          open &&
            "border-[#E873C3]/40 bg-[#E873C3]/10 text-white"
        )}
      >
        <Bell
          size={18}
          strokeWidth={1.8}
          className="transition-transform duration-200"
        />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-[#050508] bg-[#E873C3] px-1 text-[9px] font-black leading-none text-white shadow-[0_0_10px_rgba(232,115,195,0.45)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[350px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-white/10 bg-[#09090d]/98 shadow-[0_20px_70px_rgba(0,0,0,0.65),0_0_30px_rgba(232,115,195,0.08)] backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3.5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Notifications
                </h3>

                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#E873C3]/15 px-2 py-0.5 text-[9px] font-bold text-[#E873C3]">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-[10px] text-white/40">
                Stay updated with CosmoDex
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
              className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <X size={15} />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
              <span className="text-[10px] text-white/35">
                {notifications.length} notification
                {notifications.length !== 1 ? "s" : ""}
              </span>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#E873C3] transition-colors hover:text-white"
                >
                  <Check size={12} />
                  Mark all as read
                </button>
              )}
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                  <Bell size={20} className="text-white/30" />
                </div>

                <h4 className="text-sm font-semibold text-white/75">
                  All caught up
                </h4>

                <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-white/35">
                  You don&apos;t have any new notifications right now.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markAsRead(notification.id)}
                  className={`group flex w-full gap-3 border-b border-white/[0.06] px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04] ${
                    !notification.read
                      ? "bg-[#E873C3]/[0.035]"
                      : ""
                  }`}
                >
                  {/* Status */}
                  <div className="relative mt-1.5 shrink-0">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        notification.read
                          ? "bg-white/15"
                          : "bg-[#E873C3] shadow-[0_0_8px_rgba(232,115,195,0.7)]"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h4
                        className={`text-xs font-bold leading-5 ${
                          notification.read
                            ? "text-white/65"
                            : "text-white"
                        }`}
                      >
                        {notification.title}
                      </h4>

                      {!notification.read && (
                        <span className="mt-1 shrink-0 text-[8px] font-bold uppercase tracking-wider text-[#E873C3]">
                          New
                        </span>
                      )}
                    </div>

                    {notification.description && (
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-white/40">
                        {notification.description}
                      </p>
                    )}

                    {notification.time && (
                      <div className="mt-2 flex items-center gap-1 text-[9px] text-white/30">
                        <Clock3 size={10} />
                        {notification.time}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-white/[0.08] px-4 py-2.5">
              <button
                type="button"
                onClick={clearNotifications}
                className="w-full rounded-md py-1.5 text-[10px] font-semibold text-white/35 transition-colors hover:bg-white/[0.04] hover:text-white/70"
              >
                Clear notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}