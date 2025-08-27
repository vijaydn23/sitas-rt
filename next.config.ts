// D:\sitas-rt\next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Let Google Sites frame the app
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Modern way
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://sites.google.com https://*.google.com https://*.googleusercontent.com",
          },
          // Some products still read this legacy header:
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
    ];
  },
};

export default nextConfig;
