'use client';

export default function InvoiceTable({ invoices }: { invoices: any[] }) {
  return (
    <table className="w-full border mt-4">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-2">Client</th>
          <th className="p-2">Amount</th>
          <th className="p-2">Due Date</th>
          <th className="p-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map(inv => (
          <tr key={inv.id} className="border-t">
            <td className="p-2">{inv.client?.name || 'Unknown'}</td>
            <td className="p-2">${inv.amount}</td>
            <td className="p-2">{new Date(inv.dueDate).toLocaleDateString()}</td>
            <td className="p-2">{inv.paid ? '✅ Paid' : '❌ Unpaid'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
