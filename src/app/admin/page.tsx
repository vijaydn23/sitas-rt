// D:\sitas-rt\src\app\admin\page.tsx
'use client';

import Link from 'next/link';
import RoleGate from '@/components/RoleGate';

export default function AdminPage() {
  return (
    <RoleGate allow={['admin']}>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <h1 className="text-2xl font-semibold">Admin Console</h1>

          <div className="grid gap-3">
  <Link href="/admin/users" className="underline">Users / Roles</Link>
  <Link href="/admin/customer-accounts" className="underline">Customer Accounts</Link>
  <Link href="/admin/customers" className="underline">Customers (CRUD)</Link>
  <Link href="/admin/map" className="underline">Map Site Incharge ↔ Customers</Link>
  <Link href="/admin/sources" className="underline">Sources</Link>
  <Link href="/admin/chart" className="underline">Exposure Chart</Link>
</div>
         </div>
      </main>
    </RoleGate>
  );
}
