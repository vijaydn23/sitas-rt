// D:\sitas-rt\src\app\auth\sign-in\page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

/** Build where to go after login, preserving ?embed=1 if present */
function buildNextTarget(nextParam: string | null, embed: boolean): string {
  if (nextParam) {
    try {
      const u = new URL(nextParam, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      if (embed) u.searchParams.set('embed', '1');
      return u.pathname + u.search + u.hash;
    } catch {
      let dest = nextParam;
      if (embed && !dest.includes('embed=')) {
        dest += (dest.includes('?') ? '&' : '?') + 'embed=1';
      }
      return dest;
    }
  }
  return embed ? '/reports?embed=1' : '/dashboard';
}

function SignInInner() {
  const router = useRouter();
  const search = useSearchParams();

  const isEmbed = search.get('embed') === '1';
  const nextParam = search.get('next');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already signed in, go forward
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.replace(buildNextTarget(nextParam, isEmbed));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }
    router.push(buildNextTarget(nextParam, isEmbed));
  }

  const signUpHref = `/auth/sign-up${isEmbed ? '?embed=1' : ''}`;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-2xl p-6 shadow bg-white">
        <h1 className="text-2xl font-semibold text-center">Sign in</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          SITAS-NDT portal {isEmbed && '(embedded)'}
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

        {err && (
          <div className="text-sm text-red-700 border border-red-300 rounded p-2">
            {err}
          </div>
        )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="text-sm mt-4 text-center">
          Don’t have an account?{' '}
          <Link className="underline" href={signUpHref}>Sign up</Link>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="p-3 border rounded">Loading…</div>
      </main>
    }>
      <SignInInner />
    </Suspense>
  );
}

/** Keep TS happy */
export {};
