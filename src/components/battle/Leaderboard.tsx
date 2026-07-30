'use client';

import { useEffect, useState } from 'react';
import LeaderboardTable from './LeaderboardTable';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
}

export default function Leaderboard() {
  const [mode, setMode] = useState<'code' | 'mcq'>('code');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let ignore = false;

    async function fetchLeaderboard() {
      try {
        setLoading(true);

        const res = await fetch(`/api/battle/leaderboard?mode=${mode}`);

        if (!res.ok) {
          throw new Error('Failed to load leaderboard');
        }

        const data = await res.json();

        if (!ignore) {
          if (Array.isArray(data)) {
            setEntries(data);
            setError(null);
          } else {
            setEntries([]);
            setError(data.error || 'Unable to load leaderboard');
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setEntries([]);
          setError(
            err instanceof Error
              ? err.message
              : 'Something went wrong.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchLeaderboard();

    return () => {
      ignore = true;
    };
  }, [mode, reloadTrigger]);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-8">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-4xl font-bold text-white tracking-wide">
            Leaderboard
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Compete with the best players across the platform.
          </p>
        </div>

        {/* Battle Mode Switch */}

        <div className="flex rounded-xl border border-[#2B2F38] bg-[#111318] p-1">

          <button
            onClick={() => setMode('code')}
            className={`rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200
              ${
                mode === 'code'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
          >
            Code Battle
          </button>

          <button
            onClick={() => setMode('mcq')}
            className={`rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200
              ${
                mode === 'mcq'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
          >
            MCQ Battle
          </button>

        </div>

      </div>

      {/* Leaderboard Card */}

      <div className="rounded-2xl border border-[#2B2F38] bg-[#0F1117] p-6 shadow-2xl">

        <LeaderboardTable
          loading={loading}
          error={error}
          entries={entries}
          onRetry={handleRetry}
        />

      </div>

    </section>
  );
}