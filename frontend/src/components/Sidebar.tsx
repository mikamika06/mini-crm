"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Receipt,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/invoices", label: "Invoices", icon: Receipt },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="h-full w-64 min-w-[16rem] border-r bg-white shadow-sm flex flex-col">
      <div className="px-6 py-4 text-2xl font-bold text-brand">Mini CRM</div>

      <nav className="flex-1 px-2 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path?.startsWith(href) || false;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition hover:bg-gray-100 ${
                active ? "bg-brand/10 text-brand font-medium" : "text-gray-700"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t">
        <LogoutButton />
      </div>
    </aside>
  );
}