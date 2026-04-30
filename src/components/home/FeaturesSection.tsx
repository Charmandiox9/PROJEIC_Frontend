'use client';

import { useRef, useEffect } from 'react';
import { KanbanSquare, Activity, Globe, Users } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function FeaturesSection() {
  const { t } = useT();
  const sectionRef = useRef<HTMLDivElement>(null);

  const FEATURES = [
    { id: 1, title: t('features.kanbanTitle'), description: t('features.kanbanDesc'), icon: KanbanSquare },
    { id: 2, title: t('features.healthTitle'), description: t('features.healthDesc'), icon: Activity },
    { id: 3, title: t('features.publicTitle'), description: t('features.publicDesc'), icon: Globe },
    { id: 4, title: t('features.rolesTitle'), description: t('features.rolesDesc'), icon: Users },
  ];

  const animatedRef = useRef(false);

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
            targets: el.querySelectorAll('[data-heading-item]'),
            opacity: [0, 1],
            translateY: [24, 0],
            duration: 700,
            delay: anime.stagger(150),
          })
          .add({
            targets: el.querySelectorAll('[data-feature-card]'),
            opacity: [0, 1],
            translateY: [32, 0],
            duration: 800,
            delay: anime.stagger(120),
          }, '-=400');
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const iconContainer = target.querySelector('.feature-icon');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      
      anime({
        targets: target,
        translateY: -8,
        scale: 1.02,
        duration: 400,
        easing: 'easeOutExpo',
      });

      if (iconContainer) {
        anime({
          targets: iconContainer,
          scale: 1.15,
          rotate: [0, 10, -8, 0],
          duration: 600,
          easing: 'easeOutElastic(1, .6)',
        });
      }
    });
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const iconContainer = target.querySelector('.feature-icon');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      
      anime({
        targets: target,
        translateY: 0,
        scale: 1,
        duration: 400,
        easing: 'easeOutExpo',
      });

      if (iconContainer) {
        anime({
          targets: iconContainer,
          scale: 1,
          rotate: 0,
          duration: 400,
          easing: 'easeOutExpo',
        });
      }
    });
  };

  return (
    <section ref={sectionRef} className="py-16 md:py-20 px-4 sm:px-6 bg-surface-secondary overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            data-heading-item
            style={{ opacity: 0 }}
            className="text-2xl sm:text-3xl font-bold text-text-primary mb-3"
          >
            {t('features.heading')}
          </h2>
          <p
            data-heading-item
            style={{ opacity: 0 }}
            className="text-text-secondary max-w-2xl mx-auto text-sm sm:text-base"
          >
            {t('features.subheading')}
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                data-feature-card
                style={{ opacity: 0 }}
                className="bg-surface-primary p-5 sm:p-6 rounded-xl shadow-sm border border-border-primary transition-shadow hover:shadow-lg cursor-default"
                onMouseEnter={handleCardEnter}
                onMouseLeave={handleCardLeave}
              >
                <div className="feature-icon w-12 h-12 bg-brand-light dark:bg-brand/20 text-brand dark:text-brand-light rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}