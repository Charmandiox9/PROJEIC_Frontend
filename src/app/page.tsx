import Image from "next/image";
import LoginButton from "@/components/auth/LoginButton";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-[calc(100vh-73px)] p-8">
      {/* Contenedor Principal */}
      <div className="max-w-5xl w-full space-y-12 text-center mt-10">
        
        {/* Sección Hero */}
        <div className="space-y-6 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Bienvenido a <span className="text-blue-600 dark:text-blue-400">PROJEIC</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Tu plataforma centralizada para gestionar, supervisar y concretar tus proyectos de manera eficiente y segura. ¡Inicia sesión para descubrir todo lo que PROJEIC tiene para ofrecer!
          </p>
        </div>

        {/* Acción Principal */}
        <div className="flex justify-center pb-10">
          <div className="transform transition hover:scale-105">
            <LoginButton />
          </div>
        </div>

        {/* Grilla de Características (Filler visual) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-zinc-200 dark:border-zinc-800 pt-16">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 transition-colors">
            <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-white">🚀 Rápido y Seguro</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Autenticación robusta con Google OAuth2 y JWT para proteger cada uno de tus endpoints.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 transition-colors">
            <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-white">⚡ Stack Moderno</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Construido con las últimas herramientas del mercado: Next.js App Router, NestJS y GraphQL.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 transition-colors">
            <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-white">🛠️ 100% Escalable</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Arquitectura completamente desacoplada y lista para crecer junto con las necesidades de tu sistema.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}