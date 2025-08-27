// D:\sitas-rt\next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Do not fail Vercel builds on ESLint issues
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Allow embedding inside Google Sites (and similar Google hosts)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://sites.google.com https://*.google.com https://*.googleusercontent.com",
          },
          // Legacy header some products still respect
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
    ];
  },
};

export default nextConfig;
