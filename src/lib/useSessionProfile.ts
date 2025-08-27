// D:\sitas-rt\src\lib\useSessionProfile.ts
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type AppRole = 'admin' | 'site_incharge' | 'customer';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  customer_id: string | null;
};

export function useSessionProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: s, error: e1 } = await supabase.auth.getSession();
      if (e1) { if (!cancelled) { setError(e1.message); setLoading(false); } return; }
      const user = s.session?.user ?? null;
      if (!user) { if (!cancelled) { setProfile(null); setLoading(false); } return; }

      const { data, error: e2 } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, customer_id')
        .eq('id', user.id)
        .single();

      if (!cancelled) {
        if (e2) setError(e2.message);
        else setProfile(data as Profile);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { loading, profile, error };
}
