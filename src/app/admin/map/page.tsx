// D:\sitas-rt\src\app\admin\map\page.tsx
'use client';

import { useEffect, useState } from 'react';
import RoleGate from '@/components/RoleGate';
import { supabase } from '@/lib/supabaseClient';

type Profile = { id: string; email: string; full_name: string | null; role: 'admin'|'site_incharge'|'customer' };
type Customer = { id: string; name: string; code: string | null };
type Mapping = { id: string; profile_id: string; customer_id: string; email: string; customer_name: string };

export default function MapPage() {
  const [incharges, setIncharges] = useState<Profile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [selIncharge, setSelIncharge] = useState('');
  const [selCustomer, setSelCustomer] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const [p, c, m] = await Promise.all([
      supabase.from('profiles').select('id, email, full_name, role').eq('role', 'site_incharge'),
      supabase.from('customers').select('id, name, code').order('name', { ascending: true }),
      supabase
        .from('site_incharge_customers')
        .select('id, profile_id, customer_id, profiles!inner(email), customers!inner(name)')
    ]);

    if (p.error) setErr(p.error.message); else setIncharges((p.data ?? []) as Profile[]);
    if (c.error) setErr(c.error.message); else setCustomers((c.data ?? []) as Customer[]);
    if (m.error) setErr(m.error.message);
    else {
      const rows = (m.data ?? []) as any[];
      setMappings(rows.map(r => ({
        id: r.id,
        profile_id: r.profile_id,
        customer_id: r.customer_id,
        email: r.profiles.email,
        customer_name: r.customers.name,
      } as Mapping)));
    }
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function addMapping() {
    setErr(null);
    if (!selIncharge || !selCustomer) { setErr('Select both Site Incharge and Customer'); return; }
    const { error } = await supabase
      .from('site_incharge_customers')
      .insert([{ profile_id: selIncharge, customer_id: selCustomer }]);
    if (error) setErr(error.message); else await loadAll();
  }

  async function deleteMapping(id: string) {
    const { error } = await supabase.from('site_incharge_customers').delete().eq('id', id);
    if (error) setErr(error.message); else await loadAll();
  }

  return (
    <RoleGate allow={['admin']}>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold mb-4">Map Site Incharge ↔ Customers</h1>
          {err && <div className="p-3 border rounded text-sm mb-3">❌ {err}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm mb-1">Site Incharge</label>
              <select className="border rounded p-2 w-full" value={selIncharge} onChange={e=>setSelIncharge(e.target.value)}>
                <option value="">-- select --</option>
                {incharges.map(i => <option key={i.id} value={i.id}>{i.full_name || i.email} ({i.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Customer</label>
              <select className="border rounded p-2 w-full" value={selCustomer} onChange={e=>setSelCustomer(e.target.value)}>
                <option value="">-- select --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.code ? ` (${c.code})` : ''}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={addMapping} className="px-4 py-2 rounded bg-black text-white">Add mapping</button>
            </div>
          </div>

          {loading ? (
            <div className="p-2 border rounded inline-block">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Site Incharge (email)</th>
                    <th className="p-2 text-left">Customer</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map(m => (
                    <tr key={m.id} className="border-t">
                      <td className="p-2">{m.email}</td>
                      <td className="p-2">{m.customer_name}</td>
                      <td className="p-2">
                        <button onClick={()=>deleteMapping(m.id)} className="px-3 py-1 rounded border">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {mappings.length === 0 && (
                    <tr><td className="p-2 text-gray-500" colSpan={3}>No mappings yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </RoleGate>
  );
}
