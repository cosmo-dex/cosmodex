'use client';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
}

interface LeaderboardTableProps {
  loading: boolean;
  error: string | null;
  entries: LeaderboardEntry[];
  onRetry: () => void;
}

export default function LeaderboardTable({
  loading,
  error,
  entries,
  onRetry,
}: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#2B2F38] bg-[#111318] p-8">
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-[#1C2028]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-[#111318] p-10 text-center">
        <h3 className="text-lg font-semibold text-red-400">
          Failed to load leaderboard
        </h3>

        <p className="mt-2 text-sm text-gray-400">
          {error}
        </p>

        <button
          onClick={onRetry}
          className="mt-6 rounded-lg bg-violet-600 px-6 py-2 font-medium text-white transition hover:bg-violet-500"
        >
          Retry
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-[#2B2F38] bg-[#111318] py-16 text-center">
        <h3 className="text-xl font-semibold text-white">
          No leaderboard data
        </h3>

        <p className="mt-2 text-gray-400">
          Play a battle to appear on the leaderboard.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#2B2F38] bg-[#111318] shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-[#2B2F38] bg-[#181B22]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Rank
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Player
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                Rating
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                Wins
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                Losses
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                Draws
              </th>
            </tr>
          </thead>

          <tbody>
            {entries.map((player) => (
              <tr
                key={player.userId}
                className="border-b border-[#20242D] transition hover:bg-[#1A1F28]"
              >
                <td className="px-6 py-5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-bold
                    ${
                      player.rank === 1
                        ? 'bg-yellow-500 text-black'
                        : player.rank === 2
                        ? 'bg-gray-300 text-black'
                        : player.rank === 3
                        ? 'bg-orange-500 text-white'
                        : 'bg-[#252B36] text-gray-300'
                    }`}
                  >
                    {player.rank}
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-700 text-lg font-bold text-white">
                      {player.username.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        {player.username}
                      </p>

                      <p className="text-xs text-gray-500">
                        {player.userId.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5 text-center">
                  <span className="rounded-lg bg-violet-600/20 px-3 py-2 font-semibold text-violet-300">
                    {player.elo}
                  </span>
                </td>

                <td className="px-6 py-5 text-center font-semibold text-green-400">
                  {player.wins}
                </td>

                <td className="px-6 py-5 text-center font-semibold text-red-400">
                  {player.losses}
                </td>

                <td className="px-6 py-5 text-center font-semibold text-yellow-400">
                  {player.draws}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}