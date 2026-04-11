'use client';

import { useState } from 'react';
import { Calendar, CheckCircle2, Flag, Target, ChevronDown, ChevronUp, Loader2, User as UserIcon, CircleDashed } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_TASKS_BY_PROJECT } from '@/graphql/tasks/operations';

interface SprintTimelineProps {
  sprints: any[];
  projectId: string;
  members: any[];
}

const priorityStyles: Record<string, string> = {
  LOW: 'bg-surface-secondary text-text-secondary',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', URGENT: 'Urgente',
};

const statusLabels: Record<string, { text: string; color: string; icon: any }> = {
  BACKLOG: { text: 'Backlog', color: 'bg-surface-secondary text-text-secondary', icon: CircleDashed },
  TODO: { text: 'Por hacer', color: 'bg-slate-100 text-slate-700', icon: CircleDashed },
  IN_PROGRESS: { text: 'En progreso', color: 'bg-blue-100 text-blue-700', icon: CircleDashed },
  IN_REVIEW: { text: 'En revisión', color: 'bg-purple-100 text-purple-700', icon: CircleDashed },
  DONE: { text: 'Completado', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  CANCELLED: { text: 'Cancelado', color: 'bg-red-100 text-red-700', icon: CircleDashed },
};

export default function SprintTimeline({ sprints, projectId, members }: SprintTimelineProps) {
  const [expandedSprintId, setExpandedSprintId] = useState<string | null>(null);
  const [tasksCache, setTasksCache] = useState<Record<string, any[]>>({});
  const [isLoadingTasks, setIsLoadingTasks] = useState<string | null>(null);

  const completedSprints = sprints
    .filter(s => s.status === 'COMPLETED')
    .sort((a, b) => new Date(b.endDate || b.updatedAt).getTime() - new Date(a.endDate || a.updatedAt).getTime());

  const handleToggleSprint = async (sprintId: string) => {
    if (expandedSprintId === sprintId) {
      setExpandedSprintId(null);
      return;
    }

    setExpandedSprintId(sprintId);

    if (tasksCache[sprintId]) return;

    setIsLoadingTasks(sprintId);
    try {
      const res = await fetchGraphQL({
        query: GET_TASKS_BY_PROJECT,
        variables: { projectId, sprintId }
      });

      setTasksCache(prev => ({
        ...prev,
        [sprintId]: res.tasksByProject || []
      }));
    } catch (error) {
      console.error("Error cargando tareas del sprint:", error);
    } finally {
      setIsLoadingTasks(null);
    }
  };

  if (completedSprints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-primary dark:bg-surface-primary rounded-xl border border-border-primary dark:border-border-primary shadow-sm animate-in fade-in">
        <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mb-4">
          <Flag className="w-8 h-8 text-text-secondary" />
        </div>
        <h3 className="text-lg font-bold text-text-primary dark:text-gray-200">No hay historial todavía</h3>
        <p className="text-sm text-text-muted mt-1 max-w-sm">
          Los Sprints que el equipo vaya finalizando aparecerán aquí como un cronograma histórico.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary dark:bg-surface-primary p-6 md:p-8 rounded-xl border border-border-primary dark:border-border-primary shadow-sm animate-in fade-in">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-text-primary dark:text-text-primary">Cronograma de Sprints</h2>
        <p className="text-sm text-text-muted">Haz clic en un Sprint para ver las tareas que se completaron durante esa iteración.</p>
      </div>

      <div className="relative border-l-2 border-brand/20 ml-3 md:ml-4 space-y-8">
        {completedSprints.map((sprint, index) => {
          const endDate = sprint.endDate || sprint.updatedAt;
          const isExpanded = expandedSprintId === sprint.id;
          const sprintTasks = tasksCache[sprint.id];
          const isFetching = isLoadingTasks === sprint.id;

          return (
            <div key={sprint.id} className="relative pl-8 md:pl-10">
              {/* Punto en la línea de tiempo */}
              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-surface-primary dark:bg-surface-primary border-4 border-brand flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-brand absolute -z-10 opacity-0" />
              </div>

              <div
                className={`border transition-all duration-200 overflow-hidden ${isExpanded ? 'bg-surface-primary dark:bg-surface-primary border-brand shadow-md rounded-xl' : 'bg-surface-secondary/50 dark:bg-surface-secondary/50 border-border-primary dark:border-border-secondary rounded-xl hover:shadow-md hover:border-brand/30 cursor-pointer'}`}
              >
                {/* CABECERA DEL SPRINT */}
                <div
                  className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 cursor-pointer"
                  onClick={() => handleToggleSprint(sprint.id)}
                >
                  <div>
                    <h3 className={`text-base font-bold transition-colors ${isExpanded ? 'text-brand' : 'text-text-primary dark:text-text-primary'}`}>
                      {sprint.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-text-muted">
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Completado
                      </span>
                      {endDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(endDate), "d 'de' MMMM, yyyy", { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {index === 0 && !isExpanded && (
                      <span className="shrink-0 bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                        Última entrega
                      </span>
                    )}
                    <div className="p-1.5 bg-surface-secondary rounded-full text-text-muted">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* ─── CONTENIDO DESPLEGABLE (Tareas del Sprint) ─── */}
                {isExpanded && (
                  <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                    {sprint.goal && (
                      <div className="mb-4 p-3 bg-brand/5 border border-brand/10 rounded-lg">
                        <p className="flex items-start gap-2 text-sm text-brand-dark">
                          <Target className="w-4 h-4 mt-0.5 shrink-0" />
                          <span><span className="font-semibold">Meta alcanzada:</span> {sprint.goal}</span>
                        </p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-border-primary">
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Trabajo realizado</h4>

                      {isFetching ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-brand animate-spin" />
                        </div>
                      ) : sprintTasks && sprintTasks.length > 0 ? (
                        <div className="space-y-2">
                          {sprintTasks.map(task => {
                            const assigneeMember = members.find(m => m.user.id === task.assigneeId);
                            const StatusIcon = statusLabels[task.status]?.icon || CircleDashed;

                            return (
                              <div key={task.id} className="flex items-center justify-between p-3 bg-surface-secondary dark:bg-surface-secondary border border-border-primary dark:border-border-secondary rounded-lg hover:bg-surface-secondary dark:hover:bg-gray-600 transition-colors">
                                <div className="flex flex-col min-w-0 pr-4">
                                  <span className="text-sm font-semibold text-text-primary dark:text-gray-200 truncate">{task.title}</span>
                                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${priorityStyles[task.priority] || priorityStyles.MEDIUM}`}>
                                      {priorityLabels[task.priority] || 'Media'}
                                    </span>

                                    <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${statusLabels[task.status]?.color || 'bg-surface-secondary text-text-secondary'}`}>
                                      <StatusIcon className="w-3 h-3" />
                                      {statusLabels[task.status]?.text || task.status}
                                    </span>

                                    {task.dueDate && (
                                      <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted bg-surface-primary border border-border-primary px-1.5 py-0.5 rounded shadow-sm">
                                        <Calendar className="w-3 h-3 text-text-muted" />
                                        {format(new Date(task.dueDate), "d MMM yyyy", { locale: es })}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0">
                                  {assigneeMember ? (
                                    <div className="w-7 h-7 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shadow-sm" title={assigneeMember.user.name}>
                                      {assigneeMember.user.avatarUrl ? (
                                        <img src={assigneeMember.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        <span className="text-xs font-bold text-brand">
                                          {assigneeMember.user.name.charAt(0).toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="w-7 h-7 rounded-full border border-dashed border-border-secondary dark:border-gray-500 flex items-center justify-center bg-surface-primary dark:bg-surface-primary" title="Sin asignar">
                                      <UserIcon className="w-3.5 h-3.5 text-text-muted" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-sm text-text-muted border border-dashed border-border-primary rounded-lg">
                          No se encontraron tareas registradas en este sprint.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}