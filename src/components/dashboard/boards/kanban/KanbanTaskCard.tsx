import { GripHorizontal, Edit2, Trash2, Calendar, User as UserIcon, AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS, pt } from 'date-fns/locale';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/hooks/useLocale';

export const PriorityBadge = ({ priority }: { priority: string }) => {
  const { tDynamic } = useT();
  const p = priority || 'MEDIUM';
  if (p === 'URGENT') return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-900/50"><AlertCircle className="w-2.5 h-2.5" /> {tDynamic('kanbanCard.priorityUrgent')}</span>;
  if (p === 'HIGH') return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50"><ArrowUp className="w-2.5 h-2.5" /> {tDynamic('kanbanCard.priorityHigh')}</span>;
  if (p === 'LOW') return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-secondary text-text-secondary border border-border-secondary"><ArrowDown className="w-2.5 h-2.5" /> {tDynamic('kanbanCard.priorityLow')}</span>;
  return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"><Minus className="w-2.5 h-2.5" /> {tDynamic('kanbanCard.priorityMedium')}</span>;
};

export const PRIORITY_BORDER: Record<string, string> = {
  URGENT: 'border-l-red-500', HIGH: 'border-l-orange-500',
  MEDIUM: 'border-l-blue-500', LOW: 'border-l-gray-400'
};

interface KanbanTaskCardProps {
  task: any;
  members: any[];
  canManageTasks: boolean;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
}

export default function KanbanTaskCard({ task, members, canManageTasks, isDragging, onDragStart, onDragEnd, onEdit, onDelete }: KanbanTaskCardProps) {
  const { t } = useT();
  const { locale } = useLocale();
  const dateLocale = locale === 'en' ? enUS : locale === 'pt' ? pt : es;
  const assigneeMember = members.find(m => m.user.id === task.assigneeId);
  
  const visibleTags = task.tags?.slice(0, 3) || [];
  const extraTagsCount = task.tags?.length > 3 ? task.tags.length - 3 : 0;

  return (
    <div
      draggable={canManageTasks}
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`group bg-surface-primary p-4 rounded-xl border border-l-[4px] shadow-sm transition-all duration-200 relative ${isDragging ? 'opacity-50 scale-95 shadow-none' : 'border-border-secondary hover:shadow-md cursor-grab active:cursor-grabbing'} ${PRIORITY_BORDER[task.priority] || PRIORITY_BORDER.MEDIUM}`}
    >
      <div className="absolute top-0 inset-x-0 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <GripHorizontal className="w-4 h-4 text-border-primary" />
      </div>
      
      {canManageTasks && !isDragging && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-surface-primary shadow-sm border border-border-secondary rounded-md overflow-hidden z-10">
          <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="p-1.5 text-text-muted hover:text-brand hover:bg-brand/5" title={t('kanban.edit')}>
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50" title={t('kanban.delete')}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div 
        className="mt-2 cursor-pointer" 
        onClick={() => onEdit(task)}
        title={t('kanbanCard.clickDetails')}
      >
        <div className="flex flex-wrap items-center gap-1.5 mb-3 pr-12">
          <PriorityBadge priority={task.priority} />
          
          {visibleTags.map((tag: string) => (
            <span key={tag} className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20">
              {tag}
            </span>
          ))}
          
          {extraTagsCount > 0 && (
            <span className="text-[10px] font-bold text-text-muted px-1.5 py-0.5 rounded-md bg-surface-secondary border border-border-secondary">
              +{extraTagsCount}
            </span>
          )}
        </div>

        <h4 className="text-sm font-semibold text-text-primary mb-3 hover:text-brand transition-colors">
          {task.title}
        </h4>
      </div>

      {/* Footer de la tarjeta con Fechas y Asignado */}
      <div className="flex items-center justify-between mt-auto pt-4 relative border-t border-border-primary/50">
        {task.dueDate ? (
          <div title={task.startDate ? `${t('kanbanCard.startDate')} ${format(new Date(task.startDate), "d MMM", { locale: dateLocale })}` : t('kanbanCard.dueDate')} className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-surface-secondary px-2 py-1 rounded-md border border-border-primary cursor-help">
            <Calendar className="w-3.5 h-3.5 text-brand" />
            {task.startDate
              ? `${format(new Date(task.startDate), "d MMM", { locale: dateLocale })} → ${format(new Date(task.dueDate), "d MMM", { locale: dateLocale })}`
              : format(new Date(task.dueDate), "d MMM", { locale: dateLocale })
            }
          </div>
        ) : task.startDate ? (
          <div title={t('kanbanCard.startDate')} className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-surface-secondary px-2 py-1 rounded-md border border-border-primary cursor-help">
            <Calendar className="w-3.5 h-3.5 text-brand" />
            {t('kanbanCard.startDate')} {format(new Date(task.startDate), "d MMM", { locale: dateLocale })}
          </div>
        ) : <div />}

        {assigneeMember ? (
          <div className="flex items-center gap-2 cursor-help" title={`${t('kanbanCard.assignedTo')} ${assigneeMember.user.name}`}>
            {assigneeMember.user.avatarUrl ? (
              <img src={assigneeMember.user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-surface-primary shadow-sm" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold ring-2 ring-surface-primary shadow-sm">
                {assigneeMember.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-surface-secondary border border-dashed border-border-primary flex items-center justify-center ring-2 ring-surface-primary cursor-help" title={t('kanbanCard.notAssigned')}>
            <UserIcon className="w-3 h-3 text-text-muted" />
          </div>
        )}
      </div>
    </div>
  );
}