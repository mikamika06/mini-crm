'use client';

import { useEffect, useState } from 'react';
import ClientForm from '@/components/ClientForm';
import ClientTable from '@/components/ClientTable';
import { fetchWithAuth } from '@/app/utils/fetchWithAuth';
import { Client } from '@/app/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
        const res = await fetchWithAuth('/clients');
      
      if (!res.ok) {
        throw new Error('Failed to load clients');
      }
      
      const data = await res.json();
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientCreated = () => {
    setShowForm(false);
    fetchClients();
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetchWithAuth(`/clients/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete client');
      }
      
      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading clients...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Client'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showForm && (
          <div className="lg:col-span-1">
            <ClientForm onClientCreated={handleClientCreated} />
          </div>
        )}
        
        <div className={showForm ? "lg:col-span-1" : "lg:col-span-2"}>
          <ClientTable clients={clients} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
