'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PUBLIC_PROJECTS } from '@/graphql/misc/operations';
import { AVATAR_FALLBACK_URL } from '@/lib/constants';
import { useT } from '@/hooks/useT';
import { useRouter } from 'next/navigation';

interface PublicUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface ProjectMember {
  id: string;
  role: string;
  status: string;
  user: PublicUser;
}

interface Project {
  id: string;
  name: string;
  status: string;
  description: string | null;
  color: string;
  members: ProjectMember[];
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  STARTING: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  COMPLETED: 'bg-surface-secondary text-text-secondary',
  ON_HOLD: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};

export default function RecentProjectsSection() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t, tDynamic } = useT();

  const headingRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await fetchGraphQL({
          query: GET_PUBLIC_PROJECTS,
          variables: { skip: 0, take: 3 },
        });
        if (data?.findAll?.items) {
          setProjects(data.findAll.items.slice(0, 3));
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        import('animejs').then((mod) => {
          const anime = mod.default ?? mod;
          anime({
            targets: el.querySelectorAll('[data-heading-item]'),
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 700,
            delay: anime.stagger(150),
            easing: 'easeOutExpo',
          });
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el || loading || projects.length === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        import('animejs').then((mod) => {
          const anime = mod.default ?? mod;
          anime({
            targets: el.querySelectorAll('[data-project-card]'),
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.95, 1],
            duration: 800,
            delay: anime.stagger(120),
            easing: 'easeOutBack',
          });
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, projects]);

  const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const colorBar = target.querySelector('.project-color-bar');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: target,
        translateY: -6,
        scale: 1.01,
        duration: 400,
        easing: 'easeOutExpo',
      });
      if (colorBar) {
        anime({
          targets: colorBar,
          height: '10px',
          duration: 300,
          easing: 'easeOutQuad',
        });
      }
    });
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const colorBar = target.querySelector('.project-color-bar');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: target,
        translateY: 0,
        scale: 1,
        duration: 400,
        easing: 'easeOutExpo',
      });
      if (colorBar) {
        anime({
          targets: colorBar,
          height: '6px',
          duration: 300,
          easing: 'easeOutQuad',
        });
      }
    });
  };

  function handleAvatarGroupEnter(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation(); 
    const targets = e.currentTarget.querySelectorAll('img');
    
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: targets,
        translateX: (_: HTMLElement, i: number) => i * 8,
        rotate: (_: HTMLElement, i: number) => (i % 2 === 0 ? 4 : -4),
        duration: 600,
        delay: anime.stagger(30),
        easing: 'easeOutElastic(1, .7)',
      });
    });
  }

  function handleAvatarGroupLeave(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    const targets = e.currentTarget.querySelectorAll('img');
    
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: targets,
        translateX: 0,
        rotate: 0,
        duration: 400,
        easing: 'easeOutExpo',
      });
    });
  }

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 bg-surface-primary">
      <div className="max-w-6xl mx-auto">

        <div ref={headingRef} className="mb-8 md:mb-10">
          <h2
            data-heading-item
            style={{ opacity: 0 }}
            className="text-2xl sm:text-3xl font-bold text-text-primary mb-2"
          >
            {t('recentProjects.heading')}
          </h2>
          <p
            data-heading-item
            style={{ opacity: 0 }}
            className="text-sm sm:text-base text-text-secondary"
          >
            {t('recentProjects.subheading')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
          </div>
        ) : error || projects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-muted">{t('recentProjects.noProjects')}</p>
          </div>
        ) : (
          <div
            ref={listRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 nice-scrollbar md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0"
          >
            {projects.map((project) => (
              <div
                key={project.id}
                data-project-card
                style={{ opacity: 0 }}
                className="w-[82vw] shrink-0 snap-center md:w-auto md:shrink md:snap-align-none border border-border-primary rounded-xl overflow-hidden hover:shadow-xl transition-shadow bg-surface-primary flex flex-col cursor-pointer"
                onMouseEnter={handleCardEnter}
                onMouseLeave={handleCardLeave}
                onClick={() => router.push(`/proyectos?id=${project.id}`)}
              >
                <div 
                  className="project-color-bar w-full shrink-0" 
                  style={{ backgroundColor: project.color, height: '6px' }} 
                />

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-2 mb-3 w-full">
                    <h3 className="font-bold text-base text-text-primary line-clamp-2 leading-tight flex-1">
                      {project.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap shrink-0 ${STATUS_BADGE[project.status] ?? STATUS_BADGE.STARTING}`}
                    >
                      {tDynamic(`projectStatus.${project.status}`) ?? project.status}
                    </span>
                  </div>

                  <p className="text-text-secondary text-xs sm:text-sm mb-6 line-clamp-3 flex-1">
                    {project.description ?? t('recentProjects.noDescription')}
                  </p>

                  <div
                    className="flex -space-x-2 mt-auto self-start"
                    onMouseEnter={handleAvatarGroupEnter}
                    onMouseLeave={handleAvatarGroupLeave}
                  >
                    {project.members
                      ?.filter((m) => m.status === 'ACTIVE')
                      .slice(0, 6)
                      .map((member) => (
                        <img
                          key={member.id}
                          className="w-8 h-8 rounded-full border-2 border-surface-primary bg-gray-200 object-cover shadow-sm relative z-10"
                          src={member.user.avatarUrl || `${AVATAR_FALLBACK_URL}${member.user.id}`}
                          alt={member.user.name}
                          title={member.user.name}
                        />
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}