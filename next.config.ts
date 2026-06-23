import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // ⚡ Asset path load crash bypass trigger
  }
};

export default nextConfig;