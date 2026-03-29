'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Search, X, Calendar, Users, Layers, Globe, Lock } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PUBLIC_PROJECTS, GET_PROJECT_DETAIL } from '@/graphql/projects/operations';
import type {
  PublicProject,
  ProjectDetail,
  ProjectStatus,
  GetPublicProjectsData,
  GetProjectDetailData,
} from '@/graphql/projects/operations';
import { AVATAR_FALLBACK_URL } from '@/lib/constants';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ProjectStatus, string> = {
  STARTING:  'Iniciando',
  ACTIVE:    'En curso',
  ON_HOLD:   'En pausa',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

const LABEL_TO_STATUS: Record<string, ProjectStatus | undefined> = {
  'Iniciando':  'STARTING',
  'En curso':   'ACTIVE',
  'En pausa':   'ON_HOLD',
  'Finalizado': 'COMPLETED',
  'Cancelado':  'CANCELLED',
};

const STATUS_BADGE: Record<ProjectStatus, string> = {
  STARTING:  'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  ACTIVE:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  ON_HOLD:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  COMPLETED: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  CANCELLED: 'bg-red-50 text-red-600 ring-1 ring-red-200',
};

const ROLE_LABEL: Record<string, string> = {
  LEADER:     'Líder',
  SUPERVISOR: 'Supervisor',
  STUDENT:    'Estudiante',
  EXTERNAL:   'Externo',
};

const ROLE_BADGE: Record<string, string> = {
  LEADER:     'bg-violet-50 text-violet-700',
  SUPERVISOR: 'bg-blue-50 text-blue-700',
  STUDENT:    'bg-emerald-50 text-emerald-700',
  EXTERNAL:   'bg-gray-100 text-gray-600',
};

const METHODOLOGY_LABEL: Record<string, string> = {
  KANBAN:   'Kanban',
  SCRUM:    'Scrum',
  SCRUMBAN: 'Scrumban',
};

const FILTER_TABS = ['Todos', 'En curso', 'Iniciando', 'Finalizado'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── Project Modal ────────────────────────────────────────────────────────────

function ProjectModal({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGraphQL<GetProjectDetailData>({
      query: GET_PROJECT_DETAIL,
      variables: { id: projectId },
    })
      .then((data) => setProject(data?.project ?? null))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const badgeClass = project ? (STATUS_BADGE[project.status] ?? '') : '';
  const statusLabel = project ? (STATUS_LABEL[project.status] ?? project.status) : '';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      style={{ animation: 'fadeIn 0.15s ease' }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'slideUp 0.2s ease' }}
      >
        {loading ? (
          <div className="p-10 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !project ? (
          <div className="p-10 text-center text-gray-500">
            No se pudo cargar el proyecto.
          </div>
        ) : (
          <>
            {/* Header con color del proyecto */}
            <div
              className="relative h-2 rounded-t-2xl"
              style={{ backgroundColor: project.color }}
            />

            <div className="p-7">
              {/* Título + cerrar */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className="mt-1.5 flex-shrink-0 w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                      {project.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
                        {statusLabel}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                        <Layers className="w-3 h-3" />
                        {METHODOLOGY_LABEL[project.methodology] ?? project.methodology}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                        {project.isPublic
                          ? <><Globe className="w-3 h-3" /> Público</>
                          : <><Lock className="w-3 h-3" /> Privado</>
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Descripción */}
              {project.description && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Descripción
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Fechas */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium uppercase tracking-wider">Creado</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {formatDate(project.createdAt)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium uppercase tracking-wider">Actualizado</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {formatDate(project.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Miembros */}
              {project.members && project.members.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Equipo ({project.members.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {project.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <img
                          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                          src={member.user.avatarUrl ?? `${AVATAR_FALLBACK_URL}${member.user.id}`}
                          alt={member.user.name}
                        />
                        <div className="min-w-0 flex-grow">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {member.user.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Desde {formatDate(member.joinedAt)}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full ${ROLE_BADGE[member.role] ?? 'bg-gray-100 text-gray-600'}`}>
                          {ROLE_LABEL[member.role] ?? member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onClick,
}: {
  project: PublicProject;
  onClick: () => void;
}) {
  const statusLabel = STATUS_LABEL[project.status] ?? project.status;
  const badgeClass  = STATUS_BADGE[project.status] ?? 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';

  return (
    <button
      onClick={onClick}
      className="text-left w-full bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full group"
    >
      {/* Color bar top */}
      <div
        className="w-full h-1 rounded-full mb-4 opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: project.color }}
      />

      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <h3 className="font-bold text-base text-gray-900 line-clamp-2 leading-snug group-hover:text-[#1e3a5f] transition-colors">
          {project.name}
        </h3>
        <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
          {statusLabel}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm mb-5 line-clamp-3 flex-grow leading-relaxed">
        {project.description ?? 'Sin descripción.'}
      </p>

      {/* Footer: members + methodology */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center -space-x-2">
          {project.members?.slice(0, 4).map((m) => (
            <img
              key={m.id}
              className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 object-cover"
              src={m.user.avatarUrl ?? `${AVATAR_FALLBACK_URL}${m.user.id}`}
              alt={m.user.name}
              title={m.user.name}
            />
          ))}
          {(project.members?.length ?? 0) > 4 && (
            <span className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-medium">
              +{project.members.length - 4}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {METHODOLOGY_LABEL[project.methodology] ?? project.methodology}
        </span>
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="h-1 bg-gray-200 rounded-full mb-4 w-1/3" />
      <div className="flex justify-between mb-3">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-5 bg-gray-200 rounded w-16" />
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
      <div className="flex -space-x-2">
        {[1,2,3].map((i) => (
          <div key={i} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white" />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProyectosPage() {
  const [projects, setProjects]         = useState<PublicProject[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedId, setSelectedId]     = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const statusEnum = LABEL_TO_STATUS[statusFilter];
      const data = await fetchGraphQL<GetPublicProjectsData>({
        query: GET_PUBLIC_PROJECTS,
        variables: {
          filter: {
            isPublic: true,
            includeArchived: false,
            ...(statusEnum && { status: statusEnum }),
            ...(searchTerm.trim() && { search: searchTerm.trim() }),
            take: 50,
          },
        },
      });
      setProjects(data?.projects?.items ?? []);
      setTotal(data?.projects?.total ?? 0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(loadProjects, 300);
    return () => clearTimeout(timer);
  }, [loadProjects]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Proyectos de la EIC
          </h1>
          <p className="text-blue-200">
            Iniciativas académicas abiertas a la comunidad universitaria.
          </p>
          {!loading && !error && (
            <p className="text-blue-300/70 text-sm mt-2">
              {total} {total === 1 ? 'proyecto disponible' : 'proyectos disponibles'}
            </p>
          )}
        </div>
      </section>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
            />
          </div>
          <div className="flex gap-2 text-sm w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors ${
                  statusFilter === tab
                    ? 'bg-[#1e3a5f] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-10">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-4">
              Ocurrió un error al cargar los proyectos.
            </p>
            <button
              onClick={loadProjects}
              className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#16304f] transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No hay proyectos públicos disponibles.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedId(project.id)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-[#1e3a5f] text-white/60 py-6 text-center text-sm mt-auto">
        <p>PROJEIC &middot; Escuela de Ingeniería Coquimbo</p>
      </footer>

      {/* Modal */}
      {selectedId && (
        <ProjectModal
          projectId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}