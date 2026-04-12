'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Trash2, Edit2, Calendar, User as UserIcon, Tag, AlertCircle, ArrowUp, ArrowDown, Minus, GripHorizontal, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import Select from '@/components/ui/Select';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_BOARDS_BY_PROJECT, CREATE_BOARD } from '@/graphql/boards/operations';
import { GET_TASKS_BY_PROJECT, REMOVE_TASK, UPDATE_TASK } from '@/graphql/tasks/operations';
import CreateTaskModal from '../../CreateTaskModal';

interface ProjectMember {
  id: string;
  status: string;
  role: string;
  user: { id: string; name: string; avatarUrl: string | null; };
}

interface KanbanBoardProps {
  projectId: string;
  members: ProjectMember[];
  userRole: string | null;
  sprintId?: string;
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const p = priority || 'MEDIUM';
  if (p === 'URGENT') return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-900/50"><AlertCircle className="w-2.5 h-2.5" /> Urgente</span>;
  if (p === 'HIGH') return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50"><ArrowUp className="w-2.5 h-2.5" /> Alta</span>;
  if (p === 'LOW') return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-secondary text-text-secondary border border-border-secondary"><ArrowDown className="w-2.5 h-2.5" /> Baja</span>;
  return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"><Minus className="w-2.5 h-2.5" /> Media</span>;
};

const PRIORITY_BORDER: Record<string, string> = {
  URGENT: 'border-l-red-500', HIGH: 'border-l-orange-500',
  MEDIUM: 'border-l-blue-500', LOW: 'border-l-gray-400'
};

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

  const canManageTasks = userRole === 'LEADER' || userRole === 'STUDENT';

  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    const savedView = localStorage.getItem('kanban-view-preference');
    if (savedView === 'list' || savedView === 'kanban') {
      setViewMode(savedView as 'kanban' | 'list');
    }
  }, []);

  const handleViewModeToggle = (mode: 'kanban' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('kanban-view-preference', mode);
  };

  const toggleColumnExpand = (boardId: string) => {
    setExpandedColumns(prev => {
      const next = new Set(prev);
      if (next.has(boardId)) next.delete(boardId);
      else next.add(boardId);
      return next;
    });
  };

  const loadKanbanData = async () => {
    setIsLoading(true);
    try {
      const boardsRes = await fetchGraphQL({ query: GET_BOARDS_BY_PROJECT, variables: { projectId } });
      const tasksRes = await fetchGraphQL({
        query: GET_TASKS_BY_PROJECT,
        variables: { projectId, sprintId }
      });

      if (boardsRes?.boardsByProject) setBoards(boardsRes.boardsByProject);
      if (tasksRes?.tasksByProject) setTasks(tasksRes.tasksByProject);
    } catch (error) {
      console.error("Error cargando el Kanban:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const virtualBoards = [
    { id: 'fake-backlog', name: 'Backlog', position: 0, color: '#9CA3AF' },
    { id: 'fake-todo', name: 'To Do', position: 1, color: '#3B82F6' },
    { id: 'fake-inprogress', name: 'In Progress', position: 2, color: '#F59E0B' },
    { id: 'fake-done', name: 'Done', position: 3, color: '#10B981' },
  ];

  const activeBoards = boards.length > 0 ? boards : virtualBoards;

  useEffect(() => { loadKanbanData(); }, [projectId, sprintId]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => setDraggingTaskId(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

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

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, boardId: targetBoardId.startsWith('fake-') ? null : targetBoardId, status: newStatus } : t
    ));

    try {
      const inputObj: any = { id: taskId, status: newStatus };
      if (!targetBoardId.startsWith('fake-')) {
        inputObj.boardId = targetBoardId;
      }

      const response = await fetchGraphQL({
        query: UPDATE_TASK,
        variables: { input: inputObj }
      });

      if (response?.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

    } catch (error: any) {
      console.error("Error moviendo tarea:", error);

      alert(`No se pudo mover la tarea:\n${error.message || "Límite WIP excedido o error de red."}`);

      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, boardId: originalBoardId, status: originalStatus } : t
      ));

      loadKanbanData();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetchGraphQL({ query: REMOVE_TASK, variables: { id: taskId } });
    } catch (error) {
      console.error("Error eliminando:", error);
      loadKanbanData();
    }
  };

  const openModal = (boardId?: string, task?: any) => {
    setDefaultBoardId(boardId);
    setTaskToEdit(task || null);
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssignee = assigneeFilter ? task.assigneeId === assigneeFilter : true;

    const matchesTag = tagFilter
      ? task.tags?.some((tag: string) => tag.toLowerCase().includes(tagFilter.toLowerCase()))
      : true;

    return matchesSearch && matchesAssignee && matchesTag;
  });

  const displayTasks = [...filteredTasks];
  if (viewMode === 'list' && sortConfig) {
    displayTasks.sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.key === 'title') {
        return a.title.localeCompare(b.title) * dir;
      }
      if (sortConfig.key === 'priority') {
        const priorityScore: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const scoreA = priorityScore[a.priority] || 2;
        const scoreB = priorityScore[b.priority] || 2;
        return (scoreA - scoreB) * dir;
      }
      if (sortConfig.key === 'status') {
        const statusScore: Record<string, number> = { BACKLOG: 1, TODO: 2, IN_PROGRESS: 3, IN_REVIEW: 4, DONE: 5 };
        const scoreA = statusScore[a.status] || 0;
        const scoreB = statusScore[b.status] || 0;
        return (scoreA - scoreB) * dir;
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
      
      <div className="flex flex-wrap items-end gap-2 sm:gap-3 bg-surface-primary p-3 sm:p-4 rounded-xl border border-border-primary shadow-sm">

        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-shadow bg-surface-primary text-text-primary placeholder:text-text-muted"
          />
        </div>

        <div className="relative w-36 sm:w-44">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Filtrar por tag..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-shadow bg-surface-primary text-text-primary placeholder:text-text-muted"
          />
        </div>

        <div className="w-36 sm:w-44">
          <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
            <option value="">Asignado: Todos</option>
            {members.filter(m => m.status === 'ACTIVE').map((m) => (
              <option key={m.id} value={m.user.id}>{m.user.name}</option>
            ))}
          </Select>
        </div>

        {canManageTasks && (
          <button onClick={() => openModal()} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark sm:ml-auto transition-colors shadow-sm shrink-0 w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" /> Nueva tarea
          </button>
        )}

        <div className="flex bg-surface-secondary rounded-lg border border-border-secondary p-1 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
          <button
            onClick={() => handleViewModeToggle('kanban')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-surface-primary text-brand shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Kanban
          </button>
          <button
            onClick={() => handleViewModeToggle('list')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface-primary text-brand shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            <List className="w-4 h-4" /> Lista
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
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
              <div
                key={board.id}
                className={`flex flex-col rounded-[1.25rem] border shrink-0 flex-1 min-w-[220px] max-w-[450px] transition-colors shadow-sm ${isOverWip ? 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-[#f4f5f7] dark:bg-surface-secondary border-border-secondary'}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, board.id)}
              >
                
                <div
                  className={`flex items-center justify-between px-5 py-3.5 border-b bg-surface-primary rounded-t-[1.25rem] ${isOverWip ? 'border-red-200 dark:border-red-800' : 'border-border-secondary'}`}
                  style={{ borderTop: `4px solid ${isOverWip ? '#ef4444' : boardColor}` }}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <h3 className={`text-base font-bold truncate ${isOverWip ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}>
                      {board.name}
                    </h3>
                    {isOverWip && <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Límite excedido</span>}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 flex items-center justify-center min-w-[28px] ${isOverWip ? 'bg-red-100 text-red-700' : 'bg-surface-secondary border border-border-primary text-text-muted'}`}>
                    {boardTasks.length} {board.wipLimit ? `/ ${board.wipLimit}` : ''}
                  </span>
                </div>

                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3 min-h-[150px]">
                  {boardTasks.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border-secondary rounded-lg pointer-events-none bg-surface-primary/50">
                      <p className="text-xs text-text-muted font-medium">Arrastra tareas aquí</p>
                    </div>
                  ) : (
                    <>
                      {(expandedColumns.has(board.id) ? boardTasks : boardTasks.slice(0, 5)).map((task) => {
                        const assigneeMember = members.find(m => m.user.id === task.assigneeId);
                        const isDragging = draggingTaskId === task.id;

                        return (
                          <div
                            key={task.id}
                            draggable={canManageTasks}
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={handleDragEnd}
                            className={`group bg-surface-primary p-4 rounded-xl border border-l-[4px] shadow-sm transition-all duration-200 relative ${isDragging ? 'opacity-50 scale-95 shadow-none' : 'border-border-secondary hover:shadow-lg hover:-translate-y-1 cursor-grab active:cursor-grabbing'} ${PRIORITY_BORDER[task.priority] || PRIORITY_BORDER.MEDIUM}`}
                          >
                            
                            <div className="absolute top-0 inset-x-0 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripHorizontal className="w-4 h-4 text-border-primary" />
                            </div>
                            
                            {canManageTasks && !isDragging && (
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-surface-primary shadow-sm border border-border-secondary rounded-md overflow-hidden">
                                <button onClick={() => openModal(board.id, task)} className="p-1.5 text-text-muted hover:text-brand hover:bg-brand/5" title="Editar">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50" title="Eliminar">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-1.5 mb-3 pr-12 mt-2">
                              <PriorityBadge priority={task.priority} />

                              {task.tags && task.tags.map((tag: string) => (
                                <span key={tag} className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-page text-text-secondary border border-border-secondary">
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <h4 className="text-sm font-semibold text-text-primary mb-3">{task.title}</h4>

                            <div className="flex items-center justify-between mt-auto pt-4 relative border-t border-border-primary/50">
                              {task.dueDate ? (
                                <div title="Vencimiento" className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-surface-secondary px-2 py-1 rounded-md border border-border-primary">
                                  <Calendar className="w-3.5 h-3.5 text-brand" /> {format(new Date(task.dueDate), "d MMM", { locale: es })}
                                </div>
                              ) : (
                                <div />
                              )}

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
                      })}

                      {!expandedColumns.has(board.id) && boardTasks.length > 5 && (
                        <button
                          onClick={() => toggleColumnExpand(board.id)}
                          className="w-full py-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors bg-surface-primary/50 hover:bg-surface-secondary border border-border-secondary rounded-lg"
                        >
                          Ver {boardTasks.length - 5} más
                        </button>
                      )}
                      {expandedColumns.has(board.id) && boardTasks.length > 5 && (
                        <button
                          onClick={() => toggleColumnExpand(board.id)}
                          className="w-full py-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors bg-surface-primary/50 hover:bg-surface-secondary border border-border-secondary rounded-lg"
                        >
                          Mostrar menos
                        </button>
                      )}
                    </>
                  )}
                </div>

                {canManageTasks && (
                  <div className="p-2 pt-0 mt-auto bg-surface-primary/50 rounded-b-xl">
                    <button onClick={() => openModal(board.id)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-text-muted rounded-lg hover:bg-surface-tertiary hover:text-text-primary transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Añadir tarjeta
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-primary rounded-xl border border-border-primary overflow-x-auto shadow-sm">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-secondary border-b border-border-primary text-text-secondary select-none">
              <tr>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-surface-tertiary transition-colors" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-2">Título <ArrowUpDown className="w-3 h-3 text-text-muted" /></div>
                </th>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-surface-tertiary transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">Columna / Estado <ArrowUpDown className="w-3 h-3 text-text-muted" /></div>
                </th>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-surface-tertiary transition-colors" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-2">Prioridad <ArrowUpDown className="w-3 h-3 text-text-muted" /></div>
                </th>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-surface-tertiary transition-colors" onClick={() => handleSort('assignee')}>
                  <div className="flex items-center gap-2">Asignado <ArrowUpDown className="w-3 h-3 text-text-muted" /></div>
                </th>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-surface-tertiary transition-colors" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center gap-2">Vencimiento <ArrowUpDown className="w-3 h-3 text-text-muted" /></div>
                </th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-secondary">
              {displayTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">No se encontraron tareas.</td>
                </tr>
              ) : (
                displayTasks.map(task => {
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
                      <td className="px-4 py-3">
                        <span className="font-semibold text-text-primary">{task.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset" style={{ color: boardColor, backgroundColor: `${boardColor}1A`, '--tw-ring-color': `${boardColor}4D` } as any}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: boardColor }}></span>
                          {stateName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-4 py-3">
                        {assigneeMember ? (
                          <div className="flex items-center gap-2" title={`Asignado a: ${assigneeMember.user.name}`}>
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
                          <span className="text-text-muted italic flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5" /> Sin asignar</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {task.dueDate ? (
                          <span className="text-text-secondary font-medium flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-text-muted" />
                            {format(new Date(task.dueDate), "d 'de' MMM, yyyy", { locale: es })}
                          </span>
                        ) : (
                          <span className="text-text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openModal(matchedBoard?.id, task)} className="p-1.5 text-text-muted hover:text-brand hover:bg-surface-tertiary rounded-md transition-colors" title="Editar">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {canManageTasks && (
                            <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors" title="Eliminar">
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
      )}

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setTaskToEdit(null); loadKanbanData(); }}
        defaultBoardId={defaultBoardId}
        taskToEdit={taskToEdit}
        members={members}
        boards={activeBoards}
        projectId={projectId}
      />
    </div>
  );
}