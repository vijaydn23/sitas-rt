// src/app/admin/page.tsx
'use client';
import RoleGate from '@/components/RoleGate';
import { useEffect, useState } from 'react';

type UserRow = { id: string; email: string; name: string | null; role: 'ADMIN' | 'INCHARGE' | 'CUSTOMER' };
type CustomerRow = { id: string; name: string; code: string | null; owner: { email: string } };

export default function AdminPage() {
  return (
    <RoleGate allow={['ADMIN']}>
      <main className="space-y-8">
        <h1 className="text-xl font-semibold">Admin Console</h1>
        <CreateUserCard />
        <CreateCustomerCard />
        <MapCard />
        <Lists />
      </main>
    </RoleGate>
  );
}

function CreateUserCard() {
  const [email, setEmail] = useState(''); const [name, setName] = useState('');
  const [password, setPassword] = useState(''); const [role, setRole] = useState<'ADMIN'|'INCHARGE'|'CUSTOMER'>('CUSTOMER');
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);
    const res = await fetch('/api/admin/create-user', {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ email, name, password, role }),
    });
    const j = await res.json();
    setMsg(res.ok ? '✅ User created' : '❌ ' + (j.error || 'failed'));
  }

  return (
    <section className="p-4 border rounded-2xl space-y-3">
      <h2 className="font-semibold">Create User</h2>
      {msg && <div className="p-2 border rounded">{msg}</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input className="border rounded p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded p-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border rounded p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <select className="border rounded p-2" value={role} onChange={e=>setRole(e.target.value as any)}>
          <option value="ADMIN">ADMIN</option>
          <option value="INCHARGE">INCHARGE</option>
          <option value="CUSTOMER">CUSTOMER</option>
        </select>
      </div>
      <button onClick={submit} className="px-4 py-2 bg-black text-white rounded">Create</button>
    </section>
  );
}

function CreateCustomerCard() {
  const [name, setName] = useState(''); const [code, setCode] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);
    const res = await fetch('/api/admin/create-customer', {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ name, code, ownerEmail }),
    });
    const j = await res.json();
    setMsg(res.ok ? '✅ Customer created' : '❌ ' + (j.error || 'failed'));
  }

  return (
    <section className="p-4 border rounded-2xl space-y-3">
      <h2 className="font-semibold">Create Customer</h2>
      {msg && <div className="p-2 border rounded">{msg}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input className="border rounded p-2" placeholder="Customer Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border rounded p-2" placeholder="Code (optional)" value={code} onChange={e=>setCode(e.target.value)} />
        <input className="border rounded p-2" placeholder="Owner Email (CUSTOMER user)" value={ownerEmail} onChange={e=>setOwnerEmail(e.target.value)} />
      </div>
      <button onClick={submit} className="px-4 py-2 bg-black text-white rounded">Create</button>
    </section>
  );
}

function MapCard() {
  const [inchargeEmail, setInchargeEmail] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/admin/list');
      const j = await r.json();
      setCustomers(j.customers ?? []);
    })();
  }, []);

  async function add() {
    setMsg(null);
    const res = await fetch('/api/admin/map', {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ inchargeEmail, customerId }),
    });
    const j = await res.json();
    setMsg(res.ok ? '✅ Mapped' : '❌ ' + (j.error || 'failed'));
  }

  return (
    <section className="p-4 border rounded-2xl space-y-3">
      <h2 className="font-semibold">Map Incharge → Customer</h2>
      {msg && <div className="p-2 border rounded">{msg}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input className="border rounded p-2" placeholder="Incharge Email" value={inchargeEmail} onChange={e=>setInchargeEmail(e.target.value)} />
        <select className="border rounded p-2" value={customerId} onChange={e=>setCustomerId(e.target.value)}>
          <option value="">-- select customer --</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.code ? ` (${c.code})` : ''}</option>)}
        </select>
        <button onClick={add} className="px-4 py-2 bg-black text-white rounded">Add mapping</button>
      </div>
    </section>
  );
}

function Lists() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/admin/list');
      const j = await r.json();
      setUsers(j.users ?? []);
      setCustomers(j.customers ?? []);
    })();
  }, []);

  return (
    <section className="p-4 border rounded-2xl">
      <h2 className="font-semibold mb-3">Users</h2>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead><tr><th className="p-2">Email</th><th className="p-2">Name</th><th className="p-2">Role</th></tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.name ?? '—'}</td>
                <td className="p-2">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="font-semibold mb-3">Customers</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr><th className="p-2">Name</th><th className="p-2">Code</th><th className="p-2">Owner (customer user)</th></tr></thead>
          <tbody>
            {customers.map(c=>(
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.code ?? ''}</td>
                <td className="p-2">{c.owner.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
