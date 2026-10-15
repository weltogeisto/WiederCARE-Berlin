import type { NextConfig } from "next";

// GitHub Pages serves a project site under /<repo>/. The workflow sets NEXT_PUBLIC_BASE_PATH.
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

const config: NextConfig = {
  output: "export",
  basePath: base,
  assetPrefix: base || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default config;
