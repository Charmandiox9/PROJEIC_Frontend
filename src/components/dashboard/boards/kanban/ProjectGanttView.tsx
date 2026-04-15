import { useMemo } from 'react';
import { format, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface ProjectGanttViewProps {
  tasks: any[];
  onEditTask: (boardId: string | undefined, task: any) => void;
}

export default function ProjectGanttView({ tasks, onEditTask }: ProjectGanttViewProps) {
  const ganttTasks = useMemo(() => {
    return tasks
      .filter(t => t.createdAt)
      .map(t => {
        const start = new Date(t.createdAt);
        const end = t.dueDate ? new Date(t.dueDate) : addDays(start, 1);
        return { ...t, parsedStart: start, parsedEnd: end };
      })
      .sort((a, b) => a.parsedStart.getTime() - b.parsedStart.getTime());
  }, [tasks]);

  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (ganttTasks.length === 0) return { minDate: new Date(), maxDate: new Date(), totalDays: 0 };

    let min = ganttTasks[0].parsedStart;
    let max = ganttTasks[0].parsedEnd;

    ganttTasks.forEach(t => {
      if (isBefore(t.parsedStart, min)) min = t.parsedStart;
      if (isAfter(t.parsedEnd, max)) max = t.parsedEnd;
    });

    min = addDays(min, -3);
    max = addDays(max, 3);
    
    return { minDate: min, maxDate: max, totalDays: differenceInDays(max, min) + 1 };
  }, [ganttTasks]);

  const dayColumns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < totalDays; i++) {
      cols.push(addDays(minDate, i));
    }
    return cols;
  }, [minDate, totalDays]);

  if (ganttTasks.length === 0) {
    return <div className="p-8 text-center text-text-muted bg-surface-primary rounded-xl border border-border-primary">No hay suficientes tareas con fechas para generar el Gantt.</div>;
  }

  const DAY_WIDTH = 40; 

  return (
    <div className="bg-surface-primary rounded-xl border border-border-primary overflow-hidden shadow-sm flex flex-col">
      <div className="overflow-x-auto custom-scrollbar relative">
        
        {/* Cabecera del Gantt (Lista de Días) */}
        <div className="flex border-b border-border-primary bg-surface-secondary/50 sticky top-0 z-10" style={{ width: `${totalDays * DAY_WIDTH + 250}px` }}>
          <div className="w-[250px] shrink-0 p-3 font-bold text-text-secondary text-sm border-r border-border-primary sticky left-0 bg-surface-secondary z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
            Tarea
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

        {/* Filas de Tareas */}
        <div className="flex flex-col relative" style={{ width: `${totalDays * DAY_WIDTH + 250}px` }}>
          {/* Líneas de fondo para la cuadrícula */}
          <div className="absolute top-0 bottom-0 left-[250px] flex pointer-events-none">
            {dayColumns.map((_, i) => (
              <div key={i} className="border-r border-border-secondary/30 shrink-0 h-full" style={{ width: `${DAY_WIDTH}px` }} />
            ))}
          </div>

          {/* Renderizado de Tareas */}
          {ganttTasks.map((task) => {
            const daysFromStart = differenceInDays(task.parsedStart, minDate);
            const duration = differenceInDays(task.parsedEnd, task.parsedStart) || 1;
            
            const leftOffset = daysFromStart * DAY_WIDTH;
            const barWidth = duration * DAY_WIDTH;

            return (
              <div key={task.id} className="flex group hover:bg-surface-secondary/30 transition-colors border-b border-border-secondary/30">
                {/* Nombre de la tarea (Columna Fija) */}
                <div 
                  className="w-[250px] shrink-0 p-3 text-sm font-medium text-text-primary border-r border-border-primary truncate cursor-pointer hover:text-brand sticky left-0 bg-surface-primary group-hover:bg-surface-secondary/50 z-10"
                  onClick={() => onEditTask(task.boardId, task)}
                  title={task.title}
                >
                  {task.title}
                </div>
                
                {/* Área del Timeline */}
                <div className="relative py-2" style={{ width: `${totalDays * DAY_WIDTH}px` }}>
                  <div 
                    onClick={() => onEditTask(task.boardId, task)}
                    className="absolute h-6 rounded-md bg-brand shadow-sm cursor-pointer flex items-center px-2 text-[10px] text-white font-bold truncate transition-transform hover:scale-[1.02] hover:brightness-110 active:scale-95"
                    style={{ 
                      left: `${leftOffset}px`, 
                      width: `${barWidth}px`,
                      backgroundColor: task.status === 'DONE' ? '#10b981' : task.status === 'IN_PROGRESS' ? '#f59e0b' : '#3b82f6'
                    }}
                    title={`${task.title}\nInicio: ${format(task.parsedStart, "d MMM")}\nFin: ${format(task.parsedEnd, "d MMM")}`}
                  >
                    {barWidth > 50 && task.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}