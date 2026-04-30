'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Code
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { Project } from '@/types/project';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/hooks/useLocale';
import { getLocalizedText } from '@/utils/i18n';

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

type TabId = 'resumen' | 'tablero' | 'resultados' | 'actividad' | 'metricas' | 'miembros' | 'cronograma' | 'github';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useT();
  const { locale } = useLocale();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

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

  if (isLoading && !project) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>;
  
  if (error && !project) return <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4"><p>{error}</p><Link href="/misc/proyectos">{t('projectDetail.back')}</Link></div>;

  if (!project) return null;

  const actualRole = project?.members?.find((m) => m.user.id === user?.userId)?.role;
  const currentUserRole = project?.myRole || actualRole || null;
  const isLeader = currentUserRole === 'LEADER';

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
    { id: 'miembros', label: t('projectDetail.tabMiembros'), icon: Users },
  );

  if (project.repositories && project.repositories.length > 0) {
    currentTabs.push({ id: 'github', label: t('projectDetail.tabGithub'), icon: Code });
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 pb-12 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            href="/misc/proyectos"
            className="flex items-center gap-1.5 hover:text-brand transition-colors font-medium shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('projectDetail.backFull')}</span>
            <span className="sm:hidden">{t('projectDetail.back')}</span>
          </Link>
          <span className="text-gray-300 text-lg/none shrink-0">|</span>
          <span className="text-text-primary font-medium truncate max-w-[140px] sm:max-w-[300px]">
            {getLocalizedText(project.name, locale as 'es' | 'en' | 'pt')}
          </span>
          {/* Pequeña etiqueta visual del modo */}
          <span className="hidden sm:inline-flex px-2 py-0.5 ml-2 text-[10px] font-bold uppercase tracking-wider rounded-md bg-surface-secondary text-text-secondary">
            {project.mode === 'HYBRID' ? t('projectDetail.modeHybrid') : t('projectDetail.modeClassic')}
          </span>
        </nav>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            disabled
            title={t('projectDetail.comingSoon')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-muted border border-border-primary rounded-lg cursor-not-allowed opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" /> {t('projectDetail.exportPdf')}
          </button>
          <button
            disabled
            title={t('projectDetail.comingSoon')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-muted border border-border-primary rounded-lg cursor-not-allowed opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" /> {t('projectDetail.exportCsv')}
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
          />
        )}
        {/* Renderizamos Resultados SOLO si es híbrido */}
        {activeTab === 'resultados' && project.mode === 'HYBRID' && (
          <TabResultados project={project} isLeader={isLeader} />
        )}

        {activeTab === 'actividad' && <ActivityFeed project={project} />}
        {activeTab === 'metricas' && <TabMetricas projectId={project.id} />}
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
      </div>

      {/* MODALES */}
      {isEditModalOpen && <UpdateProjectModal isOpen={isEditModalOpen} project={project} onClose={() => setIsEditModalOpen(false)} onSuccess={loadProject} />}
      {isAddMemberOpen && activeTab === 'resumen' && <InviteMemberForm project={project} onUpdateRole={handleUpdateRole} onRemoveMember={handleRemoveMember} onRefresh={loadProject} onClose={() => setIsAddMemberOpen(false)} />}
    </div>
  );
}