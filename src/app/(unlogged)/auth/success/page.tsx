'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { Loader2, CheckCircle2, XCircle, Shield, User, ArrowRight } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/hooks/useT';

interface GoogleUserPayload {
  email: string;
  sub: string;
  name: string;
  avatar?: string;
  isAdmin?: boolean; 
}

const REDEEM_INVITATION_MUTATION = `
  mutation RedeemProjectInvitation($token: String!) {
    redeemProjectInvitation(token: $token) {
      id
      projectId
    }
  }
`;

function AuthSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { isDark } = useTheme();
  const { t } = useT();
  const [mounted, setMounted] = useState(false);

  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [userName, setUserName] = useState<string>('');
  
  // 🔥 ESTADOS PARA LA ELECCIÓN DEL ADMIN
  const [showAdminChoice, setShowAdminChoice] = useState(false);
  const [userUrl, setUserUrl] = useState('/projeic/misc/profile');

  const containerRef = useRef<HTMLDivElement>(null);
  const iconContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      if (containerRef.current) {
        anime.timeline({ easing: 'easeOutExpo' })
          .add({
            targets: containerRef.current.querySelectorAll('.auth-anim-item'),
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            delay: anime.stagger(150)
          });
      }
    });
  }, []);

  useEffect(() => {
    if (authStatus !== 'loading') {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        if (iconContainerRef.current) {
          anime({
            targets: iconContainerRef.current,
            scale: [0.8, 1.1, 1],
            duration: 800,
            easing: 'easeOutElastic(1, .5)',
          });
        }
      });
    }
  }, [authStatus]);

  useEffect(() => {
    const processAuth = async () => {
      const token = searchParams.get('token');
      let calculatedUserUrl = '/projeic/misc/profile';

      if (token) {
        localStorage.setItem('projeic_accessToken', token);
        let isUserAdmin = false;

        try {
          const decoded = jwtDecode<GoogleUserPayload>(token);
          isUserAdmin = decoded.isAdmin || false;

          const userData = {
            userId: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            avatarUrl: decoded.avatar,
            isAdmin: isUserAdmin
          };
          localStorage.setItem('projeic_user', JSON.stringify(userData));
          
          const firstName = decoded.name.split(' ')[0];
          setUserName(firstName);
        } catch (error) {
          console.error("Error al decodificar JWT", error);
        }

        // Lógica de cálculo de URL normal (invitaciones, etc)
        const pendingInviteToken = localStorage.getItem('pending_invite_token');
        if (pendingInviteToken) {
          try {
            const response = await fetchGraphQL({
              query: REDEEM_INVITATION_MUTATION,
              variables: { token: pendingInviteToken }
            });
            localStorage.removeItem('pending_invite_token');
            if (!response.errors) {
              calculatedUserUrl = `/projeic/misc/proyectos/${response.redeemProjectInvitation.projectId}/invites`;
            }
          } catch (error) {
            localStorage.removeItem('pending_invite_token');
          }
        } else {
          const redirectAfterLogin = localStorage.getItem('redirect_after_login');
          if (redirectAfterLogin) {
            localStorage.removeItem('redirect_after_login');
            calculatedUserUrl = redirectAfterLogin;
          }
        }

        setUserUrl(calculatedUserUrl);
        setAuthStatus('success');

        // 🔥 LÓGICA DE DECISIÓN
        if (isUserAdmin) {
          setTimeout(() => {
            setShowAdminChoice(true);
          }, 1500);
        } else {
          setTimeout(() => {
            window.location.href = calculatedUserUrl;
          }, 2000);
        }

      } else {
        setAuthStatus('error');
        setTimeout(() => {
          window.location.href = '/projeic/auth/login';
        }, 2500);
      }
    };

    processAuth();
  }, [router, searchParams]);

  const isDarkMode = mounted && isDark;

  const statusConfig = {
    loading: {
      glowClass: isDarkMode ? 'bg-brand/30' : 'bg-brand/20',
      icon: <Loader2 className="w-10 h-10 text-brand animate-spin" />,
      title: t('authSuccess.loadingTitle'),
      subtitle: t('authSuccess.loadingSubtitle'),
    },
    success: {
      glowClass: isDarkMode ? 'bg-green-500/30' : 'bg-green-500/20',
      icon: <CheckCircle2 className={`w-10 h-10 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />,
      title: userName ? t('authSuccess.successTitle').replace('{name}', userName) : t('authSuccess.successTitleGeneric'),
      subtitle: t('authSuccess.successSubtitle'),
    },
    error: {
      glowClass: isDarkMode ? 'bg-red-500/30' : 'bg-red-500/20',
      icon: <XCircle className={`w-10 h-10 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />,
      title: t('authSuccess.errorTitle'),
      subtitle: t('authSuccess.errorSubtitle'),
    },
  };

  const currentConfig = statusConfig[authStatus];

  return (
    <div className={`flex justify-center items-center min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-brand-dark' : 'bg-surface-primary'}`}>
      <div ref={containerRef} className="flex flex-col items-center text-center p-8 w-full max-w-2xl">
        
        {/* ICONO CENTRAL */}
        <div className="auth-anim-item relative flex items-center justify-center mb-8">
          <div className={`absolute inset-0 rounded-full blur-xl animate-pulse duration-1000 transition-colors ${currentConfig.glowClass}`}></div>
          <div 
            ref={iconContainerRef}
            className={`relative p-5 rounded-3xl border shadow-2xl transition-colors ${isDarkMode ? 'bg-surface-primary border-border-primary' : 'bg-surface-secondary border-border-primary'}`}
          >
            {currentConfig.icon}
          </div>
        </div>
        
        {/* TEXTO INFORMATIVO (Se oculta si aparece la elección) */}
        {!showAdminChoice ? (
          <div ref={textContainerRef} className="auth-anim-item flex flex-col items-center h-24">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-primary mb-3 tracking-tight">
              {currentConfig.title}
            </h2>
            <p className="text-base text-text-muted dark:text-text-muted max-w-sm leading-relaxed">
              {currentConfig.subtitle}
            </p>
          </div>
        ) : (
          /* 🔥 PANEL DE ELECCIÓN PARA ADMINISTRADORES */
          <div className="auth-anim-item animate-in fade-in zoom-in duration-500 flex flex-col items-center gap-6">
            <div>
              <h2 className="text-2xl font-black text-text-primary mb-1">Acceso de Administrador</h2>
              <p className="text-sm text-text-muted">Selecciona el entorno de trabajo para esta sesión</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {/* Opción Admin */}
              <button 
                onClick={() => window.location.href = '/projeic/admin'}
                className="group relative flex flex-col items-center p-6 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-red-500/20"
              >
                <div className="p-3 bg-red-500 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-red-500/30">
                  <Shield className="w-8 h-8" />
                </div>
                <span className="font-bold text-lg text-text-primary">Panel de Control</span>
                <span className="text-xs text-text-muted mt-1">Gestión global de la UCN</span>
                <ArrowRight className="w-5 h-5 mt-4 text-red-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Opción Usuario Normal */}
              <button 
                onClick={() => window.location.href = userUrl}
                className="group relative flex flex-col items-center p-6 bg-brand/5 hover:bg-brand/10 border border-brand/20 hover:border-brand rounded-3xl transition-all duration-300 shadow-sm hover:shadow-brand/20"
              >
                <div className="p-3 bg-brand rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-brand/30">
                  <User className="w-8 h-8" />
                </div>
                <span className="font-bold text-lg text-text-primary">Vista de Usuario</span>
                <span className="text-xs text-text-muted mt-1">Mis proyectos y perfil</span>
                <ArrowRight className="w-5 h-5 mt-4 text-brand opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-surface-primary dark:bg-brand-dark">
          <Loader2 className="w-10 h-10 text-brand animate-spin" />
        </div>
      }
    >
      <AuthSuccessInner />
    </Suspense>
  );
}