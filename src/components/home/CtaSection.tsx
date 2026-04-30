'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useT } from '@/hooks/useT';

export default function CtaSection() {
  const { user } = useAuth();
  const { t } = useT();
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || animatedRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animatedRef.current) return;
        animatedRef.current = true;
        observer.disconnect();

        import('animejs').then((mod) => {
          const anime = mod.default ?? mod;
          const tl = anime.timeline({
            easing: 'easeOutExpo',
          });

          tl.add({
            targets: el.querySelectorAll('[data-cta-text]'),
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 700,
            delay: anime.stagger(120),
          })
          .add({
            targets: el.querySelector('[data-cta-button]'),
            opacity: [0, 1],
            scale: [0.9, 1],
            translateY: [15, 0],
            duration: 600,
          }, '-=400');
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleButtonEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const arrow = target.querySelector('svg');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      
      anime({
        targets: target,
        scale: 1.04,
        duration: 400,
        easing: 'easeOutElastic(1, .6)',
      });

      if (arrow) {
        anime({
          targets: arrow,
          translateX: 5,
          duration: 300,
          easing: 'easeOutQuad',
        });
      }
    });
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const arrow = target.querySelector('svg');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      
      anime({
        targets: target,
        scale: 1,
        duration: 400,
        easing: 'easeOutExpo',
      });

      if (arrow) {
        anime({
          targets: arrow,
          translateX: 0,
          duration: 300,
          easing: 'easeOutQuad',
        });
      }
    });
  };

  return (
    <section ref={sectionRef} className="bg-surface-nav py-12 sm:py-16 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-center md:text-left relative z-10">

        <div className="text-white">
          <h2 data-cta-text style={{ opacity: 0 }} className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
            {t('cta.heading')}
          </h2>
          <p data-cta-text style={{ opacity: 0 }} className="text-blue-200 text-sm sm:text-base">
            {t('cta.subheading')}
          </p>
        </div>

        <Link
          data-cta-button
          style={{ opacity: 0 }}
          href={!mounted ? '/auth/login?tab=register' : user ? '/misc/proyectos' : '/auth/login?tab=register'}
          className="w-full sm:w-auto flex justify-center items-center px-8 py-3.5 text-sm font-semibold text-text-btn bg-surface-btn rounded-lg hover:bg-surface-btn-hover shadow-lg hover:shadow-xl transition-shadow whitespace-nowrap"
          onMouseEnter={handleButtonEnter}
          onMouseLeave={handleButtonLeave}
        >
          {!mounted ? t('cta.createProject') : user ? t('cta.myProjects') : t('cta.createProject')}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </section>
  );
}