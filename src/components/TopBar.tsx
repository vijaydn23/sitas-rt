'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function TopBar() {
  const params = useSearchParams();
  const embed = useMemo(() => params?.get('embed') === '1', [params]);

  if (embed) return null; // hide header when ?embed=1 (for Google Sites)

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image src="/logo.png" alt="SITAS NDT" width={40} height={40} priority />
          </Link>
          <div className="font-semibold">SITAS NDT ENGINEERS PVT LTD</div>
        </div>
        <nav className="text-sm flex gap-4">
          <Link href="/reports" className="underline">Reports</Link>
          <Link href="/entry" className="underline">Entry</Link>
          <Link href="/admin" className="underline">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
