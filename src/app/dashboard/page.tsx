import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { AVATARS, INTERESTS_OPTIONS } from '@/features/onboarding/theme/constants';

export const metadata = {
  title: 'Dashboard — CosmoDeX',
  description: 'Your personal CosmoDeX command center.',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // Not logged in → send to onboarding
  if (!authUser) {
    redirect('/onboarding');
  }

  // Try to fetch DB profile (may fail if DB is down)
  let dbUser: {
    username: string;
    email: string;
    role: string | null;
    level: number | null;
    xp_total: number | null;
    avatar_url: string | null;
    created_at: Date | null;
    auth_provider: string | null;
  } | null = null;

  try {
    const { prisma } = await import('@/lib/prisma');
    dbUser = await prisma.users.findUnique({
      where: { id: authUser.id },
      select: {
        username: true,
        email: true,
        role: true,
        level: true,
        xp_total: true,
        avatar_url: true,
        created_at: true,
        auth_provider: true,
      },
    });
  } catch {
    // DB unreachable — show Supabase auth info only
  }

  const displayName = dbUser?.username || authUser.user_metadata?.user_name || authUser.email?.split('@')[0] || 'Explorer';
  const email = dbUser?.email || authUser.email || '—';
  const role = dbUser?.role || 'student';
  const level = dbUser?.level ?? 1;
  const xp = dbUser?.xp_total ?? 0;
  const provider = dbUser?.auth_provider || authUser.app_metadata?.provider || 'email';
  const joinedAt = dbUser?.created_at
    ? new Date(dbUser.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  // Extract custom onboarding details from Supabase Auth metadata
  const avatarId = authUser.user_metadata?.avatar_id || 'av1';
  const selectedAvatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];

  const experienceLevel = authUser.user_metadata?.experience_level || 'Beginner';

  const interests: string[] = authUser.user_metadata?.interests || [];
  const interestLabels = interests.map(id => {
    const opt = INTERESTS_OPTIONS.find(o => o.id === id);
    return opt ? opt.label : id;
  });

  return (
    <main className="min-h-screen bg-white text-gray-900 p-8 sm:p-12">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <LogoutButton />
        </div>

        {/* Welcome Banner */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 flex items-center gap-6">
          <div className={`w-20 h-20 rounded-full shrink-0 ${selectedAvatar.cls} flex items-center justify-center shadow-md border-2 border-white text-white font-bold text-2xl`}>
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Welcome back,</p>
            <h2 className="text-4xl font-bold text-gray-900">{displayName} 👋</h2>
            <p className="text-gray-500 mt-1 text-sm">{email}</p>
          </div>
        </div>

        {/* User Details */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Account Details</h3>
          </div>
          <dl className="divide-y divide-gray-100">
            <Row label="Username" value={`@${displayName}`} />
            <Row label="Email" value={email} />
            <Row label="Role" value={capitalise(role)} />
            <Row label="Hologram (Avatar)" value={selectedAvatar.name} />
            <Row label="Combat Rank" value={experienceLevel} />
            <Row label="Systems Calibration" value={interestLabels.join(', ') || 'None'} />
            <Row label="Level" value={String(level)} />
            <Row label="XP Total" value={`${xp.toLocaleString()} XP`} />
            <Row label="Auth Provider" value={capitalise(provider)} />
            <Row label="Joined" value={joinedAt} />
          </dl>
        </div>

        {/* DB status note if profile missing */}
        {!dbUser && (
          <p className="mt-6 text-center text-xs text-gray-400">
            ⚠️ Extended profile unavailable (database temporarily unreachable). Showing Supabase auth data only.
          </p>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <dt className="text-sm text-gray-500 font-medium w-36 shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900 font-semibold text-right break-all">{value}</dd>
    </div>
  );
}

function capitalise(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
