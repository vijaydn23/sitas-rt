'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useSessionProfile } from '@/lib/useSessionProfile';

type Role = 'admin' | 'site_incharge' | 'customer';

export default function RoleGate({
  allow,
  children,
}: {
  allow: Role[];
  children: ReactNode;
}) {
  const { loading, profile } = useSessionProfile();

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><div className="p-3 border rounded">Loading…</div></main>;
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="p-8 rounded-2xl border bg-white text-center space-y-3">
          <div className="text-lg font-semibold">Please sign in</div>
          <Link href="/auth/sign-in" className="px-4 py-2 rounded bg-black text-white">Sign in</Link>
        </div>
      </main>
    );
  }

  if (!allow.includes(profile.role)) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="p-8 rounded-2xl border bg-white text-center">
          <div className="font-semibold mb-2">No access</div>
          <div className="text-sm text-gray-600">Your role is <b>{profile.role}</b>.</div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
