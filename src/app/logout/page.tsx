'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LogoutPage() {
  const [msg, setMsg] = useState('Signing out...');

  useEffect(() => {
    const go = async () => {
      await supabase.auth.signOut();
      setMsg('Signed out.');
      window.location.href = '/auth/sign-in';
    };
    void go();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-6 rounded-2xl shadow border">{msg}</div>
    </main>
  );
}
