'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('token');
    setToken(saved);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Token: <code>{token}</code></p>
    </div>
  );
}
