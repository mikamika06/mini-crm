import "@/styles/globals.css";
import { ReactNode } from "react";
import type { Metadata } from "next";
import { MiddlewareDebug } from "@/components/MiddlewareDebug";
import { AuthProvider } from "@/contexts/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "Mini CRM",
  description: "Simple CRM for freelancers",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-800 antialiased">
        <AuthProvider>
          <MiddlewareDebug />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}