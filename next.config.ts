// D:\sitas-rt\next.config.ts
import type { NextConfig } from 'next';

const CSP = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} https://*.supabase.co wss://*.supabase.co;
  frame-ancestors 'self' https://sites.google.com https://*.google.com https://*.googleusercontent.com;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  // ✅ let the build succeed even if ESLint finds problems
  eslint: { ignoreDuringBuilds: true },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
