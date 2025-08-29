// middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/admin/:path*', '/entry/:path*', '/reports/:path*', '/dashboard/:path*'],
};
