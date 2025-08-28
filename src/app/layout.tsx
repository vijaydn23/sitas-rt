// D:\sitas-rt\src\app\layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';

// Client components (they use "use client" internally)
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
        {/* IMPORTANT: wrap any component that uses useSearchParams in Suspense */}
        <Suspense fallback={null}>
          <TopBar />
          <EmbedAuthNotice />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
