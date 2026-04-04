'use client';

import { useEffect, useState } from 'react';
import { Search, BookOpen, GraduationCap } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PUBLIC_PROJECTS } from '@/graphql/misc/operations';
import { AVATAR_FALLBACK_URL } from '@/lib/constants';
import PublicProjectModal from '@/components/public/PublicProjectModal';

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

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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
    <div className="min-h-screen flex flex-col bg-white">
      <section className="bg-white text-ui-dark py-12 px-6 border-b border-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Proyectos de la EIC</h1>
            <p className="text-gray-500 font-medium">Iniciativas académicas abiertas a la comunidad universitaria.</p>
        </div>
      </section>

      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proyectos, ramos o profesores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 text-sm w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {FILTER_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-brand-dark text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'Todos' ? 'Todos' : getStatusLabel(status)}
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
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Ocurrió un error al cargar los proyectos. Inténtalo más tarde.</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No hay proyectos públicos disponibles.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const activeMembers = project.members?.filter(m => m.status === 'ACTIVE') ?? [];

              return (
                <button 
                  onClick={() => setSelectedProjectId(project.id)}
                  key={project.id} 
                  className="block text-left w-full bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-brand/40 hover:-translate-y-1 transition-all duration-300 ring-offset-2 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent min-w-0 relative"
                >
                  {project.isInstitutional && project.subject && (
                    <div className="absolute top-4 right-4 text-gray-300 transition-colors" title={`Ramo: ${project.subject.name}`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4 gap-3 pr-6">
                    <div className="flex flex-col gap-2 w-full">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2 decoration-brand group-hover:underline break-words">
                        {project.name}
                      </h3>
                      
                      {project.isInstitutional && project.subject && (
                        <div className="flex flex-col gap-1.5 mt-1 bg-gray-50/80 p-2.5 rounded-lg border border-gray-100 w-fit pr-4">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-brand shrink-0" />
                            <p className="text-xs font-semibold text-brand truncate">
                              {project.subject.name} <span className="font-normal text-gray-400 ml-1">• {project.subject.period}</span>
                            </p>
                          </div>
                          
                          {project.subject.professors && project.subject.professors.length > 0 && (
                            <div className="flex items-start gap-1.5 pl-0.5">
                              <GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                              <p className="text-[11px] text-gray-600 line-clamp-1">
                                <span className="font-medium text-gray-500 mr-1">Prof:</span> 
                                {project.subject.professors.map(p => p.name).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap shrink-0 ${
                      project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                      'bg-brand-light text-brand'
                    }`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">{project.description || 'Sin descripción detallada.'}</p>
                  
                  <div className="flex items-center -space-x-2 relative z-0 mt-auto">
                    {activeMembers.slice(0, 4).map((member) => (
                      <img
                        key={member.id}
                        className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 object-cover shrink-0"
                        src={member.user.avatarUrl || `${AVATAR_FALLBACK_URL}${member.user.id}`}
                        alt={member.user.name}
                        title={member.user.name}
                      />
                    ))}
                    {activeMembers.length > 4 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 z-10">
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
