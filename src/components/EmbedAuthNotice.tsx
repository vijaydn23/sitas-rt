// D:\sitas-rt\src\components\EmbedAuthNotice.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function EmbedAuthNotice() {
  const params = useSearchParams();
  const pathname = usePathname();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  const embed = useMemo(() => params?.get('embed') === '1', [params]);

  // Get current full path with query (to return here after sign-in)
  const currentUrlPath = useMemo(() => {
    if (typeof window === 'undefined') return pathname || '/';
    const q = new URLSearchParams(params ?? undefined).toString();
    return q ? `${pathname}?${q}` : pathname || '/';
  }, [pathname, params]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setHasSession(!!data.session);
    })();
    return () => { mounted = false; };
  }, []);

  if (!embed) return null;
  if (hasSession === null) return null; // still checking
  if (hasSession) return null;          // already signed in

  // Build absolute sign-in URL and force top window navigation (break iframe)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const signInHref = `${origin}/auth/sign-in?redirect=${encodeURIComponent(currentUrlPath)}`;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="mx-auto max-w-7xl px-4 py-3 text-sm flex items-center justify-between gap-4">
        <div>
          <b>Embedded mode:</b> To sign in, open the app in a new tab.
          After login you’ll be returned to this page.
        </div>
        <div className="flex gap-2">
          <a
            href={signInHref}
            target="_top"
            className="px-3 py-1.5 rounded bg-black text-white"
          >
            Open sign-in
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 rounded border"
          >
            I already signed in — Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
