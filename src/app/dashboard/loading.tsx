export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#080312] flex flex-col relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#080312]">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[120px]" />
      </div>

      <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-8 pt-20 relative flex-1 z-10 flex flex-col gap-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Welcome Banner Skeleton */}
            <div className="w-full h-44 rounded-2xl bg-[#0e1628]/80 border border-[#1b263b] p-6 flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="h-4 w-32 bg-white/10 rounded-md" />
                <div className="h-8 w-64 bg-white/15 rounded-lg" />
              </div>
              <div className="h-4 w-48 bg-white/10 rounded-md" />
            </div>

            {/* Get Started Card Skeleton */}
            <div className="w-full h-56 rounded-2xl bg-[#0e1628]/80 border border-[#1b263b] p-6 space-y-4 shadow-lg">
              <div className="h-6 w-48 bg-white/15 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-28 rounded-xl bg-white/5 border border-white/5" />
                <div className="h-28 rounded-xl bg-white/5 border border-white/5" />
              </div>
            </div>

            {/* Achievements Skeleton */}
            <div className="w-full h-40 rounded-2xl bg-[#0e1628]/80 border border-[#1b263b] p-6 space-y-4 shadow-lg">
              <div className="h-6 w-36 bg-white/15 rounded-md" />
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-full bg-white/10" />
                <div className="w-14 h-14 rounded-full bg-white/10" />
                <div className="w-14 h-14 rounded-full bg-white/10" />
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {/* Profile Card Skeleton */}
            <div className="w-full h-72 rounded-2xl bg-[#0e1628]/80 border border-[#1b263b] p-6 flex flex-col items-center justify-between shadow-lg">
              <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-[#E873C3]/30" />
              <div className="h-6 w-32 bg-white/20 rounded-md" />
              <div className="h-4 w-24 bg-white/10 rounded-md" />
              <div className="w-full grid grid-cols-2 gap-2 pt-2">
                <div className="h-12 rounded-lg bg-white/5" />
                <div className="h-12 rounded-lg bg-white/5" />
              </div>
            </div>

            {/* Activity Feed Skeleton */}
            <div className="w-full h-64 rounded-2xl bg-[#0e1628]/80 border border-[#1b263b] p-6 space-y-4 shadow-lg">
              <div className="h-6 w-40 bg-white/15 rounded-md" />
              <div className="space-y-3">
                <div className="h-10 w-full rounded-lg bg-white/5" />
                <div className="h-10 w-full rounded-lg bg-white/5" />
                <div className="h-10 w-full rounded-lg bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
