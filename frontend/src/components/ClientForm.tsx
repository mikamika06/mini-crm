"use client";

import { useState } from "react";
import { Client } from "../app/types";

export default function InvoiceForm({
  clients,
  onCreate,
}: {
  clients: Client[];
  onCreate: (dto: any) => void;
}) {
  const [form, setForm] = useState({
    clientId: clients[0]?.id ?? 0,
    amount: 0,
    dueDate: new Date().toISOString().slice(0, 10),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ ...form, amount: Number(form.amount) });
    setForm({ ...form, amount: 0 });
  };

  return (
    <form className="flex flex-wrap gap-4 items-end" onSubmit={submit}>
      <select
        className="border p-2 rounded-lg"
        value={form.clientId}
        onChange={(e) => setForm({ ...form, clientId: Number(e.target.value) })}
      >
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Amount"
        className="border p-2 rounded-lg"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
        required
      />

      <input
        type="date"
        className="border p-2 rounded-lg"
        value={form.dueDate}
        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        required
      />

      <button className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand/90">
        Save
      </button>
    </form>
  );
}