import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@polisprotocol/core', '@polisprotocol/react', '@polisprotocol/theme-default'],
};

export default nextConfig;
