'use client';

import { LogOut } from 'lucide-react';

type LogoutButtonProps = {
  className?: string;
};

export default function LogoutButton({ className = "" }: LogoutButtonProps) {

  const logout = async () => {
    try {
      await fetch('http://localhost:3333/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.href = '/';
    }
  };

  return (
    <button
      onClick={logout}
      className={`flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors w-full ${className}`}
    >
      <LogOut size={16} />
      Logout
    </button>
  );
}
