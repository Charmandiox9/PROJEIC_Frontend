'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, BookOpen, GraduationCap } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PUBLIC_PROJECTS } from '@/graphql/misc/operations';
import { AVATAR_FALLBACK_URL } from '@/lib/constants';
import { useT } from '@/hooks/useT';
import PublicProjectModal from '@/components/public/PublicProjectModal';
import { useSearchParams } from 'next/navigation';

interface Professor {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  period: string;
  professors?: Professor[];
}

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
  methodology: string;
  isPublic: boolean;
  isInstitutional: boolean;
  subject?: Subject;
  members: ProjectMember[];
}

const FILTER_OPTIONS = ['ALL', 'ACTIVE', 'STARTING', 'COMPLETED'];

export default function ProyectosPage() {
  const { t, tDynamic } = useT();
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get('id');

  const getStatusLabel = (status: string) => tDynamic(`projectStatus.${status}`);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (projectIdFromUrl) {
      setSelectedProjectId(projectIdFromUrl);
    }
  }, [projectIdFromUrl]);

  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await fetchGraphQL({
          query: GET_PUBLIC_PROJECTS,
          variables: { skip: 0, take: 50 },
        });
        if (data?.findAll?.items) {
          setProjects(data.findAll.items);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (project.subject?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (project.subject?.professors?.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ?? false);

    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    const headerEl = headerRef.current;
    
    if (headerEl) {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({
          targets: headerEl.querySelectorAll('[data-header-anim]'),
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 800,
          delay: anime.stagger(100),
          easing: 'easeOutExpo',
        });
      });
    }
  }, []);

  useEffect(() => {
    const gridEl = gridRef.current;

    if (!loading && gridEl && filteredProjects.length > 0) {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        
        anime({
          targets: gridEl.querySelectorAll('[data-project-card]'),
          opacity: [0, 1],
          translateY: isFirstLoad.current ? [30, 0] : [10, 0],
          duration: isFirstLoad.current ? 600 : 400,
          delay: anime.stagger(isFirstLoad.current ? 80 : 40, { start: 50 }),
          easing: 'easeOutExpo',
        });

        isFirstLoad.current = false;
      });
    }
  }, [loading, filteredProjects, searchTerm, statusFilter]);

  const handleCardEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const avatars = target.querySelectorAll('.avatar-img');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      
      anime({
        targets: target,
        translateY: -6,
        scale: 1.01,
        duration: 400,
        easing: 'easeOutExpo',
      });

      if (avatars.length > 0) {
        anime({
          targets: avatars,
          translateX: (_: HTMLElement, i: number) => i * 4,
          duration: 400,
          easing: 'easeOutQuad',
        });
      }
    });
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const avatars = target.querySelectorAll('.avatar-img');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      
      anime({
        targets: target,
        translateY: 0,
        scale: 1,
        duration: 400,
        easing: 'easeOutExpo',
      });

      if (avatars.length > 0) {
        anime({
          targets: avatars,
          translateX: 0,
          duration: 400,
          easing: 'easeOutExpo',
        });
      }
    });
  };

  const handleFilterClick = (status: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setStatusFilter(status);
    const target = e.currentTarget;
    
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: target,
        scale: [0.95, 1],
        duration: 400,
        easing: 'easeOutBack',
      });
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-primary">
      <section ref={headerRef} className="bg-surface-primary text-text-primary py-12 px-6 border-b border-border-primary">
        <div className="max-w-6xl mx-auto text-center">
          <h1 data-header-anim style={{ opacity: 0 }} className="text-3xl md:text-4xl font-extrabold mb-3">{t('proyectosPage.heading')}</h1>
          <p data-header-anim style={{ opacity: 0 }} className="text-text-muted font-medium">{t('proyectosPage.subheading')}</p>
        </div>
      </section>

      <div className="bg-surface-primary border-b border-border-primary px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={t('proyectosPage.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-secondary rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-colors bg-surface-primary placeholder:text-text-muted"
            />
          </div>
          <div className="flex gap-2 text-sm w-full md:w-auto overflow-x-auto pb-2 md:pb-0 nice-scrollbar">
            {FILTER_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={(e) => handleFilterClick(status, e)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all duration-200 ${statusFilter === status
                  ? 'bg-brand text-white shadow-md'
                  : 'bg-surface-primary border border-border-secondary text-text-secondary hover:bg-surface-tertiary'
                  }`}
              >
                {status === 'ALL' ? t('proyectosPage.filterAll') : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-dark"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-surface-primary rounded-xl border border-border-primary">
            <p className="text-text-muted">{t('proyectosPage.errorLoad')}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-surface-primary rounded-xl border border-border-primary animate-in fade-in duration-300">
            <p className="text-text-muted">{t('proyectosPage.noResults')}</p>
          </div>
        ) : (
          <div ref={gridRef} className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:flex-none md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible nice-scrollbar">
            {filteredProjects.map((project) => {
              const activeMembers = project.members?.filter(m => m.status === 'ACTIVE') ?? [];

              return (
                <button
                  onClick={() => setSelectedProjectId(project.id)}
                  onMouseEnter={handleCardEnter}
                  onMouseLeave={handleCardLeave}
                  key={project.id}
                  data-project-card
                  style={{ opacity: 0 }}
                  className="flex flex-col text-left w-[85vw] shrink-0 snap-center md:w-auto md:shrink md:snap-align-none min-h-[200px] bg-surface-primary border border-border-primary rounded-xl p-6 hover:shadow-xl hover:border-brand/40 transition-shadow duration-300 ring-offset-2 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent min-w-0 relative"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-4 gap-3 w-full">
                    <h3 className="font-bold text-lg text-text-primary line-clamp-2 decoration-brand group-hover:underline break-words w-full">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap shrink-0 ${project.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
                      project.status === 'COMPLETED' ? 'bg-surface-secondary text-text-secondary' :
                        'bg-brand-light text-brand dark:bg-brand/20 dark:text-brand-light'
                      }`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  {project.isInstitutional && project.subject && (
                    <div className="flex flex-col gap-1.5 mb-4 bg-surface-secondary p-2.5 rounded-lg border border-border-secondary w-full min-w-0">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand shrink-0" />
                        <p className="text-xs font-semibold text-brand truncate">
                          {project.subject.name} <span className="font-normal text-text-muted ml-1">• {project.subject.period}</span>
                        </p>
                      </div>

                      {project.subject.professors && project.subject.professors.length > 0 && (
                        <div className="flex items-start gap-1.5 pl-0.5">
                          <GraduationCap className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
                          <p className="text-[11px] text-text-secondary line-clamp-1">
                            <span className="font-medium text-text-muted mr-1">Prof:</span>
                            {project.subject.professors.map(p => p.name).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-text-secondary text-sm mb-6 line-clamp-3">{project.description || t('proyectosPage.noDescription')}</p>

                  <div className="flex items-center -space-x-2 relative z-0 mt-auto">
                    {activeMembers.slice(0, 4).map((member) => (
                      <img
                        key={member.id}
                        className="avatar-img w-8 h-8 rounded-full border-2 border-surface-primary bg-gray-200 object-cover shrink-0 relative z-10"
                        src={member.user.avatarUrl || `${AVATAR_FALLBACK_URL}${member.user.id}`}
                        alt={member.user.name}
                        title={member.user.name}
                      />
                    ))}
                    {activeMembers.length > 4 && (
                      <div className="w-8 h-8 rounded-full border-2 border-surface-primary bg-surface-secondary flex items-center justify-center text-xs font-bold text-text-secondary shrink-0 z-0">
                        +{activeMembers.length - 4}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <PublicProjectModal
        isOpen={!!selectedProjectId}
        projectId={selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
      />

    </div>
  );
}