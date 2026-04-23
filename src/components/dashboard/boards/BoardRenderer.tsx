import KanbanBoard from './kanban/KanbanBoard';
import ScrumBoard from './scrum/ScrumBoard';
import ScrumbanBoard from './scrumban/ScrumbanBoard';

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
  if (methodology === 'KANBAN') {
    return <KanbanBoard projectId={projectId} members={members} userRole={userRole} />;
  }
  if (methodology === 'SCRUM') {
    return <ScrumBoard projectId={projectId} members={members} userRole={userRole} />;
  }
  if (methodology === 'SCRUMBAN') {
    return <ScrumbanBoard />;
  }
  return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Metodología no reconocida: {methodology}
    </div>
  );
}
