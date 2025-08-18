'use client';

import { LogOut } from 'lucide-react';
import { fetchWithAuth } from '@/app/utils/fetchWithAuth';

type LogoutButtonProps = {
  className?: string;
};

export default function LogoutButton({ className = "" }: LogoutButtonProps) {

  const logout = async () => {
    try {
      await fetchWithAuth('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
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
