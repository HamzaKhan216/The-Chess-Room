import type { NextConfig } from "next"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

const nextConfig: NextConfig = {
  /* config options here */
  // reactStrictMode: false,
  // output: "export",
  basePath: basePath,
  assetPrefix: basePath ? basePath + "/" : undefined,
  // distDir: "dist",
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ]
  }
}

export default nextConfig