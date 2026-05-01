'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_MY_PROJECTS } from '@/graphql/misc/operations';
import { Plus, FolderKanban, LayoutGrid, List, Search, BookOpen, GraduationCap } from 'lucide-react';
import CreateProjectModal from '@/components/dashboard/CreateProjectModal';
import { useAuth } from '@/context/AuthProvider';
import { AVATAR_FALLBACK_URL } from '@/lib/constants';
import { useT } from '@/hooks/useT';

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
  myRole?: string;
  mode?: string;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  STARTING: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  COMPLETED: 'bg-surface-secondary text-text-secondary',
  ON_HOLD: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};

const ROLE_COLORS: Record<string, string> = {
  LEADER: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  STUDENT: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  SUPERVISOR: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  EXTERNAL: 'bg-surface-secondary text-text-secondary',
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
        <div className="w-7 h-7 rounded-full border-2 border-white bg-surface-secondary text-text-secondary flex items-center justify-center text-[10px] font-bold z-10">
          +{remaining}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface-primary rounded-xl border border-border-primary overflow-hidden animate-pulse">
      <div className="h-1.5 w-full bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-surface-secondary rounded w-full" />
        <div className="h-3 bg-surface-secondary rounded w-5/6" />
        <div className="h-1.5 bg-surface-secondary rounded-full w-full mt-4" />
        <div className="flex gap-2 mt-2">
          <div className="w-7 h-7 rounded-full bg-gray-200" />
          <div className="w-7 h-7 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, currentUserId, tDynamic }: { project: Project; currentUserId?: string; tDynamic: (key: string) => string }) {
  const { t } = useT();
  const activeMembers = project.members?.filter(m => m.status === 'ACTIVE') || [];
  const myMembership = activeMembers.find(m => m.user.id === currentUserId);
  const role = project.myRole || myMembership?.role || 'STUDENT';

  return (
    <Link
      href={`/misc/proyectos/${project.id}`}
      className="group w-[85vw] shrink-0 snap-center md:w-auto md:shrink md:snap-align-none bg-surface-primary rounded-xl border border-border-primary overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col relative"
    >
      <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: project.color }} />
      <div className="p-6 flex flex-col flex-1">
          <div className="flex flex-col gap-4 w-full mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4 w-full min-w-0">
              <div className="flex flex-col gap-2.5 min-w-0 flex-1 w-full">
                <h3 className="font-bold text-lg text-text-primary line-clamp-2 break-words leading-tight group-hover:text-brand transition-colors">
                  {project.name}
                </h3>

                {project.isInstitutional && project.subject && (
                  <div className="flex flex-col gap-2 mt-1 bg-surface-secondary p-3 rounded-xl border border-border-secondary w-full min-w-0">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-brand shrink-0" />
                      <p className="text-xs font-semibold text-brand truncate">
                        {project.subject.name} <span className="font-normal text-text-muted ml-1">• {project.subject.period}</span>
                      </p>
                    </div>

                    {project.subject.professors && project.subject.professors.length > 0 && (
                      <div className="flex items-start gap-2 pl-0.5">
                        <GraduationCap className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                        <p className="text-[11px] text-text-secondary line-clamp-1">
                          <span className="font-medium text-text-muted mr-1">Prof:</span>
                          {project.subject.professors.map(p => p.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2.5 shrink-0 flex-wrap">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap shrink-0 shadow-sm ${STATUS_COLORS[project.status] ?? 'bg-surface-secondary text-text-secondary'}`}>
                  {tDynamic(`projectStatus.${project.status}`)}
                </span>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap shrink-0 shadow-sm ${ROLE_COLORS[role] ?? 'bg-surface-secondary text-text-secondary'}`}>
                  {tDynamic(`projectRole.${role}`)}
                </span>
              </div>
            </div>
          </div>

        <p className="text-xs text-text-muted line-clamp-2 flex-1 mb-6 leading-relaxed">
          {project.description ?? t('misProyectos.noDescription')}
        </p>

        <div className="mt-auto space-y-4 pt-5 border-t border-border-primary">
          <div>
            <div className="flex justify-between text-[10px] text-text-muted mb-1.5 font-medium">
              <span>{t('misProyectos.progress')}</span>
              <span>0%</span>
            </div>
            <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden shadow-inner">
              <div className="h-full rounded-full transition-all duration-1000" style={{ backgroundColor: project.color, width: '0%' }} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <MemberAvatars members={activeMembers} />
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest bg-surface-secondary px-2 py-0.5 rounded">
              {project.mode === 'HYBRID' ? 'Projeic Native' : project.methodology}
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
  const { t, tDynamic } = useT();
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
    const activeMembers = p.members?.filter(m => m.status === 'ACTIVE') || [];
    const myMembership = activeMembers.find(m => m.user.id === user?.userId);
    const role = p.myRole || myMembership?.role;

    if (!role) return false;

    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (p.subject?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (p.subject?.professors?.some(prof => prof.name.toLowerCase().includes(searchTerm.toLowerCase())) ?? false);

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || role === roleFilter;

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
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">{t('misProyectos.title')}</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {isLoading
              ? t('misProyectos.loading')
              : t(projects.length === 1 ? 'misProyectos.count' : 'misProyectos.countPlural').replace('{n}', String(projects.length))}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-dark hover:bg-brand-dark-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('misProyectos.newProject')}
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder={t('misProyectos.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border-secondary rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-shadow bg-surface-primary placeholder:text-text-muted"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border-secondary rounded-lg text-sm bg-surface-primary focus:ring-2 focus:ring-brand focus:border-brand outline-none"
        >
                    <option value="ALL">{t('misProyectos.statusAll')}</option>
          <option value="ACTIVE">{tDynamic('projectStatus.ACTIVE')}</option>
          <option value="STARTING">{tDynamic('projectStatus.STARTING')}</option>
          <option value="COMPLETED">{tDynamic('projectStatus.COMPLETED')}</option>
          <option value="ON_HOLD">{tDynamic('projectStatus.ON_HOLD')}</option>
          <option value="CANCELLED">{tDynamic('projectStatus.CANCELLED')}</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-border-secondary rounded-lg text-sm bg-surface-primary focus:ring-2 focus:ring-brand focus:border-brand outline-none"
        >
                    <option value="ALL">{t('misProyectos.roleAll')}</option>
          <option value="LEADER">{tDynamic('projectRole.LEADER')}</option>
          <option value="STUDENT">{tDynamic('projectRole.STUDENT')}</option>
          <option value="SUPERVISOR">{tDynamic('projectRole.SUPERVISOR')}</option>
          <option value="EXTERNAL">{tDynamic('projectRole.EXTERNAL')}</option>
        </select>

        <div className="flex items-center border border-border-secondary rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-brand-dark text-white' : 'text-text-muted hover:bg-surface-secondary'}`}
            title={t('misProyectos.viewGrid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-brand-dark text-white' : 'text-text-muted hover:bg-surface-secondary'}`}
            title={t('misProyectos.viewList')}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-surface-secondary p-3 rounded-lg border border-border-primary">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <BookOpen className="w-4 h-4 text-brand" />
          {t('misProyectos.eicFilters')}
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
          className="px-3 py-1.5 border border-border-secondary rounded-md text-xs bg-surface-primary focus:ring-2 focus:ring-brand outline-none"
        >
                    <option value="ALL">{t('misProyectos.filterAll')}</option>
          <option value="YES">{t('misProyectos.filterInstitutional')}</option>
          <option value="NO">{t('misProyectos.filterPersonal')}</option>
        </select>

        {institutionalFilter === 'YES' && (
          <>
            <select
              value={subjectNameFilter}
              onChange={(e) => setSubjectNameFilter(e.target.value)}
              className="px-3 py-1.5 border border-border-secondary rounded-md text-xs bg-surface-primary focus:ring-2 focus:ring-brand outline-none animate-in fade-in slide-in-from-left-2"
            >
                            <option value="ALL">{t('misProyectos.allSubjects')}</option>
              {uniqueSubjectNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <select
              value={subjectPeriodFilter}
              onChange={(e) => setSubjectPeriodFilter(e.target.value)}
              className="px-3 py-1.5 border border-border-secondary rounded-md text-xs bg-surface-primary focus:ring-2 focus:ring-brand outline-none animate-in fade-in slide-in-from-left-2"
            >
                            <option value="ALL">{t('misProyectos.allPeriods')}</option>
              {uniquePeriods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border-primary rounded-2xl bg-surface-secondary/50">
          <div className="w-14 h-14 bg-surface-primary rounded-full flex items-center justify-center mb-4 shadow-sm border border-border-primary">
            <FolderKanban className="w-7 h-7 text-text-secondary" />
          </div>
                    <p className="text-sm font-semibold text-text-primary mb-1">
            {projects.length === 0 ? t('misProyectos.emptyTitle') : t('misProyectos.emptySearchTitle')}
          </p>
          <p className="text-sm text-text-muted max-w-sm">
            {projects.length === 0 ? t('misProyectos.emptyDesc') : t('misProyectos.emptySearchDesc')}
          </p>
        </div>
      ) : (
        <div className={`flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 nice-scrollbar md:grid md:overflow-visible md:pb-0 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'}`}>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} currentUserId={user?.userId} tDynamic={tDynamic} />
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