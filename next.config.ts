import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // No image optimization -> avoids shipping native `sharp` binaries on deploy.
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
