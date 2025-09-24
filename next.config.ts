import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ["app", "components", "lib", "scripts"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    typedRoutes: true,
  },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
