import { ArrowUpDown, Edit2, Trash2, Calendar, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS, pt } from 'date-fns/locale';
import { PriorityBadge } from './KanbanTaskCard';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/hooks/useLocale';

interface KanbanListViewProps {
  tasks: any[];
  members: any[];
  activeBoards: any[];
  canManageTasks: boolean;
  onSort: (key: string) => void;
  onEdit: (boardId: string | undefined, task: any) => void;
  onDelete: (taskId: string) => void;
}

export default function KanbanListView({ tasks, members, activeBoards, canManageTasks, onSort, onEdit, onDelete }: KanbanListViewProps) {
  const { t } = useT();
  const { locale } = useLocale();
  const dateLocale = locale === 'en' ? enUS : locale === 'pt' ? pt : es;
  return (
    <div className="bg-surface-primary rounded-xl border border-border-primary overflow-x-auto shadow-sm">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-surface-secondary border-b border-border-primary text-text-secondary select-none">
          <tr>
            <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-surface-tertiary transition-colors" onClick={() => onSort('title')}>
              <div className="flex items-center gap-2">{t('kanban.titleHeader')} <ArrowUpDown className="w-3 h-3 text-text-muted" /></div>
            </th>
            <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-surface-tertiary transition-colors" onClick={() => onSort('status')}>
              <div className="flex items-center gap-2">{t('kanban.columnStatus')} <ArrowUpDown className="w-3 h-3 text-text-muted" /></div>
            </th>
            <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-surface-tertiary transition-colors" onClick={() => onSort('priority')}>
              <div className="flex items-center gap-2">{t('kanban.priority')} <ArrowUpDown className="w-3 h-3 text-text-muted" /></div>
            </th>
            <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-surface-tertiary transition-colors" onClick={() => onSort('assignee')}>
              <div className="flex items-center gap-2">{t('kanban.assignee')} <ArrowUpDown className="w-3 h-3 text-text-muted" /></div>
            </th>
            <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-surface-tertiary transition-colors" onClick={() => onSort('dueDate')}>
              <div className="flex items-center gap-2">{t('kanban.dueDate')} <ArrowUpDown className="w-3 h-3 text-text-muted" /></div>
            </th>
            <th className="px-4 py-3 font-semibold text-right">{t('kanban.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-secondary">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-text-muted">{t('kanban.noTasksFound')}</td>
            </tr>
          ) : (
            tasks.map(task => {
              const assigneeMember = members.find(m => m.user.id === task.assigneeId);
              const matchedBoard = activeBoards.find(b => b.id === task.boardId) || activeBoards.find(b => {
                if (b.id.startsWith('fake-')) {
                  const statusMap: Record<string, string> = { 'fake-backlog': 'BACKLOG', 'fake-todo': 'TODO', 'fake-inprogress': 'IN_PROGRESS', 'fake-done': 'DONE' };
                  return task.status === statusMap[b.id] || task.status === b.name.toUpperCase().replace(' ', '_');
                }
                return false;
              });

              const boardColor = matchedBoard?.color || '#9CA3AF';
              const stateName = matchedBoard?.name || task.status;

              return (
                <tr key={task.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="px-4 py-3"><span className="font-semibold text-text-primary">{task.title}</span></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset" style={{ color: boardColor, backgroundColor: `${boardColor}1A`, '--tw-ring-color': `${boardColor}4D` } as any}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: boardColor }}></span>
                      {stateName}
                    </span>
                  </td>
                  <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                  <td className="px-4 py-3">
                    {assigneeMember ? (
                      <div className="flex items-center gap-2" title={`${t('kanban.assignedTo')} ${assigneeMember.user.name}`}>
                        {assigneeMember.user.avatarUrl ? (
                          <img src={assigneeMember.user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-surface-primary shadow-sm shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold ring-2 ring-surface-primary shadow-sm shrink-0">
                            {assigneeMember.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-text-secondary truncate max-w-[150px]">{assigneeMember.user.name}</span>
                      </div>
                    ) : (
                      <span className="text-text-muted italic flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5" /> {t('kanban.unassigned')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {task.dueDate ? (
                      <span className="text-text-secondary font-medium flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-text-muted" />
                        {format(new Date(task.dueDate), locale === 'en' ? "MMM d, yyyy" : "d 'de' MMM, yyyy", { locale: dateLocale })}
                      </span>
                    ) : <span className="text-text-muted">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEdit(matchedBoard?.id, task)} className="p-1.5 text-text-muted hover:text-brand hover:bg-surface-tertiary rounded-md transition-colors" title={t('kanban.edit')}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {canManageTasks && (
                        <button onClick={() => onDelete(task.id)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors" title={t('kanban.delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
}