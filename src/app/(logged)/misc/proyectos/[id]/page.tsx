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
import { ArrowLeft, FileDown, Loader2, Layout, Columns, Activity, BarChart2, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { Project } from '@/types/project';

import UpdateProjectModal from '@/components/dashboard/UpdateProjectModal';
import BoardRenderer from '@/components/dashboard/boards/BoardRenderer';
import TabResumen from '@/components/dashboard/projects/tabs/TabResumen';
import TabMetricas from '@/components/dashboard/projects/tabs/TabMetricas';
import TabMiembros from '@/components/dashboard/projects/tabs/TabMiembros';
import ComingSoonTab from '@/components/dashboard/projects/tabs/ComingSoonTab';
import InviteMemberForm from '@/components/dashboard/projects/members/InviteMemberForm';

type TabId = 'resumen' | 'tablero' | 'actividad' | 'metricas' | 'miembros';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'resumen', label: 'Resumen', icon: Layout },
  { id: 'tablero', label: 'Tablero', icon: Columns },
  { id: 'actividad', label: 'Actividad', icon: Activity },
  { id: 'metricas', label: 'Métricas', icon: BarChart2 },
  { id: 'miembros', label: 'Miembros', icon: Users },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

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
        setError('Proyecto no encontrado.');
      }
    } catch {
      setError('Error al cargar el proyecto.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId, loadProject]);

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este proyecto permanentemente? Esta acción no se puede deshacer.')) return;
    setIsDeleting(true);
    try {
      await fetchGraphQL({ query: DELETE_PROJECT, variables: { id: projectId } });
      router.push('/misc/proyectos');
    } catch {
      alert('Error al eliminar el proyecto.');
      setIsDeleting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await fetchGraphQL({
        query: UPDATE_PROJECT_MEMBER_ROLE,
        variables: { input: { memberId, role: newRole } },
      });
      loadProject();
    } catch {
      alert('Error al actualizar el rol.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('¿Expulsar a este integrante del equipo?')) return;
    try {
      await fetchGraphQL({ query: REMOVE_PROJECT_MEMBER, variables: { memberId } });
      loadProject();
    } catch {
      alert('Error al eliminar al integrante.');
    }
  };

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>;
  if (error || !project) return <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4"><p>{error}</p><Link href="/misc/proyectos">Volver</Link></div>;

  const currentUserRole = project?.members.find((m) => m.user.id === user?.userId)?.role ?? null;
  const isLeader = currentUserRole === 'LEADER';

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/misc/proyectos" className="hover:text-gray-900 transition-colors">
            Mis proyectos
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[240px]">{project.name}</span>
        </nav>
        <div className="flex items-center gap-2">
          <button
            disabled
            title="Próximamente"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" /> Exportar PDF
          </button>
          <button
            disabled
            title="Próximamente"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* NAVEGACIÓN DE TABS */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <button 
            key={tabId} 
            onClick={() => setActiveTab(tabId)} 
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tabId
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}>
               <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL DE TABS DESACOPLADAS */}
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
        {activeTab === 'tablero' && <BoardRenderer methodology={project.methodology} projectId={project.id} members={project.members} userRole={currentUserRole} />}
        {activeTab === 'actividad' && <ComingSoonTab label="Feed de actividad" />}
        {activeTab === 'metricas' && <TabMetricas />}
        {activeTab === 'miembros' && (
          <TabMiembros
            project={project}
            isLeader={isLeader}
            onUpdateRole={handleUpdateRole}
            onRemoveMember={handleRemoveMember}
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