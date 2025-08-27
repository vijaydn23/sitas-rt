// D:\sitas-rt\src\app\layout.tsx
import './globals.css';
import type { Metadata } from 'next';

// These are Client Components (with "use client") and can be imported in a Server layout:
import TopBar from '@/components/TopBar';
import EmbedAuthNotice from '@/components/EmbedAuthNotice';

export const metadata: Metadata = {
  title: 'SITAS NDT',
  description: 'Casting exposure & reporting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopBar />
        {/* Shows only when ?embed=1 and user is not signed in */}
        <EmbedAuthNotice />
        {children}
      </body>
    </html>
  );
}
