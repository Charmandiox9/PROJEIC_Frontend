'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PROJECT_BY_ID, DELETE_PROJECT, REMOVE_PROJECT_MEMBER, UPDATE_PROJECT_MEMBER_ROLE } from '@/graphql/misc/operations';
import { ArrowLeft, Edit3, Trash2, Calendar, Layout, Info, User, Loader2, Globe, Lock, UserPlus } from 'lucide-react';
import Link from 'next/link';
import UpdateProjectModal from '@/components/dashboard/UpdateProjectModal';
import AddMemberModal from '@/components/dashboard/AddMemberModal';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setError('Error al cargar el proyecto.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto Pemanentemente? ¡Esta acción borrará todos los datos asociados de la base de datos!')) return;
    
    try {
      setIsDeleting(true);
      await fetchGraphQL({
        query: DELETE_PROJECT,
        variables: { id: project.id }
      });
      router.push('/misc/profile');
    } catch (err) {
      alert('Error al eliminar el proyecto.');
      setIsDeleting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await fetchGraphQL({
        query: UPDATE_PROJECT_MEMBER_ROLE,
        variables: { input: { memberId, role: newRole } }
      });
      loadProject();
    } catch (err) {
      alert('Error al actualizar el rol.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('¿Expulsar a este integrante del equipo?')) return;
    try {
      await fetchGraphQL({
        query: REMOVE_PROJECT_MEMBER,
        variables: { memberId }
      });
      loadProject();
    } catch (err) {
      alert('Error al eliminar al integrante.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-500 font-medium">{error || 'Proyecto no disponible'}</p>
        <Link href="/misc/profile" className="text-brand hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Volver al dashboard
        </Link>
      </div>
    );
  }

  const creationDate = new Date(project.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <Link href="/misc/profile" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-2">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Color Banner */}
        <div className="h-24 w-full" style={{ backgroundColor: project.color || '#3B82F6' }}></div>
        
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{project.name}</h1>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {project.status}
                </span>
              </div>
              <p className="text-gray-500 text-lg">{project.description || 'Sin descripción detallada.'}</p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Editar
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Detalles del Proyecto</h2>
              
              <ul className="space-y-4">
                <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <div className="flex items-center text-gray-500 min-w-40 font-medium text-sm">
                    <Calendar className="w-4 h-4 mr-2" /> Fecha de creación
                  </div>
                  <span className="text-gray-900 text-sm">{creationDate}</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <div className="flex items-center text-gray-500 min-w-40 font-medium text-sm">
                    <Layout className="w-4 h-4 mr-2" /> Metodología
                  </div>
                  <span className="text-gray-900 text-sm capitalize">{project.methodology.toLowerCase()}</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <div className="flex items-center text-gray-500 min-w-40 font-medium text-sm">
                    {project.isPublic ? <Globe className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />} 
                    Visibilidad
                  </div>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-md ${project.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {project.isPublic ? 'Público' : 'Privado'}
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h2 className="text-lg font-bold text-gray-900">Equipo ({project.members?.length || 0})</h2>
                <button 
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="text-sm font-medium text-brand hover:text-brand-hover flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-4 h-4" /> Agregar
                </button>
              </div>
              
              {project.members && project.members.length > 0 ? (
                <div className="space-y-3">
                  {project.members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        {member.user.avatarUrl ? (
                          <img src={member.user.avatarUrl} alt={member.user.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand-light text-brand flex items-center justify-center font-bold">
                            {member.user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{member.user.name}</p>
                          <select 
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            className="mt-1 text-[11px] font-bold text-brand bg-brand/5 border border-brand/20 rounded-md py-1 px-2 focus:ring-2 focus:ring-brand focus:border-brand outline-none cursor-pointer hover:bg-brand/15 hover:border-brand/30 transition-all shadow-sm max-w-[125px]"
                          >
                             <option value="LEADER">Líder</option>
                             <option value="STUDENT">Estudiante</option>
                             <option value="SUPERVISOR">Supervisor</option>
                             <option value="EXTERNAL">Externo</option>
                          </select>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Expulsar integrante"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                  <User className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay miembros registrados.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <UpdateProjectModal 
        isOpen={isEditModalOpen} 
        project={project}
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={loadProject} 
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        projectId={project.id}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSuccess={loadProject}
      />
    </div>
  );
}
