import { Project } from '@/types/project';
import { STATUS_LABELS, STATUS_COLORS, ROLE_OPTIONS } from '@/constants/project-constants';
import { Edit3, Trash2, Loader2, Calendar, Layout, Globe, Lock, BookOpen, User, UserPlus } from 'lucide-react';
import MemberAvatar from '../../project-detail/MemberAvatar';
import RoleBadge from '../../project-detail/RoleBadge';

interface TabResumenProps {
  project: Project;
  isLeader: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string) => void;
  onAddMember: () => void;
  isDeleting: boolean;
}

export default function TabResumen({
  project,
  isLeader,
  onEdit,
  onDelete,
  onUpdateRole,
  onRemoveMember,
  onAddMember,
  isDeleting,
}: TabResumenProps) {
  const creationDate = new Date(project.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const activeMembers = project.members.filter(m => m.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="h-2 w-full" style={{ backgroundColor: project.color }} />
        <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{project.name}</h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${STATUS_COLORS[project.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[project.status] ?? project.status}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-2xl">
              {project.description ?? 'Sin descripción detallada.'}
            </p>
          </div>
          {isLeader && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onEdit}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" /> Editar
              </button>
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Detalles del Proyecto</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[120px]">Creado el</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{creationDate}</span>
            </li>
            <li className="flex items-center gap-3">
              <Layout className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[120px]">Metodología</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{project.mode === 'HYBRID' ? 'Projeic Native' : project.methodology.toLowerCase()}</span>
            </li>

            {project.isInstitutional && project.subject && (
              <>
                <li className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[120px]">Ramo (EIC)</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-brand">
                      {project.subject.name} {project.subject.code ? `(${project.subject.code})` : ''}
                    </span>
                    <span className="text-xs text-gray-500">Periodo {project.subject.period}</span>
                  </div>
                </li>

                {project.subject.professors && project.subject.professors.length > 0 && (
                  <li className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-500 min-w-[120px]">Profesor(es)</span>
                    <div className="flex flex-col gap-1">
                      {project.subject.professors.map(prof => (
                        <span key={prof.id} className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md w-fit">
                          {prof.name}
                        </span>
                      ))}
                    </div>
                  </li>
                )}
              </>
            )}

            <li className="flex items-center gap-3">
              {project.isPublic ? (
                <Globe className="w-4 h-4 text-gray-400 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              )}
              <span className="text-sm text-gray-500 min-w-[120px]">Visibilidad</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${project.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {project.isPublic ? 'Público' : 'Privado'}
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Equipo ({activeMembers.length})
            </h3>
            {isLeader && (
              <button
                onClick={onAddMember}
                className="text-xs font-medium text-brand hover:text-brand-dark flex items-center gap-1 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" /> Agregar
              </button>
            )}
          </div>

          {activeMembers.length > 0 ? (
            <ul className="space-y-2">
              {activeMembers.map((member) => (
                <li key={member.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center gap-3 min-w-0">
                    <MemberAvatar member={member} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                        {member.user.name}
                      </p>
                      {member.status === 'PENDING' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 rounded-md">
                          <Loader2 className="w-3 h-3 animate-spin" /> Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isLeader ? (
                      <label className="relative cursor-pointer" title="Cambiar rol">
                        <RoleBadge role={member.role} label={ROLE_OPTIONS.find(r => r.value === member.role)?.label ?? member.role} />
                        <select
                          value={member.role}
                          onChange={(e) => onUpdateRole(member.id, e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value} className="bg-surface-primary text-text-primary">
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <RoleBadge role={member.role} label={ROLE_OPTIONS.find(r => r.value === member.role)?.label ?? member.role} />
                    )}
                    {isLeader && (
                      <button
                        onClick={() => onRemoveMember(member.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-200 dark:border-gray-600">
              <User className="w-5 h-5 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No hay miembros registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}