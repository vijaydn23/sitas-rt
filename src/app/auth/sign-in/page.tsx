'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type AppRole = 'admin' | 'site_incharge' | 'customer';

export default function SignInPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'site_incharge' | 'customer'>('site_incharge');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);

    const { data: signIn, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      setMsg('❌ ' + error.message);
      return;
    }

    // fetch role then route
    const uid = signIn.user?.id;
    if (!uid) {
      setBusy(false);
      setMsg('❌ No user returned from sign-in.');
      return;
    }

    const { data: prof, error: pe } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', uid)
      .single();

    setBusy(false);
    if (pe) {
      setMsg('Signed in, but could not load role: ' + pe.message);
      // fallback route
      router.replace('/');
      return;
    }

    const role = (prof?.role ?? 'customer') as AppRole;
    if (role === 'admin') router.replace('/admin');
    else if (role === 'site_incharge') router.replace('/entry');
    else router.replace('/reports');
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 border rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-center">Sign in</h1>

        {/* tabs */}
        <div className="flex border rounded overflow-hidden text-sm">
          <button
            className={`flex-1 px-3 py-2 ${tab==='site_incharge' ? 'bg-black text-white' : ''}`}
            onClick={() => setTab('site_incharge')}
          >
            Site Incharge
          </button>
          <button
            className={`flex-1 px-3 py-2 ${tab==='customer' ? 'bg-black text-white' : ''}`}
            onClick={() => setTab('customer')}
          >
            Customer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded p-2"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder={tab === 'site_incharge' ? 'incharge@example.com' : 'customer@example.com'}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded p-2"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              required
            />
          </div>
          <button
            disabled={busy}
            className="w-full px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {msg && <div className="text-sm p-2 border rounded">{msg}</div>}

        <div className="text-sm text-center">
          No account? <Link className="underline" href="/auth/sign-up">Sign up</Link>
        </div>
      </div>
    </main>
  );
}
