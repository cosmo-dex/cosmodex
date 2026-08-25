'use client';

import { useAuth } from '@/context/AuthContext';

export function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout('/onboarding?mode=login');
  };

  return (
    <button
      onClick={handleLogout}
      className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
    >
      Log out
    </button>
  );
}
