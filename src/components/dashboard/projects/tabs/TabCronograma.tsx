'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { Loader2, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import { format, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { GET_SPRINTS_BY_PROJECT } from '@/graphql/sprints/operations';
import { GET_TASKS_BY_PROJECT } from '@/graphql/tasks/operations';

interface TabCronogramaProps {
  projectId: string;
  members: any[];
  userRole: string | null;
}

export default function TabCronograma({ projectId, members, userRole }: TabCronogramaProps) {
  const [sprints, setSprints] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [sprintsRes, tasksRes] = await Promise.all([
          fetchGraphQL({ query: GET_SPRINTS_BY_PROJECT, variables: { projectId } }),
          fetchGraphQL({ query: GET_TASKS_BY_PROJECT, variables: { projectId } })
        ]);
        
        if (sprintsRes?.sprintsByProject) {
          setSprints(sprintsRes.sprintsByProject);
          setExpandedSprints(new Set(sprintsRes.sprintsByProject.map((s: any) => s.id)));
        }
        if (tasksRes?.tasksByProject) setTasks(tasksRes.tasksByProject);
      } catch (error) {
        console.error("Error cargando datos del cronograma:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [projectId]);

  const toggleSprint = (sprintId: string) => {
    setExpandedSprints(prev => {
      const next = new Set(prev);
      if (next.has(sprintId)) next.delete(sprintId);
      else next.add(sprintId);
      return next;
    });
  };

  const { processedSprints, minDate, maxDate, totalDays } = useMemo(() => {
    if (sprints.length === 0) return { processedSprints: [], minDate: new Date(), maxDate: new Date(), totalDays: 0 };

    let globalMin = new Date(3000, 0, 1);
    let globalMax = new Date(1970, 0, 1);

    const processed = sprints.map(sprint => {
      const start = new Date(sprint.startDate);
      const end = new Date(sprint.endDate);
      
      if (isBefore(start, globalMin)) globalMin = start;
      if (isAfter(end, globalMax)) globalMax = end;

      const sprintTasks = tasks
        .filter(t => t.sprintId === sprint.id && t.createdAt)
        .map(t => {
          const tStart = new Date(t.createdAt);
          const tEnd = t.dueDate ? new Date(t.dueDate) : addDays(tStart, 1);
          
          if (isBefore(tStart, globalMin)) globalMin = tStart;
          if (isAfter(tEnd, globalMax)) globalMax = tEnd;

          return { ...t, parsedStart: tStart, parsedEnd: tEnd };
        })
        .sort((a, b) => a.parsedStart.getTime() - b.parsedStart.getTime());

      return { ...sprint, parsedStart: start, parsedEnd: end, tasks: sprintTasks };
    });

    globalMin = addDays(globalMin, -3);
    globalMax = addDays(globalMax, 3);
    const days = differenceInDays(globalMax, globalMin) + 1;

    return { processedSprints: processed, minDate: globalMin, maxDate: globalMax, totalDays: days > 0 ? days : 30 };
  }, [sprints, tasks]);

  const dayColumns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < totalDays; i++) cols.push(addDays(minDate, i));
    return cols;
  }, [minDate, totalDays]);

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>;
  if (sprints.length === 0) return <div className="p-8 text-center text-text-muted bg-surface-primary rounded-xl border border-border-primary flex flex-col items-center gap-3"><Calendar className="w-8 h-8 opacity-50" /><p>No hay Sprints configurados en este proyecto.</p></div>;

  const DAY_WIDTH = 40;

  return (
    <div className="bg-surface-primary rounded-xl border border-border-primary overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 border-b border-border-primary bg-surface-secondary/30">
        <h3 className="text-lg font-bold text-text-primary">Cronograma de Sprints</h3>
        <p className="text-sm text-text-muted">Visualización del flujo de iteraciones y tareas asociadas.</p>
      </div>

      <div className="overflow-x-auto custom-scrollbar relative bg-surface-page">
        {/* Cabecera (Días) */}
        <div className="flex border-b border-border-primary bg-surface-secondary/80 sticky top-0 z-20" style={{ width: `${totalDays * DAY_WIDTH + 300}px` }}>
          <div className="w-[300px] shrink-0 p-3 font-bold text-text-secondary text-sm border-r border-border-primary sticky left-0 bg-surface-secondary shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
            Iteración / Tarea
          </div>
          <div className="flex">
            {dayColumns.map(date => (
              <div key={date.toISOString()} className="flex flex-col items-center justify-center border-r border-border-secondary/50 shrink-0" style={{ width: `${DAY_WIDTH}px` }}>
                <span className="text-[10px] font-medium text-text-muted">{format(date, "EE", { locale: es })}</span>
                <span className="text-xs font-bold text-text-primary">{format(date, "d")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filas */}
        <div className="flex flex-col relative pb-8" style={{ width: `${totalDays * DAY_WIDTH + 300}px` }}>
          {/* Líneas de fondo */}
          <div className="absolute top-0 bottom-0 left-[300px] flex pointer-events-none">
            {dayColumns.map((_, i) => (
              <div key={i} className="border-r border-border-secondary/30 shrink-0 h-full" style={{ width: `${DAY_WIDTH}px` }} />
            ))}
          </div>

          {processedSprints.map(sprint => {
            const isExpanded = expandedSprints.has(sprint.id);
            const sprintStartOffset = differenceInDays(sprint.parsedStart, minDate) * DAY_WIDTH;
            const sprintWidth = (differenceInDays(sprint.parsedEnd, sprint.parsedStart) || 1) * DAY_WIDTH;

            return (
              <div key={sprint.id} className="flex flex-col border-b border-border-secondary/50">
                {/* Fila del SPRINT */}
                <div className="flex group bg-surface-primary hover:bg-surface-secondary/30 transition-colors z-10 sticky left-0">
                  <div 
                    className="w-[300px] shrink-0 p-2 border-r border-border-primary flex items-center gap-2 cursor-pointer sticky left-0 bg-surface-primary group-hover:bg-surface-secondary/50 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.02)]"
                    onClick={() => toggleSprint(sprint.id)}
                  >
                    <button className="p-1 hover:bg-border-secondary rounded text-text-muted">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-text-primary truncate">{sprint.name}</span>
                      <span className="text-[10px] text-text-muted uppercase font-semibold">{sprint.status}</span>
                    </div>
                  </div>
                  
                  {/* Barra del Sprint */}
                  <div className="relative py-2 flex items-center" style={{ width: `${totalDays * DAY_WIDTH}px` }}>
                    <div 
                      className="absolute h-4 rounded-full bg-brand/20 border border-brand/40"
                      style={{ left: `${sprintStartOffset}px`, width: `${sprintWidth}px` }}
                      title={`Sprint: ${format(sprint.parsedStart, "d MMM")} - ${format(sprint.parsedEnd, "d MMM")}`}
                    />
                  </div>
                </div>

                {/* Filas de las TAREAS del Sprint */}
                {isExpanded && sprint.tasks.map((task: any) => {
                  const taskStartOffset = differenceInDays(task.parsedStart, minDate) * DAY_WIDTH;
                  const taskWidth = (differenceInDays(task.parsedEnd, task.parsedStart) || 1) * DAY_WIDTH;

                  return (
                    <div key={task.id} className="flex group bg-surface-page/50 hover:bg-surface-secondary/30 transition-colors">
                      <div className="w-[300px] shrink-0 p-2 pl-10 border-r border-border-primary flex items-center sticky left-0 bg-surface-page/90 group-hover:bg-surface-secondary/80 z-10 backdrop-blur-sm shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        <span className="text-xs font-medium text-text-secondary truncate cursor-pointer hover:text-brand" title={task.title}>
                          • {task.title}
                        </span>
                      </div>
                      
                      <div className="relative py-1.5 flex items-center" style={{ width: `${totalDays * DAY_WIDTH}px` }}>
                        <div 
                          className="absolute h-5 rounded-md bg-brand shadow-sm flex items-center px-2 text-[10px] text-white font-bold truncate transition-transform hover:scale-[1.02] cursor-pointer"
                          style={{ 
                            left: `${taskStartOffset}px`, 
                            width: `${taskWidth}px`,
                            backgroundColor: task.status === 'DONE' ? '#10b981' : task.status === 'IN_PROGRESS' ? '#f59e0b' : '#3b82f6'
                          }}
                          title={`${task.title}\nEstado: ${task.status}\nFin: ${format(task.parsedEnd, "d MMM")}`}
                          onClick={() => alert(`Implementar llamada a modal para la tarea: ${task.title}`)}
                        >
                          {taskWidth > 50 && task.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isExpanded && sprint.tasks.length === 0 && (
                  <div className="flex bg-surface-page/50 py-2">
                    <div className="w-[300px] shrink-0 pl-10 text-xs text-text-muted italic sticky left-0 bg-surface-page/90 z-10">Sin tareas asociadas</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}