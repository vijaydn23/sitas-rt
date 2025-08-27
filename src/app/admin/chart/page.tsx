// D:\sitas-rt\src\app\admin\chart\page.tsx
'use client';

import { useEffect, useState } from 'react';
import RoleGate from '@/components/RoleGate';
import { supabase } from '@/lib/supabaseClient';

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

export default function ChartPage() {
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
    <RoleGate allow={['admin']}>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold mb-4">Exposure Chart</h1>
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
        </div>
      </main>
    </RoleGate>
  );
}
