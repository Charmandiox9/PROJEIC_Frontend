'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Tag, LayoutGrid, List, Edit2, Trash2, CalendarIcon, BarChartHorizontal } from 'lucide-react';
import Select from '@/components/ui/Select';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_BOARDS_BY_PROJECT, DELETE_BOARD } from '@/graphql/boards/operations';
import { GET_TASKS_BY_PROJECT, REMOVE_TASK, UPDATE_TASK } from '@/graphql/tasks/operations';
import CreateTaskModal from '../../CreateTaskModal';
import EditBoardModal from '../EditBoardModal';
import CreateBoardModal from '../CreateBoardModal';
import { useT } from '@/hooks/useT';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import KanbanTaskCard from './KanbanTaskCard';
import KanbanListView from './KanbanListView';
import ProjectCalendarView from './ProjectCalendarView';
import ProjectGanttView from './ProjectGanttView';

interface ProjectMember {
  id: string;
  status: string;
  role: string;
  user: { id: string; name: string; avatarUrl?: string | null; };
}

interface KanbanBoardProps {
  projectId: string;
  members: ProjectMember[];
  userRole: string | null;
  sprintId?: string;
}

const getStatusFromBoardName = (boardName: string): string => {
  const name = boardName.toLowerCase();
  if (name.includes('backlog')) return 'BACKLOG';
  if (name.includes('to do') || name.includes('todo')) return 'TODO';
  if (name.includes('progress') || name.includes('progreso')) return 'IN_PROGRESS';
  if (name.includes('review') || name.includes('revisión')) return 'IN_REVIEW';
  if (name.includes('done') || name.includes('completado')) return 'DONE';
  return 'TODO';
};

export default function KanbanBoard({ projectId, members, userRole, sprintId }: KanbanBoardProps) {
  const { t } = useT();
  const [boards, setBoards] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultBoardId, setDefaultBoardId] = useState<string | undefined>(undefined);

  const [taskToEdit, setTaskToEdit] = useState<any | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const canManageTasks = userRole === 'LEADER';
  const canManageBoards = userRole === 'LEADER';

  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar' | 'gantt'>('kanban');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const [boardToEdit, setBoardToEdit] = useState<any | null>(null);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const taskIdFromUrl = searchParams.get('task');

  useEffect(() => {
    const savedView = localStorage.getItem('kanban-view-preference');
    if (savedView === 'list' || savedView === 'kanban') setViewMode(savedView as 'kanban' | 'list');
  }, []);

  useEffect(() => {
    if (tasks.length > 0 && taskIdFromUrl) {
      const taskToOpen = tasks.find(t => t.id === taskIdFromUrl);
      
      if (taskToOpen) {
        // Abrimos el modal con la tarea encontrada
        openModal(taskToOpen.boardId, taskToOpen);
        
        // (Opcional pero recomendado): Limpiamos la URL para que no se vuelva a abrir si el usuario recarga la página
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('task');
        router.replace(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
      }
    }
  }, [tasks, taskIdFromUrl, pathname, router, searchParams]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const loadKanbanData = async () => {
    setIsLoading(true);
    try {
      const boardsRes = await fetchGraphQL({ query: GET_BOARDS_BY_PROJECT, variables: { projectId } });
      const tasksRes = await fetchGraphQL({ query: GET_TASKS_BY_PROJECT, variables: { projectId, sprintId } });
      if (boardsRes?.boardsByProject) setBoards(boardsRes.boardsByProject);
      if (tasksRes?.tasksByProject) setTasks(tasksRes.tasksByProject);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const virtualBoards = [
    { id: 'fake-backlog', name: t('kanban.backlog'), position: 0, color: '#9CA3AF' },
    { id: 'fake-todo', name: t('kanban.todo'), position: 1, color: '#3B82F6' },
    { id: 'fake-inprogress', name: t('kanban.inProgress'), position: 2, color: '#F59E0B' },
    { id: 'fake-done', name: t('kanban.done'), position: 3, color: '#10B981' },
  ];

  const activeBoards = boards.length > 0 ? boards : virtualBoards;
  useEffect(() => { loadKanbanData(); }, [projectId, sprintId]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
  };
  const handleDragEnd = () => setDraggingTaskId(null);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const handleDrop = async (e: React.DragEvent, targetBoardId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.boardId === targetBoardId) return;

    const originalBoardId = task.boardId;
    const originalStatus = task.status;
    const targetBoard = activeBoards.find(b => b.id === targetBoardId);
    let newStatus = task.status;

    if (targetBoardId.startsWith('fake-')) {
      const statusMap: any = { 'fake-backlog': 'BACKLOG', 'fake-todo': 'TODO', 'fake-inprogress': 'IN_PROGRESS', 'fake-done': 'DONE' };
      newStatus = statusMap[targetBoardId];
    } else {
      newStatus = targetBoard ? getStatusFromBoardName(targetBoard.name) : task.status;
    }

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, boardId: targetBoardId.startsWith('fake-') ? null : targetBoardId, status: newStatus } : t));

    try {
      const inputObj: any = { id: taskId, status: newStatus };
      if (!targetBoardId.startsWith('fake-')) inputObj.boardId = targetBoardId;
      await fetchGraphQL({ query: UPDATE_TASK, variables: { input: inputObj } });
    } catch (error: any) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, boardId: originalBoardId, status: originalStatus } : t));
      loadKanbanData();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm(t('kanban.confirmDeleteTask'))) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try { await fetchGraphQL({ query: REMOVE_TASK, variables: { id: taskId } }); } 
    catch { loadKanbanData(); }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (boardId.startsWith('fake-') || !window.confirm(t('kanban.confirmDeleteBoard'))) return;
    try {
      await fetchGraphQL({ query: DELETE_BOARD, variables: { id: boardId } });
      setBoards(prev => prev.filter(b => b.id !== boardId));
      loadKanbanData();
    } catch (error: any) {}
  };

  const openModal = (boardId?: string, task?: any) => {
    setDefaultBoardId(boardId);
    setTaskToEdit(task || null);
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssignee = assigneeFilter ? task.assigneeId === assigneeFilter : true;
    const matchesTag = tagFilter ? task.tags?.some((tag: string) => tag.toLowerCase().includes(tagFilter.toLowerCase())) : true;
    return matchesSearch && matchesAssignee && matchesTag;
  });

  const displayTasks = [...filteredTasks];
  if (viewMode === 'list' && sortConfig) {
    displayTasks.sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.key === 'title') return a.title.localeCompare(b.title) * dir;
      if (sortConfig.key === 'priority') {
        const pScore: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return ((pScore[a.priority] || 2) - (pScore[b.priority] || 2)) * dir;
      }
      if (sortConfig.key === 'status') {
        const sScore: Record<string, number> = { BACKLOG: 1, TODO: 2, IN_PROGRESS: 3, IN_REVIEW: 4, DONE: 5 };
        return ((sScore[a.status] || 0) - (sScore[b.status] || 0)) * dir;
      }
      if (sortConfig.key === 'assignee') {
        const nameA = members.find(m => m.user.id === a.assigneeId)?.user.name || 'Z';
        const nameB = members.find(m => m.user.id === b.assigneeId)?.user.name || 'Z';
        return nameA.localeCompare(nameB) * dir;
      }
      if (sortConfig.key === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return (dateA - dateB) * dir;
      }
      return 0;
    });
  }

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in w-full min-w-0">
      
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-end gap-2 sm:gap-3 bg-surface-primary p-3 sm:p-4 rounded-xl border border-border-primary shadow-sm">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input type="text" placeholder={t('kanban.searchTasks')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand outline-none bg-surface-primary text-text-primary" />
        </div>
        <div className="relative w-36 sm:w-44">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input type="text" placeholder={t('kanban.filterTags')} value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand outline-none bg-surface-primary text-text-primary" />
        </div>
        <div className="w-36 sm:w-44">
          <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
            <option value="">{t('kanban.assigneeAll')}</option>
            {members.map(m => <option key={m.id} value={m.user.id}>{m.user.name}</option>)}
          </Select>
        </div>
        {canManageTasks && (
          <button onClick={() => openModal()} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark sm:ml-auto">
            <Plus className="w-4 h-4" /> {t('kanban.newTask')}
          </button>
        )}
        <div className="flex bg-surface-secondary rounded-lg border border-border-secondary p-1 shrink-0 mt-2 sm:mt-0">
          <button onClick={() => { setViewMode('kanban'); localStorage.setItem('kanban-view-preference', 'kanban'); }} className={`flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-surface-primary text-brand shadow-sm' : 'text-text-muted'}`}><LayoutGrid className="w-4 h-4" /> {t('kanban.viewKanban')}</button>
          <button onClick={() => { setViewMode('list'); localStorage.setItem('kanban-view-preference', 'list'); }} className={`flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface-primary text-brand shadow-sm' : 'text-text-muted'}`}><List className="w-4 h-4" /> {t('kanban.viewList')}</button>
          <button onClick={() => { setViewMode('calendar'); localStorage.setItem('kanban-view-preference', 'calendar'); }} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-surface-primary text-brand shadow-sm' : 'text-text-muted hover:text-text-primary'}`}><CalendarIcon className="w-4 h-4" /> {t('kanban.viewCalendar')}</button>
          <button onClick={() => { setViewMode('gantt'); localStorage.setItem('kanban-view-preference', 'gantt'); }} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'gantt' ? 'bg-surface-primary text-brand shadow-sm' : 'text-text-muted hover:text-text-primary'}`}><BarChartHorizontal className="w-4 h-4" /> {t('kanban.viewGantt')}</button>
        </div>
      </div>

      {/* RENDER VIEWS */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar items-start">
          {activeBoards.map((board) => {
            const boardTasks = filteredTasks.filter(t => {
              if (board.id.startsWith('fake-')) {
                const statusMap: any = { 'fake-backlog': 'BACKLOG', 'fake-todo': 'TODO', 'fake-inprogress': 'IN_PROGRESS', 'fake-done': 'DONE' };
                return t.status === statusMap[board.id] || t.status === board.name.toUpperCase().replace(' ', '_');
              }
              return t.boardId === board.id;
            });
            const isOverWip = board.wipLimit && boardTasks.length > board.wipLimit;
            const boardColor = board.color || '#3B82F6';

            return (
              <div key={board.id} className={`group/board flex flex-col rounded-[1.25rem] border shrink-0 flex-1 min-w-[220px] max-w-[450px] transition-colors shadow-sm ${isOverWip ? 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-[#f4f5f7] dark:bg-surface-secondary border-border-secondary'}`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, board.id)}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b bg-surface-primary rounded-t-[1.25rem] ${isOverWip ? 'border-red-200 dark:border-red-800' : 'border-border-secondary'}`} style={{ borderTop: `4px solid ${isOverWip ? '#ef4444' : boardColor}` }}>
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-base font-bold truncate ${isOverWip ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}>{board.name}</h3>
                      {canManageBoards && !board.id.startsWith('fake-') && (
                        <div className="opacity-0 group-hover/board:opacity-100 flex items-center gap-1 transition-opacity">
                          <button onClick={() => setBoardToEdit(board)} className="p-1 text-text-muted hover:text-brand bg-surface-secondary rounded"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={() => handleDeleteBoard(board.id)} className="p-1 text-text-muted hover:text-red-500 bg-surface-secondary rounded"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      )}
                    </div>
                    {isOverWip && <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{t('kanban.limitExceeded')}</span>}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 flex items-center justify-center min-w-[28px] ${isOverWip ? 'bg-red-100 text-red-700' : 'bg-surface-secondary border border-border-primary text-text-muted'}`}>
                    {boardTasks.length} {board.wipLimit ? `/ ${board.wipLimit}` : ''}
                  </span>
                </div>

                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3 min-h-[150px]">
                  {boardTasks.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border-secondary rounded-lg pointer-events-none bg-surface-primary/50">
                      <p className="text-xs text-text-muted font-medium">{t('kanban.dragHere')}</p>
                    </div>
                  ) : (
                    <>
                      {(expandedColumns.has(board.id) ? boardTasks : boardTasks.slice(0, 3)).map((task) => (
                        /* 🔥 USAMOS EL COMPONENTE DE LA TARJETA 🔥 */
                        <KanbanTaskCard 
                          key={task.id} 
                          task={task} 
                          members={members} 
                          canManageTasks={canManageTasks} 
                          isDragging={draggingTaskId === task.id} 
                          onDragStart={handleDragStart} 
                          onDragEnd={handleDragEnd} 
                          onEdit={(t) => openModal(board.id, t)} 
                          onDelete={handleDeleteTask} 
                        />
                      ))}
                      {!expandedColumns.has(board.id) && boardTasks.length > 3 && (
                        <button onClick={() => setExpandedColumns(prev => { const n = new Set(prev); n.add(board.id); return n; })} className="w-full py-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors bg-surface-primary/50 hover:bg-surface-secondary border border-border-secondary rounded-lg">{t('kanban.seeMore').replace('{n}', String(boardTasks.length - 3))}</button>
                      )}
                      {expandedColumns.has(board.id) && boardTasks.length > 3 && (
                        <button onClick={() => setExpandedColumns(prev => { const n = new Set(prev); n.delete(board.id); return n; })} className="w-full py-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors bg-surface-primary/50 hover:bg-surface-secondary border border-border-secondary rounded-lg">{t('kanban.showLess')}</button>
                      )}
                    </>
                  )}
                </div>

                {canManageTasks && (
                  <div className="p-2 pt-0 mt-auto bg-surface-primary/50 rounded-b-xl">
                    <button onClick={() => openModal(board.id)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-text-muted rounded-lg hover:bg-surface-tertiary hover:text-text-primary transition-colors">
                      <Plus className="w-3.5 h-3.5" /> {t('kanban.addCard')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {canManageBoards && (
            <button onClick={() => setIsCreateBoardOpen(true)} className="flex flex-col items-center justify-center gap-2 shrink-0 w-[220px] h-[100px] mt-0 border-2 border-dashed border-border-secondary rounded-[1.25rem] text-text-muted hover:text-brand hover:border-brand hover:bg-brand/5 transition-all">
              <Plus className="w-6 h-6" /> <span className="font-medium text-sm">{t('kanban.addColumn')}</span>
            </button>
          )}
        </div>
      )} 

      {viewMode === 'list' && (
        <KanbanListView 
          tasks={displayTasks} 
          members={members} 
          activeBoards={activeBoards} 
          canManageTasks={canManageTasks} 
          onSort={handleSort} 
          onEdit={openModal} 
          onDelete={handleDeleteTask} 
        />
      )}

      {viewMode === 'calendar' && (
        <ProjectCalendarView 
          tasks={displayTasks}
          onEditTask={openModal} 
        />
      )}

      {viewMode === 'gantt' && (
        <ProjectGanttView 
          tasks={displayTasks} 
          onEditTask={openModal} 
        />
      )}


      {/* MODALS */}
      <CreateTaskModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setTaskToEdit(null); loadKanbanData(); }} defaultBoardId={defaultBoardId} taskToEdit={taskToEdit} members={members} boards={activeBoards} projectId={projectId} sprintId={sprintId} userRole={userRole} />
      <EditBoardModal isOpen={!!boardToEdit} board={boardToEdit} onClose={() => setBoardToEdit(null)} onSuccess={() => { setBoardToEdit(null); loadKanbanData(); }} />
      <CreateBoardModal isOpen={isCreateBoardOpen} onClose={() => setIsCreateBoardOpen(false)} onSuccess={() => { setIsCreateBoardOpen(false); loadKanbanData(); }} projectId={projectId} nextPosition={boards.length} />
    </div>
  );
}