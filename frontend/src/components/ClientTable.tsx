'use client';

import { Client } from '@/app/types';

export default function ClientTable({
  clients,
  onDelete,
}: {
  clients: Client[];
  onDelete: (id: number) => void;
}) {
  const validClients = Array.isArray(clients)
    ? clients.filter(
        (c) =>
          c &&
          typeof c.id === 'number' &&
          typeof c.name === 'string' &&
          typeof c.email === 'string'
      )
    : [];

  if (validClients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border p-8 text-center">
        <div className="text-gray-400 mb-2">No clients found</div>
        <p className="text-sm text-gray-500">Create your first client to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {validClients.map((client, index) => (
              <tr key={client.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{client.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{client.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{client.company || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    className="text-red-600 hover:text-red-800 font-medium transition-colors"
                    onClick={() => onDelete(client.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
