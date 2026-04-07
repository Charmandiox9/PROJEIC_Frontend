'use client';

import { useState, useEffect } from 'react';
import { Plus, Play, Loader2, GripVertical, Inbox, Target, FileText, CheckCircle2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_TASKS_BY_PROJECT, UPDATE_TASK } from '@/graphql/tasks/operations';
import { GET_SPRINTS_BY_PROJECT, CREATE_SPRINT, START_SPRINT } from '@/graphql/sprints/operations';
import { GET_BOARDS_BY_PROJECT } from '@/graphql/boards/operations'; 
import CreateTaskModal from '../../CreateTaskModal';

interface ScrumPlanningProps {
  projectId: string;
  members: any[];
  onSprintStarted: () => void;
}

const priorityStyles: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', URGENT: 'Urgente',
};

export default function ScrumPlanning({ projectId, members, onSprintStarted }: ScrumPlanningProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]); // 🔥 Necesitamos los tableros para el Modal
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  // Estados de Modales
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); // 🔥 Estado para crear tarea
  
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    
    try {
      try {
        const tasksRes = await fetchGraphQL({ query: GET_TASKS_BY_PROJECT, variables: { projectId } });
        if (tasksRes?.tasksByProject) setTasks(tasksRes.tasksByProject);
      } catch (e) { console.error("❌ Error trayendo Tareas:", e); }

      try {
        const boardsRes = await fetchGraphQL({ query: GET_BOARDS_BY_PROJECT, variables: { projectId } });
        if (boardsRes?.boardsByProject) setBoards(boardsRes.boardsByProject);
      } catch (e) { console.error("❌ Error trayendo Tableros:", e); }

      try {
        const sprintsRes = await fetchGraphQL({ query: GET_SPRINTS_BY_PROJECT, variables: { projectId } });
        if (sprintsRes?.sprintsByProject) {
          const projectSprints = sprintsRes.sprintsByProject;
          setSprints(projectSprints);
          
          if (!selectedSprintId) {
            const pendingSprint = projectSprints.find((s: any) => s.status === 'PENDING');
            if (pendingSprint) setSelectedSprintId(pendingSprint.id);
          }
        }
      } catch (e) { console.error("❌ Error trayendo Sprints:", e); }

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [projectId]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragEnd = () => setDraggingTaskId(null);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent, targetZone: 'BACKLOG' | 'SPRINT') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setDraggingTaskId(null);

    if (!taskId) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (targetZone === 'SPRINT' && !selectedSprintId) return;

    const targetSprintId = targetZone === 'SPRINT' ? selectedSprintId : null;
    if (task.sprintId === targetSprintId) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, sprintId: targetSprintId } : t));

    try {
      await fetchGraphQL({
        query: UPDATE_TASK,
        variables: { input: { id: taskId, sprintId: targetSprintId } }
      });
    } catch (error) {
      console.error("Error moviendo tarea:", error);
      loadData(); 
    }
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchGraphQL({
        query: CREATE_SPRINT,
        variables: { input: { projectId, name: sprintName, goal: sprintGoal } }
      });
      const newSprint = res.createSprint;
      setIsSprintModalOpen(false);
      setSprintName('');
      setSprintGoal('');
      setSelectedSprintId(newSprint.id);
      loadData();
    } catch (error) {
      console.error("Error creando sprint:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSprint = async () => {
    if (!selectedSprintId) return;
    try {
      await fetchGraphQL({
        query: START_SPRINT,
        variables: { id: selectedSprintId, projectId }
      });
      onSprintStarted(); 
    } catch (error) {
      console.error("Error iniciando sprint:", error);
      alert("No se pudo iniciar el Sprint. Asegúrate de no tener otro activo.");
    }
  };

  const backlogTasks = tasks.filter(t => !t.sprintId);
  
  const sprintTasks = selectedSprintId 
    ? tasks.filter(t => t.sprintId === selectedSprintId) 
    : []; 
    
  const selectedSprint = sprints.find(s => s.id === selectedSprintId);
  const pendingSprints = sprints.filter(s => s.status === 'PENDING');

  const renderTaskRow = (task: any) => (
    <div 
      key={task.id}
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
      onDragEnd={handleDragEnd}
      className={`group flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-brand hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${draggingTaskId === task.id ? 'opacity-40 scale-[0.98]' : ''}`}
    >
      <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-brand/60 transition-colors shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${priorityStyles[task.priority] || priorityStyles.MEDIUM}`}>
            {priorityLabels[task.priority] || 'Media'}
          </span>
          {task.status === 'DONE' && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3" /> Completada
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* ─── HEADER Y BOTONES PRINCIPALES ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sprint Planning</h2>
          <p className="text-sm text-gray-500 mt-1">Arrastra tareas del Backlog al Sprint activo para planificar tu iteración.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-gray-500" /> Nueva Tarea
          </button>
          
          <button 
            onClick={() => setIsSprintModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Crear Sprint
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ─── ZONA: BACKLOG (Izquierda) ─── */}
        <div 
          className="bg-gray-50 rounded-xl border border-gray-200 flex flex-col min-h-[600px] shadow-inner"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'BACKLOG')}
        >
          <div className="px-5 py-4 border-b border-gray-200 bg-white rounded-t-xl flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gray-100 rounded-md">
                <Inbox className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Product Backlog</h3>
            </div>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
              {backlogTasks.length} {backlogTasks.length === 1 ? 'tarea' : 'tareas'}
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
            {backlogTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                <Inbox className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-600">El backlog está vacío</p>
                <p className="text-xs text-gray-400 mt-1">Crea nuevas tareas para empezar a planificar.</p>
              </div>
            ) : (
              backlogTasks.map(renderTaskRow)
            )}
          </div>
        </div>

        {/* ─── ZONA: SPRINT (Derecha) ─── */}
        <div 
          className="bg-brand/5 rounded-xl border border-brand/20 flex flex-col min-h-[600px] shadow-sm relative overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'SPRINT')}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand"></div>

          <div className="px-5 py-4 border-b border-brand/10 bg-white flex flex-col gap-3 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-brand/10 rounded-md">
                <Target className="w-4 h-4 text-brand" />
              </div>
              {pendingSprints.length === 0 ? (
                <h3 className="text-base font-bold text-gray-800">Sin Sprints</h3>
              ) : (
                <select 
                  value={selectedSprintId || ''}
                  onChange={(e) => setSelectedSprintId(e.target.value)}
                  className="w-full text-base font-bold text-brand bg-transparent outline-none cursor-pointer hover:text-brand-dark transition-colors"
                >
                  {pendingSprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
            </div>
            
            {selectedSprint?.goal && (
              <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
                <p className="text-xs font-medium text-gray-600"><span className="font-bold text-gray-800">Meta:</span> {selectedSprint.goal}</p>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
            {!selectedSprintId ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Target className="w-10 h-10 text-brand/30 mb-3" />
                <p className="text-sm font-medium text-brand/70">Crea un Sprint para empezar</p>
              </div>
            ) : sprintTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-brand/20 rounded-xl bg-white/50">
                <p className="text-sm font-medium text-brand/60">Arrastra tareas aquí</p>
                <p className="text-xs text-brand/40 mt-1">Añade elementos desde el Backlog</p>
              </div>
            ) : (
              sprintTasks.map(renderTaskRow)
            )}
          </div>

          <div className="p-4 bg-white border-t border-brand/10 mt-auto">
            <button
              onClick={handleStartSprint}
              disabled={!selectedSprintId || sprintTasks.length === 0}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold text-white bg-brand rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            >
              <Play className="w-4 h-4 fill-current" /> Iniciar Sprint ({sprintTasks.length} {sprintTasks.length === 1 ? 'tarea' : 'tareas'})
            </button>
          </div>
        </div>

      </div>

      {/* ─── MODAL CREAR TAREA ─── */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => { 
          setIsTaskModalOpen(false); 
          loadData();
        }}
        members={members || []}
        boards={boards}
        projectId={projectId}
      />

      {/* ─── MODAL CREAR SPRINT ─── */}
      {isSprintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Nuevo Sprint</h2>
              <p className="text-sm text-gray-500 mb-5">Define el ciclo de trabajo de tu equipo.</p>
              
              <form onSubmit={handleCreateSprint} className="space-y-4">
                <Input 
                  id="sprint-name" 
                  label="Nombre del Sprint *" 
                  value={sprintName} 
                  onChange={(e) => setSprintName(e.target.value)} 
                  required 
                  placeholder="Ej: Sprint 1 - MVP Login" 
                />
                <div className="space-y-1.5">
                  <label htmlFor="sprint-goal" className="block text-sm font-semibold text-gray-700">Meta del Sprint</label>
                  <textarea
                    id="sprint-goal"
                    value={sprintGoal}
                    onChange={(e) => setSprintGoal(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-shadow resize-none"
                    placeholder="¿Qué aporta valor al usuario en esta iteración?"
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsSprintModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSubmitting || !sprintName} className="px-6 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-dark rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Sprint'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}