"use client";

import { Search } from "lucide-react";

export default function TopBar() {
  return (
    <header className="h-14 px-6 flex items-center justify-between border-b bg-white/90 backdrop-blur sticky top-0 z-10">
      {/* search */}
      <div className="relative w-72 max-w-full">
        <input
          type="text"
          placeholder="Search…"
          className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/60"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {/* user */}
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden sm:inline">Hi, John</span>
        <img
          src="https://i.pravatar.cc/32"
          alt="avatar"
          className="h-8 w-8 rounded-full border"
        />
      </div>
    </header>
  );
}