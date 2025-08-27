// D:\sitas-rt\src\app\dashboard\page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type AppRole = 'admin' | 'site_incharge' | 'customer';
type ProfileRow = { id: string; email: string; full_name: string | null; role: AppRole };

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [self, setSelf] = useState<ProfileRow | null>(null);
  const [allProfiles, setAllProfiles] = useState<ProfileRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // 1) ensure signed in
      const { data: s } = await supabase.auth.getSession();
      const user = s.session?.user ?? null;
      if (!user) { window.location.href = '/auth/sign-in'; return; }

      // 2) load own profile
      const me = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', user.id)
        .single<ProfileRow>();
      if (me.error) { setErr(me.error.message); setLoading(false); return; }
      setSelf(me.data);

      // 3) if admin → load everyone (RLS policy allows)
      if (me.data.role === 'admin') {
        const all = await supabase
          .from('profiles')
          .select('id, email, full_name, role')
          .order('role', { ascending: true })
          .order('email', { ascending: true });
        if (all.error) { setErr(all.error.message); setLoading(false); return; }
        setAllProfiles(all.data as ProfileRow[]);
      }

      setLoading(false);
    })();
  }, []);

  const admins = useMemo(() => allProfiles.filter(p => p.role === 'admin'), [allProfiles]);
  const incharges = useMemo(() => allProfiles.filter(p => p.role === 'site_incharge'), [allProfiles]);
  const customers = useMemo(() => allProfiles.filter(p => p.role === 'customer'), [allProfiles]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="p-6 rounded-2xl shadow border">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-8 rounded-2xl shadow border w-full max-w-4xl space-y-5">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {err && <div className="p-3 border rounded text-sm">❌ {err}</div>}

        {self && (
          <div className="p-4 border rounded-2xl">
            <div className="text-sm">
              <b>You:</b> {self.full_name || '—'} &lt;{self.email}&gt; — <b>{self.role}</b>
            </div>
            <div className="flex gap-3 pt-3">
              <Link href="/" className="px-4 py-2 rounded border">Home</Link>
              <Link href="/reports" className="px-4 py-2 rounded border">Reports</Link>
              {(self.role === 'admin' || self.role === 'site_incharge') &&
                <Link href="/entry" className="px-4 py-2 rounded border">Entry</Link>}
              {self.role === 'admin' &&
                <Link href="/admin" className="px-4 py-2 rounded border">Admin</Link>}
              <Link href="/logout" className="px-4 py-2 rounded bg-black text-white">Sign out</Link>
            </div>
          </div>
        )}

        {/* Admin-only lists */}
        {self?.role === 'admin' && (
          <div className="space-y-5">
            <UserList title="Admins" rows={admins} />
            <UserList title="Site Incharge" rows={incharges} />
            <UserList title="Customers" rows={customers} />
          </div>
        )}
      </div>
    </main>
  );
}

function UserList({ title, rows }: { title: string; rows: ProfileRow[] }) {
  return (
    <section className="p-4 border rounded-2xl">
      <h2 className="font-semibold mb-3">{title}</h2>
      {rows.length === 0 ? (
        <div className="text-sm text-gray-600">None</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Full name</th>
                <th className="p-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.full_name || '—'}</td>
                  <td className="p-2">{r.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
