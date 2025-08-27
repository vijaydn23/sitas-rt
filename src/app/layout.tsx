// D:\sitas-rt\src\app\layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import TopBar from '@/components/TopBar';

export const metadata: Metadata = {
  title: 'SITAS NDT',
  description: 'Casting exposure & reporting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopBar />
        {children}
      </body>
    </html>
  );
}
