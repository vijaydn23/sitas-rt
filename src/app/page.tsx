'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data } = useSession();
  const role = (data?.user as any)?.role;

  return (
    <main className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Welcome to SITAS NDT</h1>
      <p className="text-gray-600">Login and use the Admin Console to create users and customers.</p>
      {!data?.user && <Link className="px-3 py-2 border rounded" href="/auth/sign-in">Sign in</Link>}
      {role === 'ADMIN' && <Link className="px-3 py-2 border rounded" href="/admin">Admin Console</Link>}
      {role === 'INCHARGE' && <Link className="px-3 py-2 border rounded" href="/entry">Incharge — My Customers</Link>}
      {role === 'CUSTOMER' && <Link className="px-3 py-2 border rounded" href="/reports">Customer — My Reports</Link>}
    </main>
  );
}
