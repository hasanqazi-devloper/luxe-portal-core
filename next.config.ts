import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  }
  // Standalone agar likha hai toh use temporarily hata do ya file ko aisi clean rakho!
};

export default nextConfig;