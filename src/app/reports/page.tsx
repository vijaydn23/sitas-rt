// D:\sitas-rt\src\app\reports\page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import RoleGate from '@/components/RoleGate';
import { supabase } from '@/lib/supabaseClient';
import { fmtSeconds } from '@/lib/format';
import { useSearchParams, useRouter } from 'next/navigation';

type Row = {
  Date: string;
  'Castings Name': string;
  'Heat No': string | null;
  'RT No': string | null;
  'Area Coverage': string | null;
  Source: 'Ir-192' | 'Co-60';
  Film: string;
  Technique: string;
  Thickness: number;
  SFD: number;
  'Total Film': number;
  'Total Exposure time': number;
  'Total per casting time': number;
  casting_id: string;
  exposure_id: string;
  status: 'open' | 'completed';
  customer_id: string;
  customer_name: string;
};

function ReportsInner() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const search = useSearchParams();
  const router = useRouter();

  const urlStatus = (search.get('status') as 'open' | 'completed' | null) ?? null;
  const urlCustomer = search.get('customer');
  const urlFrom = search.get('from');
  const urlTo = search.get('to');

  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'completed'>(urlStatus ?? 'all');
  const [customerFilter, setCustomerFilter] = useState<'all' | string>(urlCustomer ?? 'all');
  const [from, setFrom] = useState<string>(urlFrom ?? '');
  const [to, setTo] = useState<string>(urlTo ?? '');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('v_casting_report')
        .select('*')
        .order('Date', { ascending: false })
        .limit(2000);
      if (error) setErr(error.message);
      else setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (customerFilter !== 'all') params.set('customer', customerFilter);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    router.replace(qs ? `/reports?${qs}` : '/reports');
  }, [statusFilter, customerFilter, from, to, router]);

  const customers = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) map.set(r.customer_id, r.customer_name);
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const filtered = useMemo(() => {
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    return rows.filter((r) => {
      const okStatus = statusFilter === 'all' || r.status === statusFilter;
      const okCustomer = customerFilter === 'all' || r.customer_id === customerFilter;

      const dateOnly = r['Date']?.slice(0, 10);
      const d = dateOnly ? new Date(dateOnly) : null;

      const okFrom = !fromDate || (d && d >= fromDate);
      const okTo = !toDate || (d && d <= toDate);
      return okStatus && okCustomer && okFrom && okTo;
    });
  }, [rows, statusFilter, customerFilter, from, to]);

  function downloadCSV() {
    const header = [
      'Date',
      'Customer',
      'Castings Name',
      'Heat No',
      'RT No',
      'Area Coverage',
      'Status',
      'Source',
      'Film',
      'Technique',
      'Thickness',
      'SFD',
      'Total Film',
      'Total Exposure time (s)',
      'Total per casting time (s)',
    ];
    const lines = filtered.map((r) => [
      r['Date'],
      r.customer_name,
      r['Castings Name'],
      r['Heat No'] ?? '',
      r['RT No'] ?? '',
      r['Area Coverage'] ?? '',
      r.status,
      r['Source'],
      r['Film'],
      r['Technique'],
      String(r['Thickness']),
      String(r['SFD']),
      String(r['Total Film']),
      String(r['Total Exposure time'] ?? 0),
      String(r['Total per casting time'] ?? 0),
    ]);
    const csv = [header, ...lines]
      .map((arr) =>
        arr
          .map((val) => {
            const s = String(val ?? '');
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casting-reports-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <RoleGate allow={['admin', 'site_incharge', 'customer']}>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-semibold mb-4">Casting Reports (read-only)</h1>

          {/* Filters + CSV */}
          <div className="flex flex-wrap gap-3 mb-3 items-end">
            <div>
              <label className="block text-sm mb-1">Status</label>
              <select
                className="border rounded p-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {customers.length > 1 && (
              <div>
                <label className="block text-sm mb-1">Customer</label>
                <select
                  className="border rounded p-2"
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                >
                  <option value="all">All customers</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm mb-1">From</label>
              <input type="date" className="border rounded p-2" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">To</label>
              <input type="date" className="border rounded p-2" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>

            <button onClick={downloadCSV} className="px-4 py-2 rounded bg-black text-white">
              Download CSV (filtered)
            </button>
          </div>

          {loading && <div className="p-3 rounded border inline-block">Loading…</div>}
          {err && <div className="p-3 rounded border inline-block">❌ {err}</div>}

          {!loading && !err && (
            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Customer</th>
                    <th className="p-2 text-left">Castings Name</th>
                    <th className="p-2 text-left">Heat No</th>
                    <th className="p-2 text-left">RT No</th>
                    <th className="p-2 text-left">Area Coverage</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Source</th>
                    <th className="p-2 text-left">Film</th>
                    <th className="p-2 text-left">Technique</th>
                    <th className="p-2 text-right">Thickness (mm)</th>
                    <th className="p-2 text-right">SFD (mm)</th>
                    <th className="p-2 text-right">Total Film</th>
                    <th className="p-2 text-right">Total Exposure time</th>
                    <th className="p-2 text-right">Total per casting time</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td className="p-3 text-center text-gray-500" colSpan={16}>
                        No data with current filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, idx) => (
                      <tr key={r.exposure_id ?? idx} className="border-t">
                        <td className="p-2">{r['Date']}</td>
                        <td className="p-2">{r.customer_name}</td>
                        <td className="p-2">{r['Castings Name']}</td>
                        <td className="p-2">{r['Heat No'] ?? ''}</td>
                        <td className="p-2">{r['RT No'] ?? ''}</td>
                        <td className="p-2">{r['Area Coverage'] ?? ''}</td>
                        <td className="p-2">{r.status}</td>
                        <td className="p-2">{r['Source']}</td>
                        <td className="p-2">{r['Film']}</td>
                        <td className="p-2">{r['Technique']}</td>
                        <td className="p-2 text-right">{r['Thickness']}</td>
                        <td className="p-2 text-right">{r['SFD']}</td>
                        <td className="p-2 text-right">{r['Total Film']}</td>
                        <td className="p-2 text-right">{fmtSeconds(r['Total Exposure time'])}</td>
                        <td className="p-2 text-right">{fmtSeconds(r['Total per casting time'])}</td>
                        <td className="p-2">
                          <Link href={`/casting/${r.casting_id}`} className="underline">
                            View / Print
                          </Link>
                        </td>
                      </tr>
                    ))
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

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="p-3 border rounded">Loading…</div>
      </main>
    }>
      <ReportsInner />
    </Suspense>
  );
}
