import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mini CRM",
  description: "Simple CRM for freelancers",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex bg-gray-50 text-gray-800 antialiased">
        {/* Sidebar */}
        <Sidebar />

        {/* Main wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top navigation bar */}
          <TopBar />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6 bg-white shadow-inner rounded-tl-2xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}