'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

function SignInInner() {
  const params = useSearchParams();
  const embed = params.get('embed') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg('❌ ' + error.message);
    else setMsg('✅ Signed in — you can close this window or go to Home.');
    setBusy(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="p-8 rounded-2xl shadow border w-full max-w-md bg-white space-y-4">
        {!embed && <h1 className="text-xl font-semibold text-center">Sign in</h1>}

        {msg && <div className="p-2 border rounded text-sm">{msg}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="border rounded p-2 w-full"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              className="border rounded p-2 w-full"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2 rounded bg-black text-white"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {!embed && (
          <div className="text-center text-sm">
            No account? <Link href="/auth/sign-up" className="underline">Sign up</Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Page() {
  // useSearchParams is in Suspense to make Next build happy
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center">Loading…</main>}>
      <SignInInner />
    </Suspense>
  );
}
