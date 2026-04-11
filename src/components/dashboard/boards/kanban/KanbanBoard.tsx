'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Trash2, Edit2, Calendar, User as UserIcon, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import Select from '@/components/ui/Select';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_BOARDS_BY_PROJECT } from '@/graphql/boards/operations';
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

const priorityStyles: Record<string, string> = {
  LOW: 'bg-surface-secondary text-text-secondary',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', URGENT: 'Urgente',
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

    const targetBoard = boards.find(b => b.id === targetBoardId);
    const newStatus = targetBoard ? getStatusFromBoardName(targetBoard.name) : task.status;

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, boardId: targetBoardId, status: newStatus } : t
    ));

    try {
      const response = await fetchGraphQL({
        query: UPDATE_TASK,
        variables: { input: { id: taskId, boardId: targetBoardId, status: newStatus } }
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

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* ─── BARRA DE HERRAMIENTAS Y FILTROS ─── */}
      <div className="flex flex-wrap items-end gap-3 bg-surface-primary p-4 rounded-xl border border-border-primary shadow-sm">

        {/* Buscador de texto */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-shadow bg-surface-primary text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Buscador de Etiquetas */}
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

        {/* Filtro de Asignados */}
        <div className="w-36 sm:w-44">
          <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
            <option value="">Asignado: Todos</option>
            {members.filter(m => m.status === 'ACTIVE').map((m) => (
              <option key={m.id} value={m.user.id}>{m.user.name}</option>
            ))}
          </Select>
        </div>

        {canManageTasks && (
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark ml-auto transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Nueva tarea
          </button>
        )}
      </div>

      {/* ─── TABLERO KANBAN ─── */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar items-start">
        {boards.length === 0 ? (
          <div className="w-full text-center py-20 text-text-muted">No hay columnas configuradas.</div>
        ) : (
          boards.map((board) => {
            const boardTasks = filteredTasks.filter(t => t.boardId === board.id);
            const isOverWip = board.wipLimit && boardTasks.length > board.wipLimit;
            const boardColor = board.color || '#3B82F6';

            return (
              <div
                key={board.id}
                className={`flex flex-col rounded-xl border shrink-0 w-80 max-h-[75vh] transition-colors shadow-sm ${isOverWip ? 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-surface-secondary border-border-secondary'}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, board.id)}
              >
                {/* Cabecera de Columna */}
                <div
                  className={`flex items-center justify-between px-4 py-3 border-b bg-surface-primary rounded-t-xl ${isOverWip ? 'border-red-200 dark:border-red-800' : 'border-border-primary'}`}
                  style={{ borderTop: `4px solid ${isOverWip ? '#ef4444' : boardColor}` }}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <h3 className={`text-sm font-bold truncate ${isOverWip ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}>
                      {board.name}
                    </h3>
                    {isOverWip && <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Límite excedido</span>}
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md shrink-0 ${isOverWip ? 'bg-red-100 text-red-700' : 'bg-surface-secondary text-text-muted'}`}>
                    {boardTasks.length} {board.wipLimit ? `/ ${board.wipLimit}` : ''}
                  </span>
                </div>

                {/* Zona de Tarjetas */}
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3 min-h-[150px]">
                  {boardTasks.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border-secondary rounded-lg pointer-events-none bg-surface-primary/50">
                      <p className="text-xs text-text-muted font-medium">Arrastra tareas aquí</p>
                    </div>
                  ) : (
                    boardTasks.map((task) => {
                      const assigneeMember = members.find(m => m.user.id === task.assigneeId);
                      const isDragging = draggingTaskId === task.id;

                      return (
                        <div
                          key={task.id}
                          draggable={canManageTasks}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          className={`group bg-surface-primary p-4 rounded-lg border shadow-sm transition-all relative ${isDragging ? 'opacity-50 border-brand scale-95' : 'border-border-secondary hover:shadow-md hover:border-brand/40 cursor-grab active:cursor-grabbing'
                            }`}
                        >
                          {/* Botones Flotantes */}
                          {canManageTasks && !isDragging && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-surface-primary shadow-sm border border-border-secondary rounded-md overflow-hidden">
                              <button onClick={() => openModal(undefined, task)} className="p-1.5 text-text-muted hover:text-brand hover:bg-brand/5" title="Editar">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50" title="Eliminar">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* Prioridad y Etiquetas */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-2 pr-12">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${priorityStyles[task.priority] || priorityStyles.MEDIUM}`}>
                              {priorityLabels[task.priority] || 'Media'}
                            </span>

                            {/* Renderizado de Etiquetas (Tags) */}
                            {task.tags && task.tags.map((tag: string) => (
                              <span key={tag} className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-secondary text-text-muted border border-border-primary">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <h4 className="text-sm font-semibold text-text-primary mb-3">{task.title}</h4>

                          {/* Pie de tarjeta */}
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-primary">
                            {task.dueDate ? (
                              <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                                <Calendar className="w-3.5 h-3.5" /> {format(new Date(task.dueDate), "d MMM", { locale: es })}
                              </div>
                            ) : <div />}

                            {assigneeMember ? (
                              <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center border border-brand/20 shadow-sm">
                                {assigneeMember.user.avatarUrl ? (
                                  <img src={assigneeMember.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-[10px] font-bold text-brand">{assigneeMember.user.name.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border border-dashed border-border-secondary flex items-center justify-center bg-surface-secondary">
                                <UserIcon className="w-3 h-3 text-text-muted" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Botón inferior */}
                {canManageTasks && (
                  <div className="p-2 pt-0 mt-auto bg-surface-primary/50 rounded-b-xl">
                    <button onClick={() => openModal(board.id)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-text-muted rounded-lg hover:bg-surface-tertiary hover:text-text-primary transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Añadir tarjeta
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setTaskToEdit(null); loadKanbanData(); }}
        defaultBoardId={defaultBoardId}
        taskToEdit={taskToEdit}
        members={members}
        boards={boards}
        projectId={projectId}
      />
    </div>
  );
}