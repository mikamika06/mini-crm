'use client';

import { useEffect, useState } from 'react';
import InvoiceTable from '@/components/InvoiceTable';

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('http://localhost:3333/invoices', {
        credentials: 'include',
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        console.error('Received non-array response:', data);
        setInvoices([]); 
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setInvoices([]); 
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const paidTotal = safeInvoices
    .filter(i => i && typeof i.paid === 'boolean' && i.paid)
    .reduce((sum, i) => sum + (typeof i.amount === 'number' ? i.amount : 0), 0);

  const unpaidTotal = safeInvoices
    .filter(i => i && typeof i.paid === 'boolean' && !i.paid)
    .reduce((sum, i) => sum + (typeof i.amount === 'number' ? i.amount : 0), 0);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="flex gap-8 text-lg">
        <div>📦 Total Invoices: {safeInvoices.length}</div>
        <div>✅ Paid Total: ${paidTotal.toFixed(2)}</div>
        <div>❌ Unpaid Total: ${unpaidTotal.toFixed(2)}</div>
      </div>

      <InvoiceTable
        invoices={safeInvoices.slice(0, 5)}
        onMarkPaid={(id: number) => {
          setInvoices(prev =>
            prev.map(inv =>
              inv.id === id ? { ...inv, paid: true } : inv
            )
          );
        }}
      />
    </div>
  );
}
