'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { Loader2, ChevronRight, ChevronDown, Calendar, Download } from 'lucide-react';
import { format, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';
import { es, enUS, pt } from 'date-fns/locale';
import { GET_SPRINTS_BY_PROJECT } from '@/graphql/sprints/operations';
import { GET_TASKS_BY_PROJECT } from '@/graphql/tasks/operations';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/hooks/useLocale';

interface TabCronogramaProps {
  projectId: string;
  members: any[];
  userRole: string | null;
}

export default function TabCronograma({ projectId, members, userRole }: TabCronogramaProps) {
  const { t } = useT();
  const { locale } = useLocale();
  const dateLocale = locale === 'en' ? enUS : locale === 'pt' ? pt : es;
  const dateFormatLong = locale === 'en' ? "MMMM d" : "d 'de' MMMM";
  const [sprints, setSprints] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();

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
      link.download = `Cronograma-Projeic.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exportando Cronograma:', err);
    } finally {
      setIsExporting(false);
    }
  };
  
  const isTodayColumn = (date: Date) => {
    return date.getFullYear() === today.getFullYear() && 
           date.getMonth() === today.getMonth() && 
           date.getDate() === today.getDate();
  };

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

    const parseSafeDate = (val: any) => {
      if (!val) return new Date();
      if (typeof val === 'string' && /^\d+$/.test(val)) return new Date(Number(val));
      const d = new Date(val);
      return isNaN(d.getTime()) ? new Date() : d;
    };

    const processed = sprints.map(sprint => {
      const start = parseSafeDate(sprint.startDate);
      const end = parseSafeDate(sprint.endDate);
      
      if (isBefore(start, globalMin)) globalMin = start;
      if (isAfter(end, globalMax)) globalMax = end;

      const sprintTasks = tasks
        .filter(t => t.sprintId === sprint.id && t.createdAt)
        .map(t => {
          const tStart = parseSafeDate(t.startDate || t.createdAt || sprint.startDate);
          const tEnd = t.dueDate ? parseSafeDate(t.dueDate) : addDays(tStart, 1);
          
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

  useEffect(() => {
    if (isLoading || sprints.length === 0 || !scrollRef.current || dayColumns.length === 0) return;
    
    let targetDate = today;
    if (isBefore(today, minDate)) targetDate = minDate;
    if (isAfter(today, maxDate)) targetDate = maxDate;

    const offsetDays = differenceInDays(targetDate, minDate);
    const containerWidth = scrollRef.current.clientWidth;
    const DAY_WIDTH = 40;
    const scrollLeft = Math.max(0, offsetDays * DAY_WIDTH - (containerWidth / 2) + 300 + (DAY_WIDTH / 2));
    
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }, 100);
  }, [isLoading, sprints.length, minDate, maxDate, dayColumns.length]);

  const renderOutOfRangeMessage = () => {
    const todayStr = format(today, dateFormatLong, { locale: dateLocale });
    
    if (isBefore(today, minDate)) {
      const diff = differenceInDays(minDate, today);
      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl text-sm font-medium border border-blue-200 dark:border-blue-800/30 mb-4 flex items-center gap-2 animate-in fade-in">
          <Calendar className="w-4 h-4" />
          <span>{t('kanban.todayIs')} {todayStr}. {t('kanban.projectStartsIn')} {diff} {diff === 1 ? t('kanban.day') : t('kanban.days')}.</span>
        </div>
      );
    }
    if (isAfter(today, maxDate)) {
      const diff = differenceInDays(today, maxDate);
      return (
        <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-4 py-3 rounded-xl text-sm font-medium border border-orange-200 dark:border-orange-800/30 mb-4 flex items-center gap-2 animate-in fade-in">
          <Calendar className="w-4 h-4" />
          <span>{t('kanban.todayIs')} {todayStr}. {t('kanban.projectEndedAgo')} {diff} {diff === 1 ? t('kanban.day') : t('kanban.days')} {t('kanban.ago')}</span>
        </div>
      );
    }
    return null;
  };

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>;
  if (sprints.length === 0) return <div className="p-8 text-center text-text-muted bg-surface-primary rounded-xl border border-border-primary flex flex-col items-center gap-3"><Calendar className="w-8 h-8 opacity-50" /><p>{t('tabCronograma.noSprints')}</p></div>;

  const DAY_WIDTH = 40;

  return (
    <div className="bg-surface-primary rounded-xl border border-border-primary overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 border-b border-border-primary bg-surface-secondary/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-text-primary">{t('tabCronograma.title')}</h3>
          <p className="text-sm text-text-muted mb-4 sm:mb-0">{t('tabCronograma.subtitle')}</p>
        </div>
        <button
          onClick={exportAsImage}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? 'Exportando...' : 'Exportar a Imagen'}
        </button>
      </div>
      <div className="px-4">
        {renderOutOfRangeMessage()}
      </div>

      <div className="overflow-x-auto custom-scrollbar relative bg-surface-page" ref={scrollRef}>
        {/* Cabecera (Meses y Días) */}
        <div className="flex flex-col border-b border-border-primary bg-surface-secondary/80 sticky top-0 z-20" style={{ width: `${totalDays * DAY_WIDTH + 300}px` }}>
          <div className="flex">
            <div className="w-[300px] shrink-0 p-3 font-bold text-text-secondary text-sm border-r border-b border-border-primary sticky left-0 bg-surface-secondary shadow-[2px_0_5px_rgba(0,0,0,0.05)] flex items-center">
              {t('tabCronograma.columnHeader')}
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
            <div className="w-[300px] shrink-0 border-r border-border-primary sticky left-0 bg-surface-secondary shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
            </div>
            <div className="flex">
              {dayColumns.map(date => (
                <div key={date.toISOString()} className={`flex flex-col items-center justify-center border-r shrink-0 py-1 transition-colors ${isTodayColumn(date) ? 'bg-brand/10 border-brand/30' : 'border-border-secondary/50'}`} style={{ width: `${DAY_WIDTH}px` }}>
                  <span className={`text-[10px] capitalize ${isTodayColumn(date) ? 'text-brand font-bold' : 'text-text-muted font-medium'}`}>{format(date, "EE", { locale: dateLocale })}</span>
                  <span className={`text-xs font-bold ${isTodayColumn(date) ? 'text-brand' : 'text-text-primary'}`}>{format(date, "d")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filas */}
        <div className="flex flex-col relative pb-8" style={{ width: `${totalDays * DAY_WIDTH + 300}px` }}>
          {/* Líneas de fondo */}
          <div className="absolute top-0 bottom-0 left-[300px] flex pointer-events-none">
            {dayColumns.map((date, i) => (
              <div key={i} className={`border-r shrink-0 h-full transition-colors ${isTodayColumn(date) ? 'bg-brand/5 border-brand/20' : 'border-border-secondary/30'}`} style={{ width: `${DAY_WIDTH}px` }} />
            ))}
          </div>

          {processedSprints.map(sprint => {
            const isExpanded = expandedSprints.has(sprint.id);
            const sprintStartOffset = differenceInDays(sprint.parsedStart, minDate) * DAY_WIDTH;
            const sprintWidth = Math.max(1, differenceInDays(sprint.parsedEnd, sprint.parsedStart) + 1) * DAY_WIDTH;

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
                      title={`Sprint: ${format(sprint.parsedStart, "d MMM", { locale: dateLocale })} - ${format(sprint.parsedEnd, "d MMM", { locale: dateLocale })}`}
                    />
                  </div>
                </div>

                {/* Filas de las TAREAS del Sprint */}
                {isExpanded && sprint.tasks.map((task: any) => {
                  const taskStartOffset = differenceInDays(task.parsedStart, minDate) * DAY_WIDTH;
                  const taskWidth = Math.max(1, differenceInDays(task.parsedEnd, task.parsedStart) + 1) * DAY_WIDTH;

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
                          title={`${task.title}\n${t('kanban.columnStatus')}: ${task.status}\n${t('kanban.endLabel')} ${format(task.parsedEnd, "d MMM", { locale: dateLocale })}`}
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
                    <div className="w-[300px] shrink-0 pl-10 text-xs text-text-muted italic sticky left-0 bg-surface-page/90 z-10">{t('tabCronograma.noTasks')}</div>
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
