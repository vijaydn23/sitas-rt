// D:\sitas-rt\src\app\admin\customer-accounts\page.tsx
'use client';

import { useEffect, useState } from 'react';
import RoleGate from '@/components/RoleGate';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'site_incharge' | 'customer';
  customer_id: string | null;
};

type Customer = { id: string; name: string; code: string | null };

export default function CustomerAccountsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // link form
  const [selCustomer, setSelCustomer] = useState('');
  const [selProfile, setSelProfile] = useState('');

  async function loadAll() {
    setErr(null);
    setLoading(true);

    const [c, p] = await Promise.all([
      supabase.from('customers').select('id,name,code').order('name', { ascending: true }),
      supabase.from('profiles').select('id,email,full_name,role,customer_id').eq('role', 'customer').order('email', { ascending: true }),
    ]);

    if (c.error) setErr(c.error.message); else setCustomers((c.data ?? []) as Customer[]);
    if (p.error) setErr(p.error.message); else setProfiles((p.data ?? []) as Profile[]);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function linkProfile() {
    setErr(null);
    if (!selCustomer || !selProfile) { setErr('Select both Customer and Customer User'); return; }

    const { error } = await supabase
      .from('profiles')
      .update({ customer_id: selCustomer })
      .eq('id', selProfile)
      .eq('role', 'customer');

    if (error) setErr(error.message);
    else { setSelCustomer(''); setSelProfile(''); await loadAll(); }
  }

  async function unlinkProfile(profileId: string) {
    setErr(null);
    const { error } = await supabase
      .from('profiles')
      .update({ customer_id: null })
      .eq('id', profileId)
      .eq('role', 'customer');

    if (error) setErr(error.message);
    else await loadAll();
  }

  function customerName(id: string | null) {
    if (!id) return '—';
    const c = customers.find(x => x.id === id);
    return c ? (c.code ? `${c.name} (${c.code})` : c.name) : '—';
  }

  const availableProfiles = profiles.filter(p => !p.customer_id); // unlinked only for the "Add link" dropdown

  return (
    <RoleGate allow={['admin']}>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <h1 className="text-2xl font-semibold">Customer Accounts</h1>
          {err && <div className="p-3 border rounded text-sm">❌ {err}</div>}

          {/* Add link */}
          <section className="p-4 border rounded-2xl">
            <h2 className="font-semibold mb-3">Link a customer user to a customer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">Customer</label>
                <select className="border rounded p-2 w-full" value={selCustomer} onChange={e=>setSelCustomer(e.target.value)}>
                  <option value="">-- select --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.code ? ` (${c.code})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Customer User (email)</label>
                <select className="border rounded p-2 w-full" value={selProfile} onChange={e=>setSelProfile(e.target.value)}>
                  <option value="">-- select --</option>
                  {availableProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name ? `${p.full_name} — ` : ''}{p.email}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-600 mt-1">Only unlinked customer users appear here.</div>
              </div>
              <div className="flex items-end">
                <button onClick={linkProfile} className="px-4 py-2 rounded bg-black text-white">Add link</button>
              </div>
            </div>
          </section>

          {/* Current links */}
          <section className="p-4 border rounded-2xl">
            <h2 className="font-semibold mb-3">Current links (customer users → customers)</h2>

            {loading ? (
              <div className="p-2 border rounded inline-block">Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Customer User</th>
                      <th className="p-2 text-left">Customer</th>
                      <th className="p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.filter(p => p.role === 'customer').map(p => (
                      <tr key={p.id} className="border-t">
                        <td className="p-2">{p.full_name ? `${p.full_name} — ` : ''}{p.email}</td>
                        <td className="p-2">{customerName(p.customer_id)}</td>
                        <td className="p-2">
                          {p.customer_id
                            ? <button onClick={() => unlinkProfile(p.id)} className="px-3 py-1 rounded border">Unlink</button>
                            : <span className="text-gray-500">—</span>}
                        </td>
                      </tr>
                    ))}
                    {profiles.filter(p => p.role === 'customer').length === 0 && (
                      <tr><td className="p-2 text-gray-500" colSpan={3}>No customer users yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="text-xs text-gray-600 mt-2">
              Hint: Create customer users by signing up or via Supabase Auth, then set their role to <b>customer</b> in Admin → Users &amp; Roles.
            </div>
          </section>
        </div>
      </main>
    </RoleGate>
  );
}
