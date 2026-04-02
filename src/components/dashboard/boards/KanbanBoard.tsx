'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import CreateTaskModal from '../CreateTaskModal';
import { Inbox, GitPullRequest, Eye, CheckCircle2 } from 'lucide-react';

interface ProjectMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface KanbanBoardProps {
  projectId: string;
  members: ProjectMember[];
  userRole: string | null;
}

interface Column {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  headerBg: string;
}

const COLUMNS: Column[] = [
  { id: 'backlog', label: 'Backlog', icon: Inbox, color: 'text-gray-500', headerBg: 'bg-gray-100' },
  { id: 'in_progress', label: 'En progreso', icon: GitPullRequest, color: 'text-blue-600', headerBg: 'bg-blue-50' },
  { id: 'in_review', label: 'En revisión', icon: Eye, color: 'text-yellow-600', headerBg: 'bg-yellow-50' },
  { id: 'completed', label: 'Completado', icon: CheckCircle2, color: 'text-green-600', headerBg: 'bg-green-50' },
];

export default function KanbanBoard({ projectId: _projectId, members, userRole }: KanbanBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultColumn, setDefaultColumn] = useState<string | undefined>(undefined);

  const openModal = (columnId?: string) => {
    setDefaultColumn(columnId);
    setIsModalOpen(true);
  };

  const canCreateTask = userRole === 'LEADER' || userRole === 'STUDENT';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-full self-center">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-green-700">Salud: buena</span>
        </div>

        <div className="relative self-end">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none w-44 bg-white"
          />
        </div>

        <div className="w-40">
          <Select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="">Asignado: Todos</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.user.name}</option>
            ))}
          </Select>
        </div>

        <div className="w-40">
          <Select
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value)}
          >
            <option value="">Etiqueta: Todas</option>
            <option value="backend">Backend</option>
            <option value="frontend">Frontend</option>
            <option value="ux">UX</option>
            <option value="documentation">Documentación</option>
            <option value="setup">Setup</option>
          </Select>
        </div>

        {canCreateTask && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors ml-auto"
          >
            <Plus className="w-4 h-4" />
            Nueva tarea
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          return (
            <div key={col.id} className="bg-gray-50 rounded-xl border border-gray-100 flex flex-col min-h-[420px]">
              <div className={`flex items-center gap-2 px-4 py-3 rounded-t-xl ${col.headerBg}`}>
                <Icon className={`w-4 h-4 ${col.color}`} />
                <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                <span className="ml-auto text-xs font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded-full border border-gray-200">
                  0
                </span>
              </div>

              <div className="flex-1 p-3">
                <div className="text-center py-8">
                  <p className="text-xs text-gray-400">Sin tareas</p>
                </div>
              </div>

              <div className="px-3 pb-3">
                {canCreateTask ? (
                  <button
                    onClick={() => openModal(col.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-brand hover:text-brand transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar tarea
                  </button>
                ) : (
                  <div className="h-8" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultColumn={defaultColumn}
        members={members}
      />
    </div>
  );
}
