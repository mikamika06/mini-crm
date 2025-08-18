import "@/styles/globals.css";
import { ReactNode } from "react";
import type { Metadata } from "next";
import ClientLayout from "@/components/ClientLayout";
import { MiddlewareDebug } from "@/components/MiddlewareDebug";

export const metadata: Metadata = {
  title: "Mini CRM",
  description: "Simple CRM for freelancers",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-800 antialiased">
        <MiddlewareDebug />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}