'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PROFILE } from '@/graphql/misc/operations';
import { Plus, Briefcase, CheckSquare, Activity, Users, FolderKanban, Clock } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  avatarUrl?: string;
}

interface DashboardMetrics {
  activeProjects: number | null;
  pendingTasks: number | null;
  activityPoints: number | null;
  collaborators: number | null;
}

export default function ProfileDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeProjects: null,
    pendingTasks: null,
    activityPoints: null,
    collaborators: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const data = await fetchGraphQL({ query: GET_PROFILE });
        if (mounted && data?.me) {
          setProfile(data.me);
        }
      } catch (error: unknown) {
        // Manejado silenciosamente para usar estados vacíos limpios en la UI
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, []);

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
            Bienvenido, {getFirstName(user?.nombre ?? profile?.nombre)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{getFormattedDate()}</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-blue-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Proyectos activos', value: metrics.activeProjects, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
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
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <FolderKanban className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">No tienes proyectos aún.</p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">Crea un proyecto para empezar a colaborar con otros estudiantes y profesores.</p>
              </div>
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