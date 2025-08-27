// D:\sitas-rt\src\app\layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import TopBar from '@/components/TopBar';
import dynamic from 'next/dynamic';

// Load client-only banner without affecting SSR
const EmbedAuthNotice = dynamic(() => import('@/components/EmbedAuthNotice'), { ssr: false });

export const metadata: Metadata = {
  title: 'SITAS NDT',
  description: 'Casting exposure & reporting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopBar />
        {/* Shows ONLY inside Google Sites (embed=1) when not authenticated */}
        <EmbedAuthNotice />
        {children}
      </body>
    </html>
  );
}
