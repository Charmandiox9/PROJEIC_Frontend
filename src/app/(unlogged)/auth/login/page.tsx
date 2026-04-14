'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, LayoutDashboard, Users, Bell, Shield } from 'lucide-react';
import logoTexto from '../../../../../public/Logo__Texto.png';
import logoIcon from '../../../../../public/logo.png';

export default function AuthPage() {
  const handleOAuthLogin = () => {
    let baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    console.log(baseUrl);
    if (!baseUrl) {
      const isProduction = window.location.hostname.includes('railway.app');
      baseUrl = isProduction 
        ? 'https://projeicbackend-development.up.railway.app' 
        : 'http://localhost:4000'; // Ajusta a tu puerto local si es otro
    }

    // 3. Limpieza: Aseguramos que no haya doble slash y redirigimos
    const finalUrl = `${baseUrl.replace(/\/$/, '')}/projeic/api/auth/google`;
    
    console.log("Redirigiendo a:", finalUrl);
    window.location.href = finalUrl;
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Columna izquierda (oculta en mobile, visible en md) */}
      <div className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-[#0f2942] via-[#153a5c] to-[#0a1f33] animate-gradient relative overflow-hidden py-12 px-12 lg:px-24">

        <div className="relative z-10 flex">
          <Link
            href="/"
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Formas decorativas */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-surface-primary/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 right-12 w-64 h-64 bg-surface-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-surface-primary/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>        

        <div className="relative z-10 flex flex-col justify-center flex-1 max-w-lg">
          <Image
            src={logoTexto}
            alt="PROJEIC"
            className="mb-12"
            style={{ width: '200px', height: 'auto' }}
            priority
          />

          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-snug">
            Gestión estructurada para tus proyectos
          </h1>
          <p className="text-white/80 text-lg mb-12">
            Centraliza la información, colabora con tu equipo y mantén el control de cada etapa de desarrollo.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 text-white/80">
              <div className="bg-surface-primary/10 p-3 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-base font-medium">Tableros Kanban</span>
            </div>
            
            <div className="flex items-center space-x-4 text-white/80">
              <div className="bg-surface-primary/10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-base font-medium">Gestión de Equipos</span>
            </div>

            <div className="flex items-center space-x-4 text-white/80">
              <div className="bg-surface-primary/10 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <span className="text-base font-medium">Notificaciones en tiempo real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Columna derecha (100% width en mobile, 50% en desktop) */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-surface-primary relative animate-fade-in-up shrink-0">
        
        <Link
          href="/"
          className="md:hidden absolute top-6 left-6 flex items-center space-x-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al inicio</span>
        </Link>

        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <Image 
            src={logoIcon} 
            alt="PROJEIC Icon" 
            width={60} 
            height={60} 
            className="mb-8"
            style={{ height: 'auto' }} 
            priority
          />
          
          <div className="flex items-center space-x-2 bg-brand/5 text-brand px-3 py-1 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wider">DESARROLLO AUTENTICADO</span>
          </div>

          <h2 className="text-3xl font-bold text-text-primary mb-3">Bienvenido</h2>
          <p className="text-text-muted text-sm mb-10 leading-relaxed">
            Accede directamente al panel de proyectos utilizando tu identidad universitaria provista por la red EIC UCN.
          </p>

          <button
            onClick={handleOAuthLogin}
            type="button"
            className="shimmer-btn w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-border-primary hover:bg-surface-secondary text-text-secondary font-medium rounded-xl transition-all shadow-sm hover:shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 text-base"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
