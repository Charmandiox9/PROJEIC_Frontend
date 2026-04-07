'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PROJECT_METRICS } from '@/graphql/misc/operations';

interface TabMetricasProps {
  projectId: string;
}

export default function TabMetricas({ projectId }: TabMetricasProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return; 

    const loadMetrics = async () => {
      try {
        const data = await fetchGraphQL({
          query: GET_PROJECT_METRICS,
          variables: { projectId }
        });
        setMetrics(data.projectMetrics);
      } catch (error) {
        console.error("Error cargando métricas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMetrics();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!metrics) return null;

  const progressPercentage = metrics.totalTasks > 0 
    ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) 
    : 0;

  const hasOverdue = metrics.overdueTasksCount > 0;
  const healthColor = hasOverdue ? '#ef4444' : '#22c55e';
  const healthBgColor = hasOverdue ? 'bg-red-500' : 'bg-green-500';
  const healthText = hasOverdue ? `${metrics.overdueTasksCount} tareas atrasadas` : 'Sin tareas vencidas';

  const metricCards = [
    { label: 'Tareas totales', value: metrics.totalTasks },
    { label: 'Tareas vencidas', value: metrics.overdueTasksCount },
    { label: 'En revisión', value: metrics.inReviewTasks },
    { label: 'Actividad (7 días)', value: metrics.activityLast7Days },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* TARJETA DE SALUD DEL PROYECTO */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center gap-6 shadow-sm">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={progressPercentage === 0 ? '#f3f4f6' : '#22c55e'}
              strokeWidth="3.5"
              strokeDasharray={`${progressPercentage} 100`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{progressPercentage}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Salud del proyecto</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-2 h-2 rounded-full ${healthBgColor} animate-pulse`} />
            <span className={`text-xs font-medium ${hasOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              {healthText}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{metrics.completedTasks} de {metrics.totalTasks} completadas</p>
        </div>
      </div>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:border-brand/30 transition-colors">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ESTADÍSTICAS POR COLUMNA & TAREAS VENCIDAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AVANCE POR COLUMNA */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Distribución del tablero</h3>
          {metrics.tasksByColumn.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No hay columnas configuradas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.tasksByColumn.map((col: any) => {
                const percentage = metrics.totalTasks > 0 ? Math.round((col.count / metrics.totalTasks) * 100) : 0;
                return (
                  <div key={col.boardId}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{col.name}</span>
                      <span className="text-gray-500">{col.count} tareas ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${percentage}%`, backgroundColor: col.color || '#3B82F6' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* LISTA DE TAREAS VENCIDAS */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            Tareas vencidas {hasOverdue && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full">{metrics.overdueTasksList.length}</span>}
          </h3>
          
          {metrics.overdueTasksList.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-900">¡Todo al día!</p>
              <p className="text-xs text-gray-500 mt-1">No hay tareas atrasadas en el proyecto.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.overdueTasksList.map((task: any) => (
                <div key={task.id} className="flex items-start justify-between p-3 bg-red-50/50 border border-red-100 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{task.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-red-600 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Venció el {format(new Date(task.dueDate), "d MMM yyyy", { locale: es })}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 rounded text-gray-500 border border-gray-200">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}