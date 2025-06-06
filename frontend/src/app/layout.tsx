import '../styles/global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mini CRM',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
