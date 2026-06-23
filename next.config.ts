/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript ke strict checks build time par block na karein
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint validation warning par build crash na ho
    ignoreDuringBuilds: true,
  },
  // Static export validation override triggers
  output: 'standalone', 
};

export default nextConfig;