import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@taskflow/ui",
    "@taskflow/types",
    "@taskflow/utils",
    "@taskflow/validation",
  ],
};

export default nextConfig;
