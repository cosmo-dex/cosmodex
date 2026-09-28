'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/landing/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import RisingStars from '@/components/RisingStar';
import {
  CalendarDays, Trophy, Users, Clock, Search,
  Zap, Hammer, BookOpen, Star, ChevronDown, Check,
  UserCheck, UsersRound, Flame, Globe, Sparkles, RefreshCw, X, RotateCcw,
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

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ size?: number }>; color: string; bg: string }> = {
  hackathon: { label: 'Hackathon', icon: Zap, color: '#E873C3', bg: 'rgba(232,115,195,0.18)' },
  coding_contest: { label: 'Coding Contest', icon: Hammer, color: '#4ECDC4', bg: 'rgba(78,205,196,0.18)' },
  workshop: { label: 'Workshop', icon: BookOpen, color: '#F5A623', bg: 'rgba(245,166,35,0.18)' },
  challenge: { label: 'Challenge', icon: Star, color: '#8D37D6', bg: 'rgba(141,55,214,0.18)' },
};


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
        className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer border backdrop-blur-md ${isSelected
            ? 'bg-[#E873C3]/20 text-[#E873C3] border-[#E873C3]/50 shadow-[0_0_15px_rgba(232,115,195,0.3)]'
            : 'bg-[#131d31] text-white/80 border-[#22314e] hover:bg-[#1b2942] hover:text-white hover:border-[#38bdf8]/50'
          }`}
      >
        <span className="text-white/40 uppercase tracking-wider text-[10px] font-extrabold">{label}:</span>
        {SelectedIcon && (
          <span className="inline-flex items-center justify-center transition-all duration-300 group-hover:scale-110">
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
            className="absolute left-0 mt-2 w-56 rounded-xl bg-[#090e1a] border border-[#22314e] backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-1.5 z-50 flex flex-col gap-0.5 max-h-64 overflow-y-auto"
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
                  className={`group/item w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-sans font-bold transition-all flex items-center justify-between cursor-pointer ${active
                      ? 'bg-gradient-to-r from-[#E873C3]/25 to-[#8D37D6]/25 text-[#E873C3] border border-[#E873C3]/40'
                      : 'text-white/80 hover:text-white hover:bg-white/[0.08]'
                    }`}
                >
                  <span className="flex items-center gap-2.5">
                    {OptIcon && (
                      <span className="inline-flex items-center justify-center transition-all duration-300 group-hover/item:scale-110">
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
  const isLive = event.status === 'ongoing';
  const isUpcoming = event.status === 'published';

  return (
    <Link href={`/events/${event.slug || event.id}`} scroll={false} className="block">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        whileHover={{ y: -10 }}
        transition={{ duration: 0.15, ease: 'easeOut', delay: 0 }}
        className="group relative flex flex-col overflow-hidden bg-[#090e1a] border border-white/80 border-l-3 border-b-3 hover:border-white/50 rounded-[8px] cursor-pointer transition-colors duration-150"
      >
        {/* Highlight screen overlay on whole card component */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-30" />

        {/* 1. Image Banner - Static */}
        <div className="relative w-full h-40 overflow-hidden bg-[#0b1220] border-b border-[#1b263b]">
          {event.banner_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.banner_url}
              alt={event.title}
              loading="lazy"
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0b1220] text-white/60 text-sm font-sans">
              {event.title}
            </div>
          )}

          {isLive && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E873C3]/20 border border-[#E873C3]/50 text-[#E873C3] text-[10px] font-sans font-bold tracking-wider uppercase backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E873C3] animate-pulse" />
              <span>LIVE NOW</span>
            </div>
          )}
        </div>

        {/* 2. Card Content */}
        <div className="p-5 flex-1 flex flex-col justify-between bg-[#090e1a]">
          <div>
            {/* COURSE sequence number style */}
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#64748b] uppercase block mb-1.5">
              EVENT • {typeMeta.label}
            </span>

            {/* Title Heading in font-sans */}
            <h3 className="text-xl font-bold text-white mb-2 font-sans tracking-tight">
              {event.title}
            </h3>

            {/* Short 2-sentence summary */}
            <p className="text-sm text-[#94a3b8] font-sans leading-relaxed mb-6 line-clamp-2">
              {event.tagline || 'Join top developers, build real projects, and compete for galactic rewards.'}
            </p>
          </div>

          {/* 3. Level Tag Pill style */}
          <div className="flex items-center justify-between mt-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131d31] border border-[#22314e] text-[11px] font-sans font-bold tracking-wider text-[#94a3b8]">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
              <span>{isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'ENDED'}</span>
            </div>

            {event.prize_pool && (
              <span className="text-[11px] font-sans font-bold tracking-wider text-[#FFD700]">
                {event.prize_pool}
              </span>
            )}
          </div>
        </div>
      </motion.div>
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
      .catch(() => {
        setEvents([]);
        setTotal(0);
        setTotalPages(1);
      })
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
    <div className="relative min-h-screen bg-[#050508] text-white flex flex-col overflow-x-hidden font-sans">
      <Navbar />

      {/* ── Deep Space Cosmic Background FX (Course, Blog & Battle Theme) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050508]">
        <div className="absolute inset-0 bg-[#050508]" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.22)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(232,115,195,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(141,55,214,0.08)_0%,transparent_70%)]" />

        {/* Shooting Stars Animations */}
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{ width: '150px', rotate: -35, top: '10%', right: '-10%' }}
          animate={{ x: [0, -1200], y: [0, 800], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#00FFE9] to-transparent shadow-[0_0_10px_rgba(0,255,233,0.8)]"
          style={{ width: '120px', rotate: -35, top: '35%', right: '-5%' }}
          animate={{ x: [0, -1100], y: [0, 750], opacity: [0, 0.8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 7, ease: 'linear' }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#E873C3] to-transparent shadow-[0_0_10px_rgba(232,115,195,0.9)]"
          style={{ width: '180px', rotate: -35, top: '-5%', right: '25%' }}
          animate={{ x: [0, -1400], y: [0, 950], opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 10, ease: 'linear' }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_10px_rgba(168,85,247,0.9)]"
          style={{ width: '160px', rotate: -35, top: '60%', right: '-10%' }}
          animate={{ x: [0, -1300], y: [0, 850], opacity: [0, 0.9, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 6, ease: 'linear' }}
        />

        <RisingStars />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 pt-28 pb-24 px-4 sm:px-8 max-w-[1140px] mx-auto space-y-12 flex-1 w-full">
        {/* Main Heading Section */}
        <div className="text-center border-b border-white/10 pb-8 space-y-4">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-wider text-white filter drop-shadow-[0_0_30px_rgba(232,115,195,0.4)]">
            Cosmo<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6]">Events</span>
          </h1>

          <p className="text-sm sm:text-base text-[#94a3b8] font-sans leading-relaxed max-w-xl mx-auto">
            Join hackathons, coding contests, and workshops on CosmoDex. Level up your skills, build real projects, and earn prizes.
          </p>

          {/* Metric Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131d31] border border-[#22314e] text-xs font-sans font-bold tracking-wider text-[#94a3b8]">
              <CalendarDays size={14} className="text-[#38bdf8]" />
              <span>{total} Events</span>
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131d31] border border-[#22314e] text-xs font-sans font-bold tracking-wider text-[#94a3b8]">
              <Trophy size={14} className="text-[#FFD700]" />
              <span>Prizes & Rewards</span>
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131d31] border border-[#22314e] text-xs font-sans font-bold tracking-wider text-[#94a3b8]">
              <Users size={14} className="text-[#4ECDC4]" />
              <span>Solo & Team Modes</span>
            </span>
          </div>
        </div>

        {/* Filter and Events Container */}
        <div className="space-y-6">
          {/* Search & Dropdown Filter Bar */}
          <div className="relative z-40 flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-[#0b061e]/90 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
            {/* Search Box */}
            <div className="relative flex-1 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#E873C3] transition-colors duration-200" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search events, hackathons, contests..."
                className="w-full pl-11 pr-10 py-2.5 bg-[#131d31] border border-[#22314e] rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#E873C3] focus:ring-2 focus:ring-[#E873C3]/30 transition-all font-sans font-medium"
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

            {/* Dropdown Filters Row */}
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
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500/15 via-rose-500/15 to-fuchsia-500/15 hover:from-red-500/25 hover:via-rose-500/25 hover:to-fuchsia-500/25 text-red-300 hover:text-red-200 border border-red-500/35 hover:border-red-400/60 text-xs font-sans font-bold transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:scale-[1.02]"
                >
                  <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500 text-red-400 group-hover:text-red-200" />
                  <span>Reset</span>
                  <span className="w-5 h-5 rounded-full bg-red-500/30 border border-red-400/40 text-red-200 text-[10px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Results Summary Row */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-sans font-semibold text-[#94a3b8]">
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-[#E873C3]" />
                  Searching cosmic events...
                </span>
              ) : (
                <span>{total} event{total !== 1 ? 's' : ''} found</span>
              )}
            </p>
          </div>

          {/* Events Grid / Loading / Empty View */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 bg-[#0c0721]/50 border border-white/10 rounded-2xl animate-pulse flex flex-col p-5 gap-4">
                  <div className="h-44 bg-[#131d31] rounded-lg" />
                  <div className="h-5 w-3/4 bg-[#131d31] rounded-md" />
                  <div className="h-4 w-1/2 bg-[#131d31] rounded-md" />
                  <div className="h-10 w-full bg-[#131d31] rounded-lg mt-auto" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-[#0c0721]/50 border border-white/10 rounded-2xl backdrop-blur-md">
              <div className="w-16 h-16 rounded-full bg-[#E873C3]/10 border border-[#E873C3]/30 flex items-center justify-center text-[#E873C3] mb-1 shadow-[0_0_30px_rgba(232,115,195,0.2)]">
                <Sparkles size={32} />
              </div>
              <p className="text-white font-bold text-xl font-sans">No Events Found</p>
              <p className="text-[#94a3b8] text-sm max-w-sm text-center font-sans">
                We couldn&apos;t find any events matching your search or filters. Try adjusting your search criteria.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="mt-2 px-6 py-2.5 rounded-xl text-sm font-sans font-bold text-white bg-gradient-to-r from-[#E873C3] to-[#8D37D6] hover:opacity-90 transition-all shadow-lg cursor-pointer"
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
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                className="px-6 py-2.5 rounded-xl text-sm font-sans font-bold text-white/70 bg-[#131d31] border border-[#22314e] hover:bg-[#1b2942] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                ← Previous
              </button>
              <span className="text-sm font-sans font-bold text-[#94a3b8] px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-6 py-2.5 rounded-xl text-sm font-sans font-bold text-white/70 bg-[#131d31] border border-[#22314e] hover:bg-[#1b2942] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
