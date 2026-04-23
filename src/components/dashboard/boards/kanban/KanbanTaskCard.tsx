import { GripHorizontal, Edit2, Trash2, Calendar, User as UserIcon, AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

export const PriorityBadge = ({ priority }: { priority: string }) => {
  const p = priority || 'MEDIUM';
  if (p === 'URGENT') return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-900/50"><AlertCircle className="w-2.5 h-2.5" /> Urgente</span>;
  if (p === 'HIGH') return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50"><ArrowUp className="w-2.5 h-2.5" /> Alta</span>;
  if (p === 'LOW') return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-secondary text-text-secondary border border-border-secondary"><ArrowDown className="w-2.5 h-2.5" /> Baja</span>;
  return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"><Minus className="w-2.5 h-2.5" /> Media</span>;
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
  const assigneeMember = members.find(m => m.user.id === task.assigneeId);

  return (
    <div
      draggable={canManageTasks}
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`group bg-surface-primary p-4 rounded-xl border border-l-[4px] shadow-sm transition-all duration-200 relative ${isDragging ? 'opacity-50 scale-95 shadow-none' : 'border-border-secondary hover:shadow-lg hover:-translate-y-1 cursor-grab active:cursor-grabbing'} ${PRIORITY_BORDER[task.priority] || PRIORITY_BORDER.MEDIUM}`}
    >
      <div className="absolute top-0 inset-x-0 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <GripHorizontal className="w-4 h-4 text-border-primary" />
      </div>
      
      {canManageTasks && !isDragging && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-surface-primary shadow-sm border border-border-secondary rounded-md overflow-hidden">
          <button onClick={() => onEdit(task)} className="p-1.5 text-text-muted hover:text-brand hover:bg-brand/5" title="Editar">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50" title="Eliminar">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mb-3 pr-12 mt-2">
        <PriorityBadge priority={task.priority} />
        {task.tags?.map((tag: string) => (
          <span key={tag} className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-page text-text-secondary border border-border-secondary">
            {tag}
          </span>
        ))}
      </div>

      <h4 className="text-sm font-semibold text-text-primary mb-3">{task.title}</h4>

      <div className="flex items-center justify-between mt-auto pt-4 relative border-t border-border-primary/50">
        {task.dueDate ? (
          <div title={task.startDate ? `Inicio: ${format(new Date(task.startDate), "d MMM", { locale: es })}` : 'Vencimiento'} className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-surface-secondary px-2 py-1 rounded-md border border-border-primary">
            <Calendar className="w-3.5 h-3.5 text-brand" />
            {task.startDate
              ? `${format(new Date(task.startDate), "d MMM", { locale: es })} → ${format(new Date(task.dueDate), "d MMM", { locale: es })}`
              : format(new Date(task.dueDate), "d MMM", { locale: es })
            }
          </div>
        ) : task.startDate ? (
          <div title="Fecha de inicio" className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-surface-secondary px-2 py-1 rounded-md border border-border-primary">
            <Calendar className="w-3.5 h-3.5 text-brand" />
            Inicio: {format(new Date(task.startDate), "d MMM", { locale: es })}
          </div>
        ) : <div />}

        {assigneeMember ? (
          <div className="flex items-center gap-2" title={`Asignado a: ${assigneeMember.user.name}`}>
            {assigneeMember.user.avatarUrl ? (
              <img src={assigneeMember.user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-surface-primary shadow-sm" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold ring-2 ring-surface-primary shadow-sm">
                {assigneeMember.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-surface-secondary border border-dashed border-border-primary flex items-center justify-center ring-2 ring-surface-primary" title="Sin asignar">
            <UserIcon className="w-3 h-3 text-text-muted" />
          </div>
        )}
      </div>
    </div>
  );
}