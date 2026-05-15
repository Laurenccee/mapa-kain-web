import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Set to 4MB instead of default 1MB
    },
  },
};

export default nextConfig;
