'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function EmbedAuthNotice() {
  const search = useSearchParams();
  const embed = search?.get('embed') === '1';
  if (!embed) return null;

  return (
    <div className="bg-yellow-50 border-b text-sm">
      <div className="mx-auto max-w-7xl px-4 py-2">
        This is embedded. If sign-in fails here, open
        {' '}
        <a className="underline" href="/" target="_blank" rel="noreferrer">the full app</a>
        {' '}or{' '}
        <Link className="underline" href="/auth/sign-in" target="_top">sign in</Link>.
      </div>
    </div>
  );
}


