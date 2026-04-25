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
    // En producción (Docker en la VM o Railway): Next.js no hace proxy.
    // Nginx o la plataforma manejan el enrutamiento directamente.
    if (process.env.NODE_ENV === "production") {
      return [];
    }

    // En desarrollo (npm run dev): Next.js actúa como proxy para evitar errores de CORS.
    // Buscamos la URL en las variables de entorno, y si no hay, caemos en localhost.
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const cleanBackendUrl = backendUrl.replace(/\/$/, '');

    return [
      {
        // Con basePath "/projeic", Next.js ya evaluó la ruta internamente.
        source: "/api/:path*",
        destination: `${cleanBackendUrl}/projeic/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
