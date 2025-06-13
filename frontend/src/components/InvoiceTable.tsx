"use client";

import { Invoice } from "../app/types";

export default function InvoiceTable({
  invoices,
  onMarkPaid,
}: {
  invoices: Invoice[];
  onMarkPaid: (id: number) => void;
}) {
  if (!invoices.length)
    return <div className="text-gray-500">No invoices.</div>;

  return (
    <table className="w-full text-sm border rounded-lg overflow-hidden shadow-sm">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="px-4 py-3">#</th>
          <th className="px-4 py-3">Client</th>
          <th className="px-4 py-3">Amount</th>
          <th className="px-4 py-3">Due</th>
          <th className="px-4 py-3">Status</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv, i) => (
          <tr key={inv.id} className={i % 2 ? "bg-gray-50" : ""}>
            <td className="px-4 py-2">{inv.id}</td>
            <td className="px-4 py-2">{inv.client?.name ?? "-"}</td>
            <td className="px-4 py-2">${inv.amount.toFixed(2)}</td>
            <td className="px-4 py-2">{new Date(inv.dueDate).toLocaleDateString()}</td>
            <td className="px-4 py-2">
              {inv.paid ? (
                <span className="text-green-600">Paid</span>
              ) : (
                <button
                  onClick={() => onMarkPaid(inv.id)}
                  className="text-red-600 hover:underline"
                >
                  Mark as paid
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}