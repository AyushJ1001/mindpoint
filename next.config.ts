import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blocks.astratic.com",
      },
      {
        protocol: "https",
        hostname: "healthy-wolf-897.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
