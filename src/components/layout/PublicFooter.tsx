'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { LayoutGrid, Info, GraduationCap, Github, Building2, Cpu, TerminalSquare } from 'lucide-react';
import logoTexto from '../../../public/Logo__Texto.png';
import { useT } from '@/hooks/useT';

export default function PublicFooter() {
  const { t } = useT();
  const footerRef = useRef<HTMLElement>(null);
  const animatedRef = useRef(false);
  // Cache the anime module so HMR re-imports don't leave stale references
  const animeRef = useRef<((opts: object) => unknown) | null>(null);

  useEffect(() => {
    // Pre-load animejs once and cache it
    import('animejs').then((mod) => {
      animeRef.current = mod.default ?? mod;
    });
  }, []);

  useEffect(() => {
    const el = footerRef.current;
    if (!el || animatedRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animatedRef.current) return;
        animatedRef.current = true;
        observer.disconnect();

        import('animejs').then((mod) => {
          const anime = mod.default ?? mod;
          const tl = (anime as { timeline: (opts: object) => { add: (...args: unknown[]) => unknown } }).timeline({
            easing: 'easeOutExpo',
          });

          tl.add({
            targets: el.querySelectorAll('[data-footer-col]'),
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 700,
            delay: (anime as { stagger: (n: number) => unknown }).stagger(100),
          });
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleLinkEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('svg');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      (anime as (opts: object) => void)({ targets: target, translateX: 4, duration: 300, easing: 'easeOutQuad' });
      if (icon) {
        (anime as (opts: object) => void)({ targets: icon, rotate: 8, scale: 1.1, duration: 300, easing: 'easeOutBack' });
      }
    });
  };

  const handleLinkLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('svg');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      (anime as (opts: object) => void)({ targets: target, translateX: 0, duration: 300, easing: 'easeOutQuad' });
      if (icon) {
        (anime as (opts: object) => void)({ targets: icon, rotate: 0, scale: 1, duration: 300, easing: 'easeOutQuad' });
      }
    });
  };

  const handleLogoEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      (anime as (opts: object) => void)({
        targets: e.currentTarget,
        scale: 1.02,
        translateY: -2,
        duration: 400,
        easing: 'easeOutElastic(1, .6)',
      });
    });
  };

  const handleLogoLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      (anime as (opts: object) => void)({
        targets: e.currentTarget,
        scale: 1,
        translateY: 0,
        duration: 300,
        easing: 'easeOutExpo',
      });
    });
  };

  return (
    <footer ref={footerRef} className="bg-ui-dark dark:bg-ui-darker text-white py-12 px-6 border-t border-white/5 overflow-hidden">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        {/* Columna 1: Logo */}
        <div data-footer-col style={{ opacity: 0 }} className="flex flex-col space-y-4">
          <div
            className="inline-block cursor-pointer origin-left"
            onMouseEnter={handleLogoEnter}
            onMouseLeave={handleLogoLeave}
          >
            <Image
              src={logoTexto}
              alt="PROJEIC Logo"
              className="w-40 h-auto object-contain"
              priority
            />
          </div>
          <p className="text-sm text-white/50 mt-2">
            {t('publicFooter.description')}
          </p>
        </div>

        {/* Columna 2: Plataforma */}
        <div data-footer-col style={{ opacity: 0 }} className="flex flex-col space-y-4">
          <h3 className="font-semibold text-lg text-white/90">{t('publicFooter.platform')}</h3>
          <Link href="/proyectos" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors w-fit" onMouseEnter={handleLinkEnter} onMouseLeave={handleLinkLeave}>
            <LayoutGrid className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
            <span>{t('publicFooter.projects')}</span>
          </Link>
          <Link href="/acerca" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors w-fit" onMouseEnter={handleLinkEnter} onMouseLeave={handleLinkLeave}>
            <Info className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
            <span>{t('publicFooter.about')}</span>
          </Link>
          <Link href="/eic" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors w-fit" onMouseEnter={handleLinkEnter} onMouseLeave={handleLinkLeave}>
            <GraduationCap className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
            <span>EIC</span>
          </Link>
        </div>

        {/* Columna 3: Universidad */}
        <div data-footer-col style={{ opacity: 0 }} className="flex flex-col space-y-4">
          <h3 className="font-semibold text-lg text-white/90">{t('publicFooter.university')}</h3>
          <a href="https://www.ucn.cl/" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors w-fit" onMouseEnter={handleLinkEnter} onMouseLeave={handleLinkLeave}>
            <Building2 className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
            <span>UCN</span>
          </a>
          <a href="https://eic.ucn.cl/" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors w-fit" onMouseEnter={handleLinkEnter} onMouseLeave={handleLinkLeave}>
            <Cpu className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
            <span>EIC UCN</span>
          </a>
        </div>

        {/* Columna 4: Desarrolladores */}
        <div data-footer-col style={{ opacity: 0 }} className="flex flex-col space-y-4">
          <h3 className="font-semibold text-lg text-white/90">{t('publicFooter.developers')}</h3>

          <div className="flex flex-col space-y-3">
            <a href="https://github.com/Marton1123" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors w-fit" onMouseEnter={handleLinkEnter} onMouseLeave={handleLinkLeave}>
              <TerminalSquare className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
              <span>Martín Castillo</span>
            </a>
            <a href="https://github.com/Charmandiox9" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors w-fit" onMouseEnter={handleLinkEnter} onMouseLeave={handleLinkLeave}>
              <TerminalSquare className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
              <span>Daniel Durán</span>
            </a>
          </div>

          <div className="pt-2 flex flex-col space-y-3">
            <a href="https://github.com/Charmandiox9/PROJEIC_Frontend" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors w-fit" onMouseEnter={handleLinkEnter} onMouseLeave={handleLinkLeave}>
              <Github className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
              <span>{t('publicFooter.frontendCode')}</span>
            </a>
            <a href="https://github.com/Charmandiox9/PROJEIC_Backend" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors w-fit" onMouseEnter={handleLinkEnter} onMouseLeave={handleLinkLeave}>
              <Github className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
              <span>{t('publicFooter.backendCode')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div data-footer-bottom className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex justify-center items-center">
        <p className="text-center text-xs text-white/50">
          {t('publicFooter.copyright').replace('{year}', new Date().getFullYear().toString())}
        </p>
      </div>
    </footer>
  );
}