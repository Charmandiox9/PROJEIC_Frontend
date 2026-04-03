'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_MY_PROJECTS } from '@/graphql/misc/operations';
import { Plus, FolderKanban, LayoutGrid, List, Search, BookOpen, GraduationCap } from 'lucide-react';
import CreateProjectModal from '@/components/dashboard/CreateProjectModal';
import { useAuth } from '@/context/AuthProvider';
import { AVATAR_FALLBACK_URL } from '@/lib/constants';

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

interface ProjectMember {
  id: string;
  role: string;
  status: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: string;
  methodology: string;
  isPublic: boolean;
  isInstitutional: boolean;
  subject?: Subject;
  members: ProjectMember[];
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  STARTING: 'Iniciando',
  COMPLETED: 'Completado',
  ON_HOLD: 'En pausa',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  STARTING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const ROLE_LABELS: Record<string, string> = {
  LEADER: 'Líder',
  STUDENT: 'Estudiante',
  SUPERVISOR: 'Supervisor',
  EXTERNAL: 'Externo',
};

const ROLE_COLORS: Record<string, string> = {
  LEADER: 'bg-purple-100 text-purple-700',
  STUDENT: 'bg-blue-100 text-blue-700',
  SUPERVISOR: 'bg-orange-100 text-orange-700',
  EXTERNAL: 'bg-gray-100 text-gray-600',
};

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function MemberAvatars({ members }: { members: ProjectMember[] }) {
  const visible = members.slice(0, 3);
  const remaining = members.length - visible.length;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((m) => (
        <div
          key={m.id}
          title={m.user.name}
          className="w-7 h-7 rounded-full border-2 border-white shrink-0 overflow-hidden bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold"
        >
          {m.user.avatarUrl ? (
            <img src={m.user.avatarUrl || `${AVATAR_FALLBACK_URL}${m.user.id}`} alt={m.user.name} className="w-full h-full object-cover" />
          ) : (
            <span>{getInitials(m.user.name)}</span>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold z-10">
          +{remaining}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-1.5 w-full bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-1.5 bg-gray-100 rounded-full w-full mt-4" />
        <div className="flex gap-2 mt-2">
          <div className="w-7 h-7 rounded-full bg-gray-200" />
          <div className="w-7 h-7 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, currentUserId }: { project: Project; currentUserId?: string }) {
  const activeMembers = project.members.filter(m => m.status === 'ACTIVE');
  const myMembership = activeMembers.find(m => m.user.id === currentUserId);
  const role = myMembership?.role ?? 'STUDENT';

  return (
    <Link
      href={`/misc/proyectos/${project.id}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col relative"
    >
      <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: project.color }} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-col mb-4 gap-3 pr-2">
          <div className="flex justify-between items-start gap-3 w-full">
            <div className="flex flex-col gap-2 w-full">
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2 break-words leading-tight">
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
            
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap ${STATUS_COLORS[project.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[project.status] ?? project.status}
              </span>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap ${ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-600'}`}>
                {ROLE_LABELS[role] ?? role}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-4">
          {project.description ?? 'Sin descripción.'}
        </p>

        <div className="mt-auto space-y-3 pt-4 border-t border-gray-50">
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Progreso</span>
              <span>0%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ backgroundColor: project.color, width: '0%' }} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <MemberAvatars members={activeMembers} />
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              {project.methodology}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

type ViewMode = 'grid' | 'list';

export default function MisProyectosPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  const [institutionalFilter, setInstitutionalFilter] = useState('ALL');
  const [subjectNameFilter, setSubjectNameFilter] = useState('ALL');
  const [subjectPeriodFilter, setSubjectPeriodFilter] = useState('ALL');
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchGraphQL({ query: GET_MY_PROJECTS, variables: { skip: 0, take: 100 } });

      if (data?.myProjects?.items) {
        setProjects(data.myProjects.items as Project[]);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const institutionalProjects = projects.filter(p => p.isInstitutional && p.subject);
  const uniqueSubjectNames = Array.from(new Set(institutionalProjects.map(p => p.subject!.name))).sort();
  const uniquePeriods = Array.from(new Set(institutionalProjects.map(p => p.subject!.period))).sort((a, b) => b.localeCompare(a)); 

  const filteredProjects = projects.filter((p) => {
    const activeMembers = p.members.filter(m => m.status === 'ACTIVE');
    const myMembership = activeMembers.find(m => m.user.id === user?.userId);
    
    if (!myMembership) return false;

    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (p.subject?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (p.subject?.professors?.some(prof => prof.name.toLowerCase().includes(searchTerm.toLowerCase())) ?? false);
    
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || myMembership.role === roleFilter;
    
    const matchesInstitutional = 
      institutionalFilter === 'ALL' || 
      (institutionalFilter === 'YES' && p.isInstitutional) ||
      (institutionalFilter === 'NO' && !p.isInstitutional);

    const matchesSubjectName = subjectNameFilter === 'ALL' || p.subject?.name === subjectNameFilter;
    const matchesSubjectPeriod = subjectPeriodFilter === 'ALL' || p.subject?.period === subjectPeriodFilter;

    return matchesSearch && matchesStatus && matchesRole && matchesInstitutional && matchesSubjectName && matchesSubjectPeriod;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mis Proyectos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isLoading ? 'Cargando...' : `${projects.length} proyecto${projects.length !== 1 ? 's' : ''} en total`}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-dark hover:bg-brand-dark-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar proyectos, ramos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-shadow"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand focus:border-brand outline-none"
        >
          <option value="ALL">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="STARTING">Iniciando</option>
          <option value="COMPLETED">Completado</option>
          <option value="ON_HOLD">En pausa</option>
          <option value="CANCELLED">Cancelado</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand focus:border-brand outline-none"
        >
          <option value="ALL">Mi rol: Todos</option>
          <option value="LEADER">Líder</option>
          <option value="STUDENT">Estudiante</option>
          <option value="SUPERVISOR">Supervisor</option>
          <option value="EXTERNAL">Externo</option>
        </select>

        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            title="Vista cuadrícula"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            title="Vista lista"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <BookOpen className="w-4 h-4 text-brand" />
          Filtros EIC:
        </div>
        
        <select
          value={institutionalFilter}
          onChange={(e) => {
            setInstitutionalFilter(e.target.value);
            if (e.target.value !== 'YES') {
              setSubjectNameFilter('ALL');
              setSubjectPeriodFilter('ALL');
            }
          }}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-xs bg-white focus:ring-2 focus:ring-brand outline-none"
        >
          <option value="ALL">Todos los proyectos</option>
          <option value="YES">Solo Institucionales</option>
          <option value="NO">Solo Personales</option>
        </select>

        {institutionalFilter === 'YES' && (
          <>
            <select
              value={subjectNameFilter}
              onChange={(e) => setSubjectNameFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-xs bg-white focus:ring-2 focus:ring-brand outline-none animate-in fade-in slide-in-from-left-2"
            >
              <option value="ALL">Todas las materias</option>
              {uniqueSubjectNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <select
              value={subjectPeriodFilter}
              onChange={(e) => setSubjectPeriodFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-xs bg-white focus:ring-2 focus:ring-brand outline-none animate-in fade-in slide-in-from-left-2"
            >
              <option value="ALL">Todos los periodos</option>
              {uniquePeriods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* ─── GRID DE PROYECTOS ─── */}
      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
            <FolderKanban className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {projects.length === 0 ? 'No tienes proyectos aún.' : 'Sin resultados para tu búsqueda.'}
          </p>
          <p className="text-sm text-gray-500 max-w-sm">
            {projects.length === 0
              ? 'Crea tu primer proyecto y empieza a colaborar.'
              : 'Prueba con otros términos o limpia los filtros institucionales.'}
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} currentUserId={user?.userId} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadProjects(); 
        }}
      />
    </div>
  );
}