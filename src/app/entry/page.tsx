// D:\sitas-rt\src\app\entry\page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import RoleGate from '@/components/RoleGate';
import { supabase } from '@/lib/supabaseClient';
import { decayedActivityMbq, exposureSeconds, Isotope } from '@/lib/ndt';
import { fmtSeconds } from '@/lib/format';

type Customer = { id: string; name: string; code: string | null };
type SourceRow = { id: string; isotope: Isotope; serial_no: string | null; a0_mbq: number; ref_date: string };

type ChartRow = {
  id: string;
  isotope: Isotope;
  technique: string;
  film_speed: string;
  material: string;
  thickness_min_mm: number;
  thickness_max_mm: number;
  base_constant: number;
  alpha: number;
};

type Casting = {
  id: string;
  customer_id: string;
  date: string;
  casting_name: string;
  heat_no: string | null;
  rt_no: string | null;
  area_coverage: string | null;
  status: 'open' | 'completed';
};

type ExposureInput = {
  exposure_at: string;
  source_id: string;
  film: string;
  technique: string;
  thickness_mm: number;
  sfd_mm: number;
  total_film: number;
  setting_time_s: number;
  movement_time_s: number;
};

type ExposureRow = {
  id: string;
  source: Isotope;
  film: string;
  technique: string;
  thickness_mm: number;
  sfd_mm: number;
  total_film: number;
  total_exposure_time_s: number;
  per_casting_time_s: number;
  a_eff_mbq: number;
  exposure_at: string;
  setting_time_s: number;
  movement_time_s: number;
};

export default function EntryPage() {
  const [loading, setLoading] = useState(true);

  // dropdown data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);

  // casting form
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [castingName, setCastingName] = useState('');
  const [heatNo, setHeatNo] = useState('');
  const [rtNo, setRtNo] = useState('');
  const [areaCoverage, setAreaCoverage] = useState('');
  const [status, setStatus] = useState<'open' | 'completed'>('open');
  const [casting, setCasting] = useState<Casting | null>(null);

  // exposure form (defaults: 60s setting, 30s movement)
  const [exp, setExp] = useState<ExposureInput>({
    exposure_at: new Date().toISOString(),
    source_id: '',
    film: 'D7',
    technique: 'SW/SI',
    thickness_mm: 20,
    sfd_mm: 600,
    total_film: 1,
    setting_time_s: 60,
    movement_time_s: 30,
  });

  const [chartRow, setChartRow] = useState<ChartRow | null>(null);
  const [calc, setCalc] = useState<{ A_eff: number; t_total: number; t_each: number; t_each_with_overhead: number } | null>(null);
  const [exposureRows, setExposureRows] = useState<ExposureRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  // Load customers + sources
  useEffect(() => {
    (async () => {
      const [cust, src] = await Promise.all([
        supabase.from('customers').select('id, name, code').order('name', { ascending: true }),
        supabase.from('sources').select('id, isotope, serial_no, a0_mbq, ref_date').order('isotope', { ascending: true }),
      ]);
      if (cust.error) setMsg('❌ ' + cust.error.message); else setCustomers(cust.data as Customer[]);
      if (src.error) setMsg('❌ ' + src.error.message); else setSources(src.data as SourceRow[]);
      setLoading(false);
    })();
  }, []);

  // Recompute when inputs change
  useEffect(() => {
    (async () => {
      setCalc(null);
      setChartRow(null);
      if (!exp.source_id) return;

      const sr = sources.find(s => s.id === exp.source_id);
      if (!sr) return;

      const { data, error } = await supabase
        .from('exposure_chart')
        .select('*')
        .eq('isotope', sr.isotope)
        .eq('technique', exp.technique)
        .eq('film_speed', exp.film)
        .eq('material', 'steel')
        .lte('thickness_min_mm', exp.thickness_mm)
        .gte('thickness_max_mm', exp.thickness_mm)
        .limit(1);

      if (error) { setMsg('❌ ' + error.message); return; }
      const row = (data?.[0] as ChartRow | undefined) ?? null;
      setChartRow(row);
      if (!row) return;

      const A_eff = decayedActivityMbq(sr.a0_mbq, sr.ref_date, new Date(exp.exposure_at), sr.isotope);
      const t_total = exposureSeconds(row.base_constant, row.alpha, exp.thickness_mm, exp.sfd_mm, exp.total_film, A_eff);
      const t_each = t_total / Math.max(exp.total_film, 1);
      const t_each_with_overhead = t_each + (exp.setting_time_s || 0) + (exp.movement_time_s || 0);
      setCalc({ A_eff, t_total, t_each, t_each_with_overhead });
    })();
  }, [exp, sources]);

  async function createCasting() {
    setMsg(null);
    if (!customerId) { setMsg('❌ Select a customer'); return; }
    if (!castingName.trim()) { setMsg('❌ Enter Casting Name'); return; }

    const { data, error } = await supabase
      .from('castings')
      .insert([{
        customer_id: customerId,
        date,
        casting_name: castingName,
        heat_no: heatNo || null,
        rt_no: rtNo || null,
        area_coverage: areaCoverage || null,
        status
      }])
      .select('*')
      .single();

    if (error) { setMsg('❌ ' + error.message); return; }
    setCasting(data as Casting);
    setMsg('✅ Casting created. Now add exposure lines below.');
  }

  async function updateCastingStatus(newStatus: 'open' | 'completed') {
    if (!casting) return;
    const { error } = await supabase
      .from('castings')
      .update({ status: newStatus })
      .eq('id', casting.id);
    if (error) setMsg('❌ ' + error.message);
    else {
      setCasting({ ...casting, status: newStatus });
      setMsg('✅ Status updated to ' + newStatus);
    }
  }

  async function addExposure() {
    setMsg(null);
    if (!casting) { setMsg('❌ Create a casting first'); return; }
    if (!exp.source_id) { setMsg('❌ Select a source'); return; }
    if (!chartRow || !calc) { setMsg('❌ No matching exposure chart row. Add constants in exposure_chart.'); return; }

    const sr = sources.find(s => s.id === exp.source_id)!;
    const t_total_round = Math.round(calc.t_total);
    const t_each_with_overhead_round = Math.round(calc.t_each_with_overhead);

    const payload = {
      casting_id: casting.id,
      source: sr.isotope,
      source_id: exp.source_id,
      film: exp.film,
      technique: exp.technique,
      thickness_mm: exp.thickness_mm,
      sfd_mm: exp.sfd_mm,
      total_film: exp.total_film,
      total_exposure_time_s: t_total_round,
      per_casting_time_s: t_each_with_overhead_round,  // exposure per film + setting + movement
      a_eff_mbq: calc.A_eff,
      exposure_at: exp.exposure_at,
      setting_time_s: exp.setting_time_s,
      movement_time_s: exp.movement_time_s
    };

    const { data, error } = await supabase
      .from('exposures')
      .insert([payload])
      .select('*')
      .single();

    if (error) { setMsg('❌ ' + error.message); return; }
    setExposureRows(prev => [data as ExposureRow, ...prev]);
    setMsg('✅ Exposure line saved.');
    setExp({ ...exp, exposure_at: new Date().toISOString() });
  }

  const selectedSource = useMemo(() => sources.find(s => s.id === exp.source_id) ?? null, [sources, exp.source_id]);

  return (
    <RoleGate allow={['admin','site_incharge']}>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <h1 className="text-2xl font-semibold">Entry — Site Incharge</h1>

          {loading && <div className="p-3 rounded border inline-block">Loading…</div>}
          {msg && <div className="p-3 rounded border inline-block">{msg}</div>}

          {/* CASTING */}
          <section className="p-4 border rounded-2xl">
            <h2 className="font-semibold mb-3">1) Casting Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">Customer</label>
                <select className="w-full border rounded p-2"
                        value={customerId} onChange={e=>setCustomerId(e.target.value)}>
                  <option value="">-- select --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.code ? ` (${c.code})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Date</label>
                <input type="date" className="w-full border rounded p-2"
                       value={date} onChange={e=>setDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Casting Name</label>
                <input className="w-full border rounded p-2"
                       value={castingName} onChange={e=>setCastingName(e.target.value)} placeholder="e.g., Valve Body" />
              </div>
              <div>
                <label className="block text-sm mb-1">Heat No</label>
                <input className="w-full border rounded p-2" value={heatNo} onChange={e=>setHeatNo(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">RT No</label>
                <input className="w-full border rounded p-2" value={rtNo} onChange={e=>setRtNo(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Area Coverage</label>
                <input className="w-full border rounded p-2" value={areaCoverage} onChange={e=>setAreaCoverage(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select className="w-full border rounded p-2" value={status} onChange={e=>setStatus(e.target.value as any)}>
                  <option value="open">Open</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-3 items-center">
              <button onClick={createCasting} className="px-4 py-2 rounded bg-black text-white">
                {casting ? 'Save new casting' : 'Create casting'}
              </button>

              {casting && (
                <>
                  <span className="text-sm">Current casting: <b>{casting.casting_name}</b> — Status: <b>{casting.status}</b></span>
                  <button onClick={()=>updateCastingStatus(casting.status === 'open' ? 'completed' : 'open')}
                          className="px-3 py-2 rounded border">
                    Mark {casting.status === 'open' ? 'Completed' : 'Open'}
                  </button>
                </>
              )}
            </div>
          </section>

          {/* EXPOSURE */}
          <section className="p-4 border rounded-2xl">
            <h2 className="font-semibold mb-3">2) Exposure Line</h2>

            {!casting && <div className="p-3 border rounded text-sm">Create a casting first.</div>}

            {casting && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Exposure time at</label>
                    <input type="datetime-local" className="w-full border rounded p-2"
                      value={exp.exposure_at.slice(0,16)}
                      onChange={e=>setExp({...exp, exposure_at: new Date(e.target.value).toISOString()})} />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Source</label>
                    <select className="w-full border rounded p-2"
                      value={exp.source_id} onChange={e=>setExp({...exp, source_id: e.target.value})}>
                      <option value="">-- select source --</option>
                      {sources.map(s => (
                        <option key={s.id} value={s.id}>{s.isotope} {s.serial_no ? `(${s.serial_no})` : ''}</option>
                      ))}
                    </select>
                    {selectedSource && (
                      <div className="text-xs text-gray-600 mt-1">
                        A₀ = {selectedSource.a0_mbq.toLocaleString()} MBq @ {selectedSource.ref_date}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Film</label>
                    <input className="w-full border rounded p-2"
                           value={exp.film} onChange={e=>setExp({...exp, film: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Technique</label>
                    <select className="w-full border rounded p-2"
                            value={exp.technique}
                            onChange={e=>setExp({...exp, technique: e.target.value})}>
                      <option value="SW/SI">SW/SI</option>
                      <option value="DW/DI">DW/DI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Thickness (mm)</label>
                    <input type="number" className="w-full border rounded p-2"
                           value={exp.thickness_mm}
                           onChange={e=>setExp({...exp, thickness_mm: Number(e.target.value)})} />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">SFD (mm)</label>
                    <input type="number" className="w-full border rounded p-2"
                           value={exp.sfd_mm}
                           onChange={e=>setExp({...exp, sfd_mm: Number(e.target.value)})} />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Total Film (pcs)</label>
                    <input type="number" className="w-full border rounded p-2"
                           value={exp.total_film} min={1}
                           onChange={e=>setExp({...exp, total_film: Math.max(1, Number(e.target.value))})} />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Setting time (s)</label>
                    <input type="number" className="w-full border rounded p-2"
                           value={exp.setting_time_s}
                           onChange={e=>setExp({...exp, setting_time_s: Math.max(0, Number(e.target.value))})} />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Movement time (s)</label>
                    <input type="number" className="w-full border rounded p-2"
                           value={exp.movement_time_s}
                           onChange={e=>setExp({...exp, movement_time_s: Math.max(0, Number(e.target.value))})} />
                  </div>
                </div>

                <div className="mt-3 text-sm">
                  {chartRow ? (
                    <div className="p-2 border rounded">
                      <div>Chart match: <b>{chartRow.isotope}</b> / <b>{chartRow.technique}</b> / <b>{chartRow.film_speed}</b> / {chartRow.thickness_min_mm}-{chartRow.thickness_max_mm} mm</div>
                      <div>K = {chartRow.base_constant}, α = {chartRow.alpha}</div>
                    </div>
                  ) : (
                    <div className="p-2 border rounded text-gray-600">
                      No chart row found — add constants in <code>exposure_chart</code>.
                    </div>
                  )}
                </div>

                <div className="mt-3 text-sm">
                  {calc && (
                    <div className="p-2 border rounded">
                      <div>Aₑфф (decayed) = {calc.A_eff.toFixed(2)} MBq</div>
                      <div>Total exposure time = {fmtSeconds(calc.t_total)}</div>
                      <div>Per casting (exposure only) = {fmtSeconds(calc.t_each)}</div>
                      <div>Per casting (approx with overhead) = <b>{fmtSeconds(calc.t_each_with_overhead)}</b></div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <button onClick={addExposure} className="px-4 py-2 rounded bg-black text-white">
                    Add exposure line
                  </button>
                </div>
              </>
            )}
          </section>

          {/* SAVED LINES */}
          <section className="p-4 border rounded-2xl">
            <h2 className="font-semibold mb-3">3) Saved lines (this casting)</h2>
            {exposureRows.length === 0 ? (
              <div className="p-3 border rounded text-sm text-gray-600">No lines yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">When</th>
                      <th className="p-2 text-left">Source</th>
                      <th className="p-2 text-left">Film</th>
                      <th className="p-2 text-left">Technique</th>
                      <th className="p-2 text-right">Thickness</th>
                      <th className="p-2 text-right">SFD</th>
                      <th className="p-2 text-right">Total Film</th>
                      <th className="p-2 text-right">Exposure time</th>
                      <th className="p-2 text-right">Setting</th>
                      <th className="p-2 text-right">Movement</th>
                      <th className="p-2 text-right">Per casting (approx)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exposureRows.map(r => (
                      <tr key={r.id} className="border-t">
                        <td className="p-2">{new Date(r.exposure_at).toLocaleString()}</td>
                        <td className="p-2">{r.source}</td>
                        <td className="p-2">{r.film}</td>
                        <td className="p-2">{r.technique}</td>
                        <td className="p-2 text-right">{r.thickness_mm}</td>
                        <td className="p-2 text-right">{r.sfd_mm}</td>
                        <td className="p-2 text-right">{r.total_film}</td>
                        <td className="p-2 text-right">{fmtSeconds(r.total_exposure_time_s)}</td>
                        <td className="p-2 text-right">{fmtSeconds(r.setting_time_s)}</td>
                        <td className="p-2 text-right">{fmtSeconds(r.movement_time_s)}</td>
                        <td className="p-2 text-right">{fmtSeconds(r.per_casting_time_s)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="text-sm text-gray-600">
            Saved rows also appear in <a href="/reports" className="underline">Reports</a>. RLS ensures customers see only their own data.
          </div>
        </div>
      </main>
    </RoleGate>
  );
}
