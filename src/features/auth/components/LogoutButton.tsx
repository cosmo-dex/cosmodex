'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/onboarding');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-4 py-2 rounded-lg transition-colors"
    >
      Log out
    </button>
  );
}
