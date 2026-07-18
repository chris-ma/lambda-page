import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These use dynamic requires / ship native binaries that the bundler can't
  // statically inline — run them as native Node requires instead.
  // @sparticuz/chromium must stay external so its Brotli-packed binary is
  // traced into the serverless function and extracted at runtime.
  serverExternalPackages: ["lighthouse", "chrome-launcher", "playwright-core", "@sparticuz/chromium"],
};

export default nextConfig;
