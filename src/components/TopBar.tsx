'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function TopBar() {
  const { data } = useSession();
  const role = (data?.user as any)?.role;

  return (
    <header className="p-4 border-b flex items-center justify-between">
      <Link href="/" className="font-semibold">SITAS-NDT</Link>
      <div className="space-x-3">
        {!data?.user ? (
          <Link href="/auth/sign-in" className="px-3 py-1 border rounded">Sign in</Link>
        ) : (
          <>
            {role === 'ADMIN' && <Link href="/admin" className="px-3 py-1 border rounded">Admin</Link>}
            {role === 'INCHARGE' && <Link href="/entry" className="px-3 py-1 border rounded">Entry</Link>}
            {role === 'CUSTOMER' && <Link href="/reports" className="px-3 py-1 border rounded">Reports</Link>}
            <button onClick={() => signOut({ callbackUrl: '/' })} className="px-3 py-1 border rounded">Sign out</button>
          </>
        )}
      </div>
    </header>
  );
}
