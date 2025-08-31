import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Add other experimental features here if needed
  },
};

export default nextConfig;
