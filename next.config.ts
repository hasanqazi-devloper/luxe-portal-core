import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',      // ⚡ Static HTML export mode active
  trailingSlash: true,   // 🚀 Trailing slash logic trigger taake Netlify paths break na karein!
};

export default nextConfig;