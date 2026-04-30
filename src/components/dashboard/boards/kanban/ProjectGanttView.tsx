import { useMemo, useState, useRef } from 'react';
import { format, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';
import { es, enUS, pt } from 'date-fns/locale';
import { Loader2, Download, Calendar } from 'lucide-react';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/hooks/useLocale';

interface ProjectGanttViewProps {
  tasks: any[];
  onEditTask: (boardId: string | undefined, task: any) => void;
}

export default function ProjectGanttView({ tasks, onEditTask }: ProjectGanttViewProps) {
  const { t } = useT();
  const { locale } = useLocale();
  const dateLocale = locale === 'en' ? enUS : locale === 'pt' ? pt : es;
  const [isExporting, setIsExporting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const exportAsImage = async () => {
    if (!scrollRef.current) return;
    setIsExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      const container = scrollRef.current;
      const contentWidth = container.scrollWidth;
      const contentHeight = container.scrollHeight;

      const dataUrl = await toPng(container, {
        width: contentWidth,
        height: contentHeight,
        quality: 1,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#09090b' : '#ffffff',
        cacheBust: true,
        style: {
          overflow: 'visible',
          width: `${contentWidth}px`,
          height: `${contentHeight}px`,
        }
      });
      
      const link = document.createElement('a');
      link.download = `Gantt-Projeic.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exportando Gantt:', err);
    } finally {
      setIsExporting(false);
    }
  };
  const ganttTasks = useMemo(() => {
    return tasks
      .filter(t => t.createdAt)
      .map(t => {
        const start = t.startDate ? new Date(t.startDate) : new Date(t.createdAt);
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

  const months = useMemo(() => {
    const grouped: { key: string; label: string; days: number }[] = [];
    let currentKey = '';
    for (const date of dayColumns) {
      const key = format(date, 'yyyy-MM');
      if (key !== currentKey) {
        grouped.push({ key, label: format(date, 'MMMM yyyy', { locale: dateLocale }), days: 1 });
        currentKey = key;
      } else {
        grouped[grouped.length - 1].days++;
      }
    }
    return grouped;
  }, [dayColumns, dateLocale]);

  if (ganttTasks.length === 0) {
    return <div className="p-8 text-center text-text-muted bg-surface-primary rounded-xl border border-border-primary">{t('kanban.noTasksForGantt')}</div>;
  }

  const DAY_WIDTH = 40; 

  return (
    <div className="bg-surface-primary rounded-xl border border-border-primary overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 border-b border-border-primary bg-surface-secondary/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Calendar className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">{t('kanban.ganttTitle') || 'Vista de Gantt'}</h3>
            <p className="text-xs text-text-muted">{t('kanban.ganttSubtitle') || 'Cronograma visual de tareas'}</p>
          </div>
        </div>
        <button
          onClick={exportAsImage}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? (t('common.exporting') || 'Exportando...') : (t('common.exportImage') || 'Exportar a Imagen')}
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar relative" ref={scrollRef}>
        
        {/* Cabecera del Gantt (Meses y Días) */}
        <div className="flex flex-col border-b border-border-primary bg-surface-secondary/80 sticky top-0 z-20" style={{ width: `${totalDays * DAY_WIDTH + 250}px` }}>
          <div className="flex">
            <div className="w-[250px] shrink-0 p-3 font-bold text-text-secondary text-sm border-r border-b border-border-primary sticky left-0 bg-surface-secondary shadow-[2px_0_5px_rgba(0,0,0,0.05)] flex items-center">
              {t('kanban.taskLabel')}
            </div>
            <div className="flex border-b border-border-primary w-full">
              {months.map(m => (
                <div key={m.key} className="flex items-center justify-center border-r border-border-primary/50 text-xs font-bold text-text-secondary capitalize tracking-wider bg-surface-secondary/50 py-1.5" style={{ width: `${m.days * DAY_WIDTH}px` }}>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
          <div className="flex">
            <div className="w-[250px] shrink-0 border-r border-border-primary sticky left-0 bg-surface-secondary shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
            </div>
            <div className="flex">
              {dayColumns.map(date => {
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div key={date.toISOString()} className={`flex flex-col items-center justify-center border-r shrink-0 py-1 transition-colors ${isToday ? 'bg-brand/10 border-brand/30' : 'border-border-secondary/50'}`} style={{ width: `${DAY_WIDTH}px` }}>
                    <span className={`text-[10px] capitalize ${isToday ? 'text-brand font-bold' : 'text-text-muted font-medium'}`}>{format(date, "EE", { locale: dateLocale })}</span>
                    <span className={`text-xs font-bold ${isToday ? 'text-brand' : 'text-text-primary'}`}>{format(date, "d")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filas de Tareas */}
        <div className="flex flex-col relative pb-8" style={{ width: `${totalDays * DAY_WIDTH + 250}px` }}>
          {/* Líneas de fondo para la cuadrícula */}
          <div className="absolute top-0 bottom-0 left-[250px] flex pointer-events-none">
            {dayColumns.map((date, i) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`border-r shrink-0 h-full transition-colors ${isToday ? 'bg-brand/5 border-brand/20' : 'border-border-secondary/30'}`} style={{ width: `${DAY_WIDTH}px` }} />
              );
            })}
          </div>

          {/* Renderizado de Tareas */}
          {ganttTasks.map((task) => {
            const daysFromStart = differenceInDays(task.parsedStart, minDate);
            const duration = Math.max(1, differenceInDays(task.parsedEnd, task.parsedStart) + 1);
            
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
                    title={`${task.title}\n${t('kanban.startLabel')} ${format(task.parsedStart, "d MMM", { locale: dateLocale })}\n${t('kanban.endLabel')} ${format(task.parsedEnd, "d MMM", { locale: dateLocale })}`}
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