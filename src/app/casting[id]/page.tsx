// D:\sitas-rt\src\app\casting[id]\page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RoleGate from '@/components/RoleGate';
import { supabase } from '@/lib/supabaseClient';
import { fmtSeconds } from '@/lib/format';

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

export default function CastingPrintablePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('v_casting_report')
        .select('*')
        .eq('casting_id', id)
        .order('Date', { ascending: true })
        .order('exposure_id', { ascending: true });

      if (error) setErr(error.message);
      else setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [id]);

  const header = rows[0] || null;

  const totals = useMemo(() => {
    const se = rows.reduce((a, r) => a + (r['Total Exposure time'] || 0), 0);
    const sp = rows.reduce((a, r) => a + (r['Total per casting time'] || 0), 0);
    return { totalExposure: se, totalPerCasting: sp };
  }, [rows]);

  return (
    <RoleGate allow={['ADMIN', 'INCHARGE', 'CUSTOMER']}>
      <main className="min-h-screen p-6 print:p-0">
        <div className="mx-auto max-w-5xl bg-white print:bg-white">
          {/* Controls (hidden in print) */}
          <div className="flex items-center gap-3 mb-4 print:hidden">
            <button onClick={() => router.back()} className="px-3 py-2 rounded border">⬅ Back</button>
            <Link href="/reports" className="px-3 py-2 rounded border">Reports</Link>
            <button onClick={() => window.print()} className="px-3 py-2 rounded bg-black text-white">🖨 Print / Save PDF</button>
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <div className="text-lg font-semibold">SITAS NDT ENGINEERS PVT LTD</div>
            <div className="text-sm text-gray-600">Casting Exposure Report</div>
          </div>

          {/* Casting / Customer header */}
          <section className="border rounded-xl p-4 mb-4">
            {loading && <div>Loading…</div>}
            {err && <div className="text-red-700">❌ {err}</div>}
            {!loading && !err && header && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><b>Date:</b> {header['Date']}</div>
                <div><b>Status:</b> {header.status}</div>
                <div><b>Customer:</b> {header.customer_name}</div>
                <div><b>Casting Name:</b> {header['Castings Name']}</div>
                <div><b>Heat No:</b> {header['Heat No'] ?? '—'}</div>
                <div><b>RT No:</b> {header['RT No'] ?? '—'}</div>
                <div className="md:col-span-2"><b>Area Coverage:</b> {header['Area Coverage'] ?? '—'}</div>
              </div>
            )}
            {!loading && !err && !header && <div>No data for this casting.</div>}
          </section>

          {/* Lines */}
          {!loading && rows.length > 0 && (
            <section className="border rounded-xl p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Source</th>
                      <th className="p-2 text-left">Film</th>
                      <th className="p-2 text-left">Technique</th>
                      <th className="p-2 text-right">Thickness (mm)</th>
                      <th className="p-2 text-right">SFD (mm)</th>
                      <th className="p-2 text-right">Total Film</th>
                      <th className="p-2 text-right">Exposure time</th>
                      <th className="p-2 text-right">Per casting (approx)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.exposure_id} className="border-b">
                        <td className="p-2">{r['Source']}</td>
                        <td className="p-2">{r['Film']}</td>
                        <td className="p-2">{r['Technique']}</td>
                        <td className="p-2 text-right">{r['Thickness']}</td>
                        <td className="p-2 text-right">{r['SFD']}</td>
                        <td className="p-2 text-right">{r['Total Film']}</td>
                        <td className="p-2 text-right">{fmtSeconds(r['Total Exposure time'])}</td>
                        <td className="p-2 text-right">{fmtSeconds(r['Total per casting time'])}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-semibold">
                      <td className="p-2" colSpan={6}>Totals</td>
                      <td className="p-2 text-right">{fmtSeconds(totals.totalExposure)}</td>
                      <td className="p-2 text-right">{fmtSeconds(totals.totalPerCasting)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="text-xs text-gray-600 mt-3">
                Note: “Per casting (approx)” = exposure/film + setting + movement (as saved).
              </div>
            </section>
          )}
        </div>
      </main>
    </RoleGate>
  );
}

