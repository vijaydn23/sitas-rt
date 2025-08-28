'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // ignore errors; we just want the session cleared
      try { await supabase.auth.signOut(); } catch {}
      router.replace('/'); // go to home (or change to '/auth/sign-in')
    })();
  }, [router]);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-xl text-center">Signing out…</div>
    </main>
  );
}
