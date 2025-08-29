'use client';
import RoleGate from '@/components/RoleGate';
import { useEffect, useState } from 'react';

type MeRow = { name: string; code: string | null };

export default function ReportsPage() {
  return (
    <RoleGate allow={['CUSTOMER']}>
      <main>
        <h1 className="text-xl font-semibold mb-3">My Account (Customer)</h1>
        <Self />
      </main>
    </RoleGate>
  );
}

function Self() {
  const [row, setRow] = useState<MeRow | null>(null);
  useEffect(() => {
    (async () => {
      const r = await fetch('/api/customer/me');
      const j = await r.json();
      setRow(j.row ?? null);
    })();
  }, []);
  return (
    <div className="p-4 border rounded">
      {!row ? 'No customer record yet (ask admin to create & link).' : (
        <>
          <div><b>Name:</b> {row.name}</div>
          <div><b>Code:</b> {row.code ?? '—'}</div>
        </>
      )}
    </div>
  );
}


