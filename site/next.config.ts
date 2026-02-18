import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/bitcoin-vps",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
