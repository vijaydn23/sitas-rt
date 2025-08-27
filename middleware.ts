// D:\sitas-rt\middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const PROTECTED = ['/entry', '/admin', '/reports', '/dashboard'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const path = req.nextUrl.pathname;

  // allow assets
  if (path.startsWith('/_next') || path === '/favicon.ico') return res;

  // if embed=1, do not do server-side auth (client will handle)
  const isEmbed = req.nextUrl.searchParams.get('embed') === '1';
  if (isEmbed) return res;

  // only guard protected pages
  if (!PROTECTED.some(p => path.startsWith(p))) return res;

  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/sign-in';
    url.searchParams.set('next', path + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next|.*\\.(?:svg|png|jpg|jpeg|gif|ico)|favicon.ico).*)'],
};
