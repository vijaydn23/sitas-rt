'use client';
import RoleGate from '@/components/RoleGate';
import { useEffect, useState } from 'react';

type Row = { id: string; name: string; code: string | null };

export default function EntryPage() {
  return (
    <RoleGate allow={['INCHARGE']}>
      <main>
        <h1 className="text-xl font-semibold mb-3">My Customers (Incharge)</h1>
        <List />
      </main>
    </RoleGate>
  );
}

function List() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    (async () => {
      const r = await fetch('/api/incharge/my-customers');
      const j = await r.json();
      setRows(j.rows ?? []);
    })();
  }, []);
  return (
    <div className="overflow-x-auto border rounded">
      <table className="w-full text-sm">
        <thead><tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Code</th></tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td className="p-2 text-gray-600">No mappings yet.</td></tr> :
            rows.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.code ?? ''}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}


