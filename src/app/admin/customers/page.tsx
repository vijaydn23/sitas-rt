// D:\sitas-rt\src\app\admin\customers\page.tsx
'use client';

import { useEffect, useState } from 'react';
import RoleGate from '@/components/RoleGate';
import { supabase } from '@/lib/supabaseClient';

type Customer = { id: string; name: string; code: string | null };

export default function CustomersPage() {
  const blank: Partial<Customer> = { name: '', code: '' };

  const [rows, setRows] = useState<Customer[]>([]);
  const [form, setForm] = useState<Partial<Customer>>(blank);
  const [edit, setEdit] = useState<Partial<Customer> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, code')
      .order('name', { ascending: true });

    if (error) setErr(error.message); else setRows((data ?? []) as Customer[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function add() {
    setErr(null);
    if (!form.name?.trim()) { setErr('Name is required'); return; }
    const { error } = await supabase.from('customers').insert([{
      name: form.name!.trim(),
      code: form.code?.trim() || null,
    }]);
    if (error) setErr(error.message); else { setForm(blank); await load(); }
  }

  async function startEdit(c: Customer) {
    setEdit({ ...c });
  }

  async function saveEdit() {
    if (!edit?.id) return;
    if (!edit.name?.trim()) { setErr('Name is required'); return; }
    const { error } = await supabase
      .from('customers')
      .update({ name: edit.name!.trim(), code: edit.code?.trim() || null })
      .eq('id', edit.id);
    if (error) setErr(error.message); else { setEdit(null); await load(); }
  }

  async function remove(id: string) {
    if (!confirm('Delete this customer?')) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) setErr(error.message); else await load();
  }

  return (
    <RoleGate allow={['ADMIN']}>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <h1 className="text-2xl font-semibold">Customers</h1>
          {err && <div className="p-3 border rounded text-sm">❌ {err}</div>}

          {/* Create */}
          <section className="p-4 border rounded-2xl">
            <h2 className="font-semibold mb-3">Add Customer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input className="border rounded p-2 w-full"
                  value={form.name as string}
                  onChange={e=>setForm({...form, name: e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm mb-1">Code (optional)</label>
                <input className="border rounded p-2 w-full"
                  value={form.code as string}
                  onChange={e=>setForm({...form, code: e.target.value})}/>
              </div>
              <div className="flex items-end">
                <button onClick={add} className="px-4 py-2 rounded bg-black text-white">Add</button>
              </div>
            </div>
          </section>

          {/* List + Edit */}
          <section className="p-4 border rounded-2xl">
            <h2 className="font-semibold mb-3">All Customers</h2>

            {loading ? (
              <div className="p-2 border rounded inline-block">Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Code</th>
                      <th className="p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr><td className="p-2 text-gray-500" colSpan={3}>No customers yet.</td></tr>
                    )}
                    {rows.map(c => (
                      <tr key={c.id} className="border-t">
                        <td className="p-2">
                          {edit?.id === c.id ? (
                            <input className="border rounded p-1 w-full"
                              value={edit.name as string}
                              onChange={e=>setEdit({...edit, name: e.target.value})}/>
                          ) : c.name}
                        </td>
                        <td className="p-2">
                          {edit?.id === c.id ? (
                            <input className="border rounded p-1 w-full"
                              value={edit.code ?? ''}
                              onChange={e=>setEdit({...edit, code: e.target.value})}/>
                          ) : (c.code || '—')}
                        </td>
                        <td className="p-2">
                          {edit?.id === c.id ? (
                            <div className="flex gap-2">
                              <button onClick={saveEdit} className="px-3 py-1 rounded border">Save</button>
                              <button onClick={()=>setEdit(null)} className="px-3 py-1 rounded border">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={()=>startEdit(c)} className="px-3 py-1 rounded border">Edit</button>
                              <button onClick={()=>remove(c.id)} className="px-3 py-1 rounded border">Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </RoleGate>
  );
}


