import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ["xbrq3trg-3000.uks1.devtunnels.ms", "localhost:3000"],
    },
    serverComponentsExternalPackages: ["@libsql/client", "bcryptjs"],
  },
};

export default nextConfig;
