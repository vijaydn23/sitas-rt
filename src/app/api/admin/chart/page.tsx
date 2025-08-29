'use client';

import RoleGate from '@/components/RoleGate';

export default function AdminChartPage() {
  return (
    <RoleGate allow={['ADMIN']}>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold mb-4">Exposure Chart</h1>
          {/* keep / restore your previous chart UI here; the important part is allow={['ADMIN']} */}
        </div>
      </main>
    </RoleGate>
  );
}


