'use client';

import { useState } from 'react';

export default function ClientForm({ onCreate }: { onCreate: (client: any) => void }) {
  const [form, setForm] = useState({ name: '', email: '', company: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(form);
    setForm({ name: '', email: '', company: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-end">
      <input
        className="border p-2 rounded"
        placeholder="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        className="border p-2 rounded"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        required
      />
      <input
        className="border p-2 rounded"
        placeholder="Company"
        value={form.company}
        onChange={e => setForm({ ...form, company: e.target.value })}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add
      </button>
    </form>
  );
}
