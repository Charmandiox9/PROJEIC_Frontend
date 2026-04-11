'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, BookOpen, GraduationCap } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PUBLIC_PROJECTS } from '@/graphql/misc/operations';
import { AVATAR_FALLBACK_URL } from '@/lib/constants';
import { useAuth } from '@/context/AuthProvider';

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
  userId: string;
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

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'En curso',
  STARTING: 'Iniciando',
  COMPLETED: 'Finalizado',
  ON_HOLD: 'En pausa',
  CANCELLED: 'Cancelado',
};

const FILTER_OPTIONS = ['Todos', 'ACTIVE', 'STARTING', 'COMPLETED'];

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export default function ProyectosPublicosLogeadoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

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

    const matchesStatus = statusFilter === 'Todos' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col flex-1 h-full min-h-screen bg-surface-page">
      <div className="bg-surface-primary border-b border-border-primary px-6 py-6 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col shrink-0">
            <h1 className="text-2xl font-bold text-text-primary">Proyectos Publicos</h1>
            <p className="text-sm text-text-muted mt-1">Explora iniciativas abiertas a la comunidad</p>
          </div>
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-4 items-center">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proyectos, ramos o profesores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border-secondary rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-colors bg-surface-primary placeholder:text-text-muted"
              />
            </div>
            <div className="flex gap-2 text-sm w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {FILTER_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === status
                    ? 'bg-brand text-white'
                    : 'bg-surface-primary border border-border-secondary text-text-secondary hover:bg-surface-tertiary'
                    }`}
                >
                  {status === 'Todos' ? 'Todos' : getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-surface-primary rounded-xl border border-border-primary">
            <p className="text-gray-500">Ocurrió un error al cargar los proyectos.</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-surface-primary rounded-xl border border-border-primary">
            <p className="text-gray-500">No se encontraron proyectos públicos.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const activeMembers = project.members?.filter(m => m.status === 'ACTIVE') ?? [];
              const isMember = project.members?.some((m) => m.user.userId === user?.userId && m.status === 'ACTIVE') ?? false;

              return (
                <div
                  key={project.id}
                  className="bg-surface-primary border border-border-primary rounded-xl p-6 hover:shadow-xl hover:border-brand/40 transition-all duration-300 flex flex-col min-h-0 relative"
                >
                  {/* Etiqueta de Miembro en esquina superior derecha */}
                  {isMember && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand text-white shadow-sm rounded-full">
                        Tu proyecto
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col mb-4 gap-3 pr-2">
                    <div className="flex justify-between items-start gap-3 w-full">
                      <div className="flex flex-col gap-2 w-full">
                        <h3 className="font-bold text-lg text-text-primary line-clamp-2 break-words leading-tight">{project.name}</h3>

                        {project.isInstitutional && project.subject && (
                          <div className="flex flex-col gap-1.5 mt-1 bg-surface-secondary p-2.5 rounded-lg border border-border-secondary">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-brand shrink-0" />
                              <p className="text-xs font-semibold text-brand truncate">
                                {project.subject.name} <span className="font-normal text-gray-400 ml-1">• {project.subject.period}</span>
                              </p>
                            </div>

                            {project.subject.professors && project.subject.professors.length > 0 && (
                              <div className="flex items-start gap-1.5 pl-0.5">
                                <GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-text-secondary line-clamp-1">
                                  <span className="font-medium text-gray-500 mr-1">Prof:</span>
                                  {project.subject.professors.map(p => p.name).join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap shrink-0 ${project.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                        project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                          'bg-brand/10 text-brand'
                        }`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                  </div>

                  <p className="text-text-muted text-sm mb-6 line-clamp-3 flex-1">{project.description || 'Sin descripcion detallada.'}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-border-primary mt-auto">
                    <div className="flex items-center -space-x-2 relative z-0">
                      {activeMembers.slice(0, 3).map((member) => (
                        <img
                          key={member.id}
                          className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 object-cover shrink-0"
                          src={member.user.avatarUrl || `${AVATAR_FALLBACK_URL}${member.user.userId}`}
                          referrerPolicy="no-referrer"
                          alt={member.user.name}
                          title={member.user.name}
                        />
                      ))}
                      {activeMembers.length > 3 && (
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0 z-10">
                          +{activeMembers.length - 3}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => router.push(`/misc/proyectos/${project.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand hover:text-white bg-brand/5 hover:bg-brand rounded-lg transition-colors"
                    >
                      Ver detalles <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}