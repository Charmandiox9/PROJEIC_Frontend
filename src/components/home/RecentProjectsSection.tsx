'use client';

import { useEffect, useState } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PUBLIC_PROJECTS } from '@/graphql/misc/operations';
import { AVATAR_FALLBACK_URL } from '@/lib/constants';

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

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Activo',
  STARTING: 'Iniciando',
  COMPLETED: 'Completado',
  ON_HOLD: 'En pausa',
  CANCELLED: 'Cancelado',
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  STARTING: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  COMPLETED: 'bg-surface-secondary text-text-secondary',
  ON_HOLD: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};

export default function RecentProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 bg-surface-primary">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Proyectos recientes de la EIC</h2>
          <p className="text-sm sm:text-base text-text-secondary">Iniciativas visibles de la comunidad</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : error || projects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-muted">Aún no hay proyectos recientes para mostrar.</p>
          </div>
        ) : (
          /* Mobile: horizontal carousel. Desktop: 3-col grid */
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 nice-scrollbar md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
            {projects.map((project) => (
              <div
                key={project.id}
                className="w-[82vw] shrink-0 snap-center md:w-auto md:shrink md:snap-align-none border border-border-primary rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-surface-primary flex flex-col"
              >
                {/* Color accent bar */}
                <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: project.color }} />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-2 mb-3 w-full">
                    <h3 className="font-bold text-base text-text-primary line-clamp-2 leading-tight flex-1">{project.name}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap shrink-0 ${STATUS_BADGE[project.status] ?? STATUS_BADGE.STARTING}`}>
                      {STATUS_LABEL[project.status] ?? project.status}
                    </span>
                  </div>
                  <p className="text-text-secondary text-xs sm:text-sm mb-5 line-clamp-3 flex-1">{project.description ?? 'Sin descripción.'}</p>
                  <div className="flex -space-x-2 mt-auto">
                    {project.members?.filter(m => m.status === 'ACTIVE').slice(0, 6).map((member) => (
                      <img
                        key={member.id}
                        className="w-7 h-7 rounded-full border-2 border-white dark:border-surface-primary bg-gray-200 object-cover"
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