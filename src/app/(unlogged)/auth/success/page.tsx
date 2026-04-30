'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/hooks/useT';

interface GoogleUserPayload {
  email: string;
  sub: string;
  name: string;
  avatar?: string;
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

        if (textContainerRef.current) {
          anime({
            targets: textContainerRef.current,
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 400,
            easing: 'easeOutQuad',
          });
        }
      });
    }
  }, [authStatus]);

  useEffect(() => {
    const processAuth = async () => {
      const token = searchParams.get('token');
      let targetUrl = '/projeic/auth/login';

      if (token) {
        localStorage.setItem('projeic_accessToken', token);

        try {
          const decoded = jwtDecode<GoogleUserPayload>(token);
          const userData = {
            userId: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            avatarUrl: decoded.avatar
          };
          localStorage.setItem('projeic_user', JSON.stringify(userData));
          
          const firstName = decoded.name.split(' ')[0];
          setUserName(firstName);
        } catch (error) {
          console.error("Error al decodificar JWT", error);
        }

        const pendingInviteToken = localStorage.getItem('pending_invite_token');
        
        if (pendingInviteToken) {
          try {
            const response = await fetchGraphQL({
              query: REDEEM_INVITATION_MUTATION,
              variables: { token: pendingInviteToken }
            });

            localStorage.removeItem('pending_invite_token');

            if (!response.errors) {
              targetUrl = `/projeic/misc/proyectos/${response.redeemProjectInvitation.projectId}/invites`;
            } else {
              targetUrl = '/projeic/misc/profile';
            }
          } catch (error) {
            console.error("Error al redimir la invitación:", error);
            localStorage.removeItem('pending_invite_token');
            targetUrl = '/projeic/misc/profile';
          }
        } else {
          const redirectAfterLogin = localStorage.getItem('redirect_after_login');
          if (redirectAfterLogin) {
            localStorage.removeItem('redirect_after_login');
            targetUrl = redirectAfterLogin;
          } else {
            targetUrl = '/projeic/misc/profile';
          }
        }

        setAuthStatus('success');
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 2000);

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
      title: userName
        ? t('authSuccess.successTitle').replace('{name}', userName)
        : t('authSuccess.successTitleGeneric'),
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
      <div ref={containerRef} className="flex flex-col items-center text-center p-8">
        
        <div className="auth-anim-item relative flex items-center justify-center mb-6" style={{ opacity: 0 }}>
          <div className={`absolute inset-0 rounded-full blur-xl animate-pulse duration-1000 transition-colors ${currentConfig.glowClass}`}></div>
          <div 
            ref={iconContainerRef}
            className={`relative p-4 rounded-2xl border shadow-lg transition-colors ${isDarkMode ? 'bg-surface-primary border-border-primary' : 'bg-surface-secondary border-border-primary'}`}
          >
            {currentConfig.icon}
          </div>
        </div>
        
        <div ref={textContainerRef} className="auth-anim-item flex flex-col items-center h-24" style={{ opacity: 0 }}>
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary mb-2 tracking-tight transition-colors">
            {currentConfig.title}
          </h2>
          <p className="text-sm text-text-muted dark:text-text-muted max-w-xs leading-relaxed transition-colors">
            {currentConfig.subtitle}
          </p>
        </div>

      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-surface-primary dark:bg-brand-dark">
          <div className="flex flex-col items-center text-center p-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="relative bg-surface-secondary dark:bg-surface-primary p-4 rounded-2xl border border-border-primary shadow-lg">
                <Loader2 className="w-10 h-10 text-brand animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary mb-2 tracking-tight">Cargando...</h2>
          </div>
        </div>
      }
    >
      <AuthSuccessInner />
    </Suspense>
  );
}