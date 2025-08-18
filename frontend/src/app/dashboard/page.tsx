'use client';

import { useEffect, useState } from 'react';
import InvoiceTable from '@/components/InvoiceTable';
import { fetchWithAuth } from '@/app/utils/fetchWithAuth';
import { Invoice, Client } from '@/app/types';
import { FileText, Users, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalInvoices: number;
  totalClients: number;
  paidTotal: number;
  unpaidTotal: number;
  recentInvoices: Invoice[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalClients: 0,
    paidTotal: 0,
    unpaidTotal: 0,
    recentInvoices: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, clientsRes] = await Promise.all([
        fetchWithAuth('/invoices'),
        fetchWithAuth('/clients'),
      ]);

      if (invoicesRes.status === 401 || clientsRes.status === 401) {
        console.error('Authentication failed, redirecting to login');
        window.location.replace('/login');
        return;
      }

      const invoices: Invoice[] = invoicesRes.ok ? await invoicesRes.json() : [];
      const clients: Client[] = clientsRes.ok ? await clientsRes.json() : [];

      const paidTotal = invoices
        .filter(inv => inv.paid)
        .reduce((sum, inv) => sum + inv.amount, 0);

      const unpaidTotal = invoices
        .filter(inv => !inv.paid)
        .reduce((sum, inv) => sum + inv.amount, 0);

      setStats({
        totalInvoices: invoices.length,
        totalClients: clients.length,
        paidTotal,
        unpaidTotal,
        recentInvoices: invoices.slice(0, 5),
      });
    } catch (error) {
      console.error('Fetch error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Possible authentication issue, redirecting to login');
        window.location.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkPaid = async (id: number) => {
    try {
      const response = await fetchWithAuth(`/invoices/${id}/pay`, {
        method: 'PATCH',
      });
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error marking paid:', error);
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    try {
      const response = await fetchWithAuth(`/invoices/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalInvoices}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Total</p>
              <p className="text-3xl font-bold text-green-600">${stats.paidTotal.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unpaid Total</p>
              <p className="text-3xl font-bold text-red-600">${stats.unpaidTotal.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Revenue Status</h3>
          <div className="relative">
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={`${(stats.paidTotal / (stats.paidTotal + stats.unpaidTotal)) * 251.2 || 0} 251.2`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold">
                    {stats.paidTotal + stats.unpaidTotal > 0 
                      ? Math.round((stats.paidTotal / (stats.paidTotal + stats.unpaidTotal)) * 100) 
                      : 0}%
                  </span>
                  <span className="text-sm text-gray-600">Paid</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Paid (${stats.paidTotal.toFixed(2)})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                <span className="text-sm">Unpaid (${stats.unpaidTotal.toFixed(2)})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Revenue Comparison</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Paid Revenue</span>
                <span className="text-sm text-gray-500">${stats.paidTotal.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${stats.paidTotal + stats.unpaidTotal > 0 
                      ? (stats.paidTotal / (stats.paidTotal + stats.unpaidTotal)) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Unpaid Revenue</span>
                <span className="text-sm text-gray-500">${stats.unpaidTotal.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${stats.paidTotal + stats.unpaidTotal > 0 
                      ? (stats.unpaidTotal / (stats.paidTotal + stats.unpaidTotal)) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                <span className="text-sm font-bold">${(stats.paidTotal + stats.unpaidTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Invoices</h3>
        </div>
        <div className="p-6">
          <InvoiceTable
            invoices={stats.recentInvoices}
            onMarkPaid={handleMarkPaid}
            onDelete={handleDeleteInvoice}
          />
        </div>
      </div>
    </div>
  );
}
