import type { NextConfig } from 'next';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const API_HOSTNAME = new URL(API_URL).hostname;

const config: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@imovdigital/types', '@imovdigital/utils'],
  serverExternalPackages: [],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: API_HOSTNAME },
      { protocol: 'https', hostname: '*.imovdigital.com.br' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default config;
