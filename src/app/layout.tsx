import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Projeic App",
  description: "Plataforma centralizada de proyectos",
  icons: {
    icon: '/projeic/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-white text-zinc-900 min-h-screen flex flex-col">
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}