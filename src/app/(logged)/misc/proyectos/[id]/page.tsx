'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchGraphQL } from '@/lib/graphQLClient';
import {
  GET_PROJECT_BY_ID,
  DELETE_PROJECT,
  REMOVE_PROJECT_MEMBER,
  UPDATE_PROJECT_MEMBER_ROLE,
  ADD_PROJECT_MEMBER,
} from '@/graphql/misc/operations';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  Layout,
  Globe,
  Lock,
  UserPlus,
  Loader2,
  Users,
  BarChart2,
  Columns,
  Activity,
  FileDown,
  User,
  AlertCircle,
  X,
} from 'lucide-react';
import UpdateProjectModal from '@/components/dashboard/UpdateProjectModal';
import BoardRenderer from '@/components/dashboard/boards/BoardRenderer';
import Select from '@/components/ui/Select';
import { useAuth } from '@/context/AuthProvider';

interface ProjectUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface ProjectMember {
  id: string;
  role: string;
  status: string;
  user: ProjectUser;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: string;
  methodology: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  members: ProjectMember[];
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  STARTING: 'Iniciando',
  COMPLETED: 'Completado',
  ON_HOLD: 'En pausa',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  STARTING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const ROLE_OPTIONS = [
  { value: 'LEADER', label: 'Líder' },
  { value: 'STUDENT', label: 'Estudiante' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'EXTERNAL', label: 'Externo' },
];

const UCN_DOMAINS = ['@alumnos.ucn.cl', '@ucn.cl', '@ce.ucn.cl'];

function isValidUcnEmail(email: string): boolean {
  return UCN_DOMAINS.some((d) => email.toLowerCase().endsWith(d));
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function MemberAvatar({ member }: { member: ProjectMember }) {
  return member.user.avatarUrl ? (
    <img
      src={member.user.avatarUrl}
      alt={member.user.name}
      referrerPolicy="no-referrer"
      className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-white"
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-white">
      {getInitials(member.user.name)}
    </div>
  );
}

type TabId = 'resumen' | 'tablero' | 'actividad' | 'metricas' | 'miembros';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'resumen', label: 'Resumen', icon: Layout },
  { id: 'tablero', label: 'Tablero', icon: Columns },
  { id: 'actividad', label: 'Actividad', icon: Activity },
  { id: 'metricas', label: 'Métricas', icon: BarChart2 },
  { id: 'miembros', label: 'Miembros', icon: Users },
];

function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <Columns className="w-7 h-7 text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="text-sm text-gray-400 mt-1">Esta sección estará disponible próximamente.</p>
    </div>
  );
}

function TabResumen({
  project,
  isLeader,
  onEdit,
  onDelete,
  onUpdateRole,
  onRemoveMember,
  onAddMember,
  isDeleting,
}: {
  project: Project;
  isLeader: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string) => void;
  onAddMember: () => void;
  isDeleting: boolean;
}) {
  const creationDate = new Date(project.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="h-2 w-full" style={{ backgroundColor: project.color }} />
        <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{project.name}</h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${STATUS_COLORS[project.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[project.status] ?? project.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
              {project.description ?? 'Sin descripción detallada.'}
            </p>
          </div>
          {isLeader && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onEdit}
                className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
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
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Detalles del Proyecto</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 min-w-[120px]">Creado el</span>
              <span className="text-sm font-medium text-gray-900">{creationDate}</span>
            </li>
            <li className="flex items-center gap-3">
              <Layout className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 min-w-[120px]">Metodología</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{project.methodology.toLowerCase()}</span>
            </li>
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

        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Equipo ({project.members.length})
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

          {project.members.length > 0 ? (
            <ul className="space-y-2">
              {project.members.map((member) => (
                <li key={member.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <MemberAvatar member={member} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                        {member.user.name}
                      </p>
                      {member.status === 'PENDING' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 rounded-md">
                          <Loader2 className="w-3 h-3 animate-spin" /> Pendiente
                        </span>
                      )}
                  <Select
                    value={member.role}
                    onChange={(e) => onUpdateRole(member.id, e.target.value)}
                    disabled={!isLeader}
                    className="mt-0.5 text-[11px] font-bold text-brand bg-brand/5 border-brand/20 w-auto"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </Select>
                    </div>
                  </div>
                  {isLeader && (
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <User className="w-5 h-5 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No hay miembros registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabMetricas() {
  const metricCards = [
    { label: 'Tareas totales', value: 0 },
    { label: 'Tareas vencidas', value: 0 },
    { label: 'En revisión', value: 0 },
    { label: 'Actividad (7 días)', value: '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center gap-6">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3.5"
              strokeDasharray="0 100"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">0%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Salud del proyecto</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Sin tareas vencidas</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">0% de avance completado</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Avance por columna</h3>
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No hay columnas configuradas en el tablero.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Tareas vencidas</h3>
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No hay tareas vencidas.</p>
        </div>
      </div>
    </div>
  );
}

function TabMiembros({
  project,
  isLeader,
  onUpdateRole,
  onRemoveMember,
  onRefresh,
}: {
  project: Project;
  isLeader: boolean;
  onUpdateRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string) => void;
  onRefresh: () => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [isExternal, setIsExternal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInvite = async () => {
    setError(null);
    setSuccess(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setError('Ingresa un correo.'); return; }

    if (!isExternal && !isValidUcnEmail(trimmed)) {
      setError(`El correo debe pertenecer a: ${UCN_DOMAINS.join(', ')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) { setError('Correo inválido.'); return; }

    setIsSending(true);
    try {
      await fetchGraphQL({
        query: ADD_PROJECT_MEMBER,
        variables: {
          input: {
            projectId: project.id,
            email: trimmed,
            role: isExternal ? 'EXTERNAL' : role,
          },
        },
      });
      setEmail('');
      setSuccess('Invitación enviada correctamente.');
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar la invitación.');
    } finally {
      setIsSending(false);
    }
  };

  const ROLE_DESCRIPTIONS = [
    { role: 'Líder', desc: 'Gestiona el proyecto, invita miembros y tiene control total.' },
    { role: 'Supervisor', desc: 'Supervisa el avance del equipo. Rol típico para docentes.' },
    { role: 'Estudiante', desc: 'Participa activamente en las tareas del proyecto.' },
    { role: 'Externo', desc: 'Colaborador fuera de la institución con acceso limitado.' },
  ];

  return (
    <div className={`grid grid-cols-1 ${isLeader ? 'lg:grid-cols-3' : ''} gap-6`}>
      <div className={`${isLeader ? 'md:col-span-2' : ''} bg-white rounded-xl border border-gray-100 p-6 space-y-4`}>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Integrantes ({project.members.length})</h3>
        {project.members.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No hay miembros registrados.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {project.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <MemberAvatar member={m} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                      {m.user.name}
                    </p>
                    {m.status === 'PENDING' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 rounded-md">
                        <Loader2 className="w-3 h-3 animate-spin" /> Pendiente
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select
                    value={m.role}
                    onChange={(e) => onUpdateRole(m.id, e.target.value)}
                    disabled={!isLeader}
                    className="text-[11px] font-bold text-brand bg-brand/5 border-brand/20 w-auto"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </Select>
                  {isLeader && (
                    <button
                      onClick={() => onRemoveMember(m.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Expulsar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isLeader && (
        <div className="space-y-4 min-w-0 overflow-hidden">
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Agregar miembro</h3>

            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isExternal}
                onChange={(e) => { setIsExternal(e.target.checked); setError(null); }}
                className="w-3.5 h-3.5 text-brand border-gray-300 rounded focus:ring-brand"
              />
              Colaborador externo
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              placeholder={isExternal ? 'correo@externo.com' : 'correo@alumnos.ucn.cl'}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none"
            />

            {!isExternal && (
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLE_OPTIONS.filter((r) => r.value !== 'EXTERNAL').map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            )}

            {error && (
              <p className="text-xs text-red-500 flex gap-1 items-start">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {error}
              </p>
            )}
            {success && <p className="text-xs text-green-600">{success}</p>}

            <button
              onClick={handleInvite}
              disabled={isSending}
              className="w-full py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {isSending ? 'Enviando...' : 'Enviar invitación'}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3 overflow-y-auto max-h-64">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Roles disponibles</h3>
            {ROLE_DESCRIPTIONS.map((r) => (
              <div key={r.role}>
                <p className="text-xs font-bold text-gray-700">{r.role}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AddMemberPanel({
  project,
  onUpdateRole,
  onRefresh,
  onClose,
}: {
  project: Project;
  onUpdateRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string) => void;
  onRefresh: () => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [isExternal, setIsExternal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInvite = async () => {
    setError(null);
    setSuccess(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Ingresa un correo.');
      return;
    }

    if (!isExternal && !isValidUcnEmail(trimmed)) {
      setError(`El correo debe pertenecer a: ${UCN_DOMAINS.join(', ')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Correo inválido.');
      return;
    }

    setIsSending(true);
    try {
      await fetchGraphQL({
        query: ADD_PROJECT_MEMBER,
        variables: {
          input: {
            projectId: project.id,
            email: trimmed,
            role: isExternal ? 'EXTERNAL' : role,
          },
        },
      });
      setEmail('');
      setSuccess('Invitación enviada correctamente.');
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar la invitación.');
    } finally {
      setIsSending(false);
    }
  };

  const ROLE_DESCRIPTIONS = [
    { role: 'Líder', desc: 'Gestiona el proyecto, invita miembros y tiene control total.' },
    { role: 'Supervisor', desc: 'Supervisa el avance del equipo.' },
    { role: 'Estudiante', desc: 'Participa activamente en las tareas del proyecto.' },
    { role: 'Externo', desc: 'Colaborador con acceso limitado.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full min-w-[320px] max-w-[400px] p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Agregar al equipo</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isExternal}
              onChange={(e) => { setIsExternal(e.target.checked); setError(null); }}
              className="w-3.5 h-3.5 text-brand border-gray-300 rounded focus:ring-brand"
            />
            Colaborador externo
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            placeholder={isExternal ? 'correo@externo.com' : 'correo@alumnos.ucn.cl'}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none"
          />

          {!isExternal && (
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full"
            >
              {ROLE_OPTIONS.filter((r) => r.value !== 'EXTERNAL').map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          )}

          {error && (
            <p className="text-xs text-red-500 flex gap-1 items-start">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {error}
            </p>
          )}
          {success && <p className="text-xs text-green-600">{success}</p>}

          <button
            onClick={handleInvite}
            disabled={isSending}
            className="w-full py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {isSending ? 'Enviando...' : 'Enviar invitación'}
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-3 overflow-y-auto max-h-48 pr-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Roles disponibles</h3>
          {ROLE_DESCRIPTIONS.map((r) => (
            <div key={r.role}>
              <p className="text-xs font-bold text-gray-700">{r.role}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const projectId = Array.isArray(id) ? id[0] : id;

  const loadProject = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchGraphQL({
        query: GET_PROJECT_BY_ID,
        variables: { id: projectId },
      });
      if (data?.findOne) {
        setProject(data.findOne as Project);
      } else {
        setError('Proyecto no encontrado.');
      }
    } catch {
      setError('Error al cargar el proyecto.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId, loadProject]);

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este proyecto permanentemente? Esta acción no se puede deshacer.')) return;
    setIsDeleting(true);
    try {
      await fetchGraphQL({ query: DELETE_PROJECT, variables: { id: projectId } });
      router.push('/misc/proyectos');
    } catch {
      alert('Error al eliminar el proyecto.');
      setIsDeleting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await fetchGraphQL({
        query: UPDATE_PROJECT_MEMBER_ROLE,
        variables: { input: { memberId, role: newRole } },
      });
      loadProject();
    } catch {
      alert('Error al actualizar el rol.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('¿Expulsar a este integrante del equipo?')) return;
    try {
      await fetchGraphQL({ query: REMOVE_PROJECT_MEMBER, variables: { memberId } });
      loadProject();
    } catch {
      alert('Error al eliminar al integrante.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-500 font-medium">{error ?? 'Proyecto no disponible'}</p>
        <Link href="/misc/proyectos" className="text-brand hover:underline flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver a Mis proyectos
        </Link>
      </div>
    );
  }

  const currentUserRole = project?.members.find(
    (m) => m.user.id === user?.userId
  )?.role ?? null;
  const isLeader = currentUserRole === 'LEADER';

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/misc/proyectos" className="hover:text-gray-900 transition-colors">
            Mis proyectos
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[240px]">{project.name}</span>
        </nav>
        <div className="flex items-center gap-2">
          <button
            disabled
            title="Próximamente"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" /> Exportar PDF
          </button>
          <button
            disabled
            title="Próximamente"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tabId
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === 'resumen' && (
          <TabResumen
            project={project}
            isLeader={isLeader}
            onEdit={() => setIsEditModalOpen(true)}
            onDelete={handleDelete}
            onUpdateRole={handleUpdateRole}
            onRemoveMember={handleRemoveMember}
            onAddMember={() => setIsAddMemberOpen(true)}
            isDeleting={isDeleting}
          />
        )}
        {activeTab === 'tablero' && (
          <BoardRenderer
            methodology={project.methodology}
            projectId={project.id}
            members={project.members}
            userRole={currentUserRole}
          />
        )}
        {activeTab === 'actividad' && <ComingSoonTab label="Feed de actividad" />}
        {activeTab === 'metricas' && <TabMetricas />}
        {activeTab === 'miembros' && (
          <TabMiembros
            project={project}
            isLeader={isLeader}
            onUpdateRole={handleUpdateRole}
            onRemoveMember={handleRemoveMember}
            onRefresh={loadProject}
          />
        )}
      </div>

      {isEditModalOpen && (
        <UpdateProjectModal
          isOpen={isEditModalOpen}
          project={project}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={loadProject}
        />
      )}

      {isAddMemberOpen && activeTab === 'resumen' && (
        <AddMemberPanel
          project={project}
          onUpdateRole={handleUpdateRole}
          onRemoveMember={handleRemoveMember}
          onRefresh={loadProject}
          onClose={() => setIsAddMemberOpen(false)}
        />
      )}
    </div>
  );
}
