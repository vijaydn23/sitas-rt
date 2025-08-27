// src/components/TopBar.tsx
'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function TopBar() {
  const search = useSearchParams();
  const isEmbed = search.get('embed') === '1';

  return (
    <header className={`border-b ${isEmbed ? 'hidden' : ''}`}>
      <div className="mx-auto max-w-7xl p-3 flex items-center gap-3">
        <img src="/logo.png" alt="SITAS" className="h-8 w-auto" />
        <span className="font-semibold">SITAS-NDT</span>
        <nav className="ml-auto flex gap-3 text-sm">
          <Link href="/reports" className="underline">Reports</Link>
          <Link href="/entry" className="underline">Entry</Link>
          <Link href="/admin" className="underline">Admin</Link>
          <Link href="/logout" className="underline">Sign out</Link>
        </nav>
      </div>
    </header>
  );
}
