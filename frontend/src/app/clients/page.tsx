'use client';

import { useEffect, useState } from 'react';
import ClientForm from '@/components/ClientForm';
import ClientTable from '@/components/ClientTable';
export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);

  const fetchClients = async () => {
    const res = await fetch('http://localhost:3333/clients', {
      credentials: 'include',
    });
    const data = await res.json();
    console.log(data); 
    setClients(data);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreate = async (client: any) => {
    await fetch('http://localhost:3333/clients', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    fetchClients();
  };

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:3333/clients/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    fetchClients();
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Clients</h1>
      <ClientForm onCreate={handleCreate} />
      <ClientTable clients={clients} onDelete={handleDelete} />
    </div>
  );
}
