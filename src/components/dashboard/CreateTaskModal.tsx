'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';

interface ProjectMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface TaskFormData {
  title: string;
  description: string;
  column: string;
  assignedMemberId: string;
  label: string;
  dueDate: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultColumn?: string;
  members: ProjectMember[];
}

const COLUMNS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'completed', label: 'Completado' },
];

const LABELS = [
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'ux', label: 'UX' },
  { value: 'documentation', label: 'Documentación' },
  { value: 'setup', label: 'Setup' },
];

function buildInitialForm(column?: string): TaskFormData {
  return {
    title: '',
    description: '',
    column: column ?? 'backlog',
    assignedMemberId: '',
    label: '',
    dueDate: '',
  };
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  defaultColumn,
  members,
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>(buildInitialForm(defaultColumn));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(buildInitialForm(defaultColumn));
      setIsSubmitting(false);
    }
  }, [isOpen, defaultColumn]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('[CreateTask] payload:', formData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">Nueva tarea</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            id="task-title"
            label="Título *"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="Describe brevemente la tarea..."
          />

          <Textarea
            id="task-description"
            label="Descripción"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Contexto adicional sobre la tarea..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              id="task-column"
              label="Columna"
              name="column"
              value={formData.column}
              onChange={handleChange}
            >
              {COLUMNS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>

            <Select
              id="task-label"
              label="Etiqueta"
              name="label"
              value={formData.label}
              onChange={handleChange}
            >
              <option value="">Sin etiqueta</option>
              {LABELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              id="task-assigned"
              label="Asignado a"
              name="assignedMemberId"
              value={formData.assignedMemberId}
              onChange={handleChange}
            >
              <option value="">Sin asignar</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.user.name}</option>
              ))}
            </Select>

            <Input
              id="task-due-date"
              label="Fecha de vencimiento"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Crear tarea'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
