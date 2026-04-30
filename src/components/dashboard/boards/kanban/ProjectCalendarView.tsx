import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isToday, isBefore } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useT } from '@/hooks/useT';

interface ProjectCalendarViewProps {
  tasks: any[];
  onEditTask: (boardId: string | undefined, task: any) => void;
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'DONE') return <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
  if (status === 'IN_PROGRESS' || status === 'IN_REVIEW') return <Clock className="w-3 h-3 text-amber-600" />;
  return <div className="w-2 h-2 rounded-full bg-gray-400 mx-0.5" />;
};

export default function ProjectCalendarView({ tasks, onEditTask }: ProjectCalendarViewProps) {
  const { t, locale } = useT();
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateLocale = locale === 'es' ? es : enUS;

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, "d");
      const cloneDay = day;
      
      const dayTasks = tasks.filter(task => 
        task.dueDate && isSameDay(new Date(task.dueDate), cloneDay)
      );

      days.push(
        <div
          key={day.toString()}
          className={`min-h-[120px] p-2 border-b border-r border-border-secondary transition-colors ${
            !isSameMonth(day, monthStart)
              ? "bg-surface-secondary/40 text-text-muted"
              : isToday(day) 
              ? "bg-brand/5 text-brand font-semibold" 
              : "bg-surface-primary text-text-primary hover:bg-surface-secondary/20"
          }`}
        >
          <div className="flex justify-end mb-1">
            <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-brand text-white shadow-sm' : ''}`}>
              {formattedDate}
            </span>
          </div>
          
          <div className="flex flex-col gap-1.5 custom-scrollbar overflow-y-auto max-h-[100px] pr-1">
            {dayTasks.map(task => {
              const isOverdue = isBefore(new Date(task.dueDate), new Date()) && task.status !== 'DONE' && !isToday(new Date(task.dueDate));
              
              return (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task.boardId, task)}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md cursor-pointer transition-transform hover:scale-[1.02] border shadow-sm ${
                    isOverdue 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : task.status === 'DONE'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 opacity-70'
                      : 'bg-white border-border-secondary text-text-secondary'
                  }`}
                  title={`${task.title} (${task.status})`}
                >
                  <StatusIcon status={task.status} />
                  <span className="truncate font-medium flex-1">
                    {isOverdue && <AlertCircle className="w-3 h-3 inline mr-1 text-red-500" />}
                    {task.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
    days = [];
  }

  return (
    <div className="bg-surface-primary rounded-xl border border-border-primary overflow-hidden shadow-sm flex flex-col h-full min-h-[700px]">
      {/* Header del Calendario */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-border-primary bg-surface-secondary/50 gap-4">
        <h2 className="text-xl font-bold text-text-primary capitalize flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-brand" />
          {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
        </h2>
        <div className="flex items-center gap-3">
          {/* Leyenda rápida */}
          <div className="hidden sm:flex items-center gap-3 mr-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> {t('kanban.inProgress')}</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {t('kanban.doneStatus')}</span>
            <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-red-500" /> {t('kanban.overdue')}</span>
          </div>

          <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium text-text-secondary bg-surface-primary border border-border-secondary rounded-lg hover:text-brand hover:border-brand/30 transition-all shadow-sm">
            {t('kanban.today')}
          </button>
          <div className="flex items-center border border-border-secondary rounded-lg overflow-hidden bg-surface-primary shadow-sm">
            <button onClick={prevMonth} className="p-1.5 hover:bg-surface-tertiary text-text-secondary transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <div className="w-px h-5 bg-border-secondary" />
            <button onClick={nextMonth} className="p-1.5 hover:bg-surface-tertiary text-text-secondary transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 bg-surface-primary border-b border-border-primary shadow-sm z-10">
        {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
          <div key={dayIndex} className="py-3 text-center text-[11px] font-extrabold text-text-muted uppercase tracking-wider border-r border-border-secondary last:border-0">
            {format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), dayIndex), "EEEE", { locale: dateLocale })}
          </div>
        ))}
      </div>

      {/* Cuadrícula */}
      <div className="flex-1 overflow-y-auto bg-surface-secondary/10">
        {rows}
      </div>
    </div>
  );
}