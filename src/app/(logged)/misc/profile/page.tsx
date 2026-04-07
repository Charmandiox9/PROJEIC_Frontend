'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PROFILE, GET_MY_PROJECTS } from '@/graphql/misc/operations';
import { GET_PENDING_TASKS_BY_USER } from '@/graphql/tasks/operations';
import { Plus, Briefcase, CheckSquare, Activity, Users, FolderKanban, Clock, ArrowRight } from 'lucide-react';
import CreateProjectModal from '@/components/dashboard/CreateProjectModal';

interface UserProfile {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface Project {
  status: string;
  myRole?: string;
  members?: {
    role: string;
    status: string;
    user: {
      id: string;
    };
  }[];
}

interface DashboardMetrics {
  activeProjects: number | null;
  pendingTasks: number | null;
  activityPoints: number | null;
  collaborators: number | null;
}

export default function ProfileDashboard() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeProjects: null,
    pendingTasks: null,
    activityPoints: null,
    collaborators: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
    let isSubscribed = true;

    const loadData = async () => {
      try {
        const [profileRes, projectsRes, tasksRes] = await Promise.all([
          fetchGraphQL({ query: GET_PROFILE }),
          fetchGraphQL({ query: GET_MY_PROJECTS, variables: { skip: 0, take: 50 } }),
          fetchGraphQL({ query: GET_PENDING_TASKS_BY_USER })
        ]);

        if (isSubscribed) {
          if (profileRes?.me) {
            setProfile(profileRes.me);
            
            if (projectsRes?.myProjects?.items) {
              const items = projectsRes.myProjects.items;
              setProjects(items);

                const leaderProjects = items.filter((p: Project) => {
                  const activeMembers = p.members?.filter(m => m.status === 'ACTIVE') || [];
                  const myMembership = activeMembers.find(m => m.user.id === user?.userId);
                  const role = p.myRole || myMembership?.role;
                  return role === 'LEADER';
                });

              const collaboratorIds = new Set<string>();
              leaderProjects.forEach((p: Project) => {
                p.members
                  ?.filter(m => m.status === 'ACTIVE' && m.user.id !== user?.userId)
                  .forEach(m => collaboratorIds.add(m.user.id));
              });

              const pendingTasksCount = tasksRes?.pendingTasksByUserId?.length || 0;

              setMetrics(prev => ({
                ...prev,
                activeProjects: items.filter((p: Project) => p.status === 'ACTIVE').length,
                collaborators: collaboratorIds.size,
                pendingTasks: pendingTasksCount,
              }));
            }
          }
        }
      } catch (error: unknown) {
        // Manejado silenciosamente para usar estados vacíos limpios en la UI
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    loadData();
    // Expose loadData to window for onSuccess manual triggering if needed,
    // though passing it directly or refreshing is better.
    return () => { isSubscribed = false; };
  }, []);

  const handleProjectCreated = () => {
    setIsLoading(true);
    Promise.all([
      fetchGraphQL({ query: GET_PROFILE }),
      fetchGraphQL({ query: GET_MY_PROJECTS, variables: { skip: 0, take: 50 } })
    ])
      .then(([profileRes, projectsRes]) => {
        if (profileRes?.me && projectsRes?.myProjects?.items) {
          const items = projectsRes.myProjects.items;
          setProjects(items);

          const leaderProjects = items.filter((p: Project) => {
            const activeMembers = p.members?.filter(m => m.status === 'ACTIVE') || [];
            const myMembership = activeMembers.find(m => m.user.id === user?.userId);
            const role = p.myRole || myMembership?.role;
            return role === 'LEADER';
          });

          const collaboratorIds = new Set<string>();
          leaderProjects.forEach((p: Project) => {
            p.members
              ?.filter(m => m.status === 'ACTIVE' && m.user.id !== user?.userId)
              .forEach(m => collaboratorIds.add(m.user.id));
          });

          setMetrics(prev => ({
            ...prev,
            activeProjects: items.filter((p: Project) => p.status === 'ACTIVE').length,
            collaborators: collaboratorIds.size,
          }));
        }
      })
      .finally(() => setIsLoading(false));
  };

  const getFormattedDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    let formatted = date.toLocaleDateString('es-ES', options);
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    return `${formatted} · Semestre 2026-1`;
  };

  const getFirstName = (fullName?: string): string => {
    if (!fullName) return '...';
    return fullName.split(' ')[0];
  };

  const renderMetricValue = (value: number | null) => {
    if (isLoading || value === null) return '-';
    return value.toString();
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Bienvenido, {mounted ? getFirstName(user?.name ?? profile?.name) : '...'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mounted ? getFormattedDate() : 'Cargando...'}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-dark hover:bg-brand-dark-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </button>
      </header>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleProjectCreated} 
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Proyectos activos', value: metrics.activeProjects, icon: Briefcase, color: 'text-brand', bg: 'bg-brand-light' },
          { label: 'Tareas pendientes', value: metrics.pendingTasks, icon: CheckSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Actividad (7 días)', value: metrics.activityPoints, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Colaboradores', value: metrics.collaborators, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border text-left border-gray-100 p-5 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{renderMetricValue(stat.value)}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="col-span-1 lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm h-full flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Mis proyectos</h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="animate-pulse w-full max-w-sm space-y-4">
                    <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
                    <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <FolderKanban className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">No tienes proyectos aún.</p>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">Crea un proyecto para empezar a colaborar con otros estudiantes y profesores.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {projects.map((proj) => (
                    <Link
                      key={proj.id}
                      href={`/misc/proyectos/${proj.id}`}
                      className="block group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: proj.color ?? 'var(--color-brand)' }}
                          ></div>
                          <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-brand transition-colors line-clamp-1 text-sm">
                            {proj.name}
                          </h3>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-auto flex-1 mb-4">
                        {proj.description || 'Sin descripción...'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                        <span className="text-[10px] font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
                          {proj.status}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="col-span-1 border border-gray-100 rounded-xl shadow-sm bg-white h-full flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Feed de actividad reciente</h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Sin actividad reciente.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}