import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remove console logs in production builds
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"], // Keep console.error for critical error handling
          }
        : false,
  },
  // Optimize production builds
  poweredByHeader: false,
  reactStrictMode: true,
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
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "files.uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "pw6ih6yl8k.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
