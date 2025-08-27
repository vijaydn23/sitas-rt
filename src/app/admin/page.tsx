// D:\sitas-rt\src\app\admin\page.tsx
'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import RoleGate from '@/components/RoleGate';
import { supabase } from '@/lib/supabaseClient';

type AppRole = 'admin' | 'site_incharge' | 'customer';

type Profile = { id: string; email: string; full_name: string | null; role: AppRole };
type Customer = { id: string; name: string; code: string | null };
type Mapping = { id: string; profile_id: string; customer_id: string; email: string; customer_name: string };

type SourceRow = {
  id: string;
  isotope: 'Ir-192' | 'Co-60';
  serial_no: string | null;
  a0_mbq: number;
  ref_date: string;  // ISO date
  notes: string | null;
};

type ChartRow = {
  id: string;
  isotope: 'Ir-192' | 'Co-60';
  technique: string;
  film_speed: string;
  material: string;
  thickness_min_mm: number;
  thickness_max_mm: number;
  base_constant: number;
  alpha: number;
  remarks: string | null;
};

export default function AdminPage() {
  return (
    <RoleGate allow={['admin']}>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <h1 className="text-2xl font-semibold">Admin Console</h1>
          <UsersAndRoles />
          <InchargeMapping />
          <SourcesManager />
          <ChartManager />
        </div>
      </main>
    </RoleGate>
  );
}

/* =========================================
   1) Users & Roles
   ========================================= */
function UsersAndRoles() {
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
    <section className="p-4 border rounded-2xl">
      <h2 className="font-semibold mb-3">Users & Roles</h2>
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
            Tip: To add a new user, use the Sign-up page (or Supabase Auth dashboard). In-app invites require a secure server route with the service role key.
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================================
   2) Mapping: Site Incharge ↔ Customers
   ========================================= */
function InchargeMapping() {
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
      const rows: Mapping[] = (m.data ?? []).map((r: any) => ({
        id: r.id,
        profile_id: r.profile_id,
        customer_id: r.customer_id,
        email: r.profiles.email,
        customer_name: r.customers.name,
      }));
      setMappings(rows);
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
    <section className="p-4 border rounded-2xl">
      <h2 className="font-semibold mb-3">Map Site Incharge ↔ Customers</h2>
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
    </section>
  );
}

/* =========================================
   3) Sources manager
   ========================================= */
function SourcesManager() {
  const blank: Partial<SourceRow> = { isotope: 'Ir-192', serial_no: '', a0_mbq: 0, ref_date: new Date().toISOString().slice(0,10), notes: '' };
  const [rows, setRows] = useState<SourceRow[]>([]);
  const [form, setForm] = useState<Partial<SourceRow>>(blank);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase.from('sources').select('*').order('isotope', { ascending: true }).order('ref_date', { ascending: false });
    if (error) setErr(error.message); else setRows((data ?? []) as SourceRow[]);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    setErr(null);
    if (!form.a0_mbq || !form.ref_date) { setErr('A0 and ref_date required'); return; }
    const { error } = await supabase.from('sources').insert([{
      isotope: form.isotope, serial_no: form.serial_no || null,
      a0_mbq: Number(form.a0_mbq), ref_date: form.ref_date,
      notes: form.notes || null
    }]);
    if (error) setErr(error.message); else { setForm(blank); await load(); }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('sources').delete().eq('id', id);
    if (error) setErr(error.message); else await load();
  }

  return (
    <section className="p-4 border rounded-2xl">
      <h2 className="font-semibold mb-3">Sources</h2>
      {err && <div className="p-3 border rounded text-sm mb-3">❌ {err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
        <div>
          <label className="block text-sm mb-1">Isotope</label>
          <select className="border rounded p-2 w-full" value={form.isotope as any} onChange={e=>setForm({...form, isotope: e.target.value as any})}>
            <option>Ir-192</option>
            <option>Co-60</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Serial No</label>
          <input className="border rounded p-2 w-full" value={form.serial_no || ''} onChange={e=>setForm({...form, serial_no: e.target.value})}/>
        </div>
        <div>
          <label className="block text-sm mb-1">A₀ (MBq)</label>
          <input type="number" className="border rounded p-2 w-full" value={form.a0_mbq as any} onChange={e=>setForm({...form, a0_mbq: Number(e.target.value)})}/>
        </div>
        <div>
          <label className="block text-sm mb-1">Ref date</label>
          <input type="date" className="border rounded p-2 w-full" value={form.ref_date as any} onChange={e=>setForm({...form, ref_date: e.target.value})}/>
        </div>
        <div className="flex items-end"><button onClick={add} className="px-4 py-2 rounded bg-black text-white">Add source</button></div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Isotope</th>
              <th className="p-2 text-left">Serial</th>
              <th className="p-2 text-left">A₀ (MBq)</th>
              <th className="p-2 text-left">Ref date</th>
              <th className="p-2 text-left">Notes</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.isotope}</td>
                <td className="p-2">{r.serial_no || '—'}</td>
                <td className="p-2">{r.a0_mbq.toLocaleString()}</td>
                <td className="p-2">{r.ref_date}</td>
                <td className="p-2">{r.notes || '—'}</td>
                <td className="p-2">
                  <button onClick={()=>remove(r.id)} className="px-3 py-1 rounded border">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="p-2 text-gray-500" colSpan={6}>No sources yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* =========================================
   4) Exposure chart manager
   ========================================= */
function ChartManager() {
  const blank: Partial<ChartRow> = {
    isotope: 'Ir-192', technique: 'SW/SI', film_speed: 'D7', material: 'steel',
    thickness_min_mm: 1, thickness_max_mm: 50, base_constant: 120, alpha: 0.8, remarks: ''
  };
  const [rows, setRows] = useState<ChartRow[]>([]);
  const [form, setForm] = useState<Partial<ChartRow>>(blank);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase.from('exposure_chart').select('*').order('isotope', { ascending: true });
    if (error) setErr(error.message); else setRows((data ?? []) as ChartRow[]);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    setErr(null);
    const { error } = await supabase.from('exposure_chart').insert([{
      isotope: form.isotope,
      technique: form.technique,
      film_speed: form.film_speed,
      material: form.material,
      thickness_min_mm: Number(form.thickness_min_mm),
      thickness_max_mm: Number(form.thickness_max_mm),
      base_constant: Number(form.base_constant),
      alpha: Number(form.alpha),
      remarks: form.remarks || null
    }]);
    if (error) setErr(error.message); else { setForm(blank); await load(); }
  }

  async function removeRow(id: string) {
    const { error } = await supabase.from('exposure_chart').delete().eq('id', id);
    if (error) setErr(error.message); else await load();
  }

  return (
    <section className="p-4 border rounded-2xl">
      <h2 className="font-semibold mb-3">Exposure Chart</h2>
      {err && <div className="p-3 border rounded text-sm mb-3">❌ {err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
        <div>
          <label className="block text-sm mb-1">Isotope</label>
          <select className="border rounded p-2 w-full" value={form.isotope as any} onChange={e=>setForm({...form, isotope: e.target.value as any})}>
            <option>Ir-192</option>
            <option>Co-60</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Technique</label>
          <input className="border rounded p-2 w-full" value={form.technique as any} onChange={e=>setForm({...form, technique: e.target.value})}/>
        </div>
        <div>
          <label className="block text-sm mb-1">Film</label>
          <input className="border rounded p-2 w-full" value={form.film_speed as any} onChange={e=>setForm({...form, film_speed: e.target.value})}/>
        </div>
        <div>
          <label className="block text-sm mb-1">Material</label>
          <input className="border rounded p-2 w-full" value={form.material as any} onChange={e=>setForm({...form, material: e.target.value})}/>
        </div>
        <div>
          <label className="block text-sm mb-1">Thk min (mm)</label>
          <input type="number" className="border rounded p-2 w-full" value={form.thickness_min_mm as any} onChange={e=>setForm({...form, thickness_min_mm: Number(e.target.value)})}/>
        </div>
        <div>
          <label className="block text-sm mb-1">Thk max (mm)</label>
          <input type="number" className="border rounded p-2 w-full" value={form.thickness_max_mm as any} onChange={e=>setForm({...form, thickness_max_mm: Number(e.target.value)})}/>
        </div>
        <div>
          <label className="block text-sm mb-1">Base K</label>
          <input type="number" className="border rounded p-2 w-full" value={form.base_constant as any} onChange={e=>setForm({...form, base_constant: Number(e.target.value)})}/>
        </div>
        <div>
          <label className="block text-sm mb-1">Alpha</label>
          <input type="number" step="0.01" className="border rounded p-2 w-full" value={form.alpha as any} onChange={e=>setForm({...form, alpha: Number(e.target.value)})}/>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Remarks</label>
          <input className="border rounded p-2 w-full" value={form.remarks as any} onChange={e=>setForm({...form, remarks: e.target.value})}/>
        </div>
        <div className="flex items-end">
          <button onClick={add} className="px-4 py-2 rounded bg-black text-white">Add row</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Isotope</th>
              <th className="p-2 text-left">Technique</th>
              <th className="p-2 text-left">Film</th>
              <th className="p-2 text-left">Material</th>
              <th className="p-2 text-left">Thk range (mm)</th>
              <th className="p-2 text-left">K</th>
              <th className="p-2 text-left">α</th>
              <th className="p-2 text-left">Remarks</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.isotope}</td>
                <td className="p-2">{r.technique}</td>
                <td className="p-2">{r.film_speed}</td>
                <td className="p-2">{r.material}</td>
                <td className="p-2">{r.thickness_min_mm} – {r.thickness_max_mm}</td>
                <td className="p-2">{r.base_constant}</td>
                <td className="p-2">{r.alpha}</td>
                <td className="p-2">{r.remarks || '—'}</td>
                <td className="p-2">
                  <button onClick={()=>removeRow(r.id)} className="px-3 py-1 rounded border">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="p-2 text-gray-500" colSpan={9}>No rows yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
