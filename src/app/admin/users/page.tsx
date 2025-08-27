// D:\sitas-rt\src\app\admin\users\page.tsx
'use client';

import { useEffect, useState } from 'react';
import RoleGate from '@/components/RoleGate';
import { supabase } from '@/lib/supabaseClient';

type AppRole = 'admin' | 'site_incharge' | 'customer';
type Profile = { id: string; email: string; full_name: string | null; role: AppRole };

export default function UsersPage() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .order('role', { ascending: true })
      .order('email', { ascending: true });

    if (error) setErr(error.message);
    else setRows((data ?? []) as Profile[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateRole(id: string, role: AppRole) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) setErr('Update failed: ' + error.message);
    else await load();
  }

  return (
    <RoleGate allow={['admin']}>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold mb-4">Users & Roles</h1>
          {err && <div className="p-3 border rounded text-sm mb-3">❌ {err}</div>}

          {loading ? (
            <div className="p-2 border rounded inline-block">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Full name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">{r.full_name || '—'}</td>
                      <td className="p-2">{r.email}</td>
                      <td className="p-2">
                        <select
                          className="border rounded p-1"
                          value={r.role}
                          onChange={e => updateRole(r.id, e.target.value as AppRole)}
                        >
                          <option value="admin">admin</option>
                          <option value="site_incharge">site_incharge</option>
                          <option value="customer">customer</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-xs text-gray-600 mt-2">
                Tip: Add a new user via Sign-up page or Supabase Auth dashboard, then set their role here.
              </div>
            </div>
          )}
        </div>
      </main>
    </RoleGate>
  );
}
