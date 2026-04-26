'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, LayoutDashboard, Users, Bell, Shield } from 'lucide-react';
import logoTexto from '../../../../../public/Logo__Texto.png';
import logoIcon from '../../../../../public/logo.png';

function AuthContent() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite_token');

  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  const handleOAuthLogin = () => {
    let baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  
    if (baseUrl.includes("graphql")) {
      baseUrl = "";
    }
  
    if (!baseUrl) {
      const { hostname, port } = window.location;
  
      if (hostname.includes('development.up.railway.app')) {
        baseUrl = 'https://projeicbackend-development.up.railway.app';
      } 
      else if (hostname.includes('production.up.railway.app')) {
        baseUrl = 'https://projeicbackend-production.up.railway.app';
      } 
      // 🛡️ CORRECCIÓN PARA EL TÚNEL: 
      else if (hostname === 'localhost' && port === '8080') {
        baseUrl = ''; 
      }
      // Si es localhost 3000, es desarrollo real en tu PC.
      else if (hostname === 'localhost' && process.env.NODE_ENV === 'development') {
        baseUrl = 'http://localhost:4000';
      } 
      else {
        baseUrl = '';
      }
    }
  
    const cleanBaseUrl = baseUrl ? baseUrl.replace(/\/$/, '') : '';
    const finalUrl = `${cleanBaseUrl}/projeic/api/auth/google`;
    
    console.log("Redirigiendo a:", finalUrl);
    window.location.href = finalUrl;
  };

  useEffect(() => {
    if (inviteToken) {
      localStorage.setItem('pending_invite_token', inviteToken);
    }
  }, [inviteToken]);

  /* ── Animación Inicial Coreografiada ── */
  useEffect(() => {
    if (animatedRef.current) return;
    animatedRef.current = true;

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      const tl = anime.timeline({ easing: 'easeOutExpo' });

      // 1. Elementos de la columna izquierda (Propuesta de valor)
      if (leftColRef.current) {
        tl.add({
          targets: leftColRef.current.querySelectorAll('.left-anim-item'),
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 800,
          delay: anime.stagger(100),
        });
      }

      // 2. Elementos de la columna derecha (Formulario)
      if (rightColRef.current) {
        tl.add({
          targets: rightColRef.current.querySelectorAll('.right-anim-item'),
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 700,
          delay: anime.stagger(80),
        }, '-=500'); // Comienza a la mitad de la animación izquierda
      }
    });
  }, []);

  /* ── Interacciones Hover ── */
  const handleBackEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const arrow = e.currentTarget.querySelector('svg');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      if (arrow) {
        anime({
          targets: arrow,
          translateX: -4,
          duration: 300,
          easing: 'easeOutQuad',
        });
      }
    });
  };

  const handleBackLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const arrow = e.currentTarget.querySelector('svg');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      if (arrow) {
        anime({
          targets: arrow,
          translateX: 0,
          duration: 400,
          easing: 'easeOutExpo',
        });
      }
    });
  };

  const handleGoogleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('svg');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: target,
        scale: 1.02,
        duration: 400,
        easing: 'easeOutElastic(1, .6)',
      });
      if (icon) {
        anime({
          targets: icon,
          rotate: [0, 10, -5, 0],
          scale: 1.1,
          duration: 500,
          easing: 'easeOutElastic(1, .6)',
        });
      }
    });
  };

  const handleGoogleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('svg');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: target,
        scale: 1,
        duration: 400,
        easing: 'easeOutExpo',
      });
      if (icon) {
        anime({
          targets: icon,
          rotate: 0,
          scale: 1,
          duration: 400,
          easing: 'easeOutExpo',
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Columna izquierda (oculta en mobile, visible en md) */}
      <div ref={leftColRef} className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-[#0f2942] via-[#153a5c] to-[#0a1f33] animate-gradient relative overflow-hidden py-12 px-12 lg:px-24">

        <div className="relative z-10 flex left-anim-item" style={{ opacity: 0 }}>
          <Link
            href="/"
            onMouseEnter={handleBackEnter}
            onMouseLeave={handleBackLeave}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors text-sm font-medium w-fit"
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
          <div className="left-anim-item origin-left" style={{ opacity: 0 }}>
            <Image
              src={logoTexto}
              alt="PROJEIC"
              className="mb-12"
              style={{ width: '200px', height: 'auto' }}
              priority
            />
          </div>

          <h1 className="left-anim-item text-3xl lg:text-4xl font-bold text-white mb-4 leading-snug" style={{ opacity: 0 }}>
            Gestión estructurada para tus proyectos
          </h1>
          <p className="left-anim-item text-white/80 text-lg mb-12" style={{ opacity: 0 }}>
            Centraliza la información, colabora con tu equipo y mantén el control de cada etapa de desarrollo.
          </p>

          <div className="space-y-6">
            <div className="left-anim-item flex items-center space-x-4 text-white/80" style={{ opacity: 0 }}>
              <div className="bg-surface-primary/10 p-3 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-base font-medium">Tableros Kanban</span>
            </div>
            
            <div className="left-anim-item flex items-center space-x-4 text-white/80" style={{ opacity: 0 }}>
              <div className="bg-surface-primary/10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-base font-medium">Gestión de Equipos</span>
            </div>

            <div className="left-anim-item flex items-center space-x-4 text-white/80" style={{ opacity: 0 }}>
              <div className="bg-surface-primary/10 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <span className="text-base font-medium">Notificaciones en tiempo real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Columna derecha (100% width en mobile, 50% en desktop) */}
      <div ref={rightColRef} className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-surface-primary relative shrink-0">
        
        <Link
          href="/"
          onMouseEnter={handleBackEnter}
          onMouseLeave={handleBackLeave}
          className="md:hidden absolute top-6 left-6 flex items-center space-x-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium w-fit right-anim-item"
          style={{ opacity: 0 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al inicio</span>
        </Link>

        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <div className="right-anim-item" style={{ opacity: 0 }}>
            <Image 
              src={logoIcon} 
              alt="PROJEIC Icon" 
              width={60} 
              height={60} 
              className="mb-8"
              style={{ height: 'auto' }} 
              priority
            />
          </div>
          
          <div className="right-anim-item flex items-center space-x-2 bg-brand/5 text-brand px-3 py-1 rounded-full mb-6" style={{ opacity: 0 }}>
            <Shield className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wider">DESARROLLO AUTENTICADO</span>
          </div>

          <h2 className="right-anim-item text-3xl font-bold text-text-primary mb-3" style={{ opacity: 0 }}>Bienvenido</h2>
          <p className="right-anim-item text-text-muted text-sm mb-10 leading-relaxed" style={{ opacity: 0 }}>
            Accede directamente al panel de proyectos utilizando tu identidad universitaria provista por la red EIC UCN.
          </p>

          {inviteToken && (
            <div className="right-anim-item w-full p-4 mb-6 bg-brand/10 border border-brand/20 rounded-xl flex items-start gap-3 text-left" style={{ opacity: 0 }}>
              <Users className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-brand">Tienes una invitación pendiente</p>
                <p className="text-xs text-text-muted mt-1">Inicia sesión con tu cuenta universitaria para aceptarla automáticamente y unirte al proyecto.</p>
              </div>
            </div>
          )}

          <button
            onClick={handleOAuthLogin}
            onMouseEnter={handleGoogleEnter}
            onMouseLeave={handleGoogleLeave}
            type="button"
            className="right-anim-item shimmer-btn w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-border-primary hover:bg-surface-secondary text-text-secondary font-medium rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 text-base"
            style={{ opacity: 0 }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0 origin-center">
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

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface-primary">
        <div className="animate-pulse text-brand font-medium">Cargando plataforma...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}