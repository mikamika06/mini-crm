'use client';

export default function ClientTable({
  clients,
  onDelete,
}: {
  clients: any[];
  onDelete: (id: number) => void;
}) {
  // Фільтрація тільки валідних об'єктів
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
    return <div className="text-gray-500 mt-4">No clients found or invalid data.</div>;
  }

  return (
    <table className="w-full border mt-4">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-2">Name</th>
          <th className="p-2">Email</th>
          <th className="p-2">Company</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {validClients.map((client) => (
          <tr key={client.id} className="border-t">
            <td className="p-2">{client.name}</td>
            <td className="p-2">{client.email}</td>
            <td className="p-2">{client.company || '-'}</td>
            <td className="p-2">
              <button
                className="text-red-600 hover:underline"
                onClick={() => onDelete(client.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
