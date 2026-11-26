import type { NextConfig } from "next";
import { LABS } from "./app/links";

const nextConfig: NextConfig = {
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return LABS.flatMap((lab) => [
      { source: `/labs/${lab.slug}`, destination: `${lab.origin}/` },
      { source: `/labs/${lab.slug}/:path*`, destination: `${lab.origin}/:path*` },
    ]);
  },
};

export default nextConfig;
