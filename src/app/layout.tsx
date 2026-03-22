import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/context/AuthProvider";
import Navbar from "@/components/Navbar";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Projeic App | CodeVerse",
  description: "Plataforma centralizada de proyectos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}