import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/projeic",
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    // En desarrollo: Next.js actúa como proxy al backend local
    // En producción (Docker): array vacío → nginx maneja el enrutamiento
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        // Con basePath "/projeic", Next.js ya quitó el prefijo antes de evaluar rewrites.
        // El navegador pide /projeic/api/graphql → internamente llega como /api/graphql
        source: "/api/:path*",
        destination: "http://localhost:4000/projeic/api/:path*",
      },
    ];
  },
};

export default nextConfig;
