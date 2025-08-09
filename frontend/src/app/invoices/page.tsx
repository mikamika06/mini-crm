'use client';

import { useState, useEffect } from 'react';
import InvoiceTable from '@/components/InvoiceTable';
import InvoiceForm from '@/components/InvoiceForm';
import { fetchWithAuth } from '@/app/utils/fetchWithAuth';
import { Invoice } from '@/app/types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('http://localhost:3333/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      } else {
        setError('Failed to load invoices');
      }
    } catch (error) {
      setError('Failed to load invoices');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleInvoiceCreated = () => {
    setShowForm(false);
    fetchInvoices();
  };

  const handleMarkPaid = async (id: number) => {
    try {
      const response = await fetchWithAuth(`http://localhost:3333/invoices/${id}/pay`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        fetchInvoices();
      } else {
        setError('Failed to update invoice');
      }
    } catch (error) {
      setError('Failed to update invoice');
      console.error('Error:', error);
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    try {
      const response = await fetchWithAuth(`http://localhost:3333/invoices/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchInvoices();
      } else {
        setError('Failed to delete invoice');
      }
    } catch (error) {
      setError('Failed to delete invoice');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading invoices...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {showForm ? 'Cancel' : 'Create Invoice'}
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
            <InvoiceForm onInvoiceCreated={handleInvoiceCreated} />
          </div>
        )}
        
        <div className={showForm ? "lg:col-span-1" : "lg:col-span-2"}>
          <InvoiceTable invoices={invoices} onMarkPaid={handleMarkPaid} onDelete={handleDeleteInvoice} />
        </div>
      </div>
    </div>
  );
}
