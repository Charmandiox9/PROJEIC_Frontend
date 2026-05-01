'use client';

import { format } from 'date-fns'; // 🔥 Importante añadir esto
import KanbanBoard from './kanban/KanbanBoard';
import ScrumBoard from './scrum/ScrumBoard';
import ScrumbanBoard from './scrumban/ScrumbanBoard';
import { useT } from '@/hooks/useT';

interface ProjectMember {
  id: string;
  role: string;
  status: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface BoardRendererProps {
  methodology: string;
  projectId: string;
  members: ProjectMember[];
  userRole: string | null;
}

export default function BoardRenderer({ methodology, projectId, members, userRole }: BoardRendererProps) {
  const { t } = useT();

  // 🔥 Movimos la función fuera de los IFs y antes de los RETURN
  const handleExportCSV = (tasks: any[], projectName: string) => {
    const headers = ["ID", "Titulo", "Estado", "Prioridad", "Fecha Vencimiento"];
    const rows = tasks.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`, // Escapar comillas internas
      t.status,
      t.priority,
      t.dueDate ? format(new Date(t.dueDate), 'yyyy-MM-dd') : 'Sin fecha'
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n"); // Añadimos BOM para Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Tareas_${projectName.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🔥 Ahora pasamos la función a los hijos (debes actualizar los hijos para que acepten onExport)
  if (methodology === 'KANBAN') {
    return <KanbanBoard projectId={projectId} members={members} userRole={userRole} onExport={handleExportCSV} />;
  }
  if (methodology === 'SCRUM') {
    return <ScrumBoard projectId={projectId} members={members} userRole={userRole} onExport={handleExportCSV} />;
  }
  if (methodology === 'SCRUMBAN') {
    return <ScrumbanBoard projectId={projectId} members={members} userRole={userRole} onExport={handleExportCSV} />;
  }

  return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      {t('kanban.unrecognizedMethodology')} {methodology}
    </div>
  );
}