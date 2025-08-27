// D:\sitas-rt\src\app\admin\sources\page.tsx
'use client';

import { useEffect, useState } from 'react';
import RoleGate from '@/components/RoleGate';
import { supabase } from '@/lib/supabaseClient';

type SourceRow = {
  id: string;
  isotope: 'Ir-192' | 'Co-60';
  serial_no: string | null;
  a0_mbq: number;
  ref_date: string;  // ISO date
  notes: string | null;
};

export default function SourcesPage() {
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
    <RoleGate allow={['admin']}>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold mb-4">Sources</h1>
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
        </div>
      </main>
    </RoleGate>
  );
}
