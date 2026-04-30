'use client';

import { useEffect, useRef } from 'react';
import { ExternalLink, BookOpen, Building2, Cpu, Laptop, LucideIcon } from 'lucide-react';
import { useT } from '@/hooks/useT';

interface LinkItem {
  id: number;
  labelKey: string;
  url: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  hoverClass: string;
  groupHoverClass: string;
}

interface CareerItem {
  id: number;
  nameKey: string;
  url: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  groupHoverTextClass: string;
  hoverBorderClass: string;
}

const OFFICIAL_LINKS: LinkItem[] = [
  {
    id: 1,
    labelKey: 'eicPage.linkUcn',
    url: 'https://www.ucn.cl',
    icon: Building2,
    colorClass: 'text-blue-500 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-500/10',
    hoverClass: 'hover:border-blue-500 dark:hover:border-blue-400',
    groupHoverClass: 'group-hover:bg-blue-500 group-hover:text-white',
  },
  {
    id: 2,
    labelKey: 'eicPage.linkEic',
    url: 'https://eic.ucn.cl',
    icon: Cpu,
    colorClass: 'text-brand',
    bgClass: 'bg-brand-light dark:bg-brand/10',
    hoverClass: 'hover:border-brand dark:hover:border-brand-light',
    groupHoverClass: 'group-hover:bg-brand group-hover:text-white',
  },
  {
    id: 3,
    labelKey: 'eicPage.linkCampus',
    url: 'https://campusvirtual.ucn.cl/login/index.php',
    icon: Laptop,
    colorClass: 'text-orange-500 dark:text-orange-400',
    bgClass: 'bg-orange-50 dark:bg-orange-500/10',
    hoverClass: 'hover:border-orange-500 dark:hover:border-orange-400',
    groupHoverClass: 'group-hover:bg-orange-500 group-hover:text-white',
  },
];

const CAREERS: CareerItem[] = [
  {
    id: 1,
    nameKey: 'eicPage.careerCS',
    url: 'https://eic.ucn.cl/pregrados/Ingenieria-Civil-en-Computacion-e-Informatica',
    bgClass: 'bg-career-cs/10',
    borderClass: 'border-career-cs',
    textClass: 'text-career-cs',
    groupHoverTextClass: 'group-hover:text-career-cs',
    hoverBorderClass: 'hover:border-career-cs',
  },
  {
    id: 2,
    nameKey: 'eicPage.careerIndustrial',
    url: 'https://eic.ucn.cl/pregrados/Ingenieria-Civil-Industrial',
    bgClass: 'bg-career-industrial/10',
    borderClass: 'border-career-industrial',
    textClass: 'text-career-industrial',
    groupHoverTextClass: 'group-hover:text-career-industrial',
    hoverBorderClass: 'hover:border-career-industrial',
  },
  {
    id: 3,
    nameKey: 'eicPage.careerTI',
    url: 'https://eic.ucn.cl/pregrados/Ingenieria-en-Tecnologias-de-Informacion',
    bgClass: 'bg-career-ti/10',
    borderClass: 'border-career-ti',
    textClass: 'text-career-ti',
    groupHoverTextClass: 'group-hover:text-career-ti',
    hoverBorderClass: 'hover:border-career-ti',
  },
];

export default function EicPage() {
  const { t } = useT();
  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLElement>(null);
  const careersRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      if (heroRef.current) {
        anime({
          targets: heroRef.current.querySelectorAll('[data-hero-item]'),
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 800,
          delay: anime.stagger(150),
          easing: 'easeOutExpo',
        });
      }
    });
  }, []);

  useEffect(() => {
    const observerOptions = { threshold: 0.15 };

    const animateSection = (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver,
      targetsSelector: string,
      staggerDelay = 100,
    ) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          import('animejs').then((mod) => {
            const anime = mod.default ?? mod;
            anime({
              targets: entry.target.querySelectorAll(targetsSelector),
              opacity: [0, 1],
              translateY: [30, 0],
              duration: 700,
              delay: anime.stagger(staggerDelay),
              easing: 'easeOutExpo',
            });
          });
        }
      });
    };

    const aboutObserver = new IntersectionObserver(
      (e) => animateSection(e, aboutObserver, '[data-about-item]', 150),
      observerOptions,
    );
    const linksObserver = new IntersectionObserver(
      (e) => animateSection(e, linksObserver, '[data-link-card]', 120),
      observerOptions,
    );
    const careersObserver = new IntersectionObserver(
      (e) => animateSection(e, careersObserver, '[data-career-card]', 120),
      observerOptions,
    );

    if (aboutRef.current) aboutObserver.observe(aboutRef.current);
    if (linksRef.current) linksObserver.observe(linksRef.current);
    if (careersRef.current) careersObserver.observe(careersRef.current);

    return () => {
      aboutObserver.disconnect();
      linksObserver.disconnect();
      careersObserver.disconnect();
    };
  }, []);

  const handleLinkEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const iconContainer = target.querySelector('.link-icon-container');
    const arrow = target.querySelector('.link-arrow');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({ targets: target, translateY: -6, scale: 1.02, duration: 400, easing: 'easeOutExpo' });
      if (iconContainer) anime({ targets: iconContainer, scale: 1.1, duration: 400, easing: 'easeOutBack' });
      if (arrow) anime({ targets: arrow, translateX: 4, translateY: -4, duration: 300, easing: 'easeOutQuad' });
    });
  };

  const handleLinkLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const iconContainer = target.querySelector('.link-icon-container');
    const arrow = target.querySelector('.link-arrow');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({ targets: target, translateY: 0, scale: 1, duration: 400, easing: 'easeOutExpo' });
      if (iconContainer) anime({ targets: iconContainer, scale: 1, duration: 400, easing: 'easeOutExpo' });
      if (arrow) anime({ targets: arrow, translateX: 0, translateY: 0, duration: 300, easing: 'easeOutQuad' });
    });
  };

  const handleCareerEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('.career-icon');
    const arrow = target.querySelector('.career-arrow');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({ targets: target, translateY: -6, scale: 1.01, duration: 400, easing: 'easeOutExpo' });
      if (icon) anime({ targets: icon, scale: 1.15, rotate: [0, 15, -10, 0], duration: 600, easing: 'easeOutElastic(1, .6)' });
      if (arrow) anime({ targets: arrow, translateX: 4, translateY: -4, duration: 300, easing: 'easeOutQuad' });
    });
  };

  const handleCareerLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('.career-icon');
    const arrow = target.querySelector('.career-arrow');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({ targets: target, translateY: 0, scale: 1, duration: 400, easing: 'easeOutExpo' });
      if (icon) anime({ targets: icon, scale: 1, rotate: 0, duration: 400, easing: 'easeOutExpo' });
      if (arrow) anime({ targets: arrow, translateX: 0, translateY: 0, duration: 300, easing: 'easeOutQuad' });
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-primary dark:bg-brand-dark">
      <section
        ref={heroRef}
        className="bg-surface-primary dark:bg-brand-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-light/30 via-transparent to-transparent text-ui-dark dark:text-text-primary py-16 px-6 border-b border-border-primary dark:border-border-primary"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 data-hero-item style={{ opacity: 0 }} className="text-3xl md:text-5xl font-bold mb-4">
            {t('eicPage.heroTitle')}
          </h1>
          <p data-hero-item style={{ opacity: 0 }} className="text-text-muted dark:text-text-muted text-lg md:text-xl font-medium">
            {t('eicPage.heroSubtitle')}
          </p>
        </div>
      </section>

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16 space-y-16">

        <section ref={aboutRef} className="bg-surface-secondary dark:bg-surface-primary border border-border-primary dark:border-border-primary p-8 md:p-10 rounded-2xl">
          <h2 data-about-item style={{ opacity: 0 }} className="text-2xl font-bold text-text-primary dark:text-text-primary mb-6">
            {t('eicPage.aboutTitle')}
          </h2>
          <p data-about-item style={{ opacity: 0 }} className="text-text-secondary dark:text-text-secondary leading-relaxed text-lg">
            {t('eicPage.aboutDescription')}
          </p>
        </section>

        <section ref={linksRef}>
          <h2 data-link-card style={{ opacity: 0 }} className="text-2xl font-bold text-text-primary dark:text-text-primary mb-8">
            {t('eicPage.linksTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {OFFICIAL_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.id}
                  data-link-card
                  style={{ opacity: 0 }}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={handleLinkEnter}
                  onMouseLeave={handleLinkLeave}
                  className={`group flex flex-col items-center justify-center p-8 bg-surface-primary dark:bg-surface-primary border border-border-primary dark:border-border-primary rounded-2xl shadow-sm hover:shadow-xl transition-colors duration-300 ${link.hoverClass}`}
                >
                  <div
                    className={`link-icon-container w-16 h-16 rounded-2xl mb-5 flex items-center justify-center transition-colors duration-300 ${link.bgClass} ${link.colorClass} ${link.groupHoverClass}`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-text-primary dark:text-text-primary text-lg mb-2 text-center transition-colors">
                    {t(link.labelKey as Parameters<typeof t>[0])}
                  </span>
                  <div className="flex items-center text-sm font-medium text-text-muted group-hover:text-text-secondary transition-colors">
                    <span>{t('eicPage.visitPlatform')}</span>
                    <ExternalLink className="link-arrow w-4 h-4 ml-1" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section ref={careersRef}>
          <h2 data-career-card style={{ opacity: 0 }} className="text-2xl font-bold text-text-primary dark:text-text-primary mb-8">
            {t('eicPage.careersTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {CAREERS.map((career) => (
              <a
                key={career.id}
                data-career-card
                style={{ opacity: 0 }}
                href={career.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={handleCareerEnter}
                onMouseLeave={handleCareerLeave}
                className={`flex flex-col p-6 bg-surface-primary dark:bg-surface-primary border border-border-primary dark:border-border-primary rounded-xl shadow-sm ${career.hoverBorderClass} hover:shadow-lg transition-colors duration-200 group h-full focus-visible:ring-2 focus-visible:outline-none focus:ring-brand`}
              >
                <div className={`${career.bgClass} ${career.textClass} p-3 rounded-lg mb-4 self-start transition-colors`}>
                  <BookOpen className="career-icon w-6 h-6 origin-bottom" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <h3 className={`font-bold text-text-primary dark:text-text-primary leading-tight ${career.groupHoverTextClass} transition-colors mb-4`}>
                    {t(career.nameKey as Parameters<typeof t>[0])}
                  </h3>
                  <div className={`flex justify-between items-center text-sm font-medium ${career.textClass} transition-colors`}>
                    <span>{t('eicPage.viewProgram')}</span>
                    <ExternalLink className="career-arrow w-4 h-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}