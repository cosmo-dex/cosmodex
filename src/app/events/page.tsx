'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import RisingStars from '@/components/RisingStar';
import {
  CalendarDays, Trophy, Users, Clock, Search,
  Zap, Hammer, BookOpen, Star, ChevronRight, ChevronDown, Check,
  UserCheck, UsersRound, Flame, Lock, Globe, BadgeCheck, Sparkles, RefreshCw, X, RotateCcw,
  Rocket, Terminal, Layers, CheckCircle2, LucideIcon
} from 'lucide-react';

interface EventCard {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  event_type: string;
  banner_url: string | null;
  status: string;
  registration_open: boolean | null;
  max_participants: number | null;
  prize_pool: string | null;
  tags_json: string[] | null;
  starts_at: string | null;
  ends_at: string | null;
  registration_deadline: string | null;
  participation_type: string | null;
  enter_event_url: string | null;
  eligibility: string | null;
  registration_fee: string | null;
  _count: { event_registrations: number };
}

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ size?: number }>; color: string; bg: string; gradient: string }> = {
  hackathon: { label: 'Hackathon', icon: Zap, color: '#E873C3', bg: 'rgba(232,115,195,0.18)', gradient: 'from-[#E873C3]/30 via-[#8D37D6]/20 to-transparent' },
  coding_contest: { label: 'Coding Contest', icon: Hammer, color: '#4ECDC4', bg: 'rgba(78,205,196,0.18)', gradient: 'from-[#4ECDC4]/30 via-[#3DCB7F]/20 to-transparent' },
  workshop: { label: 'Workshop', icon: BookOpen, color: '#F5A623', bg: 'rgba(245,166,35,0.18)', gradient: 'from-[#F5A623]/30 via-[#FF6B35]/20 to-transparent' },
  challenge: { label: 'Challenge', icon: Star, color: '#8D37D6', bg: 'rgba(141,55,214,0.18)', gradient: 'from-[#8D37D6]/30 via-[#E873C3]/20 to-transparent' },
};

function useCountdownStr(target: string | null) {
  const [txt, setTxt] = useState('');
  useEffect(() => {
    if (!target) return;
    function calc() {
      const diff = new Date(target!).getTime() - Date.now();
      if (diff <= 0) { setTxt(''); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 0) setTxt(`${d}d ${h}h`);
      else if (h > 0) setTxt(`${h}h ${m}m`);
      else setTxt(`${m}m`);
    }
    calc();
    const t = setInterval(calc, 30000);
    return () => clearInterval(t);
  }, [target]);
  return txt;
}

interface DropdownOption {
  key: string;
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
}

function CosmoDropdown({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onClose,
  onChange,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChange: (key: string) => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(o => o.key === value) || options[0];
  const isSelected = value !== '';
  const SelectedIcon = selectedOption.icon;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left z-40">
      <button
        onClick={onToggle}
        className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border backdrop-blur-md ${isSelected
            ? 'bg-[#E873C3]/20 text-[#E873C3] border-[#E873C3]/50 shadow-[0_0_15px_rgba(232,115,195,0.3)]'
            : 'bg-white/[0.04] text-white/80 border-white/10 hover:bg-white/[0.08] hover:text-white hover:border-white/20'
          }`}
      >
        <span className="text-white/40 uppercase tracking-wider text-[10px] font-extrabold">{label}:</span>
        {SelectedIcon && (
          <span className="inline-flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:-rotate-12">
            <SelectedIcon size={14} style={{ color: selectedOption.iconColor || 'inherit' }} />
          </span>
        )}
        <span className="font-bold whitespace-nowrap">{selectedOption.label}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#E873C3]' : 'text-white/40'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 mt-2 w-56 rounded-xl bg-[#0e082b] border border-white/20 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-1.5 z-50 flex flex-col gap-0.5 max-h-64 overflow-y-auto"
          >
            {options.map(opt => {
              const active = opt.key === value;
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.key}
                  onClick={() => {
                    onChange(opt.key);
                    onClose();
                  }}
                  className={`group/item w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${active
                      ? 'bg-gradient-to-r from-[#E873C3]/25 to-[#8D37D6]/25 text-[#E873C3] border border-[#E873C3]/40'
                      : 'text-white/80 hover:text-white hover:bg-white/[0.08]'
                    }`}
                >
                  <span className="flex items-center gap-2.5">
                    {OptIcon && (
                      <span className="inline-flex items-center justify-center transition-all duration-300 group-hover/item:scale-125 group-hover/item:rotate-12">
                        <OptIcon size={14} style={{ color: opt.iconColor || 'inherit' }} />
                      </span>
                    )}
                    <span>{opt.label}</span>
                  </span>
                  {active && <Check size={14} className="text-[#E873C3]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventCardComponent({ event }: { event: EventCard }) {
  const typeMeta = TYPE_META[event.event_type] ?? TYPE_META.challenge;
  const TypeIcon = typeMeta.icon;
  const isLive = event.status === 'ongoing';
  const isEnded = event.status === 'ended';
  const isUpcoming = event.status === 'published';
  const isTeam = event.participation_type === 'team';
  const isFree = !event.registration_fee || event.registration_fee === 'Free';
  const countdownStr = useCountdownStr(isUpcoming ? event.starts_at : isLive ? event.ends_at : null);

  return (
    <Link
      href={`/events/${event.slug || event.id}`}
      className="group relative flex flex-col bg-[#0c0721]/75 backdrop-blur-xl border border-white/10 hover:border-white/25 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(217,95,209,0.25)]"
      style={{
        boxShadow: isLive ? '0 0 25px rgba(232,115,195,0.3), 0 8px 32px rgba(0,0,0,0.6)' : '0 8px 32px rgba(0,0,0,0.4)'
      }}
    >
      {/* Ambient background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/5 via-purple-600/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Live pulse outer ring */}
      {isLive && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-10">
          <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ boxShadow: '0 0 0 1px rgba(232,115,195,0.5)' }} />
        </div>
      )}

      {/* Banner */}
      <div className={`relative h-44 bg-gradient-to-br ${typeMeta.gradient} flex items-center justify-center overflow-hidden`}>
        {event.banner_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={event.banner_url} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0721] via-[#0c0721]/40 to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-md"
          style={{ background: typeMeta.bg, color: typeMeta.color, border: `1px solid ${typeMeta.color}50` }}>
          <TypeIcon size={12} />
          <span>{typeMeta.label}</span>
        </div>

        {/* Status badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
          isLive ? 'text-[#E873C3] bg-[#E873C3]/20 border border-[#E873C3]/50 shadow-[0_0_12px_rgba(232,115,195,0.4)]' :
          isUpcoming ? 'text-[#3DCB7F] bg-[#3DCB7F]/18 border border-[#3DCB7F]/40' :
          'text-white/40 bg-white/[0.08] border border-white/15'
        }`}>
          {isLive && <span className="w-2 h-2 rounded-full bg-[#E873C3] animate-pulse" />}
          {isLive ? 'LIVE NOW' : isUpcoming ? 'Upcoming' : 'Ended'}
        </div>

        {/* Prize pill */}
        {event.prize_pool && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/40 text-[#FFD700] text-[11px] font-bold backdrop-blur-md shadow-md">
            <Trophy size={12} className="text-[#FFD700]" />
            <span>{event.prize_pool}</span>
          </div>
        )}

        {/* Participation type pill */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 border border-white/15 text-[10px] font-bold text-white/70 backdrop-blur-md">
          {isTeam ? <><UsersRound size={11} /> Team</> : <><UserCheck size={11} /> Solo</>}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4 flex-1 relative z-10">
        <div>
          <h3 className="font-black text-white text-base leading-snug mb-1 group-hover:text-[#E873C3] transition-colors duration-200 line-clamp-2">
            {event.title}
          </h3>
          {event.tagline && <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{event.tagline}</p>}
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] text-white/60 font-medium">
            <Globe size={10} />{event.eligibility ?? 'Open to All'}
          </span>
          <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-medium ${isFree ? 'bg-[#3DCB7F]/12 border-[#3DCB7F]/30 text-[#3DCB7F]' : 'bg-[#F5A623]/12 border-[#F5A623]/30 text-[#F5A623]'
            }`}>
            <BadgeCheck size={10} />{event.registration_fee ?? 'Free'}
          </span>
        </div>

        {/* Tags */}
        {event.tags_json && (event.tags_json as string[]).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(event.tags_json as string[]).slice(0, 3).map(tag => (
              <span key={tag} className="px-2.5 py-0.5 bg-white/[0.06] border border-white/10 rounded-full text-[10px] text-white/50 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-white/50 mt-auto pt-3 border-t border-white/10">
          <span className="flex items-center gap-1.5 font-medium">
            <Users size={12} className="text-[#E873C3]" />
            {event._count.event_registrations}{event.max_participants ? `/${event.max_participants}` : ''} registered
          </span>
          {countdownStr && (
            <span className={`flex items-center gap-1 font-bold text-[11px] ${isLive ? 'text-[#E873C3]' : 'text-[#F5A623]'}`}>
              <Clock size={12} />
              {isLive ? `Ends in ${countdownStr}` : `Starts in ${countdownStr}`}
            </span>
          )}
          {isEnded && <span className="text-white/30 text-[10px] font-medium">Event Concluded</span>}
        </div>
      </div>

      {/* CTA strip */}
      <div className="px-4 pb-4 relative z-10">
        {isLive ? (
          <div
            className="w-full py-2.5 rounded-xl text-xs font-black text-center flex items-center justify-center gap-1.5 transition-all shadow-lg"
            style={event.event_type === 'coding_contest'
              ? { background: 'linear-gradient(135deg,#4ECDC4,#3DCB7F)', color: '#fff', boxShadow: '0 4px 20px rgba(78,205,196,0.4)' }
              : { background: 'linear-gradient(135deg,#E873C3,#8D37D6)', color: '#fff', boxShadow: '0 4px 20px rgba(232,115,195,0.5)' }
            }
          >
            <Flame size={14} className="animate-pulse" />
            <span>{event.event_type === 'coding_contest' ? 'Enter Contest — LIVE NOW!' : 'Submit Project — LIVE NOW!'}</span>
            <ChevronRight size={14} />
          </div>
        ) : isUpcoming ? (
          <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all shadow-md group-hover:border-[#E873C3]/40">
            <span>{event.registration_open ? 'Register Now' : 'Registration Closed'}</span>
            {!event.registration_open && <Lock size={12} />}
            <ChevronRight size={14} />
          </div>
        ) : (
          <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 bg-white/[0.04] text-white/40 border border-white/10 group-hover:text-white/70 transition-all">
            <span>View Event Details</span>
            <ChevronRight size={14} />
          </div>
        )}
      </div>
    </Link>
  );
}

const TYPE_FILTERS: DropdownOption[] = [
  { key: '', label: 'All Categories', icon: Layers, iconColor: '#A9A8BE' },
  { key: 'hackathon', label: 'Hackathons', icon: Rocket, iconColor: '#E873C3' },
  { key: 'coding_contest', label: 'Contests', icon: Terminal, iconColor: '#4ECDC4' },
];
const STATUS_FILTERS: DropdownOption[] = [
  { key: '', label: 'All Status', icon: CalendarDays, iconColor: '#A9A8BE' },
  { key: 'published', label: 'Upcoming', icon: Clock, iconColor: '#3DCB7F' },
  { key: 'ongoing', label: 'Live Now', icon: Flame, iconColor: '#E873C3' },
  { key: 'ended', label: 'Ended', icon: CheckCircle2, iconColor: '#888888' },
];

const PARTICIPATION_FILTERS: DropdownOption[] = [
  { key: '', label: 'All Modes', icon: Globe, iconColor: '#A9A8BE' },
  { key: 'individual', label: 'Solo', icon: UserCheck, iconColor: '#4ECDC4' },
  { key: 'team', label: 'Team', icon: UsersRound, iconColor: '#E873C3' },
];

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [participationFilter, setParticipationFilter] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const liveCount = events.filter(e => e.status === 'ongoing').length;
  const activeFilterCount = (typeFilter ? 1 : 0) + (statusFilter ? 1 : 0) + (participationFilter ? 1 : 0) + (search ? 1 : 0);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => (prev === name ? null : name));
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const fetchEvents = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);
    if (typeFilter) params.set('type', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (participationFilter) params.set('participation', participationFilter);
    fetch(`/api/events?${params}`)
      .then(r => r.json())
      .then(data => {
        setEvents(data.events ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [search, typeFilter, statusFilter, participationFilter, page]);

  useEffect(() => {
    void (async () => {
      await fetchEvents();
    })();
  }, [fetchEvents]);

  const hasActiveFilters = Boolean(typeFilter || statusFilter || participationFilter || search);

  const resetAllFilters = () => {
    setTypeFilter('');
    setStatusFilter('');
    setParticipationFilter('');
    setSearch('');
    setOpenDropdown(null);
    setPage(1);
  };

  return (
    <div className="relative min-h-screen bg-[#050508] text-white flex flex-col overflow-x-hidden">
      {/* ── Space Theme Background Canvas ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Dark cosmic gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060212] via-[#08031a] to-[#04020a]" />

        {/* Ambient Nebula Dust Clouds */}
        <div className="absolute top-[-10%] left-[-10%] w-[55rem] h-[45rem] bg-indigo-900/20 rounded-full blur-[140px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[50rem] h-[40rem] bg-fuchsia-900/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[10%] left-[10%] w-[55rem] h-[35rem] bg-[#4ECDC4]/12 rounded-full blur-[160px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-10%] right-[15%] w-[45rem] h-[45rem] bg-purple-900/25 rounded-full blur-[140px] mix-blend-screen" />

        {/* Starfield Texture Layers */}
        <div
          className="absolute inset-0 pointer-events-none opacity-45"
          style={{
            backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 90px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 130px 80px, #e0b0ff, rgba(0,0,0,0)), radial-gradient(1px 1px at 160px 120px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 230px 210px, #00ffe9, rgba(0,0,0,0))',
            backgroundRepeat: 'repeat',
            backgroundSize: '250px 250px'
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-35"
          style={{
            backgroundImage: 'radial-gradient(2px 2px at 80px 120px, rgba(255,255,255,0.9), rgba(0,0,0,0)), radial-gradient(2px 2px at 250px 50px, rgba(232,115,195,0.8), rgba(0,0,0,0)), radial-gradient(2px 2px at 180px 300px, rgba(78,205,196,0.9), rgba(0,0,0,0))',
            backgroundRepeat: 'repeat',
            backgroundSize: '380px 380px'
          }}
        />

        {/* Animated Shooting Stars */}
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{ width: "160px", rotate: -35, top: "8%", right: "-10%" }}
          animate={{
            x: [0, -1300],
            y: [0, 850],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#00FFE9] to-transparent shadow-[0_0_10px_rgba(0,255,233,0.8)]"
          style={{ width: "130px", rotate: -35, top: "32%", right: "-5%" }}
          animate={{
            x: [0, -1100],
            y: [0, 750],
            opacity: [0, 0.8, 0]
          }}
          transition={{
            duration: 2.1,
            repeat: Infinity,
            repeatDelay: 8,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#E873C3] to-transparent shadow-[0_0_10px_rgba(232,115,195,0.9)]"
          style={{ width: "190px", rotate: -35, top: "-5%", right: "25%" }}
          animate={{
            x: [0, -1500],
            y: [0, 1000],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 12,
            ease: "linear"
          }}
        />

        <RisingStars speed={2.5} />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <div className="relative z-10 pt-20 pb-28 flex-1">
        {/* Cosmic Hero Section */}
        <div className="relative overflow-hidden px-6 sm:px-10 py-16 text-center">
          {/* Back Navigation Pill */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/dashboard');
              }
            }}
            className="absolute left-6 sm:left-10 top-10 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white text-xs sm:text-sm font-semibold border border-white/15 transition-all cursor-pointer shadow-lg backdrop-blur-md z-20 group"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-1 transition-transform duration-200">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>

          <div className="relative max-w-3xl mx-auto">
            {/* Live Indicator Pill */}
            {liveCount > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E873C3]/15 border border-[#E873C3]/40 text-[#E873C3] text-xs font-black mb-5 shadow-[0_0_20px_rgba(232,115,195,0.3)] animate-pulse" style={{ animationDuration: '2s' }}>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E873C3] animate-ping" />
                {liveCount} Event{liveCount !== 1 ? 's' : ''} LIVE Right Now
              </div>
            )}

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
              Compete.{' '}
              <span className="bg-gradient-to-r from-[#E873C3] via-[#8D37D6] to-[#4ECDC4] bg-clip-text text-transparent">
                Build.
              </span>
              {' '}Win.
            </h1>

            <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-8 font-medium">
              Join hackathons, coding contests, and workshops on CosmoDex. Level up your skills, build real projects, and earn prizes.
            </p>

            {/* Metric Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-white/60 font-semibold">
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <CalendarDays size={15} className="text-[#E873C3]" />
                {total} Events
              </span>
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <Trophy size={15} className="text-[#FFD700]" />
                Prizes & Rewards
              </span>
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <Users size={15} className="text-[#4ECDC4]" />
                Solo & Team Modes
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Events Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-8">
          {/* ── Modern Glass Search & Single-Active Dropdown Bar ── */}
          <div className="relative z-40 flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-[#0b061e]/95 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
            {/* Search Box */}
            <div className="relative flex-1 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#E873C3] transition-colors duration-200" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search events, hackathons, contests..."
                className="w-full pl-11 pr-10 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#E873C3] focus:ring-2 focus:ring-[#E873C3]/30 transition-all font-medium"
              />
              {search ? (
                <button
                  onClick={() => { setSearch(''); setPage(1); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-bold p-1 rounded-md transition-colors"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="hidden sm:inline-block absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono font-semibold text-white/40 border border-white/10">
                  ⌘K
                </span>
              )}
            </div>

            {/* Dropdown Filters Row (Only 1 Open at a Time) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <CosmoDropdown
                label="Category"
                value={typeFilter}
                options={TYPE_FILTERS}
                isOpen={openDropdown === 'category'}
                onToggle={() => toggleDropdown('category')}
                onClose={closeDropdown}
                onChange={val => { setTypeFilter(val); setPage(1); }}
              />

              <CosmoDropdown
                label="Status"
                value={statusFilter}
                options={STATUS_FILTERS}
                isOpen={openDropdown === 'status'}
                onToggle={() => toggleDropdown('status')}
                onClose={closeDropdown}
                onChange={val => { setStatusFilter(val); setPage(1); }}
              />

              <CosmoDropdown
                label="Mode"
                value={participationFilter}
                options={PARTICIPATION_FILTERS}
                isOpen={openDropdown === 'mode'}
                onToggle={() => toggleDropdown('mode')}
                onClose={closeDropdown}
                onChange={val => { setParticipationFilter(val); setPage(1); }}
              />

              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500/15 via-rose-500/15 to-fuchsia-500/15 hover:from-red-500/25 hover:via-rose-500/25 hover:to-fuchsia-500/25 text-red-300 hover:text-red-200 border border-red-500/35 hover:border-red-400/60 text-xs font-bold transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(244,63,94,0.35)] hover:scale-[1.03]"
                >
                  <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500 text-red-400 group-hover:text-red-200" />
                  <span>Reset</span>
                  <span className="w-5 h-5 rounded-full bg-red-500/30 border border-red-400/40 text-red-200 text-[10px] font-black flex items-center justify-center shadow-inner">
                    {activeFilterCount}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Results Summary Row */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-white/50">
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-[#E873C3]" />
                  Searching cosmic events...
                </span>
              ) : (
                <span>{total} event{total !== 1 ? 's' : ''} found</span>
              )}
            </p>
            {liveCount > 0 && (
              <button
                onClick={() => { setStatusFilter('ongoing'); setPage(1); }}
                className="flex items-center gap-1.5 text-xs font-bold text-[#E873C3] hover:text-white transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#E873C3] animate-pulse" />
                Show {liveCount} live event{liveCount !== 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Events Grid / Loading / Empty View with Smooth Layout Animations */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-84 bg-white/[0.03] border border-white/[0.06] rounded-2xl animate-pulse flex flex-col p-4 gap-4">
                  <div className="h-40 bg-white/[0.05] rounded-xl" />
                  <div className="h-4 w-3/4 bg-white/[0.06] rounded-md" />
                  <div className="h-3 w-1/2 bg-white/[0.04] rounded-md" />
                  <div className="h-8 w-full bg-white/[0.05] rounded-xl mt-auto" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-[#0c0721]/50 border border-white/10 rounded-3xl backdrop-blur-md">
              <div className="w-20 h-20 rounded-full bg-[#E873C3]/10 border border-[#E873C3]/30 flex items-center justify-center text-[#E873C3] mb-2 shadow-[0_0_30px_rgba(232,115,195,0.2)]">
                <Sparkles size={36} />
              </div>
              <p className="text-white/80 font-black text-xl">No Events Found</p>
              <p className="text-white/40 text-sm max-w-sm text-center">
                We couldn&apos;t find any events matching your search or filters. Try adjusting your search criteria.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="mt-3 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#E873C3] to-[#8D37D6] hover:opacity-90 transition-all shadow-lg cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${typeFilter}-${statusFilter}-${participationFilter}-${search}-${page}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {events.map(event => (
                  <EventCardComponent key={event.id} event={event} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white/70 bg-white/[0.05] border border-white/10 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                ← Previous
              </button>
              <span className="text-sm font-bold text-white/50 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white/70 bg-white/[0.05] border border-white/10 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
