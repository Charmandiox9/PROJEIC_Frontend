'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PROJECT_BY_ID } from '@/graphql/misc/operations';
import { ArrowLeft, Calendar, Layout, User, Loader2, Globe, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PublicProjectDetailPage() {
  const { id } = useParams();

  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const data = await fetchGraphQL({
        query: GET_PROJECT_BY_ID,
        variables: { id: Array.isArray(id) ? id[0] : id }
      });
      if (data?.findOne) {
        setProject(data.findOne);
      } else {
        setError('Proyecto no encontrado.');
      }
    } catch (err: any) {
      setError('Error al cargar la información del proyecto.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  useEffect(() => {
    if (!isLoading && project && contentRef.current) {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        const tl = anime.timeline({ easing: 'easeOutExpo' });

        tl.add({
          targets: contentRef.current,
          opacity: [0, 1],
          translateY: [40, 0],
          duration: 700,
        })
        .add({
          targets: contentRef.current.querySelectorAll('[data-anim-item]'),
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
          delay: anime.stagger(100),
        }, '-=400');
      });
    }
  }, [isLoading, project]);

  const handleSpecEnter = (e: React.MouseEvent<HTMLLIElement>) => {
    const icon = e.currentTarget.querySelector('svg');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      if (icon) {
        anime({
          targets: icon,
          scale: 1.2,
          rotate: [0, 15, -10, 0],
          duration: 500,
          easing: 'easeOutElastic(1, .6)',
        });
      }
    });
  };

  const handleSpecLeave = (e: React.MouseEvent<HTMLLIElement>) => {
    const icon = e.currentTarget.querySelector('svg');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      if (icon) {
        anime({
          targets: icon,
          scale: 1,
          rotate: 0,
          duration: 400,
          easing: 'easeOutExpo',
        });
      }
    });
  };

  const handleMemberEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const avatar = target.querySelector('.member-avatar');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: target,
        translateY: -4,
        scale: 1.02,
        duration: 300,
        easing: 'easeOutQuad',
      });
      if (avatar) {
        anime({
          targets: avatar,
          scale: 1.1,
          rotate: [0, 5, -5, 0],
          duration: 500,
          easing: 'easeOutElastic(1, .6)',
        });
      }
    });
  };

  const handleMemberLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const avatar = target.querySelector('.member-avatar');
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: target,
        translateY: 0,
        scale: 1,
        duration: 300,
        easing: 'easeOutQuad',
      });
      if (avatar) {
        anime({
          targets: avatar,
          scale: 1,
          rotate: 0,
          duration: 400,
          easing: 'easeOutExpo',
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-in fade-in duration-500">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <p className="text-text-muted font-medium">{error || 'Proyecto no disponible'}</p>
        <Link href="/" className="text-brand hover:underline flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>
      </div>
    );
  }

  const creationDate = new Date(project.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-surface-secondary dark:bg-gray-900 pt-32 pb-20">
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        
        <div 
          ref={contentRef} 
          style={{ opacity: 0 }} 
          className="bg-surface-primary dark:bg-surface-primary rounded-3xl border border-border-primary dark:border-border-primary shadow-xl overflow-hidden shadow-gray-200/50 dark:shadow-gray-900/50"
        >
          <div className="h-32 w-full transition-colors duration-500" style={{ backgroundColor: project.color || 'var(--color-brand)' }}></div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
              <div>
                <div data-anim-item style={{ opacity: 0 }} className="flex items-center gap-4 mb-3">
                  <h1 className="text-4xl font-extrabold text-text-primary dark:text-text-primary tracking-tight">{project.name}</h1>
                  <span className="px-3 py-1 bg-surface-secondary text-text-secondary text-xs font-bold rounded-full uppercase tracking-wider">
                    {project.status}
                  </span>
                </div>
                <p data-anim-item style={{ opacity: 0 }} className="text-text-secondary dark:text-text-muted text-lg leading-relaxed max-w-3xl">
                  {project.description || 'Este proyecto no cuenta con una descripción pública detallada en este momento. Forma parte del ecosistema de desarrollo de PROJEIC.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-1 space-y-8">
                <div>
                  <h2 data-anim-item style={{ opacity: 0 }} className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Ficha Técnica</h2>
                  <ul className="space-y-4">
                    <li data-anim-item style={{ opacity: 0 }} className="flex items-center gap-3 cursor-default" onMouseEnter={handleSpecEnter} onMouseLeave={handleSpecLeave}>
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Iniciado el</p>
                        <p className="text-sm font-semibold text-text-primary dark:text-text-primary">{creationDate}</p>
                      </div>
                    </li>
                    <li data-anim-item style={{ opacity: 0 }} className="flex items-center gap-3 cursor-default" onMouseEnter={handleSpecEnter} onMouseLeave={handleSpecLeave}>
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                        <Layout className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Metodología</p>
                        <p className="text-sm font-semibold text-text-primary dark:text-text-primary capitalize">{project.mode === 'HYBRID' ? 'Orientado a Resultados' : project.methodology}</p>
                      </div>
                    </li>
                    <li data-anim-item style={{ opacity: 0 }} className="flex items-center gap-3 cursor-default" onMouseEnter={handleSpecEnter} onMouseLeave={handleSpecLeave}>
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                        {project.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Acceso</p>
                        <p className={`text-sm font-semibold ${project.isPublic ? 'text-green-600' : 'text-text-secondary'}`}>
                          {project.isPublic ? 'Público Abierto' : 'Privado Restringido'}
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <h2 data-anim-item style={{ opacity: 0 }} className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Participantes del Proyecto</h2>

                {project.members && project.members.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.members.map((member: any) => (
                      <div 
                        key={member.id} 
                        data-anim-item 
                        style={{ opacity: 0 }}
                        onMouseEnter={handleMemberEnter}
                        onMouseLeave={handleMemberLeave}
                        className="flex items-center p-4 bg-surface-secondary dark:bg-surface-secondary rounded-2xl border border-border-primary dark:border-border-secondary hover:border-brand/30 transition-colors cursor-default"
                      >
                        <div className="flex items-center gap-4">
                          {member.user.avatarUrl ? (
                            <img src={member.user.avatarUrl} alt={member.user.name} className="member-avatar w-12 h-12 rounded-full ring-2 ring-white dark:ring-surface-primary shadow-sm object-cover" />
                          ) : (
                            <div className="member-avatar w-12 h-12 rounded-full bg-brand bg-opacity-10 text-brand flex items-center justify-center font-bold text-lg ring-2 ring-white dark:ring-surface-primary shadow-sm">
                              {member.user.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-text-primary dark:text-text-primary truncate">{member.user.name}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-gray-200/50 dark:bg-gray-700/50 text-text-secondary">
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div data-anim-item style={{ opacity: 0 }} className="text-center py-12 bg-surface-secondary rounded-2xl border border-border-primary border-dashed">
                    <User className="w-8 h-8 text-text-secondary mx-auto mb-3" />
                    <p className="text-sm text-text-muted">Aún no hay participantes públicos registrados.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}