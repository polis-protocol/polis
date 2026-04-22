import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@polis/core', '@polis/react', '@polis/theme-default'],
};

export default nextConfig;
