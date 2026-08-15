"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  BookOpen,
  Hammer,
  Users,
  Menu,
  X,
  CalendarDays,
} from "lucide-react";

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
  { label: "Battle", icon: Hammer, href: "/battle" },
  { label: "Events", icon: CalendarDays, href: "/events" },
  { label: "Leaderboard", icon: Users, href: "/leaderboard" },
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

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    }
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/8 bg-white/5 backdrop-blur-xl">
      <div className="flex h-16 w-full items-center justify-between px-6 sm:px-10 gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/images/logo.png"
            alt="Cosmodex logo"
            width={28}
            height={28}
            className="rounded-sm"
          />
          <span className="font-lato font-black text-xl text-text-primary tracking-wide">
            CosmoDex
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {item.href && item.href !== "#" ? (
                <Link href={item.href} className="nav-link group flex items-center gap-1.5">
                  <item.icon size={15} className="opacity-70 group-hover:opacity-100" />
                  {item.label}
                  {item.isMegaMenu && (
                    <ChevronDown
                      size={13}
                      className={`ml-0.5 transition-transform duration-150 ${
                        activeDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </Link>
              ) : (
                <button className="nav-link group flex items-center gap-1.5">
                  <item.icon size={15} className="opacity-70 group-hover:opacity-100" />
                  {item.label}
                  {item.isMegaMenu && (
                    <ChevronDown
                      size={13}
                      className={`ml-0.5 transition-transform duration-150 ${
                        activeDropdown === item.label ? "rotate-180" : ""
                      }`}
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
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleNavigate('/learn/python')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleNavigate('/learn/python');
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
                        </p>
                      </div>
                    </div>

                    {/* All Courses Button */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/learn')}
                      className="mt-1 w-full py-2.5 bg-[#E873C3]/15 hover:bg-[#E873C3]/25 border border-[#E873C3]/40 text-[#E873C3] text-center text-xs font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(232,115,195,0.2)] cursor-pointer"
                    >
                      All Courses &gt;
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-2">

          {/* Avatar */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 pr-1 py-1">
              <span className="text-sm font-bold text-white/80 hidden sm:inline-block">
                {user.username}
              </span>
              <div className="w-7 h-7 rounded-full bg-bg-elevated border border-[#E873C3] overflow-hidden flex items-center justify-center shadow-[0_0_10px_rgba(232,115,195,0.3)]">
                <Image
                  src="/images/mascot.png"
                  alt="avatar"
                  width={28}
                  height={28}
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-bg-elevated border border-border-medium overflow-hidden flex items-center justify-center opacity-40">
              <Image
                src="/images/mascot.png"
                alt="avatar"
                width={28}
                height={28}
                className="object-cover"
              />
            </div>
          )}

          {/* Join Crew CTA or Log out */}
          {user ? (
            <button
              onClick={handleLogout}
              className="dashboard-btn-secondary inline-flex items-center px-4 py-1.5 text-sm h-9 border border-white/10 hover:bg-white/5 text-white/90 rounded-md font-bold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.4)] cursor-pointer"
            >
              Log out
            </button>
          ) : (
            <Link href="/onboarding" id="navbar-join-crew" className="dashboard-btn-primary hidden sm:inline-flex px-4 py-1.5 text-sm h-9">
              Join Crew
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="btn-icon md:hidden focus-ring"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border-subtle bg-bg-surface px-4 py-3 space-y-1 animate-fade-in">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href || "#"} className="nav-link w-full">
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border-subtle">
            {user ? (
              <button
                onClick={handleLogout}
                className="btn-secondary w-full justify-center py-2.5 border border-white/10 hover:bg-white/5 text-white/90 rounded-md text-sm font-bold flex"
              >
                Log out
              </button>
            ) : (
              <Link href="/onboarding" className="btn-primary w-full justify-center">
                Join Crew
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
