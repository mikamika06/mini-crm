'use client';

import LogoutButton from '../../components/LogoutButton'; 

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];

  setToken(cookieToken || null);
}, []);


  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Token: <code>{token}</code></p>
      <div className="mt-4">
        <LogoutButton />
      </div>
    </div>
  );
}
