import "@/styles/globals.css";
import { ReactNode } from "react";
import { headers } from "next/headers";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mini CRM",
  description: "Simple CRM for freelancers",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";
  const isAuthPage = ["/", "/login", "/register"].includes(pathname);

  return (
    <html lang="en">
      <body className="h-full bg-gray-50 text-gray-800 antialiased">
        {isAuthPage ? (
          <main>{children}</main>
        ) : (
          <div className="flex h-full">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <TopBar />
              <main className="flex-1 overflow-y-auto p-6 bg-white">{children}</main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}