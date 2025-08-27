// D:\sitas-rt\src\app\auth\sign-in\page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

function SignInInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const redirect = params?.get('redirect') || '/dashboard';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMsg('❌ ' + error.message); return; }
    router.replace(redirect);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="p-8 rounded-2xl border w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>
        {msg && <div className="p-3 border rounded text-sm">{msg}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="border rounded p-2 w-full"
                   value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="border rounded p-2 w-full"
                   value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <button className="px-4 py-2 rounded bg-black text-white w-full">Sign in</button>
        </form>

        <div className="text-sm flex justify-between">
          <Link href={`/auth/sign-up?redirect=${encodeURIComponent(redirect)}`} className="underline">Create account</Link>
          <Link href="/logout" className="underline">Sign out</Link>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}
