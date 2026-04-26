'use client';

import { useEffect, useRef } from 'react';
import { Eye, History, Users, Github, Linkedin } from 'lucide-react';

const PAGE_TEXTS = {
  heroTitle: 'Acerca de PROJEIC',
  heroSubtitle: 'Transparencia y trazabilidad para los proyectos académicos.',
  aboutTitle: '¿Qué es PROJEIC?',
  aboutDescription: 'PROJEIC es una plataforma de gestión de proyectos académicos desarrollada para la Escuela de Ingeniería Coquimbo de la Universidad Católica del Norte. Su objetivo principal es centralizar el seguimiento, proporcionar visibilidad pública y asegurar la trazabilidad completa del ciclo de vida de los proyectos estudiantiles, conectando a estudiantes, docentes supervisores y la comunidad universitaria en un solo entorno colaborativo.',
  proposalTitle: 'Nuestra propuesta',
  technologyTitle: 'Tecnología',
  developersTitle: 'Desarrolladores'
};

const PROPOSALS = [
  {
    id: 1,
    title: 'Transparencia',
    description: 'Generación de un portafolio público o semipúblico donde la comunidad pueda visualizar las iniciativas creadas en la Escuela.',
    icon: Eye,
  },
  {
    id: 2,
    title: 'Trazabilidad',
    description: 'Historial completo de la actividad, tareas y decisiones tomadas durante el semestre por los miembros del proyecto.',
    icon: History,
  },
  {
    id: 3,
    title: 'Colaboración',
    description: 'Roles diferenciados y herramientas unificadas que permiten a equipos multidisciplinarios operar con mayor sinergia.',
    icon: Users,
  }
];

const TECHNOLOGIES = [
  { id: 1, name: 'Next.js', role: 'Frontend React Framework', url: 'https://nextjs.org/docs', iconUrl: 'https://cdn.simpleicons.org/nextdotjs/000000' },
  { id: 2, name: 'NestJS', role: 'Backend Node Framework', url: 'https://docs.nestjs.com/', iconUrl: 'https://cdn.simpleicons.org/nestjs/E0234E' },
  { id: 3, name: 'GraphQL', role: 'Data Query Language', url: 'https://graphql.org/learn/', iconUrl: 'https://cdn.simpleicons.org/graphql/E10098' },
  { id: 4, name: 'PostgreSQL', role: 'Relational Database', url: 'https://www.postgresql.org/docs/', iconUrl: 'https://cdn.simpleicons.org/postgresql/4169E1' },
  { id: 5, name: 'Podman', role: 'Containerization', url: 'https://podman.io/', iconUrl: 'https://cdn.simpleicons.org/podman/5950AA' },
  { id: 6, name: 'Jenkins', role: 'CI/CD Pipeline', url: 'https://www.jenkins.io/', iconUrl: 'https://cdn.simpleicons.org/jenkins/D24939' },
  { id: 7, name: 'Nginx', role: 'Web Server / Reverse Proxy', url: 'https://nginx.org/en/docs/', iconUrl: 'https://cdn.simpleicons.org/nginx/009639' },
];

const DEVELOPERS = [
  {
    id: 1,
    name: 'Martín Castillo',
    role: 'Estudiante de Ingeniería en Tecnologías de Información',
    minor: 'Minor: Seguridad Digital y Ciberinteligencia',
    minorUrl: 'https://drive.google.com/file/d/1KHAZv6aHp_feKtrPbhZXxPHSqn6xOuzL/view',
    github: 'https://github.com/Marton1123',
    linkedin: 'https://www.linkedin.com/in/martin-castillo-t'
  },
  {
    id: 2,
    name: 'Daniel Durán',
    role: 'Estudiante de Ingeniería en Tecnologías de Información',
    minor: 'Minor: Desarrollo y Arquitectura de Software',
    minorUrl: 'https://drive.google.com/file/d/1vQu27z8fN4BSLSRP-6g9lumdkTk4bzx0/view',
    github: 'https://github.com/Charmandiox9',
    linkedin: 'https://www.linkedin.com/in/daniel-durí¡n-garcí­a/'
  }
];

export default function AcercaPage() {
  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const proposalsRef = useRef<HTMLElement>(null);
  const techRef = useRef<HTMLElement>(null);
  const devsRef = useRef<HTMLElement>(null);

  /* ── Animación Inicial (Hero) ── */
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

    const animateSection = (entries: IntersectionObserverEntry[], observer: IntersectionObserver, targetsSelector: string, staggerDelay = 100) => {
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

    const aboutObserver = new IntersectionObserver((e) => animateSection(e, aboutObserver, '[data-about-item]', 150), observerOptions);
    const proposalsObserver = new IntersectionObserver((e) => animateSection(e, proposalsObserver, '[data-proposal-card]', 120), observerOptions);
    const techObserver = new IntersectionObserver((e) => animateSection(e, techObserver, '[data-tech-card]', 80), observerOptions);
    const devsObserver = new IntersectionObserver((e) => animateSection(e, devsObserver, '[data-dev-card]', 150), observerOptions);

    if (aboutRef.current) aboutObserver.observe(aboutRef.current);
    if (proposalsRef.current) proposalsObserver.observe(proposalsRef.current);
    if (techRef.current) techObserver.observe(techRef.current);
    if (devsRef.current) devsObserver.observe(devsRef.current);

    return () => {
      aboutObserver.disconnect();
      proposalsObserver.disconnect();
      techObserver.disconnect();
      devsObserver.disconnect();
    };
  }, []);

  const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('.proposal-icon');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({ targets: target, translateY: -6, scale: 1.02, duration: 400, easing: 'easeOutExpo' });
      if (icon) anime({ targets: icon, scale: 1.15, rotate: [0, 10, -8, 0], duration: 600, easing: 'easeOutElastic(1, .6)' });
    });
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('.proposal-icon');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({ targets: target, translateY: 0, scale: 1, duration: 400, easing: 'easeOutExpo' });
      if (icon) anime({ targets: icon, scale: 1, rotate: 0, duration: 400, easing: 'easeOutExpo' });
    });
  };

  const handleTechEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const img = target.querySelector('img');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({ targets: target, translateY: -4, scale: 1.02, duration: 300, easing: 'easeOutQuad' });
      if (img) anime({ targets: img, scale: 1.15, rotate: [0, -10, 10, 0], duration: 500, easing: 'easeOutElastic(1, .6)' });
    });
  };

  const handleTechLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const img = target.querySelector('img');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({ targets: target, translateY: 0, scale: 1, duration: 300, easing: 'easeOutQuad' });
      if (img) anime({ targets: img, scale: 1, rotate: 0, duration: 400, easing: 'easeOutExpo' });
    });
  };

  const handleDevEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const avatar = target.querySelector('img');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({ targets: target, translateY: -6, duration: 400, easing: 'easeOutExpo' });
      if (avatar) anime({ targets: avatar, scale: 1.08, duration: 400, easing: 'easeOutBack' });
    });
  };

  const handleDevLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const avatar = target.querySelector('img');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({ targets: target, translateY: 0, duration: 400, easing: 'easeOutExpo' });
      if (avatar) anime({ targets: avatar, scale: 1, duration: 400, easing: 'easeOutExpo' });
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-primary dark:bg-brand-dark">
      
      <section ref={heroRef} className="bg-surface-primary dark:bg-brand-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-light/30 via-transparent to-transparent text-ui-dark dark:text-text-primary py-16 px-6 border-b border-border-primary dark:border-border-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h1 data-hero-item style={{ opacity: 0 }} className="text-3xl md:text-5xl font-bold mb-4">{PAGE_TEXTS.heroTitle}</h1>
          <p data-hero-item style={{ opacity: 0 }} className="text-text-muted dark:text-text-muted text-lg md:text-xl font-medium">{PAGE_TEXTS.heroSubtitle}</p>
        </div>
      </section>

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16 space-y-20">
        
        <section ref={aboutRef} className="text-center max-w-3xl mx-auto">
          <h2 data-about-item style={{ opacity: 0 }} className="text-2xl font-bold text-text-primary dark:text-text-primary mb-6">{PAGE_TEXTS.aboutTitle}</h2>
          <p data-about-item style={{ opacity: 0 }} className="text-text-secondary dark:text-text-muted leading-relaxed text-lg">
            {PAGE_TEXTS.aboutDescription}
          </p>
        </section>

        <section ref={proposalsRef}>
          <div className="text-center mb-10">
            <h2 data-proposal-card style={{ opacity: 0 }} className="text-2xl font-bold text-text-primary dark:text-text-primary">{PAGE_TEXTS.proposalTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PROPOSALS.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.id} 
                  data-proposal-card
                  style={{ opacity: 0 }}
                  onMouseEnter={handleCardEnter}
                  onMouseLeave={handleCardLeave}
                  className="bg-surface-secondary dark:bg-surface-primary border border-border-primary dark:border-border-primary p-8 rounded-2xl text-center hover:border-brand hover:shadow-lg transition-colors duration-200 cursor-default"
                >
                  <div className="proposal-icon w-14 h-14 bg-brand-light dark:bg-brand/20 text-brand dark:text-brand-light rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-text-primary mb-3">{item.title}</h3>
                  <p className="text-text-secondary dark:text-text-muted text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section ref={techRef} className="border-t border-border-primary dark:border-border-primary pt-20">
          <div className="text-center mb-10">
            <h2 data-tech-card style={{ opacity: 0 }} className="text-2xl font-bold text-text-primary dark:text-text-primary">{PAGE_TEXTS.technologyTitle}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {TECHNOLOGIES.map((tech) => (
              <a
                key={tech.id}
                data-tech-card
                style={{ opacity: 0 }}
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={handleTechEnter}
                onMouseLeave={handleTechLeave}
                className="border border-border-primary dark:border-border-primary p-5 rounded-xl flex flex-col items-center justify-center text-center bg-surface-primary dark:bg-surface-primary hover:border-brand hover:shadow-lg transition-colors duration-200 group"
              >
                <img src={tech.iconUrl} alt={`Logo de ${tech.name}`} className={`w-10 h-10 mb-4 ${tech.name === 'Next.js' ? 'dark:invert' : ''}`} />
                <span className="font-bold text-text-primary dark:text-text-primary text-sm mb-1 group-hover:text-brand transition-colors">{tech.name}</span>
                <span className="text-xs text-text-muted dark:text-text-muted">{tech.role}</span>
              </a>
            ))}
          </div>
        </section>

        <section ref={devsRef} className="border-t border-border-primary dark:border-border-primary pt-20">
          <div className="text-center mb-10">
            <h2 data-dev-card style={{ opacity: 0 }} className="text-2xl font-bold text-text-primary dark:text-text-primary">{PAGE_TEXTS.developersTitle}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {DEVELOPERS.map((dev) => {
              const githubUsername = dev.github.split('/').pop();
              const avatarUrl = `https://github.com/${githubUsername}.png`;

              return (
                <div 
                  key={dev.id} 
                  data-dev-card
                  style={{ opacity: 0 }}
                  onMouseEnter={handleDevEnter}
                  onMouseLeave={handleDevLeave}
                  className="p-6 bg-surface-primary dark:bg-surface-primary border border-border-primary dark:border-border-primary rounded-xl shadow-sm flex flex-col justify-between hover:border-brand hover:shadow-lg transition-colors duration-200"
                >
                  <div className="flex flex-col items-center mb-4">
                    <img src={avatarUrl} alt={`Avatar de ${dev.name}`} className="w-20 h-20 rounded-full border-4 border-gray-100 dark:border-surface-secondary mb-4 object-cover" />
                    <h3 className="font-bold text-xl text-text-primary dark:text-text-primary text-center">{dev.name}</h3>
                    <p className="text-sm text-text-secondary dark:text-text-muted mt-1 text-center">{dev.role}</p>
                    <a
                      href={dev.minorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-brand hover:text-brand-hover hover:underline transition-colors mt-2 text-center"
                    >
                      {dev.minor}
                    </a>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border-primary dark:border-border-primary flex items-center justify-center space-x-6">
                    <a
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors text-sm font-medium"
                    >
                      <Github className="w-5 h-5" />
                      <span>GitHub</span>
                    </a>
                    <a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-brand dark:text-brand-light hover:text-brand-hover dark:hover:text-white transition-colors text-sm font-medium"
                    >
                      <Linkedin className="w-5 h-5" />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

    </div>
  );
}