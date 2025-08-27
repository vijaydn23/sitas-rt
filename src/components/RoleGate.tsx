// D:\sitas-rt\src\components\RoleGate.tsx
'use client';

import Link from 'next/link';
import { useSessionProfile } from '@/lib/useSessionProfile';

// Keep type for reference, but we accept string[] to avoid TS errors in pages
type Role = 'admin' | 'site_incharge' | 'customer';

export default function RoleGate({
  allow,
  children,
}: {
  // accept Role or string to be flexible in pages
  allow: Array<Role | string>;
  children: React.ReactNode;
}) {
  const { profile, loading } = useSessionProfile();

  if (loading) {
    return <div className="p-3 border rounded inline-block">Loading…</div>;
  }

  if (!profile || !allow.includes(profile.role)) {
    return (
      <div className="p-4 border rounded">
        <div className="mb-2">You don’t have access to this page.</div>
        <Link href="/" className="underline">Go home</Link>
      </div>
    );
  }

  return <>{children}</>;
}
