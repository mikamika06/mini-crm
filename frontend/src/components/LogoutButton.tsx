'use client';

import { useAuth } from '@/contexts/AuthContext';

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const { logout, isLoading } = useAuth();

  const handleLogout = () => {
    if (!isLoading) {
      logout();
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={className || "text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"}
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
