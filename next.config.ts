import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ["xbrq3trg-3000.uks1.devtunnels.ms", "localhost:3000"],
    },
    serverComponentsExternalPackages: ["bcryptjs"],
  },
};

export default nextConfig;
