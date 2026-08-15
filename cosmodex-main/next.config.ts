import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root so root-level files (e.g. middleware.ts) are discovered
  // instead of letting Turbopack infer an incorrect workspace root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
