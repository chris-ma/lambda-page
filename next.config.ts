import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lighthouse/chrome-launcher/playwright use dynamic requires that Turbopack
  // can't statically bundle — run them as native Node requires instead.
  serverExternalPackages: ["lighthouse", "chrome-launcher", "playwright"],
};

export default nextConfig;
