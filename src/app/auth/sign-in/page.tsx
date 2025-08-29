// src/app/auth/sign-in/page.tsx
'use client';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goto, setGoto] = useState<'ADMIN'|'INCHARGE'|'CUSTOMER'>('ADMIN');
  const [msg, setMsg] = useState<string|undefined>();
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(undefined);
    const callbackUrl =
      goto === 'ADMIN' ? '/admin' : goto === 'INCHARGE' ? '/entry' : '/reports';

    const res = await signIn('credentials', { redirect: false, email, password, callbackUrl });
    if (res?.error) { setMsg('❌ ' + res.error); return; }
    router.push(callbackUrl);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="space-y-3 p-6 border rounded-2xl w-full max-w-sm">
        <h1 className="text-xl font-semibold">Sign in</h1>
        {msg && <div className="p-2 border rounded text-sm">{msg}</div>}
        <input className="w-full border rounded p-2" placeholder="Email"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password"
               value={password} onChange={e=>setPassword(e.target.value)} />
        <select className="w-full border rounded p-2" value={goto} onChange={e=>setGoto(e.target.value as any)}>
          <option value="ADMIN">Go to Admin</option>
          <option value="INCHARGE">Go to Incharge (Entry)</option>
          <option value="CUSTOMER">Go to Customer (Reports)</option>
        </select>
        <button className="w-full bg-black text-white rounded p-2">Sign in</button>
      </form>
    </main>
  );
}
