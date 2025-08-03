import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "lms-platform-cezary.t3.storageapi.dev",
      },
    ],
  },
};

export default nextConfig;
