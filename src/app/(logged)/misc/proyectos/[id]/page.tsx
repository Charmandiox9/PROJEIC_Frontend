'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchGraphQL } from '@/lib/graphQLClient';
import {
  GET_PROJECT_BY_ID,
  DELETE_PROJECT,
  REMOVE_PROJECT_MEMBER,
  UPDATE_PROJECT_MEMBER_ROLE,
} from '@/graphql/misc/operations';
import {
  ArrowLeft,
  FileDown,
  Loader2,
  Layout,
  Columns,
  Activity,
  BarChart2,
  Users,
  Target,
  CalendarIcon,
  Code,
  Folder,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { Project } from '@/types/project';
import { useT } from '@/hooks/useT';
import { useSearchParams, usePathname } from 'next/navigation';

import UpdateProjectModal from '@/components/dashboard/UpdateProjectModal';
import BoardRenderer from '@/components/dashboard/boards/BoardRenderer';
import TabResumen from '@/components/dashboard/projects/tabs/TabResumen';
import TabMetricas from '@/components/dashboard/projects/tabs/TabMetricas';
import TabMiembros from '@/components/dashboard/projects/tabs/TabMiembros';
import ActivityFeed from '@/components/dashboard/projects/tabs/TabActivity';
import InviteMemberForm from '@/components/dashboard/projects/members/InviteMemberForm';
import TabResultados from '@/components/dashboard/projects/tabs/TabResultados';
import TabCronograma from '@/components/dashboard/projects/tabs/TabCronograma';
import GithubIntegration from '@/components/dashboard/projects/tabs/GithubIntegration';
import TabDocumentos from '@/components/dashboard/projects/tabs/TabDocumentos';
import TabFinanzas from '@/components/dashboard/projects/tabs/TabFinanzas';

type TabId = 'resumen' | 'tablero' | 'resultados' | 'actividad' | 'metricas' | 'miembros' | 'cronograma' | 'github' | 'documentos' | 'finanzas';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useT();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialTab: TabId = searchParams.get('task') ? 'tablero' : 'resumen';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const exportCSVRef = useRef<(() => void) | null>(null);
  const [, forceUpdate] = useState({}); // To show/hide CSV button when registered

  const handleSetExportTrigger = useCallback((fn: () => void) => {
    exportCSVRef.current = fn;
    forceUpdate({});
  }, []);

  const projectId = Array.isArray(id) ? id[0] : id;

  const loadProject = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchGraphQL({
        query: GET_PROJECT_BY_ID,
        variables: { id: projectId },
      });
      if (data?.findOne) {
        setProject(data.findOne as Project);
      } else {
        setError(t('projectDetail.notFound'));
      }
    } catch {
      setError(t('projectDetail.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId, loadProject]);

  useEffect(() => {
    if (project) {
      console.log("👀 Datos del proyecto recibidos:", project);
    }
  }, [project]);

  const handleDelete = async () => {
    if (!confirm(t('projectDetail.confirmDelete'))) return;
    setIsDeleting(true);
    try {
      await fetchGraphQL({ query: DELETE_PROJECT, variables: { id: projectId } });
      router.push('/misc/proyectos');
    } catch {
      alert(t('projectDetail.errorDelete'));
      setIsDeleting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!project?.id) return;

    try {
      await fetchGraphQL({
        query: UPDATE_PROJECT_MEMBER_ROLE,
        variables: { input: { memberId, role: newRole, projectId: project.id } },
      });
      loadProject();
    } catch {
      alert(t('projectDetail.errorUpdateRole'));
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm(t('projectDetail.confirmRemove'))) return;
    try {
      await fetchGraphQL({ query: REMOVE_PROJECT_MEMBER, variables: { memberId } });
      loadProject();
    } catch {
      alert(t('projectDetail.errorRemove'));
    }
  };

  const handleJumpToTask = (taskId: string) => {
    setActiveTab('tablero');
    
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('task', taskId);
    
    router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
  };

  if (isLoading && !project) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>;
  
  if (error && !project) return <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4"><p>{error}</p><Link href="/misc/proyectos">{t('projectDetail.back')}</Link></div>;

  if (!project) return null;

  const actualRole = project?.members?.find((m) => m.user.id === user?.userId)?.role;
  const currentUserRole = project?.myRole || actualRole || null;
  const isLeader = currentUserRole === 'LEADER';
  const isSupervisor = currentUserRole === 'SUPERVISOR';

  const currentTabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'resumen', label: t('projectDetail.tabResumen'), icon: Layout },
    project.mode === 'HYBRID'
      ? { id: 'resultados', label: t('projectDetail.tabResultados'), icon: Target }
      : { id: 'tablero', label: t('projectDetail.tabTablero'), icon: Columns },
  ];

  if (project.mode === 'CLASSIC' && (project.methodology === 'SCRUM' || project.methodology === 'SCRUMBAN')) {
    currentTabs.push({ id: 'cronograma', label: t('projectDetail.tabCronograma'), icon: CalendarIcon });
  }

  currentTabs.push(
    { id: 'actividad', label: t('projectDetail.tabActividad'), icon: Activity },
    { id: 'metricas', label: t('projectDetail.tabMetricas'), icon: BarChart2 },
    { id: 'documentos', label: t('projectDetail.tabDocumentos'), icon: Folder },
    { id: 'miembros', label: t('projectDetail.tabMiembros'), icon: Users },
  );

  if (project.repositories && project.repositories.length > 0) {
    currentTabs.push({ id: 'github', label: t('projectDetail.tabGithub'), icon: Code });
  }

  //if (project.wallet) {
  //  currentTabs.push({ id: 'finanzas', label: t('projectDetail.tabFinanzas'), icon: DollarSign });
  //}

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 pb-12 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <nav className="flex flex-wrap items-center gap-3 text-sm min-w-0">
          <Link
            href="/misc/proyectos"
            className="flex items-center gap-2 text-text-muted hover:text-brand transition-all font-semibold shrink-0 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">{t('projectDetail.backFull')}</span>
            <span className="sm:hidden">{t('projectDetail.back')}</span>
          </Link>
          <span className="text-border-secondary text-xl/none font-light shrink-0">/</span>
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-text-primary font-bold truncate text-base">
              {project.name}
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded-md bg-brand/10 text-brand border border-brand/20">
              {project.mode === 'HYBRID' ? t('projectDetail.modeHybrid') : t('projectDetail.modeClassic')}
            </span>
          </div>
        </nav>
        
        <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
          {activeTab === 'tablero' && (
            <button
              onClick={() => exportCSVRef.current?.()}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all shadow-sm whitespace-nowrap active:scale-95 rounded-xl border ${exportCSVRef.current ? 'text-brand bg-brand/5 border-brand/20 hover:bg-brand/10' : 'text-text-muted bg-surface-secondary border-border-primary opacity-50 cursor-not-allowed'}`}
              disabled={!exportCSVRef.current}
            >
              <FileDown className="w-4 h-4" /> {t('projectDetail.exportCsv')}
            </button>
          )}
          <button
            onClick={() => window.open(`/projeic/misc/proyectos/${id}/reports`, '_blank')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-text-primary bg-surface-primary border border-border-primary rounded-xl hover:bg-surface-secondary transition-all shadow-sm whitespace-nowrap active:scale-95"
          >
            <FileDown className="w-4 h-4" /> {t('projectDetail.exportPdf')}
          </button>
        </div>
      </div>

      {/* NAVEGACIÓN DE TABS */}
      <div className="border-b border-border-primary">
        <div className="flex gap-2 overflow-x-auto nice-scrollbar pb-1">
          {currentTabs.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${activeTab === tabId
                ? 'border-brand text-brand'
                : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-secondary'
                }`}>
              <Icon className="w-4 h-4 shrink-0" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === 'resumen' && (
          <TabResumen
            project={project}
            isLeader={isLeader}
            onEdit={() => setIsEditModalOpen(true)}
            onDelete={handleDelete}
            onUpdateRole={handleUpdateRole}
            onRemoveMember={handleRemoveMember}
            onAddMember={() => setIsAddMemberOpen(true)}
            isDeleting={isDeleting}
          />
        )}
        {/* Renderizamos Tablero SOLO si es clásico */}
        {activeTab === 'tablero' && project.mode === 'CLASSIC' && (
          <BoardRenderer
            methodology={project.methodology}
            projectId={project.id}
            members={project.members}
            userRole={currentUserRole}
            projectName={project.name}
            setExportTrigger={handleSetExportTrigger}
          />
        )}
        {/* Renderizamos Resultados SOLO si es híbrido */}
        {activeTab === 'resultados' && project.mode === 'HYBRID' && (
          <TabResultados project={project} isLeader={isLeader} />
        )}

        {activeTab === 'actividad' && <ActivityFeed project={project} />}
        {activeTab === 'metricas' && <TabMetricas projectId={project.id} onTaskClick={handleJumpToTask} />}
        {activeTab === 'miembros' && (
          <TabMiembros
            project={project}
            isLeader={isLeader}
            onUpdateRole={handleUpdateRole}
            onRemoveMember={handleRemoveMember}
            onRefresh={loadProject}
          />
        )}
        {activeTab === 'cronograma' && project.mode === 'CLASSIC' && (
          <TabCronograma 
            projectId={project.id} 
            members={project.members}
            userRole={currentUserRole}
          />
        )}
        {activeTab === 'github' && (
          <GithubIntegration project={project} />
        )}
        {activeTab === 'documentos' && (
          <TabDocumentos
            projectId={project.id}
            isLeader={isLeader}
            documents={project.documents || []}
            onRefresh={loadProject}
          />
        )}
        {activeTab === 'finanzas' && (
          <TabFinanzas 
            projectId={project.id} 
            subjectId={project?.subject?.id}
            isLeader={isLeader} 
            isSupervisor={isSupervisor} 
            wallet={project.wallet} 
            members={project.members || []} 
            onRefresh={loadProject}
          />
        )}
      </div>

      {/* MODALES */}
      {isEditModalOpen && <UpdateProjectModal isOpen={isEditModalOpen} project={project} onClose={() => setIsEditModalOpen(false)} onSuccess={loadProject} />}
      {isAddMemberOpen && activeTab === 'resumen' && <InviteMemberForm project={project} onUpdateRole={handleUpdateRole} onRemoveMember={handleRemoveMember} onRefresh={loadProject} onClose={() => setIsAddMemberOpen(false)} />}
    </div>
  );
}