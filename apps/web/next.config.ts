import type { NextConfig } from 'next';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const config: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@imovdigital/types', '@imovdigital/utils'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
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
