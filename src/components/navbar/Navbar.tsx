"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  BookOpen,
  Hammer,
  Users,
  Menu,
  X,
  CalendarDays,
  Code2,
} from "lucide-react";

import { NotificationBell } from "../notification/notification-bell";

const navItems = [
  {
    label: "Learn",
    icon: BookOpen,
    href: "#",
    isMegaMenu: true,
  },
  {
    label: "Practice",
    icon: Code2,
    href: "#",
  },
  {
    label: "Battle",
    icon: Hammer,
    href: "/battle",
  },
  {
    label: "Events",
    icon: CalendarDays,
    href: "/events",
  },
  {
    label: "Leaderboard",
    icon: Users,
    href: "/leaderboard",
  },
];

interface UserSession {
  id: string;
  username: string;
  email: string;
  avatarId?: string | null;
  xpTotal?: number;
  level?: number;
  role?: string;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);

  /* ----------------------------------------
     SESSION
  ---------------------------------------- */
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        if (data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
      }
    }

    checkSession();
  }, []);

  /* ----------------------------------------
     MOBILE MENU
  ---------------------------------------- */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* ----------------------------------------
     LOGOUT
  ---------------------------------------- */
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMenus = () => {
    setActiveDropdown(null);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/[0.08] bg-[#050508]/80 backdrop-blur-xl">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-8 lg:px-10">

        {/* =====================================
            LOGO
        ===================================== */}
        <Link
          href="/"
          onClick={closeMenus}
          className="flex shrink-0 items-center gap-2.5"
        >
          <Image
            src="/images/logo.png"
            alt="CosmoDex logo"
            width={30}
            height={30}
            priority
            className="rounded-sm"
          />

          <span className="font-lato text-xl font-black tracking-wide text-white">
            CosmoDex
          </span>
        </Link>

        {/* =====================================
            DESKTOP NAVIGATION
        ===================================== */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isOpen = activeDropdown === item.label;

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => {
                  if (item.isMegaMenu) {
                    setActiveDropdown(item.label);
                  }
                }}
                onMouseLeave={() => {
                  if (item.isMegaMenu) {
                    setActiveDropdown(null);
                  }
                }}
              >
                {item.href === "#" ? (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown(isOpen ? null : item.label)
                    }
                    className="nav-link group flex items-center gap-1.5"
                    aria-expanded={isOpen}
                  >
                    <Icon
                      size={15}
                      className="opacity-70 transition-opacity group-hover:opacity-100"
                    />

                    <span>{item.label}</span>

                    {item.isMegaMenu && (
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="nav-link group flex items-center gap-1.5"
                  >
                    <Icon
                      size={15}
                      className="opacity-70 transition-opacity group-hover:opacity-100"
                    />
                  )}
                </button>
              )}

              {item.isMegaMenu && activeDropdown === item.label && (
                <div className="absolute top-full left-0 pt-1.5 w-[320px] z-50">
                  <div className="bg-[#050508] py-5 px-6 animate-fade-in flex flex-col gap-4 rounded-xl border border-white/12 shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
                    <h4 className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                      Recommended
                    </h4>

                    {/* Python Course Link with Refined Subtle Glassmorphism */}
                    <Link
                      href="/learn/python"
                      onClick={() => {
                        setActiveDropdown(null);
                        setMobileOpen(false);
                      }}
                      className="flex gap-3.5 items-center group p-3 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/20 hover:bg-white/[0.07] backdrop-blur-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-500/20 shrink-0 flex items-center justify-center group-hover:border-purple-400/40 group-hover:bg-purple-900/40 transition-colors">
                        <BookOpen size={20} className="text-purple-300 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-white group-hover:text-[#E873C3] transition-colors">
                          Python
                        </h5>
                        <p className="text-xs text-white/50 group-hover:text-white/75 transition-colors mt-0.5 leading-snug">
                          Learn the basics of programming with beginner-friendly exercises.

                    <span>{item.label}</span>
                  </Link>
                )}

                {/* Learn dropdown */}
                {item.isMegaMenu && isOpen && (
                  <div
                    className="absolute left-0 top-full mt-2 w-[330px] rounded-xl border border-[#E873C3]/20 bg-[#050508] p-5 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(232,115,195,0.12)]"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E873C3]">
                      Recommended
                    </p>

                    <h4 className="mt-1 text-sm font-bold text-white">
                      Start learning today
                    </h4>

                    {/* Python */}
                    <Link
                      href="/learn"
                      onClick={closeMenus}
                      className="group mt-5 flex gap-4 rounded-lg p-2 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#8b5cf6]/30 bg-[#2e1065]/50">
                        <BookOpen
                          size={22}
                          className="text-[#8b5cf6]"
                        />
                      </div>

                      <div>
                        <h5 className="text-sm font-bold text-white group-hover:text-[#E873C3]">
                          Python
                        </h5>

                        <p className="mt-1 text-xs leading-relaxed text-white/55">
                          Learn programming fundamentals with
                          beginner-friendly exercises.
                        </p>
                      </div>
                    </Link>

                    {/* GitHub Copilot */}
                    <Link
                      href="/learn"
                      onClick={closeMenus}
                      className="group mt-3 flex gap-4 rounded-lg p-2 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10">
                        <Code2
                          size={22}
                          className="text-blue-400"
                        />
                      </div>

                      <div>
                        <h5 className="text-sm font-bold text-white group-hover:text-[#E873C3]">
                          GitHub Copilot
                        </h5>

                        <p className="mt-1 text-xs leading-relaxed text-white/55">
                          Learn how AI coding assistants can help
                          you write code faster.
                        </p>
                      </div>
                    </Link>

                    {/* All Courses Button */}
                    <Link
                      href="/learn"
                      onClick={() => {
                        setActiveDropdown(null);
                        setMobileOpen(false);
                      }}
                      className="mt-1 w-full py-2.5 bg-[#E873C3]/15 hover:bg-[#E873C3]/25 border border-[#E873C3]/40 text-[#E873C3] text-center text-xs font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(232,115,195,0.2)] cursor-pointer text-center block"
                    >
                      All Courses &gt;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
                    <Link
                      href="/learn"
                      onClick={closeMenus}
                      className="mt-4 block w-full rounded-md border border-[#E873C3]/30 bg-[#E873C3]/10 py-2.5 text-center text-xs font-bold text-[#E873C3] transition-all hover:bg-[#E873C3]/20"
                    >
                      All Courses →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* =====================================
            RIGHT CONTROLS
        ===================================== */}
        <div className="flex items-center gap-2">

          {/* Notification */}
          <NotificationBell
            notifications={[
              {
                id: "welcome",
                title: "Welcome to CosmoDex!",
                description:
                  "Explore courses, practice coding, and join exciting battles.",
                time: "Just now",
              },
              {
                id: "course",
                title: "New course available",
                description:
                  "Check out the latest learning content in Learn.",
                time: "5 min ago",
              },
              {
                id: "challenge",
                title: "New coding challenge",
                description:
                  "A fresh challenge is waiting for you in Practice.",
                time: "1 hour ago",
              },
            ]}
          />

          {/* User */}
          {user ? (
            <div className="flex items-center gap-2 pl-1">
              <span className="hidden max-w-[120px] truncate text-sm font-bold text-white/80 lg:inline">
                {user.username}
              </span>

              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#E873C3]/70 bg-[#15151c] shadow-[0_0_12px_rgba(232,115,195,0.25)]">
                <Image
                  src="/images/mascot.png"
                  alt="User avatar"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#15151c] opacity-60">
              <Image
                src="/images/mascot.png"
                alt="Guest avatar"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Auth */}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden h-9 items-center rounded-md border border-white/10 bg-white/[0.03] px-4 text-sm font-bold text-white/90 transition hover:bg-white/[0.07] sm:inline-flex"
            >
              Log out
            </button>
          ) : (
            <Link
              href="/onboarding"
              className="dashboard-btn-primary hidden h-9 items-center px-4 text-sm sm:inline-flex"
            >
              Join Crew
            </Link>
          )}

          {/* Mobile button */}
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="btn-icon flex h-9 w-9 items-center justify-center rounded-md md:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* =====================================
          MOBILE MENU
      ===================================== */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-white/[0.08] bg-[#050508]/95 px-4 py-4 shadow-2xl backdrop-blur-xl md:hidden">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Icon size={17} className="opacity-70" />
                  <span>{item.label}</span>

                  {item.isMegaMenu && (
                    <ChevronDown
                      size={14}
                      className="ml-auto opacity-50"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 border-t border-white/[0.08] pt-3">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center rounded-md border border-white/10 bg-white/[0.03] py-2.5 text-sm font-bold text-white/90 transition hover:bg-white/[0.07]"
              >
                Log out
              </button>
            ) : (
              <Link
                href="/onboarding"
                onClick={() => setMobileOpen(false)}
                className="btn-primary flex w-full items-center justify-center"
              >
                Join Crew
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}