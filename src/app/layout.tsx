// D:\sitas-rt\src\app\layout.tsx
import './globals.css';
import type { Metadata } from 'next';

// These two are Client Components (they have "use client" inside),
// but it's OK to import them in a Server layout.
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
