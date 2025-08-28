// D:\sitas-rt\src\app\layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';

// These are client components (they include "use client" at the top)
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
        {/* Anything that calls useSearchParams() must live inside Suspense */}
        <Suspense fallback={null}>
          <TopBar />
          <EmbedAuthNotice />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
