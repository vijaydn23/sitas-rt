'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);

    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) setMsg('❌ ' + error.message);
    else setMsg('✅ Account created. You can sign in now.');
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 border rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-center">Sign up</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded p-2"
              value={email}
              onChange={e=>setEmail(e.target.value)}
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
              minLength={6}
            />
          </div>
          <button
            disabled={busy}
            className="w-full px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {busy ? 'Signing up…' : 'Sign up'}
          </button>
        </form>

        {msg && <div className="text-sm p-2 border rounded">{msg}</div>}

        <div className="text-sm text-center">
          Already have an account? <Link className="underline" href="/auth/sign-in">Sign in</Link>
        </div>
      </div>
    </main>
  );
}


