'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import {
  CalendarDays, Trophy, Users, Clock, Search,
  Zap, Hammer, BookOpen, Star, ChevronRight, Filter,
  UserCheck, UsersRound, Flame, Lock, Globe, BadgeCheck
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
  prizes_json: unknown;
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
  hackathon: { label: 'Hackathon', icon: Zap, color: '#E873C3', bg: 'rgba(232,115,195,0.15)', gradient: 'from-[#E873C3]/25 via-[#8D37D6]/12 to-transparent' },
  coding_contest: { label: 'Coding Contest', icon: Hammer, color: '#4ECDC4', bg: 'rgba(78,205,196,0.15)', gradient: 'from-[#4ECDC4]/25 via-[#3DCB7F]/12 to-transparent' },
  workshop: { label: 'Workshop', icon: BookOpen, color: '#F5A623', bg: 'rgba(245,166,35,0.15)', gradient: 'from-[#F5A623]/25 via-[#FF6B35]/12 to-transparent' },
  challenge: { label: 'Challenge', icon: Star, color: '#8D37D6', bg: 'rgba(141,55,214,0.15)', gradient: 'from-[#8D37D6]/25 via-[#E873C3]/12 to-transparent' },
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
      className="group relative flex flex-col bg-[#0c0818]/80 border border-white/[0.07] rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/[0.18] hover:-translate-y-1.5 hover:shadow-2xl"
      style={{ boxShadow: isLive ? '0 0 0 1px rgba(232,115,195,0.3), 0 8px 32px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.4)' }}
    >
      {/* Live pulse ring */}
      {isLive && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-10">
          <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ boxShadow: '0 0 0 1px rgba(232,115,195,0.4)' }} />
        </div>
      )}

      {/* Banner */}
      <div className={`relative h-40 bg-gradient-to-br ${typeMeta.gradient} flex items-center justify-center overflow-hidden`}>
        {event.banner_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={event.banner_url} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 transition-opacity duration-400" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06020f]/90 via-[#06020f]/30 to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-sm"
          style={{ background: typeMeta.bg, color: typeMeta.color, border: `1px solid ${typeMeta.color}40` }}>
          <TypeIcon size={11} />{typeMeta.label}
        </div>

        {/* Status badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase backdrop-blur-sm ${isLive ? 'text-[#E873C3] bg-[#E873C3]/15 border border-[#E873C3]/40' :
            isUpcoming ? 'text-[#3DCB7F] bg-[#3DCB7F]/12 border border-[#3DCB7F]/30' :
              'text-white/40 bg-white/[0.06] border border-white/10'
          }`}>
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[#E873C3] animate-pulse" />}
          {isLive ? 'LIVE' : isUpcoming ? 'Upcoming' : 'Ended'}
        </div>

        {/* Prize pill */}
        {event.prize_pool && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFD700]/12 border border-[#FFD700]/30 text-[#FFD700] text-[11px] font-bold">
            <Trophy size={11} />{event.prize_pool}
          </div>
        )}

        {/* Participation type pill */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 border border-white/10 text-[10px] font-bold text-white/50">
          {isTeam ? <><UsersRound size={10} /> Team</> : <><UserCheck size={10} /> Solo</>}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <div>
          <h3 className="font-black text-white text-sm leading-tight mb-1 group-hover:text-[#E873C3] transition-colors duration-200 line-clamp-2">{event.title}</h3>
          {event.tagline && <p className="text-xs text-white/45 line-clamp-2 leading-relaxed">{event.tagline}</p>}
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-[10px] text-white/40 font-medium">
            <Globe size={9} />{event.eligibility ?? 'Open to All'}
          </span>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${isFree ? 'bg-[#3DCB7F]/10 border-[#3DCB7F]/25 text-[#3DCB7F]' : 'bg-[#F5A623]/10 border-[#F5A623]/25 text-[#F5A623]'
            }`}>
            <BadgeCheck size={9} />{event.registration_fee ?? 'Free'}
          </span>
        </div>

        {/* Tags */}
        {event.tags_json && (event.tags_json as string[]).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(event.tags_json as string[]).slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.08] rounded-full text-[10px] text-white/45">{tag}</span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-white/35 mt-auto pt-3 border-t border-white/[0.05]">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {event._count.event_registrations}{event.max_participants ? `/${event.max_participants}` : ''} joined
          </span>
          {countdownStr && (
            <span className={`flex items-center gap-1 ml-auto font-bold ${isLive ? 'text-[#E873C3]' : 'text-[#F5A623]'}`}>
              <Clock size={11} />
              {isLive ? `Ends in ${countdownStr}` : `Starts in ${countdownStr}`}
            </span>
          )}
          {isEnded && <span className="ml-auto text-white/25 text-[10px]">Results available</span>}
        </div>
      </div>

      {/* CTA strip */}
      <div className="px-4 pb-4">
        {isLive ? (
          <div
            className="w-full py-2.5 rounded-xl text-xs font-black text-center flex items-center justify-center gap-1.5 transition-all"
            style={event.event_type === 'coding_contest'
              ? { background: 'linear-gradient(135deg,#4ECDC4,#3DCB7F)', color: '#fff', boxShadow: '0 4px 20px rgba(78,205,196,0.4)' }
              : { background: 'linear-gradient(135deg,#E873C3,#8D37D6)', color: '#fff', boxShadow: '0 4px 20px rgba(232,115,195,0.5)' }
            }
          >
            <Flame size={13} className="animate-pulse" />
            {event.event_type === 'coding_contest' ? 'Enter Contest — LIVE NOW!' : 'Submit Project — LIVE NOW!'}
            <ChevronRight size={13} />
          </div>
        ) : isUpcoming ? (
          <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {event.registration_open ? 'Register Now' : <><Lock size={11} /> Registration Closed</>}
            <ChevronRight size={13} />
          </div>
        ) : (
          <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5"
            style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
            View Details <ChevronRight size={13} />
          </div>
        )}
      </div>
    </Link>
  );
}

const TYPE_FILTERS = [
  { key: '', label: 'All' },
  { key: 'hackathon', label: '🚀 Hackathons' },
  { key: 'coding_contest', label: '⌨️ Contests' },
  { key: 'workshop', label: '🛠️ Workshops' },
  { key: 'challenge', label: '🏆 Challenges' },
];
const STATUS_FILTERS = [
  { key: '', label: 'All Status' },
  { key: 'published', label: '📋 Upcoming' },
  { key: 'ongoing', label: '🔴 Live' },
  { key: 'ended', label: '✅ Ended' },
];
const PARTICIPATION_FILTERS = [
  { key: '', label: 'All Modes' },
  { key: 'individual', label: '👤 Solo' },
  { key: 'team', label: '👥 Team' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [participationFilter, setParticipationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const liveCount = events.filter(e => e.status === 'ongoing').length;

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
      .finally(() => setLoading(false));
  }, [search, typeFilter, statusFilter, participationFilter, page]);

  useEffect(() => {
    void (async () => {
      await fetchEvents();
    })();
  }, [fetchEvents]);

  return (
    <div className="min-h-screen bg-[#06020f] text-white">
      <Navbar />
      <div className="pt-20 pb-24">
        {/* Hero */}
        <div className="relative overflow-hidden px-6 sm:px-10 py-16 text-center">
          {/* Back Button */}
          <Link
            href="/"
            className="absolute left-6 sm:left-10 top-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs sm:text-sm font-medium border border-white/10 transition-all cursor-pointer shadow-lg backdrop-blur-md z-20"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </Link>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-[#E873C3]/6 rounded-full blur-3xl" />
            <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-[#8D37D6]/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-[#4ECDC4]/4 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-3xl mx-auto">
            {liveCount > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E873C3]/10 border border-[#E873C3]/30 text-[#E873C3] text-xs font-black mb-5 animate-pulse" style={{ animationDuration: '2s' }}>
                <span className="w-2 h-2 rounded-full bg-[#E873C3] animate-pulse" />
                {liveCount} Event{liveCount !== 1 ? 's' : ''} LIVE Right Now
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
              Compete.{' '}
              <span className="bg-gradient-to-r from-[#E873C3] via-[#8D37D6] to-[#4ECDC4] bg-clip-text text-transparent">
                Build.
              </span>
              {' '}Win.
            </h1>
            <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-8">
              Join hackathons, coding contests, and workshops on CosmoDex. Level up your skills, build real projects, and earn prizes.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-white/40">
              <span className="flex items-center gap-1.5"><CalendarDays size={14} />{total} Events</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5"><Trophy size={14} />Prizes & Rewards</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5"><Users size={14} />Solo & Team</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col gap-7">
          {/* Modern Search & Filter Bar */}
          <div className="flex flex-col gap-4 bg-[#0c081d]/80 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl">
            {/* Top row: Search input + Category quick pills + Advanced Filter Toggle */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search events, hackathons, contests..."
                  className="w-full pl-11 pr-9 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#E873C3] focus:ring-2 focus:ring-[#E873C3]/30 transition-all font-medium"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(''); setPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-bold p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Main Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {TYPE_FILTERS.map(f => {
                  const isActive = typeFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => { setTypeFilter(f.key); setPage(1); }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#E873C3] to-[#8D37D6] text-white shadow-lg shadow-[#E873C3]/30 border border-white/30 scale-[1.02]'
                          : 'bg-white/[0.05] text-white/80 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Advanced Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(f => !f)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  showFilters || statusFilter || participationFilter
                    ? 'bg-[#E873C3]/20 border-[#E873C3]/50 text-[#E873C3] shadow-md shadow-[#E873C3]/20'
                    : 'bg-white/[0.05] border-white/10 text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Filter size={14} />
                <span>Filters</span>
                {(statusFilter || participationFilter) && (
                  <span className="w-5 h-5 rounded-full bg-[#E873C3] text-white text-[10px] flex items-center justify-center font-bold">
                    {(statusFilter ? 1 : 0) + (participationFilter ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced Filters Panel (Status & Mode) */}
            {showFilters && (
              <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Status Filter Row */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Event Status</span>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_FILTERS.map(f => {
                      const isActive = statusFilter === f.key;
                      return (
                        <button
                          key={f.key}
                          onClick={() => { setStatusFilter(f.key); setPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-[#E873C3]/25 text-[#E873C3] border border-[#E873C3]/50 shadow-sm'
                              : 'bg-white/[0.04] text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mode Filter Row */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Participation Mode</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PARTICIPATION_FILTERS.map(f => {
                      const isActive = participationFilter === f.key;
                      return (
                        <button
                          key={f.key}
                          onClick={() => { setParticipationFilter(f.key); setPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-[#4ECDC4]/25 text-[#4ECDC4] border border-[#4ECDC4]/50 shadow-sm'
                              : 'bg-white/[0.04] text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Bar & Reset Option */}
            {(typeFilter || statusFilter || participationFilter || search) && (
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <div className="flex items-center gap-2 flex-wrap text-white/60">
                  <span className="font-bold text-white/40">Active Filters:</span>
                  {typeFilter && (
                    <span className="px-2.5 py-1 rounded-md bg-[#E873C3]/15 text-[#E873C3] border border-[#E873C3]/30 font-medium flex items-center gap-1">
                      {TYPE_FILTERS.find(f => f.key === typeFilter)?.label}
                      <button onClick={() => setTypeFilter('')} className="hover:text-white font-bold ml-1">✕</button>
                    </span>
                  )}
                  {statusFilter && (
                    <span className="px-2.5 py-1 rounded-md bg-[#E873C3]/15 text-[#E873C3] border border-[#E873C3]/30 font-medium flex items-center gap-1">
                      {STATUS_FILTERS.find(f => f.key === statusFilter)?.label}
                      <button onClick={() => setStatusFilter('')} className="hover:text-white font-bold ml-1">✕</button>
                    </span>
                  )}
                  {participationFilter && (
                    <span className="px-2.5 py-1 rounded-md bg-[#4ECDC4]/15 text-[#4ECDC4] border border-[#4ECDC4]/30 font-medium flex items-center gap-1">
                      {PARTICIPATION_FILTERS.find(f => f.key === participationFilter)?.label}
                      <button onClick={() => setParticipationFilter('')} className="hover:text-white font-bold ml-1">✕</button>
                    </span>
                  )}
                  {search && (
                    <span className="px-2.5 py-1 rounded-md bg-white/10 text-white border border-white/20 font-medium flex items-center gap-1">
                      &quot;{search}&quot;
                      <button onClick={() => setSearch('')} className="hover:text-white font-bold ml-1">✕</button>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => { setTypeFilter(''); setStatusFilter(''); setParticipationFilter(''); setSearch(''); setPage(1); }}
                  className="text-red-400 hover:text-red-300 font-bold transition-colors ml-auto cursor-pointer flex items-center gap-1"
                >
                  Reset All ✕
                </button>
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/35">
              {loading ? 'Loading...' : `${total} event${total !== 1 ? 's' : ''} found`}
            </p>
            {liveCount > 0 && (
              <button onClick={() => { setStatusFilter('ongoing'); setPage(1); }}
                className="flex items-center gap-1.5 text-xs font-bold text-[#E873C3] hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E873C3] animate-pulse" />
                Show {liveCount} live event{liveCount !== 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Events grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 bg-white/[0.03] border border-white/[0.05] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <CalendarDays size={56} className="text-white/8" />
              <p className="text-white/30 font-bold text-lg">No events found</p>
              <p className="text-white/20 text-sm">Try adjusting your filters or check back soon.</p>
              {(typeFilter || statusFilter || participationFilter || search) && (
                <button onClick={() => { setTypeFilter(''); setStatusFilter(''); setParticipationFilter(''); setSearch(''); setPage(1); }}
                  className="mt-2 px-5 py-2 rounded-xl text-sm font-bold text-[#E873C3] border border-[#E873C3]/30 hover:bg-[#E873C3]/10 transition-all">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {events.map(event => (
                <EventCardComponent key={event.id} event={event} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white/50 bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] disabled:opacity-30 transition-all">
                ← Prev
              </button>
              <span className="text-sm text-white/40 px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white/50 bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] disabled:opacity-30 transition-all">
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
