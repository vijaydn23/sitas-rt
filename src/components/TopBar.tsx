'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useSessionProfile } from '@/lib/useSessionProfile';

export default function TopBar() {
  const search = useSearchParams();
  const embed = search?.get('embed') === '1'; // hide header in embed mode
  const { profile } = useSessionProfile();

  if (embed) return null;

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/sitas-logo.png"
            alt="SITAS NDT"
            width={36}
            height={36}
            priority
          />
          <span className="font-semibold">SITAS NDT</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/reports" className="underline">Reports</Link>
          {profile?.role !== 'customer' && <Link href="/entry" className="underline">Entry</Link>}
          {profile?.role === 'admin' && <Link href="/admin" className="underline">Admin</Link>}
          {!profile && <Link href="/auth/sign-in" className="px-3 py-1 rounded border">Sign in</Link>}
          {profile && <Link href="/logout" className="px-3 py-1 rounded border">Sign out</Link>}
        </nav>
      </div>
    </header>
  );
}
