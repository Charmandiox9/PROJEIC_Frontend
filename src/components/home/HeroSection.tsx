'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import StatsSection from './StatsSection';
import { useAuth } from '@/context/AuthProvider';

export default function HeroSection() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;

      const tl = anime.timeline({
        easing: 'easeOutExpo',
        duration: 800,
      });

      tl.add({
        targets: badgeRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
      })
      .add({
        targets: headingRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.95, 1],
      }, '-=600')
      .add({
        targets: subtitleRef.current,
        opacity: [0, 1],
        translateY: [15, 0],
      }, '-=600')
      .add({
        targets: ctaRef.current,
        opacity: [0, 1],
        translateY: [15, 0],
      }, '-=600');

      tl.finished.then(() => {
        anime({
          targets: badgeRef.current,
          translateY: [0, -4, 0],
          duration: 3000,
          loop: true,
          easing: 'easeInOutSine',
        });
      });
    });
  }, []);

  const handlePrimaryHover = (e: React.MouseEvent<HTMLAnchorElement>, isEntering: boolean) => {
    const target = e.currentTarget;
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: target,
        scale: isEntering ? 1.03 : 1,
        duration: 400,
        easing: 'easeOutElastic(1, .6)',
      });
    });
  };

  const handleSecondaryHover = (e: React.MouseEvent<HTMLAnchorElement>, isEntering: boolean) => {
    const arrow = e.currentTarget.querySelector('svg');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: arrow,
        translateX: isEntering ? 4 : 0,
        duration: 300,
        easing: 'easeOutQuad',
      });
    });
  };

  return (
    <section className="bg-surface-primary py-12 md:py-24 flex flex-col justify-center overflow-hidden">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative">

        {/* Badge */}
        <div
          ref={badgeRef}
          style={{ opacity: 0 }}
          className="inline-block px-4 py-1 mb-6 text-xs font-semibold tracking-wider text-ui-dark dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm"
        >
          Plataforma de proyectos para la EIC
        </div>

        {/* Heading */}
        <h1
          ref={headingRef}
          style={{ opacity: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-text-primary"
        >
          Gestión de proyectos académicos, <span className="text-brand">en un solo lugar</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          style={{ opacity: 0 }}
          className="text-sm sm:text-base md:text-lg text-text-muted mb-10 max-w-2xl mx-auto"
        >
          PROJEIC centraliza el seguimiento, la trazabilidad y la visibilidad de los proyectos de la Escuela de Ingeniería Coquimbo.
        </p>

        {/* CTAs */}
        <div
          ref={ctaRef}
          style={{ opacity: 0 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href={!mounted ? '/auth/login?tab=register' : user ? '/misc/profile' : '/auth/login?tab=register'}
            onMouseEnter={(e) => handlePrimaryHover(e, true)}
            onMouseLeave={(e) => handlePrimaryHover(e, false)}
            className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-white bg-brand hover:bg-brand-hover border border-transparent rounded-lg shadow-sm transition-colors"
          >
            {!mounted ? 'Comenzar ahora' : user ? 'Ir al panel' : 'Comenzar ahora'}
          </Link>

          <Link
            href="/proyectos"
            onMouseEnter={(e) => handleSecondaryHover(e, true)}
            onMouseLeave={(e) => handleSecondaryHover(e, false)}
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 text-sm font-semibold text-ui-dark dark:text-white bg-white dark:bg-white/10 border border-gray-300 dark:border-white/30 rounded-lg hover:bg-gray-50 dark:hover:bg-white/20 transition-colors shadow-sm"
          >
            Ver proyectos públicos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      <div className="mt-16 md:mt-24 px-4 sm:px-6">
        <StatsSection />
      </div>
    </section>
  );
}