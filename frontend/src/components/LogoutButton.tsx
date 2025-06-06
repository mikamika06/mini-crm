'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await fetch('http://localhost:3333/auth/logout', {
      method: 'POST',
      credentials: 'include', 
    });

    router.push('/login');
  };

  return (
    <button
      onClick={logout}
      className="text-red-600 underline hover:text-red-800"
    >
      Logout
    </button>
  );
}
