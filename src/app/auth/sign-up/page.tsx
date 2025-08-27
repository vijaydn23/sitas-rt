'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    setLoading(false);
    if (error) setMsg('❌ ' + error.message);
    else setMsg('✅ Account created. If email confirmation is required, check your inbox. You can now sign in.');
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-8 rounded-2xl shadow border w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6">Create account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input className="w-full border rounded p-2" type="text" placeholder="Full name"
                 value={fullName} onChange={e=>setFullName(e.target.value)} required />
          <input className="w-full border rounded p-2" type="email" placeholder="Email"
                 value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="w-full border rounded p-2" type="password" placeholder="Password (min 6 chars)"
                 value={password} onChange={e=>setPassword(e.target.value)} required />
          <button type="submit" disabled={loading} className="w-full p-2 rounded bg-black text-white">
            {loading ? 'Creating…' : 'Sign up'}
          </button>
        </form>
        {msg && <p className="mt-4 text-sm">{msg}</p>}
        <p className="mt-6 text-sm">Already have an account? <Link className="underline" href="/auth/sign-in">Sign in</Link></p>
      </div>
    </main>
  );
}
