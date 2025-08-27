'use client';

import Link from 'next/link';
import { useSessionProfile } from '@/lib/useSessionProfile';

export default function Home() {
  const { loading, profile } = useSessionProfile();

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="p-8 rounded-2xl shadow border max-w-xl w-full text-center space-y-4 bg-white">
        <div className="flex items-center justify-center gap-3">
          <img src="/logo.png" width={48} height={48} alt="SITAS-NDT" className="rounded" />
          <h1 className="text-2xl font-semibold">SITAS-NDT</h1>
        </div>

        {loading && <div className="p-3 border rounded inline-block">Loading…</div>}

        {!loading && (
          <>
            <div className="text-sm">
              {profile
                ? <>Signed in as <b>{profile.email}</b> — role <b>{profile.role}</b></>
                : <>Not signed in.</>}
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              {!profile && <Link href="/auth/sign-in" className="px-4 py-2 rounded bg-black text-white">Sign in</Link>}
              {!profile && <Link href="/auth/sign-up" className="px-4 py-2 rounded border">Sign up</Link>}

              {profile && <Link href="/reports" className="px-4 py-2 rounded border">Reports</Link>}
              {profile && profile.role !== 'customer' && (
                <Link href="/entry" className="px-4 py-2 rounded border">Entry</Link>
              )}
              {profile && profile.role === 'admin' && (
                <Link href="/admin" className="px-4 py-2 rounded border">Admin</Link>
              )}
              {profile && <Link href="/logout" className="px-4 py-2 rounded bg-black text-white">Sign out</Link>}
            </div>

            <div className="rounded-2xl border p-6 text-xl">Tailwind is working ✅</div>
          </>
        )}
      </div>
    </main>
  );
}
