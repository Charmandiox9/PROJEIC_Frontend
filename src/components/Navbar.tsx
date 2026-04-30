'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Sun, Moon, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useT } from '@/hooks/useT';
import logoTexto from '../../public/Logo__Texto.png';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const { locale, toggle: toggleLocale } = useLocale();
  const { t } = useT();
  
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navRef = useRef<HTMLElement>(null);
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const animatedEntrance = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const navEl = navRef.current;

    if (mounted && !animatedEntrance.current && navEl) {
      animatedEntrance.current = true;
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({
          targets: navEl.querySelectorAll('.nav-animate-item'),
          opacity: [0, 1],
          translateY: [-10, 0],
          duration: 600,
          delay: anime.stagger(80),
          easing: 'easeOutExpo',
        });
      });
    }
  }, [mounted]);

  useEffect(() => {
    const mobileEl = mobileMenuRef.current;

    if (isMobileMenuOpen && mobileEl) {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({
          targets: mobileEl.querySelectorAll('.mobile-item'),
          opacity: [0, 1],
          translateX: [-15, 0],
          duration: 400,
          delay: anime.stagger(50),
          easing: 'easeOutExpo',
        });
      });
    }
  }, [isMobileMenuOpen]);

  const handleThemeToggle = () => {
    toggle();
    if (themeBtnRef.current) {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({
          targets: themeBtnRef.current,
          rotate: '+=180',
          scale: [0.8, 1],
          duration: 600,
          easing: 'easeOutBack',
        });
      });
    }
  };

  const handleLogoEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: e.currentTarget,
        scale: 1.05,
        translateY: -2,
        duration: 400,
        easing: 'easeOutElastic(1, .6)',
      });
    });
  };

  const handleLogoLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: e.currentTarget,
        scale: 1,
        translateY: 0,
        duration: 300,
        easing: 'easeOutExpo',
      });
    });
  };

  if (pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <nav ref={navRef} className="flex items-center justify-between px-6 py-4 bg-surface-nav text-white border-b border-white/10 shadow-sm relative z-50 dark:border-white/5">
      <div className="flex flex-1 items-center">
        <Link 
          href="/" 
          className="flex items-center origin-left nav-animate-item" 
          style={{ opacity: mounted ? undefined : 0 }}
          onMouseEnter={handleLogoEnter}
          onMouseLeave={handleLogoLeave}
        >
          <Image
            src={logoTexto}
            alt="PROJEIC Logo"
            className="w-auto h-10 md:h-12 object-contain"
            style={{ width: 'auto', height: '100%', maxHeight: '48px' }}
            priority
          />
        </Link>
      </div>

      <div className="hidden md:flex flex-1 justify-center space-x-6">
        <Link href="/proyectos" className={`nav-animate-item text-sm font-medium px-3 py-1.5 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-white ${pathname.startsWith('/proyectos') ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`} style={{ opacity: mounted ? undefined : 0 }}>
          {t('nav.projects')}
        </Link>
        <Link href="/acerca" className={`nav-animate-item text-sm font-medium px-3 py-1.5 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-white ${pathname.startsWith('/acerca') ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`} style={{ opacity: mounted ? undefined : 0 }}>
          {t('nav.about')}
        </Link>
        <Link href="/eic" className={`nav-animate-item text-sm font-medium px-3 py-1.5 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-white ${pathname.startsWith('/eic') ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`} style={{ opacity: mounted ? undefined : 0 }}>
          {t('nav.eic')}
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end space-x-4">
        <button
          ref={themeBtnRef}
          onClick={handleThemeToggle}
          aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
          className="nav-animate-item p-2 rounded-lg text-white/70 hover:text-white hover:bg-surface-primary/10 transition-colors"
          style={{ opacity: mounted ? undefined : 0 }}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={toggleLocale}
          aria-label={locale === 'es' ? 'Switch to English' : locale === 'en' ? 'Mudar para português' : 'Cambiar a Español'}
          className="nav-animate-item p-2 rounded-lg text-white/70 hover:text-white hover:bg-surface-primary/10 transition-colors text-xs font-bold tracking-wide"
          style={{ opacity: mounted ? undefined : 0 }}
        >
          {locale === 'es' ? 'EN' : locale === 'en' ? 'PT' : 'ES'}
        </button>
        <div className="hidden md:flex items-center space-x-4">
          {!mounted ? (
            <div className="w-64 h-10 animate-pulse bg-surface-primary/10 rounded-lg"></div>
          ) : isAuthenticated ? (
            <>
              <Link
                href="/misc/profile"
                className="nav-animate-item text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                {t('nav.hello')}, {user?.name?.split(' ')[0] || t('nav.user')}
              </Link>
              <Link
                href="/misc/profile"
                className="nav-animate-item px-4 py-2 text-sm font-medium bg-surface-btn text-text-btn hover:bg-surface-btn-hover rounded-lg transition-colors shadow-sm"
              >
                {t('nav.dashboard')}
              </Link>
              <button
                onClick={logout}
                className="nav-animate-item px-4 py-2 text-sm font-medium text-white/80 border border-white/20 rounded-lg hover:bg-surface-primary/10 hover:text-white transition-colors"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="nav-animate-item px-4 py-2 text-sm font-medium text-ui-dark bg-surface-primary border border-transparent rounded-lg hover:bg-surface-secondary transition-colors shadow-sm dark:text-brand dark:bg-transparent dark:border-brand dark:hover:bg-brand/10"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="nav-animate-item md:hidden p-2 text-white/80 hover:text-white"
          style={{ opacity: mounted ? undefined : 0 }}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú Móvil */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden absolute top-full left-0 w-full bg-surface-nav border-b border-white/10 dark:border-white/5 py-4 px-6 flex flex-col space-y-4 shadow-xl z-50">
          <Link
            href="/proyectos"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`mobile-item text-sm font-medium px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/proyectos') ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`}
            style={{ opacity: 0 }}
          >
            {t('nav.projects')}
          </Link>
          <Link
            href="/acerca"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`mobile-item text-sm font-medium px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/acerca') ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`}
            style={{ opacity: 0 }}
          >
            {t('nav.about')}
          </Link>
          <Link
            href="/eic"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`mobile-item text-sm font-medium px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/eic') ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`}
            style={{ opacity: 0 }}
          >
            {t('nav.eic')}
          </Link>

          <div className="mobile-item w-full h-px bg-surface-primary/10 my-2" style={{ opacity: 0 }}></div>

          {!mounted ? null : isAuthenticated ? (
            <div className="flex flex-col space-y-3">
              <span className="mobile-item text-sm font-medium text-white/90 px-3" style={{ opacity: 0 }}>
                {t('nav.hello')}, {user?.name?.split(' ')[0] || t('nav.user')}
              </span>
              <Link
                href="/misc/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-item w-full text-center px-4 py-2 text-sm font-medium bg-surface-btn text-text-btn hover:bg-surface-btn-hover rounded-lg transition-colors shadow-sm"
                style={{ opacity: 0 }}
              >
                {t('nav.dashboard')}
              </Link>
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="mobile-item w-full px-4 py-2 text-sm font-medium text-white/80 border border-white/20 rounded-lg hover:bg-surface-primary/10 hover:text-white transition-colors"
                style={{ opacity: 0 }}
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mobile-item w-full text-center px-4 py-2 text-sm font-medium text-ui-dark bg-surface-primary rounded-lg hover:bg-surface-secondary transition-colors shadow-sm dark:text-brand dark:bg-transparent dark:border dark:border-brand dark:hover:bg-brand/10"
              style={{ opacity: 0 }}
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}