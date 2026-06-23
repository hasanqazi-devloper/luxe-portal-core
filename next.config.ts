import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Static export ke liye lazmi hai
  },
  output: 'export', // ⚡ Standard Static HTML Export Engine Lock!
};

export default nextConfig;