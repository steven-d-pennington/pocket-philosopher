import type { NextConfig } from "next";

// Bundle analyzer (run with ANALYZE=true npm run build)
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ["app", "components", "lib", "scripts"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // typedRoutes: true,
  },
  outputFileTracingRoot: __dirname,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
  // Performance optimizations
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header for security
};

export default withBundleAnalyzer(nextConfig);
