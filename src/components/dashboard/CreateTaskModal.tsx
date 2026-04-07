'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { useAuth } from '@/context/AuthProvider';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { CREATE_TASK, UPDATE_TASK } from '@/graphql/tasks/operations'; 

interface ProjectMember {
  id: string;
  status: string;
  user: { id: string; name: string; };
}

interface Board { id: string; name: string; }

interface TaskFormData {
  title: string;
  description: string;
  boardId: string;
  assigneeId: string;
  priority: string;
  dueDate: string;
  tags?: string[];
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBoardId?: string;
  taskToEdit?: any;
  members: ProjectMember[];
  boards: Board[];
  projectId: string;
}

const PRIORITIES = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
];

const getStatusFromBoardName = (boardName: string): string => {
  const name = boardName.toLowerCase();
  if (name.includes('backlog')) return 'BACKLOG';
  if (name.includes('to do') || name.includes('todo')) return 'TODO';
  if (name.includes('progress') || name.includes('progreso')) return 'IN_PROGRESS';
  if (name.includes('review') || name.includes('revisión')) return 'IN_REVIEW';
  if (name.includes('done') || name.includes('completado')) return 'DONE';
  return 'TODO';
};

export default function CreateTaskModal({
  isOpen, onClose, defaultBoardId, taskToEdit, members, boards, projectId
}: CreateTaskModalProps) {
  const { user } = useAuth();
  const buildInitialForm = (): TaskFormData => {
    if (taskToEdit) {
      return {
        title: taskToEdit.title,
        description: taskToEdit.description || '',
        boardId: taskToEdit.boardId || '',
        assigneeId: taskToEdit.assigneeId || '',
        priority: taskToEdit.priority || 'MEDIUM',
        dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '',
      };
    }
    return {
      title: '',
      description: '',
      boardId: defaultBoardId || (boards.length > 0 ? boards[0].id : ''),
      assigneeId: '',
      priority: 'MEDIUM',
      dueDate: '',
    };
  };

  const [formData, setFormData] = useState<TaskFormData>(buildInitialForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(buildInitialForm());
      setIsSubmitting(false);
      setError(null);
    }
  }, [isOpen, taskToEdit, defaultBoardId, boards]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const selectedBoard = boards.find(b => b.id === formData.boardId);
    const calculatedStatus = selectedBoard ? getStatusFromBoardName(selectedBoard.name) : 'TODO';

    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let finalDueDate = undefined;
      if (formData.dueDate) {
        const localEndOfTheDay = new Date(`${formData.dueDate}T23:59:59`);
        finalDueDate = localEndOfTheDay.toISOString();
      }

      if (taskToEdit) {
        const input = {
          id: taskToEdit.id,
          title: formData.title,
          description: formData.description || undefined,
          boardId: formData.boardId || undefined,
          status: calculatedStatus,
          assigneeId: formData.assigneeId || undefined,
          priority: formData.priority,
          dueDate: finalDueDate,
        };
        await fetchGraphQL({ query: UPDATE_TASK, variables: { input } });
      } else {
        const input = {
          title: formData.title,
          projectId: projectId,
          creatorId: user?.userId || 'unknown',
          description: formData.description || undefined,
          boardId: formData.boardId || undefined,
          assigneeId: formData.assigneeId || undefined,
          priority: formData.priority,
          dueDate: finalDueDate,
        };
        await fetchGraphQL({ query: CREATE_TASK, variables: { input } });
      }
      onClose();
    } catch (err: any) {
      console.error("Error guardando tarea:", err);
      setError(err.message || 'Ocurrió un error guardando la tarea.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags?.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tagToRemove)
    }));
  };



  const isEditing = !!taskToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border rounded-lg">{error}</div>}

          <Input id="task-title" label="Título *" name="title" required value={formData.title} onChange={handleChange} />
          <Textarea id="task-description" label="Descripción" name="description" rows={3} value={formData.description} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-4">
            <Select id="task-board" label="Columna *" name="boardId" value={formData.boardId} onChange={handleChange} required>
              <option value="" disabled>Selecciona una columna</option>
              {boards.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Select id="task-priority" label="Prioridad *" name="priority" value={formData.priority} onChange={handleChange} required>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select id="task-assigned" label="Asignado a" name="assigneeId" value={formData.assigneeId} onChange={handleChange}>
              <option value="">Sin asignar</option>
              {members.filter(m => m.status === 'ACTIVE').map((m) => (
                <option key={m.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </Select>
            <Input id="task-due-date" label="Fecha" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Etiquetas (Enter para añadir)</label>
            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg min-h-[42px] bg-white focus-within:ring-2 focus-within:ring-brand transition-shadow">
              {formData.tags?.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-brand/10 text-brand text-xs font-bold rounded-md">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-brand-dark">×</button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                className="flex-1 outline-none text-sm min-w-[100px]"
                placeholder="prio, bug, frontend..."
              />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm text-white bg-brand rounded-lg hover:bg-brand-dark flex items-center gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : isEditing ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}